# Version Control (Git & GitHub) Study Guide

Version control is an essential skill for any developer, crucial for managing code changes, collaborating effectively, and maintaining a robust development workflow. This guide will introduce you to Git, the most popular distributed version control system, and GitHub, the leading platform for hosting Git repositories and facilitating team collaboration.

## 1. Introduction to Version Control

**What is Version Control?**
Version control systems (VCS) track and manage changes to files over time. They allow multiple people to work on the same project simultaneously without overwriting each other's work, easily revert to previous versions, and manage different lines of development.

**Benefits of VCS:**
*   **Collaboration:** Multiple developers can work on a project concurrently.
*   **History Tracking:** Every change, who made it, and when, is recorded.
*   **Code Rollback:** Easily revert to any previous state of the codebase.
*   **Branching & Merging:** Develop features in isolation and then integrate them.
*   **Backup & Recovery:** Centralized or distributed copies of the codebase.

**Types of VCS:**
*   **Centralized Version Control Systems (CVCS):** (e.g., SVN) A single server holds all versions of the project. Developers check out files from the central server. Single point of failure.
*   **Distributed Version Control Systems (DVCS):** (e.g., Git) Each developer has a complete copy (clone) of the entire repository, including its full history. This offers redundancy, offline work capabilities, and faster operations.

## 2. Git Fundamentals

Git is a powerful, open-source Distributed Version Control System. It tracks changes to files in a project, enabling efficient collaboration and non-linear development through branching.

**Git's Three-State Architecture:**
Git manages your project in three main states:
1.  **Working Directory:** The actual files you're currently editing.
2.  **Staging Area (Index):** A place where you prepare a snapshot of your changes before committing them. You `git add` files here.
3.  **Local Repository (HEAD):** Where Git permanently stores your committed changes. You `git commit` changes from the staging area to the local repository.

### Basic Git Commands

*   `git init`: Initializes a new Git repository in the current directory.
*   `git add <file>` / `git add .`: Stages changes for the next commit. `git add .` stages all changes in the current directory.
*   `git commit -m "<message>"`: Records the staged changes to the local repository with a descriptive message.
*   `git status`: Shows the state of your working directory and staging area.
*   `git log`: Displays the commit history.
*   `git diff`: Shows changes between commits, or between the working directory and the staging area.

**Example Git Workflow (Local):**

```bash
mkdir my-project
cd my-project
git init
echo "# My Awesome Project" > README.md
git add README.md
git commit -m "Initial commit: Add README"

echo "console.log('Hello, Git!');" > app.js
git add app.js
git commit -m "Add initial app.js file"

git status
git log --oneline
```

## 3. Branching and Merging

**What are Branches?**
Branches allow you to diverge from the main line of development and continue to work independently without affecting the main codebase. This is crucial for developing new features, fixing bugs, or experimenting.

*   `main` (or `master`): The primary development branch, typically representing the stable version of your project.

**Branch Commands:**
*   `git branch`: Lists all local branches.
*   `git branch <new-branch-name>`: Creates a new branch.
*   `git checkout <branch-name>`: Switches to a different branch.
*   `git checkout -b <new-branch-name>`: Creates a new branch and switches to it immediately.
*   `git merge <branch-to-merge-in>`: Integrates changes from the specified branch into the current branch.
*   `git branch -d <branch-name>`: Deletes a local branch (only if it's already merged).

**Merge Conflicts:**
Conflicts occur when Git cannot automatically reconcile changes between two branches being merged (e.g., the same line of code was changed differently in both branches). You must manually resolve these conflicts:
1.  Git will mark the conflicting areas in your files.
2.  Edit the files to choose which changes to keep.
3.  `git add` the resolved files.
4.  `git commit` to finalize the merge.

## 4. GitHub: Remote Repositories and Collaboration

GitHub is a web-based platform that uses Git for version control. It provides repository hosting, tools for collaboration (like pull requests), and project management features.

### Working with Remote Repositories

*   **Creating a Remote Repository:** Typically done via the GitHub website.
*   `git remote add origin <repository-url>`: Links your local repository to a remote one (named `origin` by convention).
*   `git push -u origin <branch-name>`: Pushes your local branch's commits to the remote repository. The `-u` flag sets the upstream, so future `git push` and `git pull` commands don't need `origin <branch-name>`.
*   `git pull origin <branch-name>`: Fetches changes from the remote repository and automatically merges them into your current local branch.
*   `git fetch origin`: Fetches changes from the remote but doesn't merge them. Useful for reviewing remote changes before integrating.
*   `git clone <repository-url>`: Creates a local copy of an existing remote repository.

### Pull Requests (PRs)

Pull Requests are at the heart of collaborative development on GitHub. They are a way to propose changes from one branch (typically a feature branch) to another (e.g., `main`).

**PR Workflow:**
1.  Create a new branch for your feature/fix (`git checkout -b feature/my-new-feature`).
2.  Make your changes, `git add`, and `git commit` them to your feature branch.
3.  Push your feature branch to GitHub (`git push origin feature/my-new-feature`).
4.  Go to GitHub and create a new Pull Request from your feature branch to the `main` branch.
5.  Other team members review your code, provide feedback, and request changes.
6.  Once approved, the PR can be merged into the `main` branch.

## Quick Checklist / Exercises:

1.  **Local Repository Mastery:** Create a new directory, initialize a Git repository, create a `README.md` and an `index.html` file. Make an initial commit with both files. Then, add some content to `index.html` and commit again. Use `git log` and `git status` to observe changes.
2.  **Branching & Merging Practice:** From your existing local repository, create a new branch named `feature/contact-page`. Switch to this branch, add a new file `contact.html`, and commit it. Then, switch back to `main` and merge `feature/contact-page` into `main`. Delete the feature branch.
3.  **GitHub Collaboration Simulation:** Create a new *private* repository on GitHub. Link your local repository from exercise 2 to this new remote repository. Push your `main` branch to GitHub. Then, clone the repository into a *new* local directory to simulate another developer. Make a change in the cloned repository, commit, and push it back to GitHub. Observe the changes on GitHub.