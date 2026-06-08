# Version Control with Git for Computer Vision Engineers

Version Control Systems (VCS) are indispensable tools for managing changes to source code, documentation, and data over time. Git stands out as the most widely adopted distributed VCS, offering unparalleled flexibility, speed, and robust support for collaborative development. For Computer Vision engineers, mastering Git is crucial for tracking experiments, managing model versions, collaborating on codebases, and ensuring project reproducibility.

## 1. Introduction to Version Control and Git

### What is Version Control?
Version Control is a system that records changes to a file or set of files over time so that you can recall specific versions later. It allows multiple people to work on a project simultaneously without overwriting each other's changes, provides a complete history of all modifications, and enables reverting to previous states if something goes wrong.

### Why Git?
Git is a *Distributed Version Control System (DVCS)*, meaning every developer has a full copy of the entire project history on their local machine. This offers several advantages:
*   **Offline Work:** Developers can commit changes locally even without network access.
*   **Speed:** Most operations are local, making them incredibly fast.
*   **Branching & Merging:** Git excels at handling complex branching and merging workflows, facilitating parallel development and experimentation.
*   **Data Integrity:** Git ensures the integrity of your codebase through cryptographic hashing.

## 2. Git Fundamentals: The Three States

Git manages your project files in three main states (or areas):
1.  **Working Directory:** The actual files you are currently editing on your filesystem.
2.  **Staging Area (Index):** A temporary area where you prepare changes to be committed. You explicitly add files here using `git add`.
3.  **Local Repository (.git directory):** Where Git permanently stores all committed changes, including the complete history of your project, on your local machine.

## 3. Basic Git Commands

Here are the fundamental commands you'll use daily to navigate these states and manage your project:

*   **`git init`**: Initializes a new Git repository in the current directory. This creates the hidden `.git` subdirectory.
    ```bash
    git init
    ```

*   **`git clone <repository-url>`**: Creates a local copy of an existing remote repository.
    ```bash
    git clone https://github.com/user/my-cv-project.git
    ```

*   **`git add <file>` / `git add .`**: Moves changes from the Working Directory to the Staging Area. `git add .` stages all modified and new files.
    ```bash
    git add main.py
    git add data/config.json
    git add . # stages all modified and new files
    ```

*   **`git commit -m "Commit message"`**: Takes the staged changes and permanently records them as a new snapshot (commit) in the Local Repository. The commit message should be concise and descriptive.
    ```bash
    git commit -m "feat: Implement YOLOv8 object detection inference script"
    ```

*   **`git status`**: Shows the state of the Working Directory and Staging Area, indicating which files are modified, staged, or untracked.
    ```bash
    git status
    ```

*   **`git log`**: Displays the commit history of the current branch.
    ```bash
    git log --oneline # condensed view
    git log --graph --decorate --all # visualize branches and history
    ```

*   **`git diff`**: Shows differences between various Git trees (e.g., Working Directory vs. Staging Area, Staging Area vs. Last Commit).
    ```bash
    git diff          # shows changes not yet staged
    git diff --staged # shows changes in the staging area
    ```

## 4. Remote Repositories (GitHub, GitLab, Bitbucket)

Remote repositories are where your project is hosted online, facilitating collaboration and backup.

*   **`git remote -v`**: Lists your configured remote repositories.
*   **`git remote add origin <repository-url>`**: Adds a new remote repository. `origin` is the conventional name for the primary remote.
    ```bash
    git remote add origin https://github.com/yourusername/your-repo.git
    ```

*   **`git push <remote> <branch>`**: Uploads your local branch commits to the specified remote repository.
    ```bash
    git push origin main
    ```
    *To set up upstream tracking for the first push of a new branch:*
    ```bash
    git push -u origin main
    ```

*   **`git pull <remote> <branch>`**: Fetches changes from a remote branch and *merges* them into your current local branch.
    ```bash
    git pull origin main
    ```

*   **`git fetch <remote>`**: Downloads commits, files, and refs from a remote repository into your local repository *without merging*. This allows you to inspect changes before integrating them.
    ```bash
    git fetch origin
    ```

## 5. Branching and Merging

Branching allows you to diverge from the main line of development and work on new features, experiments, or bug fixes in isolation. Merging combines these separate lines of work back together.

*   **`git branch`**: Lists all local branches. The `*` indicates the current branch.
    ```bash
    git branch
    ```

*   **`git branch <new-branch-name>`**: Creates a new branch.
    ```bash
    git branch feature/segmentation-model
    ```

*   **`git checkout <branch-name>` / `git switch <branch-name>`**: Switches to a different branch. `git switch` is the newer, more intuitive command for switching branches.
    ```bash
    git switch feature/segmentation-model
    # Or to create and switch to a new branch in one command:
    git switch -c develop
    ```

*   **`git merge <branch-to-merge-in>`**: Integrates changes from the specified branch into your current branch.
    ```bash
    # Assuming you are on 'main' and want to merge 'feature/segmentation-model'
    git switch main
    git merge feature/segmentation-model
    ```

*   **Merge Conflicts**: Occur when Git cannot automatically reconcile changes between two branches (e.g., both branches modified the same lines in the same file). You must manually resolve these conflicts, `git add` the resolved files, and then `git commit`.
    ```bash
    # After encountering a merge conflict and manually editing conflicting files
    git add conflicting_file.py
    git commit -m "Resolve merge conflict in conflicting_file.py"
    ```

## 6. Collaborative Workflows

Most teams use a **Feature Branch Workflow** or variations like Gitflow. A common process is:
1.  **Create a new branch** for each feature or bug fix from `main` or `develop`.
    `git switch -c feature/new-algorithm`
2.  **Work and commit locally** on your feature branch, making incremental progress.
3.  **Regularly `pull`** from the main branch (e.g., `main` or `develop`) to keep your feature branch up-to-date and resolve conflicts early.
4.  **Push your feature branch** to the remote repository.
    `git push -u origin feature/new-algorithm`
5.  **Create a Pull Request (PR) / Merge Request (MR)** on your hosting platform (GitHub/GitLab/Bitbucket). This requests that your changes be reviewed and merged into the target branch.
6.  **Review and Approve**: Teammates review the code, suggest changes, and approve the PR/MR.
7.  **Merge PR/MR**: Once approved, the branch is merged into the target branch (e.g., `main`).

## 7. Git in ML/Computer Vision Projects

*   **Experiment Tracking:** Use branches to isolate different experiment setups (e.g., `experiment/resnet50-transfer`, `experiment/data-aug-policy`). Commit frequently to capture specific model states, hyperparameter choices, and data preprocessing steps.
*   **Model Versioning:** While Git itself is not optimized for large binary files (like trained model weights or large datasets), you should commit the *code* that generates or uses specific model versions. For managing large files alongside Git, consider specialized tools like Git LFS (Large File Storage) or DVC (Data Version Control).
*   **Reproducibility:** A well-versioned codebase ensures that any experiment or model output can be reproduced precisely by checking out the corresponding Git commit, making your research and development reliable.

## 8. Quick Checklist/Exercises

To test your understanding of Git fundamentals:

1.  **Local Repository Setup:** Initialize a new Git repository in an empty folder. Create a `README.md` file, add some initial content, stage and commit it. Then, check the repository's status and commit log.
2.  **Branching and Merging:** Create a new branch named `dev-feature`. Switch to this branch, make a significant change to your `README.md` file, and commit it on `dev-feature`. Switch back to your `main` (or `master`) branch and merge `dev-feature` into it. Verify the changes are present on `main`.
3.  **Remote Interaction:** Create a new empty repository on GitHub/GitLab (e.g., `my-git-practice`). Link your local repository to this remote and push your `main` branch to the remote repository. Confirm your changes are visible online.