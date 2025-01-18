const k8s = require("@pulumi/kubernetes");

exports.createRbac = (provider, users) => {
    // Developer Role
    const developerRole = new k8s.rbac.v1.ClusterRole("developer-role", {
        metadata: {
            name: "developer-role"
        },
        rules: [
            // Deployment access
            {
                apiGroups: ["apps", "extensions"],
                resources: ["deployments", "replicasets"],
                verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
            },
            // Pod access
            {
                apiGroups: [""],
                resources: ["pods", "pods/log"],
                verbs: ["get", "list", "watch"]
            },
            // Service access
            {
                apiGroups: [""],
                resources: ["services", "configmaps", "secrets"],
                verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
            }
        ]
    }, { provider });

    // Admin Role
    const adminRole = new k8s.rbac.v1.ClusterRole("admin-role", {
        metadata: {
            name: "admin-role"
        },
        rules: [
            {
                apiGroups: ["*"],
                resources: ["*"],
                verbs: ["*"]
            }
        ]
    }, { provider });

    // Viewer Role
    const viewerRole = new k8s.rbac.v1.ClusterRole("viewer-role", {
        metadata: {
            name: "viewer-role"
        },
        rules: [
            {
                apiGroups: ["*"],
                resources: ["*"],
                verbs: ["get", "list", "watch"]
            }
        ]
    }, { provider });

    // Create bindings for each user
    const bindings = users.map(user => {
        return new k8s.rbac.v1.ClusterRoleBinding(`${user.email}-binding`, {
            metadata: {
                name: `${user.email}-binding`
            },
            subjects: [{
                kind: "User",
                name: user.email,
                apiGroup: "rbac.authorization.k8s.io"
            }],
            roleRef: {
                kind: "ClusterRole",
                name: user.role === "admin" ? "admin-role" : 
                     user.role === "developer" ? "developer-role" : "viewer-role",
                apiGroup: "rbac.authorization.k8s.io"
            }
        }, { provider });
    });

    return {
        developerRole,
        adminRole,
        viewerRole,
        bindings
    };
};
