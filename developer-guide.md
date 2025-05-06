# Developer Guide: Maintaining the @revmax/agent-sdk

This guide outlines the process for maintaining, packaging, and publishing the RevMax Agent SDK npm package.

## Development Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/revmax-hub/nodejs-sdk.git
   cd nodejs-sdk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Project Structure**
   ```
   nodejs/
   ├── dist/          # Compiled TypeScript output
   ├── docs/          # Documentation
   ├── examples/      # Example implementations
   ├── src/           # Source code
   │   ├── auth/      # Authentication modules
   │   ├── resources/ # API resources
   │   ├── types/     # TypeScript type definitions
   │   └── utils/     # Utility functions
   └── tests/         # Test files
   ```

## Development Workflow

### Making Changes

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your code changes in the `src/` directory.

3. Follow the coding standards:
   - Use TypeScript for all new code
   - Add appropriate JSDoc comments
   - Follow existing patterns in the codebase
   - Keep files under 300 lines of code

### Testing

1. Run the linter to check for code style issues:

   ```bash
   npm run lint
   ```

2. Run the formatter to fix code style:

   ```bash
   npm run format
   ```

3. Run tests to ensure your changes don't break existing functionality:

   ```bash
   npm test
   ```

4. Add new tests for new functionality in the `tests/` directory.

### Building the Package

Build the TypeScript code to JavaScript:

```bash
npm run build
```

This will:

- Compile TypeScript to JavaScript in the `dist/` directory
- Generate type definitions (`.d.ts` files)
- Follow the configuration in `tsconfig.json`

### Testing Examples

You can test the package with the example files:

1. TypeScript example:

   ```bash
   npm run example
   ```

2. JavaScript example:
   ```bash
   npm run example:js
   ```

## Versioning and Publishing

### Version Management

We follow [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward-compatible manner
- **PATCH** version for backward-compatible bug fixes

### Publishing Process

1. **Update version number** in `package.json`:

   ```json
   {
     "version": "x.y.z"
   }
   ```

2. **Update the CHANGELOG.md** with details of changes:

   ```markdown
   ## [x.y.z] - YYYY-MM-DD

   ### Added

   - New feature X

   ### Changed

   - Improved Y

   ### Fixed

   - Bug in Z
   ```

3. **Commit and tag the version**:

   ```bash
   git add .
   git commit -m "Release x.y.z"
   git tag -a vx.y.z -m "Version x.y.z"
   ```

4. **Build the package**:

   ```bash
   npm run build
   ```

5. **Verify the package**:

   ```bash
   # Check which files will be included in the package
   npm pack --dry-run
   ```

6. **Publish to npm**:

   ```bash
   # For standard releases
   npm publish

   # For beta releases
   npm publish --tag beta
   ```

7. **Push changes and tags**:
   ```bash
   git push origin main
   git push origin vx.y.z
   ```

### Beta Releases

For beta releases, use the following version format in `package.json`:

```json
{
  "version": "x.y.z-beta.n"
}
```

Publish with:

```bash
npm publish --tag beta
```

### Publishing from CI/CD

For automated publishing:

1. Ensure the CI system has npm authentication:

   ```bash
   echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
   ```

2. Use the following commands in CI:
   ```bash
   npm ci
   npm run build
   npm test
   npm publish
   ```

## Documentation

When making changes, ensure documentation is updated:

1. Update README.md for user-facing changes
2. Update or create docs/\*.md files for detailed documentation
3. Update JSDoc comments in the code
4. Update examples if the API changes

## Troubleshooting

### Common Issues

1. **Authentication errors when publishing**:

   - Check your npm authentication: `npm whoami`
   - Ensure you have publishing rights to the @revmax organization

2. **Errors in published package**:

   - Always run `npm pack` and inspect the contents before publishing
   - Ensure all necessary files are included (check the `files` field in package.json)

3. **TypeScript declaration issues**:
   - Check `tsconfig.json` settings
   - Ensure `declaration: true` is set
   - Validate declaration files after building: `tsc --noEmit`

## Release Checklist

Before each release:

- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation is updated
- [ ] Examples work with new changes
- [ ] Version is updated in package.json
- [ ] CHANGELOG.md is updated
- [ ] Package builds successfully
- [ ] `npm pack` contains the correct files
- [ ] Git tag is created

## Contacts

For questions about the release process, contact:

- RevMax Development Team (dev@revmax.com)
