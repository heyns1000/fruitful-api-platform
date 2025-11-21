# Contributing to Fruitful API Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Follow best practices
- Write clear, maintainable code
- Document your changes

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
```bash
git clone https://github.com/your-username/fruitful-api-platform.git
cd fruitful-api-platform
```

3. **Install dependencies**
```bash
npm install
```

4. **Create a branch**
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Frontend Development

```bash
cd frontend
npm run dev
```

Access at: http://localhost:3000

### Backend Development

```bash
cd backend
npm run dev
```

API available at: http://localhost:5000

### Both Simultaneously

From root:
```bash
npm run dev
```

## Code Style

### JavaScript/JSX
- Use ES6+ features
- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive variable names

### React Components
- Use functional components
- Implement proper prop types
- Keep components focused and small
- Use hooks appropriately

### Backend
- Use async/await for async operations
- Implement proper error handling
- Add JSDoc comments for complex functions
- Follow RESTful API conventions

## Commit Messages

Follow conventional commits:
```
feat: add new API endpoint for user management
fix: resolve rate limiting issue
docs: update deployment guide
style: format code with prettier
refactor: restructure authentication middleware
test: add tests for webhook service
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Linting
```bash
npm run lint
```

## Pull Request Process

1. **Update documentation** if needed
2. **Ensure all tests pass**
3. **Update CHANGELOG.md**
4. **Create a detailed PR description**

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

## Feature Requests

Create an issue with:
- Clear description
- Use cases
- Expected behavior
- Mockups (if UI-related)

## Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details

## Project Structure

```
fruitful-api-platform/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   ├── config/         # Configuration
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
└── docs/                   # Documentation
```

## Design System (HSOMNI9000)

When adding UI components, follow the HSOMNI9000 design system:

### Colors
- Vault: Primary blue theme
- Pulse: Red/danger theme
- Seed: Green/success theme
- Slate: Neutral grays

### Components
Use existing component classes:
- `.card`, `.card-header`, `.card-body`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.input`
- `.badge`, `.badge-success`, `.badge-danger`, etc.

### Security Indicators
- Use `.vault-secure` for security-critical sections
- Add VaultLevel 7 indicators where appropriate
- Include FAA-X13 compliance markers

## Security Guidelines

### VaultLevel 7 Requirements
- Encrypt sensitive data
- Use secure authentication
- Implement rate limiting
- Validate all inputs
- Sanitize outputs

### FAA-X13 Compliance
- Enable audit logging
- Follow data retention policies
- Implement privacy controls
- Generate compliance reports

### Common Security Practices
- Never commit secrets
- Use environment variables
- Validate user input
- Use prepared statements
- Implement CSRF protection
- Set security headers

## API Development

### REST Principles
- Use proper HTTP methods
- Return appropriate status codes
- Implement pagination
- Version your APIs
- Document endpoints

### Rate Limiting
Default limits:
- Auth endpoints: 5 requests/15 min
- API endpoints: 100 requests/15 min
- Strict endpoints: 10 requests/min

### Error Handling
Return consistent error format:
```json
{
  "message": "Error description",
  "vaultLevel": 7,
  "faaX13Compliant": true
}
```

## Database Migrations

Add new migrations to `backend/src/utils/migrate.js`:
```javascript
const migrations = [
  `CREATE TABLE new_table (...);`,
  // Add your migration
]
```

## Documentation

Update documentation for:
- New features
- API changes
- Configuration options
- Deployment procedures

## Review Process

PRs are reviewed for:
- Code quality
- Test coverage
- Documentation
- Security implications
- Performance impact
- Design consistency

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues/PRs
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Fruitful API Platform!

**VaultLevel 7 • FAA-X13 Compliant • HSOMNI9000 Design**
