# Essential Development Environment & Tooling Setup

This study guide will equip you with the knowledge and steps required to set up a robust local development environment, understand essential version control practices, navigate modern package managers, and grasp the complexities of monorepo structures—all critical for building and maintaining a large-scale design system.

## 1. Setting Up Your Local Development Environment

A well-configured environment is the foundation for efficient development.

### 1.1. Code Editor: Visual Studio Code (VS Code)

VS Code is the industry standard for front-end and full-stack development due to its extensive features, vast extension marketplace, and excellent integration with various tools.

**Key Extensions for Design Systems Engineers:**
*   **ESLint:** For consistent code style and error detection.
*   **Prettier:** For automated code formatting.
*   **Stylelint:** For CSS/SCSS/Less linting.
*   **GitLens:** Enhances Git capabilities within VS Code.
*   **Storybook Explorer:** Integrates with Storybook for component development.
*   **Path Intellisense:** Autocompletes filenames.

**Installation:**
Download from [code.visualstudio.com](https://code.visualstudio.com/).

### 1.2. Terminal & Shell

A powerful terminal is crucial for interacting with your system and development tools.

*   **macOS/Linux:** Zsh with Oh My Zsh is highly recommended for its powerful plugins, themes, and customization options.
*   **Windows:** Windows Terminal combined with WSL (Windows Subsystem for Linux) offers a robust Linux environment. PowerShell is also a strong native option.

**Installation (Example for Zsh/Oh My Zsh):**
1.  Install Zsh: `brew install zsh` (macOS) or `sudo apt install zsh` (Linux).
2.  Set Zsh as default: `chsh -s $(which zsh)`.
3.  Install Oh My Zsh: `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`.

### 1.3. Node.js and Node Version Manager (NVM)

Node.js is essential for running JavaScript outside the browser, powering build tools, and package managers. NVM allows you to easily switch between different Node.js versions, which is vital when working on multiple projects with varying requirements.

**Installation (NVM):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# Then, close and reopen your terminal or source your shell profile
nvm install --lts # Installs the latest LTS version
nvm use --lts
nvm alias default lts/gallium # Or your preferred LTS version
```

## 2. Version Control Best Practices with Git & GitHub

Git is the backbone of collaborative development. Understanding its best practices is non-negotiable.

### 2.1. Basic Git Workflow

```bash
git init                                     # Initialize a new Git repository
git add .                                    # Stage all changes
git commit -m "feat: initial commit"         # Commit staged changes with a descriptive message
git remote add origin <repository_url>       # Link to a remote repository
git push -u origin main                      # Push commits to the remote repository
git pull origin main                         # Fetch and merge changes from the remote
git checkout -b feature/new-component        # Create and switch to a new branch
```

### 2.2. Branching Strategies

*   **Feature Branching:** Developers create branches for new features, bug fixes, or experiments. Merged back into `main` (or `develop`) upon completion.
*   **GitHub Flow:** A lightweight, continuous delivery-focused strategy. `main` is always deployable. New work happens in branches, which are merged via pull requests.
*   **GitFlow:** More complex, with long-running `master` and `develop` branches, plus supporting `feature`, `release`, and `hotfix` branches. Suitable for projects with release cycles.

For design systems, GitHub Flow or a simplified feature branching model often works best, emphasizing frequent integration and a continuously deployable `main` branch.

### 2.3. Commit Message Conventions (Conventional Commits)

Using a standardized format for commit messages improves readability, enables automated tooling (e.g., changelog generation), and provides a clear history.

**Format:** `<type>(<scope>): <description>`

*   **type:** `feat` (new feature), `fix` (bug fix), `docs` (documentation), `style` (formatting, no code change), `refactor` (code refactoring), `perf` (performance improvement), `test` (adding tests), `chore` (maintenance, build process changes).
*   **scope (optional):** Component affected (e.g., `button`, `design-tokens`, `docs`).
*   **description:** Concise summary.

**Example:**
```
feat(button): add a new primary variant
fix(modal): prevent body scroll when open
docs: update getting started guide
```

## 3. Modern JavaScript Package Managers

Package managers are crucial for managing dependencies in JavaScript projects.

### 3.1. npm (Node Package Manager)

The default package manager for Node.js.
*   **Pros:** Widespread adoption, large registry, stable.
*   **Cons:** Historically slower than alternatives, can lead to large `node_modules` folders with duplicate dependencies.

**Basic Commands:**
```bash
npm install           # Install all dependencies
npm install <package> # Install a specific package
npm install -D <package> # Install as dev dependency
npm run <script>      # Run a script defined in package.json
npm update            # Update packages
```

### 3.2. Yarn

Created by Facebook to address npm's shortcomings in speed and reliability.
*   **Pros:** Faster, more reliable dependency resolution, `yarn.lock` for consistent installs, workspaces for monorepos.
*   **Cons:** Can still result in large `node_modules`.

**Basic Commands:**
```bash
yarn install          # Install all dependencies
yarn add <package>    # Install a specific package
yarn add -D <package> # Install as dev dependency
yarn <script>         # Run a script
yarn upgrade          # Update packages
```

### 3.3. pnpm (Performant npm)

A relatively newer package manager focused on disk space efficiency and speed.
*   **Pros:** Uses a content-addressable store to save disk space and speed up installations by linking dependencies rather than duplicating them. Excellent for monorepos due to its unique linking strategy.
*   **Cons:** Can have a steeper learning curve for users accustomed to npm/Yarn's `node_modules` structure.

**Basic Commands:**
```bash
pnpm install          # Install all dependencies
pnpm add <package>    # Install a specific package
pnpm add -D <package> # Install as dev dependency
pnpm run <script>     # Run a script
pnpm update           # Update packages
```

**Recommendation for Design Systems:** `pnpm` is increasingly becoming the preferred choice for monorepos and design systems due to its efficiency and performance benefits.

## 4. Monorepo Structures for Design Systems

A monorepo is a single repository containing multiple, distinct projects, often with shared code.

### 4.1. What is a Monorepo?

Instead of separate repositories for each component library, documentation site, or example application, all these projects reside within one Git repository.

**Example Structure:**
```
my-design-system/
├── packages/
│   ├── components/            # React/Vue/Angular components
│   │   ├── button/
│   │   ├── modal/
│   │   └── package.json
│   ├── design-tokens/         # Style definitions (colors, typography, spacing)
│   │   └── package.json
│   ├── hooks/                 # Reusable React hooks
│   │   └── package.json
│   └── utils/                 # General utility functions
│       └── package.json
├── apps/
│   ├── docs/                  # Documentation site (e.g., Storybook, Next.js)
│   │   └── package.json
│   └── playground/            # Example application using the components
│       └── package.json
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # Monorepo configuration
└── tsconfig.json              # Shared TypeScript configuration
```

### 4.2. Why Monorepos for Design Systems?

*   **Simplified Dependency Management:** Easy to manage shared dependencies and ensure consistent versions across packages.
*   **Atomic Changes:** A single commit can update multiple related packages (e.g., a component and its documentation).
*   **Enhanced Collaboration:** Developers can easily see and work on related projects.
*   **Code Reusability:** Promotes sharing code across components and applications within the design system.
*   **Centralized Tooling:** Shared build tools, linters, and test runners.

### 4.3. Monorepo Tooling

While `npm` and `Yarn` have basic workspace support, dedicated tools enhance monorepo management significantly.

*   **Lerna:** A traditional monorepo manager. Helps with versioning, publishing, and running scripts across packages. (Though less actively developed, still widely used).
*   **Nx (by Nrwl):** A powerful build system for monorepos. Provides advanced caching, task orchestration, dependency graphing, and code generation. Excellent for complex monorepos with many packages.
*   **Turborepo (by Vercel):** A high-performance build system for JavaScript and TypeScript monorepos. Focuses on speed with intelligent caching and parallel execution. Integrates well with package managers like pnpm.

**Example: `pnpm-workspace.yaml` (for a pnpm monorepo)**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```
This file tells pnpm to treat `packages` and `apps` subdirectories as distinct packages within the workspace.

## Checklist / Exercise

1.  **Environment Setup:** Install NVM and the latest LTS version of Node.js. Configure your preferred terminal (e.g., Zsh/Oh My Zsh) and VS Code with essential extensions like ESLint and Prettier.
2.  **Git Practice:** Initialize a new Git repository, add a `.gitignore` file, create a feature branch, make a change, commit using the Conventional Commits specification, and then merge it back to `main`.
3.  **Monorepo Simulation:** Create a new directory and initialize it as a pnpm monorepo. Create two sub-packages (e.g., `packages/button` and `apps/storybook`) and install a shared dependency (e.g., `lodash`) at the root level, then ensure it's accessible in both sub-packages.