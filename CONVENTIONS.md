# Project Conventions

## Overview

This repository implements Infrastructure as Code (IaC) for Google
Cloud Platform using Pulumi with Node.js. It follows a modular
architecture pattern for managing GCP resources, specifically focusing
on GKE (Google Kubernetes Engine) clusters and Redis instances.

## Project Structure

Follow a structure like the following:

```
.
├── src/
│   ├── apis/        # GCP API enablement modules
│   ├── cluster/     # GKE cluster configuration modules
│   └── redis/       # Redis instance configuration modules
├── index.js         # Main entry point
├── Pulumi.yaml      # Pulumi project configuration
├── Pulumi.dev.yaml  # Environment-specific configuration
└── package.json     # Project dependencies
```

... and build on that structure.

## Technology Stack
- **Infrastructure as Code**: Pulumi
- **Runtime Environment**: Node.js
- **Package Manager**: pnpm
- **Cloud Provider**: Google Cloud Platform (GCP)
- **Core Dependencies**:
  - @pulumi/pulumi
  - @pulumi/gcp

## Development Guidelines

### Module Organization
1. Each infrastructure component is organized into its own module under `src/`
2. Modules export a single primary function that handles resource creation
3. Module functions follow the pattern:
   ```javascript
   exports.createComponent = (provider, config, dependencies) => {
       // Resource creation logic
       return {
           // Resource outputs
       };
   };
   ```
4. When a file becomes too large for this type of project, split into smaller files.

### Resource Naming Conventions
1. Resource names should be prefixed with the environment (e.g., "amiara-dev-cluster")
2. Use kebab-case for resource names
3. Resource names should be descriptive and indicate their purpose

## File Organization

### Source Files
- Component modules are placed in dedicated directories under `src/`
- Each module directory contains an `index.js` file
- The index.js can create the resources when the amount of lines are small enough
  but should be split into smaller files included by index.js when the index.js
  becomes too large a file for projects like this.
- Configuration files are placed in the root directory

### Configuration Files
- `Pulumi.yaml`: Project-wide configuration
- `Pulumi.{environment}.yaml`: Environment-specific configuration
- Configuration structure follows nested objects for related settings

## Code Style

### JavaScript Conventions
1. Use CommonJS module system (`require`/`exports`)
2. Follow consistent destructuring patterns for imports
3. Use const for imports and configuration objects
4. Export objects with clear, descriptive property names

### Resource Configuration
1. Group related configuration parameters into objects
2. Use descriptive parameter names
3. Follow GCP's recommended configuration patterns
4. Include proper resource dependencies

Example:
```javascript
const cluster = new gcp.container.Cluster(config.clusterName, {
    location: provider.zone,
    initialNodeCount: config.minNodes,
    // Additional configuration...
}, { provider, dependsOn: dependencies });
```

## Configuration Management

### Pulumi Configuration
1. Use structured configuration objects in Pulumi.{environment}.yaml
2. Organize configuration by component:
   ```yaml
   config:
     component:
       setting1: value1
       setting2: value2
   ```
3. Use environment-specific configurations for different deployment targets

### Secret Management
1. Use Pulumi's secret management for sensitive values
2. Encrypt sensitive configuration using Pulumi's encryption
3. Export sensitive values as secrets using `pulumi.secret()`

## Testing
Testing conventions are currently not (yet) established in the codebase.

## Documentation

### Code Documentation
1. Resource configurations should be self-documenting with clear parameter names
2. Complex configurations should include comments explaining the purpose
3. README.md should provide project overview and setup instructions

### Infrastructure Documentation
1. Document infrastructure components in markdown format
2. Include configuration examples and usage patterns
3. Maintain separate documentation for each environment

## Workflow

### Development Process
1. Use modular development approach
2. Separate resource creation into logical components
3. Follow dependency-based resource creation order

### Resource Management
1. Enable required APIs before creating dependent resources
2. Implement proper resource cleanup with `disableOnDestroy` flags
3. Use proper dependency chains for resource creation

### Version Control
1. Use .gitignore to exclude:
   - node_modules/
   - .pulumi/
   - *.bak files
   - IDE-specific files
2. Commit all infrastructure code and configurations
3. Version control Pulumi configuration files
