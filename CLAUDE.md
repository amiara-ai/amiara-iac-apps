# CLAUDE.md - Assistant Reference Guide

## Commands
- **Preview**: `PULUMI_CONFIG_PASSPHRASE=$(skate get pulumi/config-passphrase@amiara) pulumi preview`
- **Deploy**: `PULUMI_CONFIG_PASSPHRASE=$(skate get pulumi/config-passphrase@amiara) pulumi up`
- **Stack Output**: `PULUMI_CONFIG_PASSPHRASE=... pulumi stack output`
- **Config Set**: `pulumi config set [key] [value]`
- **Secret Config**: `pulumi config set --secret [key] [value]`

## Code Style Guidelines
- **Module System**: Use CommonJS with `require`/`exports`
- **Imports**: Use destructuring for imports, e.g., `const { createX } = require('./src/x')`
- **Constants**: Use `const` for imports and configuration objects
- **Naming**:
  - Resource names use kebab-case with environment prefix (e.g., "amiara-dev-cluster")
  - Variables use camelCase
  - Functions use `createXYZ` pattern
- **Exports**: Export objects with descriptive property names
- **Error Handling**: Ensure proper resource dependencies with `dependsOn`
- **Structure**:
  - Each component is a module under `src/`
  - Module exports single function with pattern: `exports.createComponent = (provider, config, dependencies)`
  - Split files when they become too large

## Security Best Practices
- Store sensitive values using `pulumi.secret()`
- Enable authentication for services by default
- Use secure configurations for all resources

## Generic Best Practices
- Use `pnpm lint` systematically after making any changes to make sure no errors.
