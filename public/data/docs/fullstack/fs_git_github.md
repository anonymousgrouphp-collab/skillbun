# Version Control with Git & GitHub (Advanced Workflows) Study Guide

This guide delves into advanced Git concepts and collaborative workflows on GitHub, crucial for any professional full-stack developer. Mastering these techniques ensures efficient teamwork, robust code management, and the ability to handle complex project histories.

## 1. Advanced Git Commands

Beyond `add`, `commit`, `push`, and `pull`, Git offers powerful commands for fine-grained control over your project history.

### Git Rebase
`git rebase` is used to integrate changes from one branch into another, similar to `git merge`, but it rewrites commit history. Instead of creating a merge commit, `rebase` moves or combines commits to a new base commit, creating a linear history.

*   **Purpose:** To maintain a clean, linear project history by moving your feature branch's commits on top of the target branch's latest commit.
*   **When to use:**
    *   Before merging a feature branch back into `main` to ensure your feature branch is up-to-date and its commits are on top of the `main` branch.
    *   To clean up your local commits before pushing them to a shared remote (using `git rebase -i` for interactive rebasing).
*   **Example:**
    ```bash
    # From your feature branch
    git checkout feature-branch
    git rebase main
    # Resolve any conflicts, then continue
    git add .
    git rebase --continue
    # After rebase, you might need to force push if you pushed the branch before
    # git push --force-with-lease origin feature-branch
    ```
    **Caution:** Never rebase a public/shared branch, as it rewrites history and can cause problems for collaborators.

### Git Cherry-pick
`git cherry-pick` is used to apply specific commits from one branch onto another. It creates a new commit on the current branch with the same changes as the chosen commit.

*   **Purpose:** To selectively bring in individual commits without merging an entire branch.
*   **When to use:**
    *   To hotfix a production branch with a specific commit from a development branch.
    *   To port a bug fix from one branch to several others.
*   **Example:**
    ```bash
    # From the branch where you want to apply the commit
    git checkout hotfix-branch
    # Apply commit hash 'abcdefg' from another branch
    git cherry-pick abcdefg
    ```

### Git Reflog
`git reflog` (reference logs) records every change to your repository's HEAD. It's a lifesaver for recovering lost commits or branches.

*   **Purpose:** To see a history of where your HEAD has been, allowing you to go back to previous states.
*   **When to use:**
    *   You accidentally reset your branch to an older commit.
    *   You lost a commit due to a bad rebase or merge.
*   **Example:**
    ```bash
    git reflog
    # Output might look like:
    # HEAD@{0}: commit: Add new feature X
    # HEAD@{1}: rebase (finish): returning to refs/heads/feature-branch
    # HEAD@{2}: rebase (start): checkout main
    # HEAD@{3}: commit (initial): Initial commit
    # To restore to a previous state:
    git reset HEAD@{1} # Restores the branch to the state at reflog entry 1
    ```

## 2. Mastering Branching Strategies

Effective branching strategies are vital for managing parallel development and releases.

### Git Flow
A highly structured branching model suitable for projects with scheduled releases.

*   **Branches:**
    *   `master` (or `main`): Contains production-ready code.
    *   `develop`: Integrates all completed feature branches for the next release.
    *   `feature/*`: For developing new features.
    *   `release/*`: For preparing a new production release, allowing for minor bug fixes.
    *   `hotfix/*`: For quickly addressing critical bugs in `master`.
*   **Pros:** Clear roles for branches, well-defined release cycle.
*   **Cons:** Can be overly complex for smaller teams or projects with continuous delivery.

### GitHub Flow
A lightweight, continuous delivery-focused branching strategy.

*   **Branches:**
    *   `main` (or `master`): Always deployable.
    *   `feature-branch`: Created off `main` for any new work.
*   **Workflow:**
    1.  Create a feature branch from `main`.
    2.  Commit directly to this branch.
    3.  Open a Pull Request (PR) when work is ready for review.
    4.  Review, discuss, and make changes in the PR.
    5.  Merge the PR into `main`.
    6.  Deploy `main`.
*   **Pros:** Simple, supports continuous delivery, easy to understand.
*   **Cons:** Less structured for complex release schedules.

### Trunk-based Development (TBD)
A core practice for continuous integration and delivery, where developers commit frequently to a single shared branch (the "trunk," usually `main`).

*   **Workflow:**
    1.  Developers work on short-lived feature branches, often for just hours.
    2.  Merge (or rebase) frequently into `main`.
    3.  Use feature flags to hide incomplete features.
*   **Pros:** Reduces merge conflicts, faster feedback loop, supports continuous integration/delivery.
*   **Cons:** Requires strong discipline and robust automated testing, potential for breaking `main` if not careful.

## 3. Collaborative Development Workflows on GitHub

GitHub provides tools for seamless team collaboration.

### Pull Requests (PRs) / Merge Requests (MRs)
A mechanism to propose changes and ask for them to be merged into a target branch.

*   **Purpose:** Facilitates code review, discussion, and automated checks (CI/CD).
*   **Workflow:**
    1.  Developer pushes a feature branch to remote.
    2.  Opens a PR against the target branch (e.g., `main`).
    3.  Reviewers provide feedback.
    4.  Changes are made, and new commits are pushed to the feature branch (automatically updating the PR).
    5.  Once approved and CI/CD passes, the PR is merged.

### Code Reviews
The process of critically examining source code.

*   **Best Practices:**
    *   Keep PRs small and focused.
    *   Provide constructive feedback.
    *   Explain *why* a change is needed, not just *what* to change.
    *   Use GitHub's review features (comments, suggestions, approval/request changes).

## 4. Resolving Complex Merge Conflicts

Merge conflicts happen when Git cannot automatically reconcile diverging changes.

*   **Common Causes:**
    *   Two developers edit the same lines in the same file.
    *   One developer deletes a file while another modifies it.
*   **Resolution Steps:**
    1.  Git will notify you of conflicts and mark them in the affected files with `<<<<<<<`, `=======`, `>>>>>>>` markers.
    2.  Manually edit the file to choose the desired code.
    3.  `git add <conflicted-file>` to stage the resolved file.
    4.  `git commit` to finalize the merge.
*   **Advanced Tools/Techniques:**
    *   `git mergetool`: Use an external merge tool (e.g., VS Code, KDiff3).
    *   `git log --merge`: Shows commits involved in the merge.
    *   `git diff --base <file>`: Shows changes relative to the common ancestor.
    *   `git checkout --ours <file>` / `git checkout --theirs <file>`: To accept all changes from the current branch (`ours`) or the incoming branch (`theirs`) for a specific file.

## 5. Managing Git Hooks

Git Hooks are scripts that Git executes before or after events like commit, push, or receive. They automate tasks and enforce policies.

*   **Types:**
    *   **Client-side:** Run on your local repository (e.g., `pre-commit`, `post-commit`, `pre-rebase`). Located in `.git/hooks/`.
    *   **Server-side:** Run on the remote repository (e.g., `pre-receive`, `update`, `post-receive`).
*   **Common Use Cases:**
    *   `pre-commit`: Lint code, run unit tests, check commit message format.
    *   `pre-push`: Run integration tests, ensure clean build.
    *   `post-merge`: Notify team, update documentation.
*   **Example (pre-commit hook):**
    To set up a `pre-commit` hook to check for trailing whitespace:
    1.  Navigate to `.git/hooks/` in your repository.
    2.  Rename `pre-commit.sample` to `pre-commit`.
    3.  Edit the file (e.g., using a simple shell script):
        ```bash
        #!/bin/sh
        # Check for trailing whitespace
        if git diff --check --cached; then
          exit 0
        else
          echo "Error: Trailing whitespace found. Please fix before committing."
          exit 1
        fi
        ```
    4.  Make it executable: `chmod +x .git/hooks/pre-commit`

## Checklist / Exercises:

1.  Describe a scenario where `git rebase` is preferred over `git merge`, and one where `git cherry-pick` would be the best solution.
2.  Explain the key differences between Git Flow and GitHub Flow, and suggest which might be better for a small team practicing continuous delivery.
3.  Simulate a merge conflict by creating two branches, modifying the same line in a file on both, merging, resolving the conflict, and demonstrating the use of `git add` and `git commit` to finalize.