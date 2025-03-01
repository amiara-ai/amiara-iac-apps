const gcp = require("@pulumi/gcp");

exports.enableApis = (provider) => {
    const enableCompute = new gcp.projects.Service("enable-compute", {
        project: provider.project,
        service: "compute.googleapis.com",
        disableOnDestroy: false,
    }, { provider });

    const enableContainer = new gcp.projects.Service("enable-container", {
        project: provider.project,
        service: "container.googleapis.com",
        disableOnDestroy: false,
    }, { provider });

    const enableRedis = new gcp.projects.Service("enable-redis", {
        project: provider.project,
        service: "redis.googleapis.com",
        disableOnDestroy: false,
    }, { provider });

    const enableSqlAdmin = new gcp.projects.Service("enable-sqladmin", {
        project: provider.project,
        service: "sqladmin.googleapis.com",
        disableOnDestroy: false,
    }, { provider });

    const enableDns = new gcp.projects.Service("enable-dns", {
        project: provider.project,
        service: "dns.googleapis.com",
        disableOnDestroy: false,
    }, { provider });

    return {
        computeApi: enableCompute,
        containerApi: enableContainer,
        redisApi: enableRedis,
        sqlAdminApi: enableSqlAdmin,
        dnsApi: enableDns,
    };
};
