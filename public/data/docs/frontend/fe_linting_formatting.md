# Linting & Formatting (ESLint, Prettier) Study Guide

Linting and formatting are essential practices in modern web development that significantly enhance code quality, readability, and maintainability. They help teams adhere to consistent coding standards, catch potential errors early, and reduce cognitive load during code reviews.

## 1. Understanding Linting with ESLint

### What is Linting?

Linting is the process of analyzing source code to flag programming errors, bugs, stylistic errors, and suspicious constructs. A 'linter' is a tool that performs this analysis.

### What is ESLint?

ESLint is the most popular linting tool for JavaScript. It is highly configurable and extensible, allowing developers to define a vast array of rules for their codebase. These rules can range from enforcing specific coding styles (e.g., using `===` instead of `==`) to identifying potential issues like unused variables or unreachable code.

### Why ESLint?

*   **Code Quality:** Catches potential bugs and anti-patterns early.
*   **Consistency:** Enforces coding standards across a team or project.
*   **Readability:** Promotes cleaner, more predictable code.
*   **Developer Productivity:** Reduces time spent on manual code reviews for style issues.

### Basic ESLint Setup

1.  **Install ESLint:**
    ```bash
    npm install eslint --save-dev
    # or
    yarn add eslint --dev
    ```

2.  **Initialize Configuration:** Run the ESLint setup wizard. This will ask you questions about your project and generate a `.eslintrc.js` (or `.json`/`.yaml`) file.
    ```bash
    npx eslint --init
    ```
    *Common choices during `eslint --init` include:* using popular style guides (e.g., Airbnb, Standard, Google), opting for React/Vue/Node.js environments, and choosing a configuration file format.

3.  **Example `.eslintrc.js`:**
    ```javascript
    module.exports = {
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
      extends: ['eslint:recommended', 'plugin:react/recommended'],
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['react'],
      rules: {
        // Custom rules or overrides
        'no-console': 'warn', // Warns about console.log
        'indent': ['error', 2], // Enforces 2-space indentation
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'react/react-in-jsx-scope': 'off' // Example for React 17+
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    };
    ```

4.  **Add Script to `package.json`:**
    ```json
    {
      "name": "my-project",
      "version": "1.0.0",
      "scripts": {
        "lint": "eslint .",
        "lint:fix": "eslint . --fix"
      },
      "devDependencies": {
        "eslint": "^8.0.0"
      }
    }
    ```

5.  **Run ESLint:**
    ```bash
    npm run lint         # To check for errors
    npm run lint:fix     # To automatically fix fixable errors
    ```

## 2. Automatic Formatting with Prettier

### What is Prettier?

Prettier is an opinionated code formatter that enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account. Unlike linters, Prettier focuses *solely* on formatting.

### Why Prettier?

*   **No More Style Debates:** Eliminates discussions about tabs vs. spaces, semicolons, etc.
*   **Consistent Codebase:** Ensures all code looks the same, regardless of who wrote it.
*   **Reduced Cognitive Load:** Developers can focus on logic, not formatting.
*   **Easy Integration:** Works with many editors and build tools.

### Basic Prettier Setup

1.  **Install Prettier:**
    ```bash
    npm install prettier --save-dev
    # or
    yarn add prettier --dev
    ```

2.  **Create Configuration File (`.prettierrc.json`):** Prettier is opinionated, but you can override a few settings.
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 80,
      "tabWidth": 2
    }
    ```
    *Common Prettier configuration options include `semi`, `singleQuote`, `tabWidth`, `printWidth`, `trailingComma`, etc.*

3.  **Add Script to `package.json`:**
    ```json
    {
      "name": "my-project",
      "version": "1.0.0",
      "scripts": {
        "format": "prettier --write ."
      },
      "devDependencies": {
        "prettier": "^2.0.0"
      }
    }
    ```

4.  **Run Prettier:**
    ```bash
    npm run format
    ```

## 3. Integrating ESLint with Prettier

It's common to use both ESLint (for code quality and some stylistic rules) and Prettier (for consistent formatting). To prevent them from conflicting, you should configure ESLint to *defer* to Prettier for formatting-related rules.

### Steps for Integration

1.  **Install Integration Packages:**
    *   `eslint-config-prettier`: Turns off all ESLint rules that are unnecessary or might conflict with Prettier.
    *   `eslint-plugin-prettier`: Runs Prettier as an ESLint rule, reporting differences as ESLint errors.

    ```bash
    npm install eslint-config-prettier eslint-plugin-prettier --save-dev
    # or
    yarn add eslint-config-prettier eslint-plugin-prettier --dev
    ```

2.  **Update `.eslintrc.js`:**
    *   Add `plugin:prettier/recommended` to your `extends` array. This is a shortcut that does two things:
        1.  Adds `eslint-plugin-prettier` to your ESLint configuration.
        2.  Adds `eslint-config-prettier` to your `extends` array (always put it last to ensure it overrides any conflicting rules).

    ```javascript
    module.exports = {
      // ... other configurations ...
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        // Must be the last entry in the 'extends' array
        'plugin:prettier/recommended'
      ],
      rules: {
        // ESLint rules that are NOT covered by Prettier
        'no-console': 'warn',
        // Example: If you want to customize Prettier rules via ESLint, you can do this,
        // but it's generally better to configure Prettier directly.
        // 'prettier/prettier': ['error', {"semi": false, "singleQuote": true}]
      }
      // ... rest of the configuration ...
    };
    ```

3.  **VS Code Integration (Recommended):
    *   Install the `ESLint` and `Prettier - Code formatter` extensions.
    *   In VS Code settings (CMD/CTRL + ,), search for `format on save` and enable it.
    *   Also, ensure `editor.defaultFormatter` is set to `esbenp.prettier-vscode`.
    *   This setup automatically formats your code with Prettier and runs ESLint checks every time you save a file.

## Quick Checklist / Exercise

1.  **Setup Challenge:** Create a new empty JavaScript project. Install ESLint and Prettier. Configure them to work together so that ESLint uses the Airbnb style guide, and Prettier enforces `singleQuote: true` and `semi: false`. Ensure `npm run lint` identifies an unformatted file and `npm run format` fixes it.
2.  **Rule Enforcement:** Add a custom ESLint rule to your `.eslintrc.js` that disallows the use of `var` and changes it to an 'error'. Write a small JavaScript file using `var` and verify that ESLint catches it.
3.  **Conflict Resolution:** Temporarily add an ESLint rule like `'indent': ['error', 4]` to your `.eslintrc.js` *before* the `plugin:prettier/recommended` extend. Observe if Prettier still formats with 2 spaces or if ESLint tries to enforce 4. Then, move `plugin:prettier/recommended` to the *very last* item in the `extends` array and re-observe to understand how `eslint-config-prettier` works.