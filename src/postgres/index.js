const gcp = require("@pulumi/gcp");
const pulumi = require("@pulumi/pulumi");

exports.createPostgres = (provider, config, dependencies) => {
    const postgres = new gcp.sql.DatabaseInstance(config.instanceName, {
        databaseVersion: config.databaseVersion,
        region: provider.region,
        settings: {
            tier: config.tier,
            availabilityType: config.availabilityType,
            diskSize: config.diskSize,
            diskType: config.diskType,
            ipConfiguration: {
                ipv4Enabled: true,
                authorizedNetworks: [],
                sslMode: "ENCRYPTED_ONLY"
            },
            backupConfiguration: {
                enabled: true,
                startTime: "02:00"
            }
        },
        deletionProtection: false // Set to true for production
    }, { provider, dependsOn: dependencies });

    // Create the database
    const database = new gcp.sql.Database("postgres-db", {
        instance: postgres.name,
        name: config.dbName,
        charset: "UTF8",
        collation: "en_US.UTF8"
    }, { provider, dependsOn: [postgres] });

    // Create database user
    const user = new gcp.sql.User("postgres-user", {
        instance: postgres.name,
        name: config.userName,
        password: new pulumi.Config("postgres").getSecret("userPassword"),
        type: "BUILT_IN"
    }, { provider, dependsOn: [database] });

    return {
        postgres,
        database,
        user,
        host: postgres.publicIpAddress,
        connectionName: postgres.connectionName
    };
};
