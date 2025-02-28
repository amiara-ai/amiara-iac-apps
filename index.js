const pulumi = require("@pulumi/pulumi");
const gcp = require("@pulumi/gcp");
const { enableApis } = require("./src/apis");
const { createCluster } = require("./src/cluster");
const { createRedis } = require("./src/redis");
const { createPostgres } = require("./src/postgres");
const { createRbac } = require("./src/rbac");
const { createIamBindings } = require("./src/iam");
const { createExternalDns } = require("./src/externaldns");
const k8s = require("@pulumi/kubernetes");

// Get configurations from Pulumi config
const config = new pulumi.Config();

// Create a GCP provider using config values
const gcpConfig = new pulumi.Config("gcp");
const provider = new gcp.Provider("gcp", {
    project: gcpConfig.require("project"),
    region: gcpConfig.require("region"),
    zone: gcpConfig.require("zone")
});

// Enable required APIs
const apis = enableApis(provider);

// Get component configurations
const clusterConfig = config.requireObject("cluster");
const redisConfig = config.requireObject("redis");
const postgresConfig = config.requireObject("postgres");
const rbacConfig = config.requireObject("rbac");
const externalDnsConfig = config.getObject("externaldns") || {};

// Create GKE cluster
const { cluster, kubeconfig } = createCluster(
    provider,
    clusterConfig,
    [apis.computeApi, apis.containerApi]
);

// Create Redis instance
const { host: redisHost, port: redisPort, authString: redisAuth } = createRedis(
    provider,
    redisConfig,
    apis.redisApi
);

// Create PostgreSQL instance
const { host: postgresHost, connectionName: postgresConnectionName } = createPostgres(
    provider,
    postgresConfig,
    apis.sqlAdminApi
);

// Export necessary values
exports.clusterName = cluster.name;
exports.kubeconfig = pulumi.secret(pulumi.interpolate`apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${kubeconfig.clusterCaCertificate}
    server: https://${cluster.endpoint}
  name: ${cluster.name}
contexts:
- context:
    cluster: ${cluster.name}
    user: ${cluster.name}
  name: ${cluster.name}
current-context: ${cluster.name}
kind: Config
users:
- name: ${cluster.name}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
        https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke
      provideClusterInfo: true`);

exports.redisHost = redisHost;
exports.redisPort = redisPort;
exports.redisAuth = redisAuth;

// Export PostgreSQL values
exports.postgresHost = postgresHost;
exports.postgresConnectionName = postgresConnectionName;

// Create K8s provider and RBAC
const k8sProvider = new k8s.Provider("k8s-provider", {
    kubeconfig: pulumi.interpolate`apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${kubeconfig.clusterCaCertificate}
    server: https://${cluster.endpoint}
  name: ${cluster.name}
contexts:
- context:
    cluster: ${cluster.name}
    user: ${cluster.name}
  name: ${cluster.name}
current-context: ${cluster.name}
kind: Config
users:
- name: ${cluster.name}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
        https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke
      provideClusterInfo: true`
}, { dependsOn: cluster });

// Create IAM bindings for RBAC users
createIamBindings(provider, rbacConfig.users, gcpConfig.require("project"));

// Create RBAC roles and bindings
createRbac(k8sProvider, rbacConfig.users);

// If ExternalDNS is enabled in configuration
if (externalDnsConfig.enabled) {
    // Create a service account for ExternalDNS
    const externalDnsSa = new gcp.serviceaccount.Account("external-dns-sa", {
        accountId: externalDnsConfig.serviceAccountId || "external-dns-sa",
        displayName: "Service Account for ExternalDNS",
    }, { provider });

    // Grant DNS admin role to the service account
    new gcp.projects.IAMBinding("external-dns-dns-admin", {
        project: gcpConfig.require("project"),
        role: "roles/dns.admin",
        members: [pulumi.interpolate`serviceAccount:${externalDnsSa.email}`],
    }, { provider, dependsOn: [externalDnsSa] });

    // Create Kubernetes secret with service account key
    const saKey = new gcp.serviceaccount.Key("external-dns-sa-key", {
        serviceAccountId: externalDnsSa.accountId,
    }, { provider });

    // Create namespace for ExternalDNS if needed
    const namespace = externalDnsConfig.namespace || "default";
    let namespaceResource;

    if (namespace !== "default") {
        namespaceResource = new k8s.core.v1.Namespace("external-dns-namespace", {
            metadata: {
                name: namespace,
            }
        }, { provider: k8sProvider });
    }

    // Create secret with GCP credentials for ExternalDNS
    const secretName = externalDnsConfig.serviceAccountSecretName || "external-dns-sa-key";
    new k8s.core.v1.Secret("external-dns-sa-key", {
        metadata: {
            name: secretName,
            namespace: namespace,
        },
        // Store the GCP service account key directly
        data: {
            "credentials.json": saKey.privateKey,
        },
    }, {
        provider: k8sProvider,
        dependsOn: namespaceResource ? [saKey, namespaceResource] : [saKey]
    });

    // Update config with the actual secret name for ExternalDNS
    externalDnsConfig.serviceAccountSecretName = secretName;

    // Deploy ExternalDNS
    createExternalDns(k8sProvider, {
        ...externalDnsConfig,
        projectId: gcpConfig.require("project"),
        serviceAccountSecretName: secretName,
        namespace: namespace
    });
}
