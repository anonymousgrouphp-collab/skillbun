# Code Quality, Linting, Typing & Pre-commit Hooks

## Introduction
In modern software development, maintaining high code quality is paramount for collaborative projects and long-term maintainability. This section focuses on establishing robust practices to enforce consistent code style, catch errors early, and improve overall developer experience. We will explore key tools like ESLint for linting, Prettier for formatting, TypeScript for static typing, and pre-commit hooks (Husky, lint-staged) for automating these quality checks.

## 1. Linting with ESLint
**ESLint** is a static analysis tool that identifies problematic patterns found in JavaScript code. It helps enforce coding standards, detect potential errors, and improve code consistency.

### Core Concepts
*   **Rules**: Define specific coding patterns that ESLint will check for (e.g., no unused variables, consistent indentation).
*   **Plugins**: Extend ESLint with rules for specific frameworks (e.g., React, Vue) or new JavaScript features (e.g., TypeScript).
*   **Configs**: Collections of rules and settings that can be extended (e.g., `eslint:recommended`, `airbnb`).

### Installation & Configuration
1.  **Install ESLint**: 
    ```bash
    npm install eslint --save-dev
    # or yarn add eslint --dev
    ```
2.  **Initialize Configuration**: 
    ```bash
    npx eslint --init
    ```
    This command guides you through setting up an `.eslintrc.js` (or `.json`, `.yaml`) file.

### Example `.eslintrc.js`
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended' // Example for React projects
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'indent': ['error', 2], // Enforce 2-space indentation
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': 'warn', // Warn for unused variables
    'react/react-in-jsx-scope': 'off' // Example: Turn off rule for React 17+
  }
};
```

## 2. Code Formatting with Prettier
**Prettier** is an opinionated code formatter that enforces a consistent style by parsing your code and re-printing it with its own rules. Unlike linters, Prettier focuses *only* on formatting.

### Installation & Configuration
1.  **Install Prettier**: 
    ```bash
    npm install prettier --save-dev
    # or yarn add prettier --dev
    ```
2.  **Create `.prettierrc` file**: (e.g., `.json`, `.js`, `.yaml`)

### Example `.prettierrc` (JSON)
```json
{
  