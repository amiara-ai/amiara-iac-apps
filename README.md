# Amiara Infrastructure as Code (IaC)

A Pulumi-based Infrastructure as Code solution for managing GCP
resources, specifically focused on resources such as Google Kubernetes
Engine (GKE) clusters, Redis instances and so forth. This project
provides a modular and maintainable approach to infrastructure
provisioning using Node.js.

## Features

- 🚀 Automated GKE cluster provisioning with configurable node pools
- 💾 Managed Redis instance deployment with secure authentication
- 🔌 Automatic API enablement for required GCP services
- 🔐 Secure configuration management with Pulumi
- 📦 Modular architecture for easy maintenance and scaling

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- pnpm (package manager)
- Pulumi CLI
- Google Cloud SDK
- A Google Cloud Platform account with appropriate permissions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/amiara-iac-apps.git
cd amiara-iac-apps
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure Pulumi:
```bash
pulumi login
pulumi stack init dev
```

4. Configure GCP credentials:
```bash
gcloud auth application-default login
```

## Configuration

The project uses Pulumi's configuration system. Create or modify environment-specific configurations in `Pulumi.[environment].yaml`:

```yaml
config:
  gcp:project: your-project-id
  gcp:region: desired-region
  gcp:zone: desired-zone
  amiara-iac-apps:cluster:
    clusterName: "your-cluster-name"
    nodePoolName: "your-nodepool-name"
    machineType: "e2-standard-2"
    minNodes: 1
    maxNodes: 3
  amiara-iac-apps:redis:
    instanceName: "your-redis-instance"
    memorySizeGb: 1
    tier: "BASIC"
    redisVersion: "REDIS_7_2"
    authEnabled: true
```

## Usage

### Deploying Infrastructure

1. Preview changes:
```bash
pulumi preview
```

2. Deploy infrastructure:
```bash
pulumi up
```

3. Access deployment outputs:
```bash
pulumi stack output
```

### Accessing Resources

#### GKE Cluster

The deployment outputs include a `kubeconfig` that can be used to access the cluster:

```bash
pulumi stack output kubeconfig > kubeconfig.yaml
export KUBECONFIG=./kubeconfig.yaml
kubectl get nodes
```

#### Redis Instance

Connection details are available in the stack outputs:
```bash
pulumi stack output redisHost
pulumi stack output redisPort
pulumi stack output redisAuth
```

## Project Structure

```
.
├── src/
│   ├── apis/        # GCP API enablement
│   ├── cluster/     # GKE cluster configuration
│   └── redis/       # Redis instance configuration
├── index.js         # Main entry point
├── Pulumi.yaml      # Project configuration
├── Pulumi.dev.yaml  # Environment configuration
└── CONVENTIONS.md   # Project conventions and guidelines
```

## Resource Management

### Created Resources

- GKE Cluster with configurable node pool
- Managed Redis instance
- Enabled GCP APIs:
  - Compute Engine API
  - Kubernetes Engine API
  - Redis API

### Cleanup

To destroy all created resources:
```bash
pulumi destroy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONVENTIONS.md](CONVENTIONS.md) for details on our coding standards and development process.

## Security

- All sensitive values are managed through Pulumi's secret management
- Authentication is enabled by default for Redis instances
- GKE cluster uses secure configurations by default

## Troubleshooting

Common issues and solutions:

1. **API Enablement Failures**
   - Ensure your GCP account has appropriate permissions
   - Check if the APIs are already enabled in your project

2. **Resource Creation Timeouts**
   - GKE cluster creation can take 10-15 minutes
   - Verify your quotas in the target region

3. **Authentication Issues**
   - Ensure `gcloud` is properly authenticated
   - Verify Pulumi credentials are configured

## Proprietary Notice

This repository contains proprietary and confidential information belonging to Amiara AI.
All rights reserved. Unauthorized copying, distribution, or use of this repository, 
in whole or in part, is strictly prohibited.

## Support

For internal support and questions, please contact the infrastructure team or open an internal ticket.

## Acknowledgments

- Infrastructure Team at Amiara AI
- Pulumi team for their infrastructure as code platform
- Google Cloud Platform for their cloud services
