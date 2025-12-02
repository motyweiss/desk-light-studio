# Git Hooks (Husky)

Automated quality checks on git commits and pushes.

## Hooks

### Pre-commit (`.husky/pre-commit`)
Runs before every commit:
- **Prettier**: Auto-format staged files
- **ESLint**: Lint and auto-fix staged files
- **Tests**: Run tests related to changed files

**Configured via**: `.lintstagedrc.json`

### Pre-push (`.husky/pre-push`)
Runs before every push:
- **Type check**: `npx tsc --noEmit`
- **Full test suite**: `npm test -- --run`

### Commit-msg (`.husky/commit-msg`)
Validates commit message format:
- **Commitlint**: Enforces conventional commit format

**Configured via**: `commitlint.config.js`

## Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build process, dependencies
- `revert`: Revert previous commit
- `build`: Build system changes
- `ci`: CI configuration changes

### Examples

```bash
feat: add media player volume control
fix: resolve light sync race condition
docs: update README with installation steps
refactor: extract usePolling hook
test: add E2E tests for settings dialog
chore: upgrade dependencies
```

## Setup

Husky hooks are automatically installed when running:

```bash
npm install
npm run prepare
```

## Bypassing Hooks (Not Recommended)

```bash
# Skip pre-commit hooks
git commit --no-verify -m "message"

# Skip pre-push hooks
git push --no-verify
```

⚠️ **Only use in emergencies** - bypassing hooks can introduce bugs into the codebase.

## Troubleshooting

### Hooks not running

```bash
# Reinstall Husky
rm -rf .husky/_
npm run prepare
```

### Permission issues

```bash
# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

## Configuration Files

- `.prettierrc.json`: Prettier formatting rules
- `.prettierignore`: Files to exclude from formatting
- `.lintstagedrc.json`: Lint-staged configuration
- `commitlint.config.js`: Commit message linting rules
