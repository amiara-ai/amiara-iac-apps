const gcp = require("@pulumi/gcp");
const pulumi = require("@pulumi/pulumi");

exports.createRedis = (provider, config, dependencies) => {
    const redis = new gcp.redis.Instance(config.instanceName, {
        region: provider.region,
        memorySizeGb: config.memorySizeGb,
        tier: config.tier,
        redisVersion: config.redisVersion,
        authEnabled: config.authEnabled,
    }, { provider, dependsOn: dependencies });

    return {
        redis,
        host: redis.host,
        port: redis.port,
        authString: pulumi.secret(redis.authString)
    };
};
