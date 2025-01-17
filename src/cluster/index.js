const gcp = require("@pulumi/gcp");
const pulumi = require("@pulumi/pulumi");

exports.createCluster = (provider, config, dependencies) => {
    const cluster = new gcp.container.Cluster(config.clusterName, {
        location: provider.zone,
        initialNodeCount: config.minNodes,
        removeDefaultNodePool: true,
        minMasterVersion: "latest",
        network: "default",
        networkingMode: "VPC_NATIVE",
        ipAllocationPolicy: {
            clusterIpv4CidrBlock: "/16",
            servicesIpv4CidrBlock: "/22",
        },
    }, { provider, dependsOn: dependencies });

    const nodePool = new gcp.container.NodePool(config.nodePoolName, {
        cluster: cluster.name,
        location: provider.zone,
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
    }, { provider });

    return {
        cluster,
        nodePool,
        kubeconfig: cluster.masterAuth,
    };
};
