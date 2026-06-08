# Environment Setup & Tooling for Angular Development

Setting up a robust and efficient development environment is the foundational step for any Angular developer. A well-configured environment ensures a smooth workflow, boosts productivity, and minimizes common setup-related hurdles. This guide will walk you through the essential tools and their configurations.

## 1. Node.js and npm/Yarn

Angular applications rely heavily on Node.js as their runtime environment for server-side operations during development (like building, serving, and testing) and for managing project dependencies. npm (Node Package Manager) and Yarn are the primary package managers used to install, manage, and share JavaScript packages.

### Core Concepts:
*   **Node.js**: An open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. It's crucial for Angular's build processes.
*   **npm/Yarn**: Package managers that allow developers to share and reuse code by providing access to a vast registry of open-source packages. `npm` is bundled with Node.js, while `Yarn` is an alternative developed by Facebook, often praised for speed and reliability.

### Installation:
1.  **Download Node.js**: Visit the official Node.js website (nodejs.org) and download the LTS (Long Term Support) version suitable for your operating system. The installer will typically include npm.
2.  **Verify Installation**: Open your terminal or command prompt and run:
    ```bash
    node -v
    npm -v
    ```
    You should see the installed versions.
3.  **Install Yarn (Optional)**: If you prefer Yarn, install it globally via npm:
    ```bash
    npm install -g yarn
    yarn -v
    ```

## 2. Visual Studio Code (VS Code)

VS Code is a free, powerful, and highly customizable code editor from Microsoft, widely adopted by the Angular community. Its rich ecosystem of extensions significantly enhances the development experience.

### Installation:
*   Download VS Code from code.visualstudio.com. Follow the installation instructions for your OS.

### Recommended Angular Extensions:
Enhance your VS Code experience with these extensions:
*   **Angular Language Service**: Provides rich editing features for Angular templates, including autocompletion, error checking, and navigation.
*   **Prettier - Code formatter**: Automatically formats your code to ensure consistent styling across your project.
*   **ESLint**: Integrates ESLint into VS Code, helping you maintain code quality and adhere to best practices by identifying and reporting patterns in JavaScript code.
*   **Material Icon Theme**: (Optional) Provides distinct icons for different file types, making your project explorer easier to navigate.

### Installing Extensions:
1.  Open VS Code.
2.  Click the Extensions icon in the Activity Bar on the side (or press `Ctrl+Shift+X`).
3.  Search for the extension name and click "Install".

## 3. Git for Version Control

Git is a distributed version control system that tracks changes in source code during software development. It's indispensable for individual developers and teams, allowing for collaboration, history tracking, and easy rollback to previous states.

### Installation:
*   Download Git from git-scm.com. Follow the installation instructions for your OS.
*   **Verify Installation**: Open your terminal and run:
    ```bash
    git --version
    ```

### Basic Commands:
*   `git init`: Initializes a new Git repository in the current directory.
*   `git add .`: Stages all changes in the current directory for the next commit.
*   `git commit -m "Initial commit"`: Records staged changes to the repository with a descriptive message.
*   `git clone [repository-url]`: Downloads an existing Git repository from a remote server (e.g., GitHub).

## 4. Browser Developer Tools

Modern web browsers come with powerful built-in developer tools that are essential for inspecting, debugging, and optimizing web applications.

### Accessing DevTools:
*   **Google Chrome / Mozilla Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (macOS).

### Key Panels:
*   **Elements**: Inspect and modify the HTML and CSS of your page in real-time.
*   **Console**: View JavaScript errors, log messages, and interact with your application's JavaScript runtime.
*   **Sources**: Debug your JavaScript code by setting breakpoints, stepping through execution, and inspecting variables.
*   **Network**: Monitor network requests, inspect response data, and analyze loading performance.
*   **Application**: Inspect local storage, session storage, cookies, and service workers.

---

### Quick Checklist/Exercise:
1.  Verify your Node.js and npm versions by running `node -v` and `npm -v` in your terminal.
2.  Install the "Angular Language Service" and "Prettier - Code formatter" extensions in VS Code.
3.  Open your browser's developer tools (F12) and navigate to the "Console" tab. Type `console.log("Hello SkillBun!")` and press Enter.