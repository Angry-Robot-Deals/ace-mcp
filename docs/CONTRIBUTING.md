# Contributing to ACE MCP Server

Thank you for your interest in contributing to ACE MCP Server! This document provides guidelines and instructions for contributing to the project.

## 🤝 How to Contribute

### Getting Started

1. **Fork the Repository**
   - Fork the repository on GitHub
   - Clone your fork locally:
     ```bash
     git clone https://github.com/YOUR_USERNAME/ace-mcp.git
     cd ace-mcp
     ```

2. **Set Up Development Environment**
   - Read the [Project Overview](./intro/START_HERE.md) for detailed introduction
   - Follow the [Installation Guide](./intro/INSTALLATION.md)
   - Review the [Development Guide](./intro/DESCRIPTION.md)
   - Set up your local development environment using Docker Compose:
     ```bash
     cp .env.example .env
     # Edit .env with your configuration
     docker-compose -f docker-compose.dev.yml up -d
     ```

3. **Create a Branch**
   - Create a feature branch from `main`:
     ```bash
     git checkout -b feature/your-feature-name
     # or
     git checkout -b fix/your-bug-fix
     ```

## 📋 Contribution Guidelines

### Code Style

- **TypeScript**: Follow TypeScript best practices and use strict mode
- **Code Formatting**: Use consistent indentation (2 spaces for TypeScript/JavaScript, 4 for shell scripts)
- **Naming Conventions**:
  - Use camelCase for variables and functions
  - Use PascalCase for classes and types
  - Use UPPER_SNAKE_CASE for constants
- **Documentation**: Document all public methods with JSDoc comments
- **Comments**: Write clear, concise comments for complex logic

### Commit Messages

Follow the conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(dashboard): add bearer token authentication UI

Implemented token input field with save/clear functionality
and localStorage persistence.

Fixes #123
```

```
fix(api): correct error handling in playbook endpoint

Handle edge case where playbook is empty gracefully.
```

### Pull Request Process

1. **Before Submitting**
   - Ensure your code follows the project's code style
   - Write or update tests as needed
   - Update documentation if necessary
   - Check that all tests pass:
     ```bash
     npm test
     ```
   - Verify the code builds successfully:
     ```bash
     npm run build
     ```

2. **Create Pull Request**
   - Push your branch to your fork:
     ```bash
     git push origin feature/your-feature-name
     ```
   - Open a Pull Request on GitHub
   - Fill out the PR template (if available)

3. **PR Description**
   Include in your PR description:
   - **What**: Brief description of changes
   - **Why**: Motivation and context for the change
   - **How**: Summary of implementation approach
   - **Testing**: How you tested the changes
   - **Screenshots**: If UI changes were made
   - **Related Issues**: Reference any related issues (e.g., "Fixes #123")

4. **PR Requirements**
   - ✅ All tests pass
   - ✅ Code follows style guidelines
   - ✅ Documentation updated (if needed)
   - ✅ No merge conflicts with main branch
   - ✅ CI/CD checks pass (if applicable)

5. **Review Process**
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Keep your branch up to date with main:
     ```bash
     git checkout main
     git pull upstream main
     git checkout feature/your-feature-name
     git rebase main
     ```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for all new features
- Include edge cases and error scenarios
- Maintain or improve test coverage
- Use descriptive test names:
  ```typescript
  describe('Playbook', () => {
    it('should add bullet to correct section', () => {
      // test implementation
    });
    
    it('should handle empty playbook gracefully', () => {
      // test implementation
    });
  });
  ```

## 📝 Documentation Guidelines

### Code Documentation

- Add JSDoc comments for all public methods:
  ```typescript
  /**
   * Creates an LLM provider instance based on configuration.
   * 
   * @param config - Provider configuration
   * @returns Instantiated provider
   * @throws Error if provider type is unknown
   */
  export function createLLMProvider(config: LLMProviderConfig): LLMProvider {
    // implementation
  }
  ```

### Markdown Documentation

- Follow existing documentation structure in `docs/`
- Use clear headings and structure
- Include code examples where helpful
- Keep documentation up to date with code changes

### README Updates

- Update README.md if adding new features
- Keep installation instructions current
- Update configuration examples if needed

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported in Issues
2. Verify the bug exists in the latest version
3. Try to reproduce the bug consistently

### Bug Report Template

When reporting a bug, include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**:
  - OS and version
  - Node.js version
  - Docker version (if applicable)
  - Browser version (if applicable marks)
- **Screenshots/Logs**: If applicable
- **Additional Context**: Any other relevant information

## 💡 Suggesting Features

### Before Suggesting

1. Check if the feature has already been suggested
2. Consider if the feature aligns with the project's goals
3. Think about potential implementation approaches

### Feature Request Template

When suggesting a feature, include:

- **Problem**: What problem does this feature solve?
- **Solution**: Describe your proposed solution
- **Alternatives**: Any alternative solutions you've considered
- **Additional Context**: Any other relevant information

## 🏗️ Project Structure

Understanding the project structure helps with contributions:

```
ace-mcp-server/
├── src/              # Source code
│   ├── core/        # Core ACE components
│   ├── llm/         # LLM provider implementations
│   ├── mcp/         # MCP server implementation
│   └── utils/       # Utility functions
├── docs/            # Documentation
├── dashboard/       # Dashboard frontend
├── tests/           # Test files
└── docker/          # Docker configurations
```

## 🔒 Security

### Security Issues

- **DO NOT** open public issues for security vulnerabilities
- Report security issues privately to: [security email if available]
- Include detailed information about the vulnerability
- Allow time for the issue to be addressed before public disclosure

### Security Best Practices

- Never commit secrets, API keys, or frequencies to the repository
- Use environment variables for sensitive configuration
- Follow security best practices in your contributions
- Review code for potential security issues

## 📚 Resources

- [Project Overview](./intro/START_HERE.md) - Detailed project introduction
- [Installation Guide](./intro/INSTALLATION.md) - Setup instructions
- [Development Guide](./intro/DESCRIPTION.md) - Development best practices
- [LLM Providers](./LLM_PROVIDERS.md) - LLM provider configuration
- [Deployment Guide](./deployment/DEPLOYMENT_README.md) - Production deployment

## ❓ Questions?

If you have questions about contributing:

1. Check existing documentation in `docs/`
2. Search existing Issues and Pull Requests
3. Open a new Issue with the `question` label

## 🙏 Thank You!

Your contributions help make ACE MCP Server better for everyone. Thank you for taking the time to contribute!

---

**Remember**: All contributors are expected to follow our Code of Conduct and be respectful in all interactions.
