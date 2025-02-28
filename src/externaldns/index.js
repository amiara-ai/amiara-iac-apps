const k8s = require("@pulumi/kubernetes");

/**
 * Creates an ExternalDNS deployment using Helm
 *
 * @param {*} k8sProvider - Kubernetes provider
 * @param {*} config - ExternalDNS configuration
 * @returns ExternalDNS resources
 */
exports.createExternalDns = (k8sProvider, config) => {
    // Use namespace from config
    const namespace = config.namespace || "default";

    // Deploy ExternalDNS using Helm chart from OCI registry
    const externalDns = new k8s.helm.v3.Release("external-dns", {
        chart: "oci://registry-1.docker.io/bitnamicharts/external-dns", // Bitnami chart from Docker registry
        version: config.chartVersion || "8.7.1", // Default to 8.7.1 if not specified in config
        namespace: namespace,
        values: {
            provider: "google", // Using GCP
            google: {
                project: config.projectId,
            },
            env: [{
                name: "GOOGLE_APPLICATION_CREDENTIALS",
                value: "/credentials/credentials.json"
            }],
            extraVolumes: [{
                name: "google-credentials",
                secret: {
                    secretName: config.serviceAccountSecretName
                }
            }],
            extraVolumeMounts: [{
                name: "google-credentials",
                mountPath: "/credentials",
                readOnly: true
            }],
            domainFilters: config.domainFilters || [],
            txtOwnerId: config.txtOwnerId || "amiara-k8s",
            policy: config.policy || "sync", // Default sync policy
            registry: "txt",
            txtPrefix: config.txtPrefix || "externaldns-",
            interval: config.syncInterval || "1m",
            logLevel: config.logLevel || "info",
            sources: config.additionalValues?.sources || ["ingress"], // Default to ingress if not specified
            resources: config.resources || {
                limits: {
                    cpu: "100m",
                    memory: "300Mi"
                },
                requests: {
                    cpu: "50m",
                    memory: "100Mi"
                }
            },
            // Override with any additional custom values
            ...config.additionalValues || {},
        },
    }, { provider: k8sProvider });

    return {
        externalDns,
        helmRelease: externalDns,
        namespace,
    };
};
