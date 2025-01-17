const pulumi = require("@pulumi/pulumi");
const gcp = require("@pulumi/gcp");
const { enableApis } = require("./src/apis");
const { createCluster } = require("./src/cluster");
const { createRedis } = require("./src/redis");

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

// Create GKE cluster
const { cluster, nodePool, kubeconfig } = createCluster(
    provider,
    clusterConfig,
    [apis.computeApi, apis.containerApi]
);

// Create Redis instance
const { redis, host: redisHost, port: redisPort, authString: redisAuth } = createRedis(
    provider,
    redisConfig,
    apis.redisApi
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
