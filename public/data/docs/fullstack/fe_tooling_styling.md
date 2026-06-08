# Frontend Tooling, Build Systems & Modern Styling: Study Guide

Modern frontend development relies heavily on efficient tooling and robust build systems to deliver performant, maintainable, and scalable applications. Alongside this, modern styling methodologies have evolved to address the complexities of design systems and responsive UIs.

## 1. Frontend Package Managers

Package managers are essential for managing project dependencies (libraries and frameworks). They allow developers to install, update, and remove external code packages.

*   **npm (Node Package Manager)**: The default package manager for Node.js. It manages packages listed in `package.json`.
    *   `npm install [package-name]`: Installs a package.
    *   `npm install`: Installs all dependencies listed in `package.json`.
    *   `npm run [script-name]`: Executes scripts defined in `package.json`.
*   **Yarn**: An alternative package manager developed by Facebook, often praised for its speed and reliability.
    *   `yarn add [package-name]`: Installs a package.
    *   `yarn install`: Installs all dependencies.
    *   `yarn [script-name]`: Executes scripts.
*   **pnpm**: A fast, disk-space efficient alternative that uses a content-addressable filesystem to store packages, preventing duplication across projects.
    *   `pnpm add [package-name]`: Installs a package.
    *   `pnpm install`: Installs all dependencies.
    *   `pnpm run [script-name]`: Executes scripts.

### `package.json`

This file is at the heart of every Node.js project. It lists project metadata, scripts, and all dependencies (`dependencies` for production, `devDependencies` for development-only tools).

```json
{
  