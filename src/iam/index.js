const gcp = require("@pulumi/gcp");

exports.createIamBindings = (provider, users, projectId) => {
    // Grant container.viewer role to all RBAC users
    const bindings = users.map(user => {
        return new gcp.projects.IAMBinding(`gke-viewer-${user.email}`, {
            project: projectId,
            role: "roles/container.viewer",
            members: [`user:${user.email}`]
        }, { provider });
    });

    return {
        bindings
    };
};
