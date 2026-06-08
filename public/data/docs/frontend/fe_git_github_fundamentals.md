# Git & GitHub Fundamentals: A Study Guide

Welcome to the foundational guide on Git and GitHub, essential tools for any modern developer, especially in frontend where collaboration and version control are paramount. Git is a distributed version control system that tracks changes in your codebase, while GitHub is a web-based platform for hosting Git repositories, enabling seamless collaboration.

## 1. Git Fundamentals

Git allows you to track every change made to your project files, revert to previous versions, and work concurrently with others without overwriting each other's work.

### Core Concepts

*   **Repository (Repo):** A project's history (commits), branches, and files are stored here.
*   **Working Directory:** The actual files you see and edit on your computer.
*   **Staging Area (Index):** An intermediate area where you prepare changes before committing them.
*   **Local Repository:** The `.git` folder in your project, containing all version history.

### Essential Git Commands

Here are the fundamental commands you'll use daily:

*   **`git init`**: Initializes a new local Git repository in your current directory.
    ```bash
    git init
    ```
*   **`git clone <url>`**: Creates a local copy of an existing remote repository.
    ```bash
    git clone https://github.com/user/repo-name.git
    ```
*   **`git add <file>` / `git add .`**: Stages changes. `git add <file>` stages a specific file, `git add .` stages all changes in the current directory and subdirectories.
    ```bash
    git add index.html style.css
    git add .
    ```
*   **`git commit -m "Your commit message"`**: Records the staged changes to the local repository with a descriptive message.
    ```bash
    git commit -m "feat: Add initial homepage structure"
    ```
*   **`git status`**: Shows the status of your working directory and staging area, listing modified, staged, and untracked files.
    ```bash
    git status
    ```
*   **`git log`**: Displays the commit history for the current branch, showing commit hash, author, date, and message.
    ```bash
    git log
    ```

## 2. Branching & Merging

Branches are independent lines of development. They allow you to work on new features or fixes without affecting the main codebase.

*   **`git branch`**: Lists all local branches.
    ```bash
    git branch
    ```
*   **`git branch <new-branch-name>`**: Creates a new branch.
    ```bash
    git branch feature/user-auth
    ```
*   **`git checkout <branch-name>`**: Switches to an existing branch.
    ```bash
    git checkout feature/user-auth
    ```
    *   *Shorthand to create and switch:* `git checkout -b <new-branch-name>`
    ```bash
    git checkout -b fix/bug-123
    ```
*   **`git merge <branch-to-merge-from>`**: Integrates changes from the specified branch into your current branch.
    ```bash
    # Assuming you are on 'main' branch
    git merge feature/user-auth
    ```

### Conflict Resolution

Conflicts occur when Git cannot automatically reconcile changes between branches (e.g., the same line modified differently). Git will mark the conflicting files. You need to manually edit the files, choose which changes to keep, and then `git add` and `git commit` the resolved changes.

## 3. Remote Repositories (GitHub)

GitHub hosts your Git repositories online, allowing for backup, sharing, and collaboration.

*   **`git remote add origin <url>`**: Connects your local repository to a remote repository, typically named `origin`.
    ```bash
    git remote add origin https://github.com/your-username/your-repo.git
    ```
*   **`git push origin <branch-name>`**: Uploads your local commits to the specified remote branch.
    ```bash
    git push origin main
    git push origin feature/new-design
    ```
    *   *First push for a new branch:* `git push -u origin <branch-name>` (sets upstream tracking)
*   **`git pull origin <branch-name>`**: Downloads and integrates changes from the remote branch into your current local branch. This is a shorthand for `git fetch` followed by `git merge`.
    ```bash
    git pull origin main
    ```
*   **`git fetch origin`**: Downloads new data from the remote repository but doesn't integrate it into your local working files. Useful for reviewing changes before merging.
    ```bash
    git fetch origin
    ```

## 4. GitHub Collaboration Workflow

GitHub provides powerful features for team collaboration:

*   **Forking**: Creating a personal copy of someone else's repository under your GitHub account. This is common for contributing to open-source projects without direct write access to the original.
*   **Pull Requests (PRs)**: A formal way to propose changes from your branch (or forked repo) to another repository's branch. PRs facilitate code review and discussion before merging.
    *   **Workflow**:
        1.  Make changes in a feature branch.
        2.  Push the branch to GitHub.
        3.  Open a Pull Request from your branch to the target branch (e.g., `main`).
        4.  Team members review, comment, and approve.
        5.  The PR is merged.
*   **Issues**: Used to track tasks, bugs, feature requests, and general project discussions within a repository. They provide a structured way to manage work items.

## Quick Check-in / Exercise

1.  Initialize a new Git repository in an empty folder on your computer.
2.  Create a file named `index.html` with some basic HTML content. Add it to the staging area and commit it with a message like "Initial commit: basic HTML structure".
3.  Create a new branch called `dev-feature`. Switch to this branch, add a `style.css` file, stage and commit it. Then, switch back to your `main` branch.