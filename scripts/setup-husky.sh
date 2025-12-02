#!/bin/sh

# Setup Husky Git Hooks
echo "Setting up Husky git hooks..."

# Install husky
npx husky install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg

echo "✅ Husky setup complete!"
echo ""
echo "Git hooks installed:"
echo "  - pre-commit: Prettier + ESLint + Tests"
echo "  - pre-push: Type check + Full test suite"
echo "  - commit-msg: Conventional commits validation"
echo ""
echo "To test hooks:"
echo "  git add ."
echo "  git commit -m 'test: verify git hooks'"
