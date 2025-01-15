"use strict";
const pulumi = require("@pulumi/pulumi");
const gcp = require("@pulumi/gcp");

// Define common config
const config = {
    projectId: "amiara-dev-be",
    region: "us-central1",
    zone: "us-central1-a",
    clusterName: "amiara-dev-cluster",
    machineType: "e2-standard-2",
    minNodes: 1,
    maxNodes: 3
};

// Create a GKE cluster
const cluster = new gcp.container.Cluster(config.clusterName, {
    location: config.zone,
    initialNodeCount: config.minNodes,
    removeDefaultNodePool: true,
    minMasterVersion: "latest",
    network: "default",
    networkingMode: "VPC_NATIVE",
    ipAllocationPolicy: {
        clusterIpv4CidrBlock: "/16",
        servicesIpv4CidrBlock: "/22",
    },
});

// Create a separately managed node pool
const nodePool = new gcp.container.NodePool("primary-node-pool", {
    cluster: cluster.name,
    location: config.zone,
    nodeCount: config.minNodes,
    nodeConfig: {
        machineType: config.machineType,
        oauthScopes: [
            "https://www.googleapis.com/auth/compute",
            "https://www.googleapis.com/auth/devstorage.read_only",
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring"
        ],
    },
    autoscaling: {
        minNodeCount: config.minNodes,
        maxNodeCount: config.maxNodes,
    },
    management: {
        autoRepair: true,
        autoUpgrade: true,
    },
});

// Create a Redis instance
const redis = new gcp.redis.Instance("amiara-dev-redis", {
    memorySizeGb: 1,
    region: config.region,
    tier: "BASIC",
    redisVersion: "REDIS_6_X",
    authEnabled: true,
});

// Export necessary values
exports.clusterName = cluster.name;
exports.kubeconfig = pulumi.secret(pulumi.interpolate`apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${cluster.masterAuth.clusterCaCertificate}
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
exports.redisHost = redis.host;
exports.redisPort = redis.port;