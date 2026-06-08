# Git & Version Control for Azure Projects

Mastering Git is fundamental for any Azure Cloud Engineer, especially when dealing with collaborative development, Infrastructure as Code (IaC), and continuous integration/continuous delivery (CI/CD) pipelines. This study guide will cover the core concepts of Git and its integration with cloud platforms like Azure Repos and GitHub.

## 1. Understanding Version Control and Git

**Version Control System (VCS):** A system that records changes to a file or set of files over time so that you can recall specific versions later. It's crucial for tracking modifications, reverting to previous states, and facilitating collaboration among team members.

**Git:** A distributed version control system (DVCS) designed for speed, data integrity, and support for distributed, non-linear workflows. Unlike centralized systems, every developer's working copy of the code is a complete repository with full history.

**Why Git for Azure Projects?**
*   **Collaboration:** Multiple developers can work on the same project simultaneously without overwriting each other's changes.
*   **History & Auditing:** Every change is tracked, allowing you to see who made what change, when, and why. This is vital for auditing and debugging.
*   **Branching & Merging:** Easily experiment with new features or fixes in isolated branches without affecting the main codebase.
*   **Rollbacks:** Quickly revert to any previous stable version if issues arise.
*   **Infrastructure as Code (IaC):** Manage your Azure ARM templates, Bicep files, or Terraform configurations with the same rigor as application code, ensuring versioned, auditable, and collaborative infrastructure deployments.

## 2. Core Git Concepts

*   **Repository (Repo):** A directory where Git stores all the project files and the complete history of changes.
    *   **Local Repository:** The copy of the project on your machine.
    *   **Remote Repository:** A shared repository (e.g., on Azure Repos or GitHub) where team members push and pull changes.
*   **Commit:** A snapshot of your repository at a specific point in time. Each commit has a unique ID (SHA-1 hash), a message describing the changes, an author, and a timestamp.
*   **Branch:** An independent line of development. Branches allow you to work on new features or bug fixes without affecting the main codebase. The default branch is typically `main` or `master`.
*   **Merge:** The process of combining changes from one branch into another.
*   **Head:** A pointer to the last commit in the currently checked-out branch.
*   **Working Directory:** The files you see and edit in your project folder.
*   **Staging Area (Index):** An intermediate area where you prepare changes before committing them. You `add` files to the staging area.

## 3. Basic Git Workflow

Here’s a typical sequence of commands for managing your code with Git:

1.  **Initialize a new repository:**
    ```bash
    git init
    ```
    This creates a new `.git` subdirectory in your project folder.

2.  **Check the status of your working directory:**
    ```bash
    git status
    ```
    Shows untracked files, modified files, and staged files.

3.  **Add files to the staging area:**
    ```bash
    git add .
    # Or for specific files:
    # git add index.html style.css
    ```
    Stages all changes in the current directory or specified files, preparing them for the next commit.

4.  **Commit staged changes:**
    ```bash
    git commit -m "Initial commit of project structure"
    ```
    Records the staged changes as a new commit in the local repository's history with a descriptive message.

5.  **View commit history:**
    ```bash
    git log
    ```
    Displays a list of all commits in the current branch.

6.  **Create and switch to a new branch:**
    ```bash
    git branch feature/new-dashboard
    git checkout feature/new-dashboard
    # Or combine:
    # git checkout -b feature/new-dashboard
    ```
    Allows you to work on new features in isolation.

7.  **Merge a branch:**
    ```bash
    # First, switch back to the main branch
    git checkout main
    # Then, merge the feature branch into main
    git merge feature/new-dashboard
    ```
    Integrates changes from `feature/new-dashboard` into `main`.

## 4. Branching Strategies

Effective branching strategies are crucial for team collaboration and managing release cycles.

*   **Main/Master Branch:** Represents the stable, production-ready version of your code.
*   **Development Branch:** Often used for ongoing development, integrating features before they reach `main`.
*   **Feature Branches:** Created for individual features or tasks. They are short-lived and merged back into a `development` or `main` branch once complete.
*   **Hotfix Branches:** Created to quickly address critical bugs in the `main` branch.

**GitHub Flow (Simple & Effective):**
1.  Anything in the `main` branch is deployable.
2.  To work on something new, create a descriptively named branch off `main`.
3.  Commit to that branch locally and regularly push your work to the same named branch on the remote.
4.  When feedback or help is needed, or the branch is ready to merge, open a Pull Request (PR).
5.  After the branch has been reviewed and passes CI tests, merge it into `main`.
6.  Once it is merged and pushed to `main`, you can deploy it.

## 5. Integrating with Azure Repos or GitHub

Azure Repos and GitHub are popular platforms for hosting remote Git repositories, offering features like pull requests, code reviews, and integrations with CI/CD pipelines.

1.  **Create a Remote Repository:** Go to Azure DevOps (Azure Repos) or GitHub and create a new repository.
2.  **Connect Local to Remote:**
    ```bash
    # Add a remote named 'origin' pointing to your repository URL
    git remote add origin https://dev.azure.com/<organization>/<project>/_git/<repo-name>
    # Or for GitHub:
    # git remote add origin https://github.com/<username>/<repo-name>.git
    ```
3.  **Push Local Commits to Remote:**
    ```bash
    git push -u origin main
    ```
    The `-u` (or `--set-upstream`) flag sets `origin/main` as the upstream branch for your local `main` branch, making subsequent `git push` and `git pull` commands simpler.

4.  **Pull Changes from Remote:**
    ```bash
    git pull origin main
    ```
    Fetches and integrates changes from the remote `main` branch into your local `main` branch.

## 6. Git for Infrastructure as Code (IaC)

Using Git for IaC (e.g., Azure Bicep, ARM templates, Terraform configurations) is a best practice:
*   **Version History:** Every change to your infrastructure definition is tracked, allowing you to audit changes and revert to previous states if a deployment causes issues.
*   **Collaboration:** Multiple engineers can safely contribute to infrastructure definitions.
*   **Review Process:** Pull Requests enable peer review of infrastructure changes before they are applied, catching errors and ensuring compliance.
*   **Automation:** Git is the starting point for CI/CD pipelines that automatically deploy infrastructure changes upon merging into specific branches.

### Quick Checklist/Exercise:

1.  Explain the difference between `git add .` and `git commit -m "message"`.
2.  Why is branching important in a team development environment?
3.  You've made changes locally and want to share them with your team on a remote repository. What sequence of Git commands would you use?