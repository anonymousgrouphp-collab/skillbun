# Version Control with Git: A Study Guide for Data Engineers

Git is an essential tool for any modern developer, including Data Engineers, enabling collaborative development, tracking changes, and maintaining code integrity. This guide will walk you through the core concepts and workflows of Git.

## 1. Introduction to Git and Version Control

**What is Version Control?**
Version control systems (VCS) track changes to files over time, allowing you to recall specific versions later. This is crucial for:
*   **Collaboration:** Multiple people can work on the same project simultaneously.
*   **History Tracking:** Every change is recorded, showing who made it, when, and why.
*   **Reversion:** Easily revert to previous states of your codebase.
*   **Branching:** Experiment with new features without affecting the main codebase.

**What is Git?**
Git is a distributed version control system (DVCS) designed for speed, data integrity, and support for distributed, non-linear workflows. Unlike centralized systems, every developer's machine holds a complete copy of the repository, enabling offline work and robust redundancy.

## 2. Core Git Concepts

*   **Repository (Repo):** A collection of files and folders where Git tracks changes. It can be `local` (on your machine) or `remote` (on a server like GitHub).
*   **Commit:** A snapshot of your repository at a specific point in time. Each commit has a unique ID (SHA-1 hash), a message, an author, and a timestamp.
*   **Branch:** A lightweight, movable pointer to a commit. Branches allow you to diverge from the main line of development and continue work without messing up the main project.
*   **Head:** A pointer to the latest commit in your current branch.
*   **Staging Area (Index):** An intermediate area where you prepare changes before committing them. You can selectively choose which changes to include in your next commit.

## 3. Basic Git Workflow

Here's a typical sequence of commands for working with Git:

1.  **Initialize a new repository or clone an existing one:**
    ```bash
    git init # Initializes a new local repository
    git clone <repository_url> # Clones a remote repository to your local machine
    ```

2.  **Make changes to files.**

3.  **Check the status of your changes:**
    ```bash
    git status # Shows modified, staged, and untracked files
    ```

4.  **Add changes to the staging area:**
    ```bash
    git add <file_name> # Stages a specific file
    git add . # Stages all changes in the current directory
    ```

5.  **Commit your staged changes:**
    ```bash
    git commit -m "Descriptive commit message" # Creates a new commit
    ```

6.  **View commit history:**
    ```bash
    git log # Displays a list of past commits
    git log --oneline # A more concise view
    ```

7.  **Push changes to a remote repository (if collaborating):**
    ```bash
    git push origin <branch_name> # Sends your local branch commits to the remote
    ```

8.  **Pull changes from a remote repository (to update your local copy):**
    ```bash
    git pull origin <branch_name> # Fetches and merges changes from the remote branch
    ```

## 4. Branching Strategies

Branches are fundamental for parallel development. Two popular strategies:

*   **GitHub Flow:** A lightweight, continuous delivery-focused strategy.
    *   `main` (or `master`) branch is always deployable.
    *   Create a new descriptive branch for every new feature or bug fix.
    *   Commit changes to this feature branch.
    *   Open a Pull Request to merge into `main`.
    *   Review, discuss, and deploy once approved.
    *   Delete the feature branch after merging.

*   **GitFlow:** A more complex, highly structured strategy, often used for projects with defined release cycles.
    *   Has two long-lived branches: `master` (for production releases) and `develop` (for integrating new features).
    *   Supports `feature` branches, `release` branches, and `hotfix` branches for specific purposes.

## 5. Merging and Rebasing

Both merge changes from one branch into another, but they do so differently:

*   **Merging (`git merge <branch_name>`):** Combines the history of two branches. It creates a new 