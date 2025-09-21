# Contributing to AI-Powered Artisan Marketplace

Thank you for your interest in contributing to the AI-Powered Artisan Marketplace! This project aims to bridge the digital divide for India's 200+ million artisans through AI-powered marketplace solutions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Platform account (for AI services)
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/ai-artisan-marketplace.git
   cd ai-artisan-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the applications**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

## Project Structure

```
ai-artisan-marketplace/
├── server/                 # Backend API (Node.js, TypeScript)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── tests/             # Backend tests
│   └── Dockerfile
├── client/                # Frontend (React, TypeScript)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── Dockerfile
├── mobile/                # Mobile app (React Native)
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── docker-compose.yml     # Docker development environment
```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

1. **Bug Fixes** - Fix existing issues
2. **Feature Development** - Add new features
3. **Documentation** - Improve documentation
4. **Testing** - Add or improve tests
5. **Performance** - Optimize performance
6. **Accessibility** - Improve accessibility
7. **Internationalization** - Add language support
8. **UI/UX** - Improve user interface and experience

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Feature is properly tested
- [ ] Breaking changes are documented

### Pull Request Template

When creating a pull request, please use the following template:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests and linting
2. **Code Review** - At least one maintainer reviews the code
3. **Testing** - Manual testing if required
4. **Approval** - Maintainer approves the PR
5. **Merge** - PR is merged into main branch

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the bug
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, browser, Node.js version)
5. **Screenshots** if applicable
6. **Error logs** if available

### Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Proposed solution** (if you have one)
4. **Alternatives considered**
5. **Additional context**

### Issue Labels

We use the following labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Use async/await instead of Promises where possible

### React

- Use functional components with hooks
- Use TypeScript interfaces for props
- Follow React best practices
- Use proper key props for lists
- Avoid inline functions in JSX when possible

### CSS/Styling

- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use semantic class names
- Avoid inline styles
- Use CSS custom properties for theming

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Include proper error handling
- Use consistent response format
- Add proper validation

## Testing

### Backend Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Guidelines

- Write unit tests for all new functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for at least 80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions and return types
- Add examples for complex functions
- Update README files when needed

### API Documentation

- Update API documentation for new endpoints
- Include request/response examples
- Document error codes and messages
- Add authentication requirements

### User Documentation

- Update user guides for new features
- Add screenshots for UI changes
- Keep installation instructions up to date
- Document configuration options

## Internationalization

### Adding New Languages

1. Add language to `SUPPORTED_LANGUAGES` in `server/src/config/ai.ts`
2. Add translations to `client/src/contexts/LanguageContext.tsx`
3. Test voice recognition for the new language
4. Update documentation

### Translation Guidelines

- Use professional translators when possible
- Test translations with native speakers
- Consider cultural context
- Keep translations consistent
- Update all user-facing text

## Performance Guidelines

### Frontend Performance

- Use React.memo for expensive components
- Implement code splitting
- Optimize images and assets
- Use lazy loading where appropriate
- Minimize bundle size

### Backend Performance

- Use database indexes appropriately
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Monitor performance metrics

## Security Guidelines

### General Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication
- Use HTTPS in production

### API Security

- Implement rate limiting
- Use proper CORS configuration
- Validate request payloads
- Sanitize user inputs
- Log security events

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- `MAJOR` - Breaking changes
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Changelog is updated
- [ ] Version numbers are updated
- [ ] Release notes are prepared
- [ ] Security review completed

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use clear and concise language
- Ask questions when in doubt
- Provide constructive feedback
- Help others when possible

### Getting Help

- Check existing documentation first
- Search existing issues
- Ask questions in discussions
- Join our community Discord
- Contact maintainers if needed

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Contact

- Project Maintainer: [Your Name](mailto:maintainer@artisan-marketplace.com)
- Community Discord: [Join Here](https://discord.gg/artisan-marketplace)
- Project Website: [artisan-marketplace.com](https://artisan-marketplace.com)

Thank you for contributing to the AI-Powered Artisan Marketplace! Together, we can help preserve cultural heritage and empower artisans worldwide.
