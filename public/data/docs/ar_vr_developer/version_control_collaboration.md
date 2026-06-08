# Version Control & Collaboration for XR Development

Version control is an indispensable practice in modern software development, and it's particularly crucial for XR (Augmented/Virtual Reality) projects. XR development often involves large teams, complex codebases, and massive binary assets (3D models, textures, audio, animations). Efficient version control and collaboration strategies ensure project stability, enable seamless teamwork, and protect against data loss.

## 1. Introduction to Version Control

Version Control Systems (VCS) track changes to files over time, allowing you to revert to previous versions, compare changes, and collaborate with others without overwriting each other's work. For XR development, a VCS is vital for:

*   **Tracking Code & Assets:** Managing iterations of scripts, shaders, 3D models, textures, and scenes.
*   **Collaboration:** Multiple developers working on different parts of the project simultaneously.
*   **Experimentation:** Safely trying out new features or designs on separate branches.
*   **Bug Fixing:** Easily identifying when and where a bug was introduced.
*   **Backup & Recovery:** A reliable history of your project.

## 2. Git Fundamentals

Git is the most widely used distributed version control system. It allows every developer to have a full copy of the repository locally, providing robust offline capabilities and faster operations.

### Key Concepts:

*   **Repository (Repo):** A project's database containing all files, history, and metadata.
    *   **Local Repo:** The copy on your machine.
    *   **Remote Repo:** The shared repository, typically hosted on platforms like GitHub, GitLab, or Bitbucket.
*   **Commit:** A snapshot of your repository's state at a specific point in time. Each commit has a unique ID, a message, author, and timestamp.
*   **Branch:** A parallel line of development. Branches allow developers to work on new features or fixes without affecting the main project until their work is ready to be integrated.
*   **Merge:** The process of combining changes from one branch into another.
*   **Pull Request/Merge Request (PR/MR):** A formal proposal to merge changes from one branch into another, typically involving code review before acceptance.

### Basic Git Workflow:

1.  **Initialize/Clone:**
    *   `git init`: Create a new local Git repository.
    *   `git clone <repository_url>`: Create a local copy of an existing remote repository.
2.  **Make Changes:** Modify files in your working directory.
3.  **Stage Changes:**
    *   `git add <file>` or `git add .`: Select changes you want to include in the next commit. These go into the "staging area."
4.  **Commit Changes:**
    *   `git commit -m "Your commit message"`: Record the staged changes to your local repository's history.
5.  **Synchronize with Remote:**
    *   `git pull`: Fetch changes from the remote repository and merge them into your current local branch.
    *   `git push`: Upload your local commits to the remote repository.

### Branching & Merging:

1.  **Create a New Branch:**
    *   `git branch <branch_name>`
2.  **Switch to a Branch:**
    *   `git checkout <branch_name>` (or `git switch <branch_name>` in newer Git versions)
3.  **Merge a Branch:**
    *   First, switch to the branch you want to merge *into* (e.g., `main` or `develop`).
    *   `git merge <source_branch>`: Integrate changes from `source_branch` into the current branch.

## 3. Managing Large Assets with Git LFS (Large File Storage)

Traditional Git is not optimized for large binary files (like 3D models, textures, video clips, audio files) commonly found in XR projects. When large files are committed directly to Git, they bloat the repository history, making cloning and operations slow.

**Git LFS** solves this by replacing large files in your Git repository with small text pointers. The actual large files are stored on a remote LFS server (often provided by your Git hosting service like GitHub, GitLab, or Bitbucket). When you clone or checkout a branch, Git LFS transparently downloads the actual files.

### How Git LFS Works:

1.  You configure Git LFS to track specific file types (e.g., `.fbx`, `.png`, `.wav`).
2.  When you commit a tracked large file, Git commits a small pointer file to the main Git repository.
3.  The actual large file is uploaded to the Git LFS store.
4.  When another user pulls, Git downloads the pointer file, then Git LFS intercepts and downloads the actual large file from the LFS store.

### Key Benefits:

*   **Faster Repository Operations:** Smaller main Git repository size.
*   **Reduced Network Usage:** Only download necessary versions of large files.
*   **Standard Git Workflow:** You still use `git add`, `git commit`, `git push`.

## 4. Collaborative Workflows

For XR teams, effective collaboration workflows are paramount.

### a. Feature Branching Workflow

This is a common and highly recommended strategy:

1.  **Main/Develop Branch:** Keep the `main` (or `master`) branch pristine and always deployable. A `develop` branch might be used for ongoing integration of features before they are stable enough for `main`.
2.  **Feature Branches:** For every new feature, bug fix, or experimental task, create a dedicated branch off `develop` (e.g., `feature/new-menu`, `bugfix/crash-on-level-load`).
3.  **Work in Isolation:** Develop on your feature branch without impacting others.
4.  **Commit Often:** Make small, logical commits with clear messages.
5.  **Pull Request (PR)/Merge Request (MR):** When the feature is complete and tested locally, push your branch to the remote and create a PR/MR targeting `develop`.
6.  **Code Review:** Team members review the changes, provide feedback, and suggest improvements.
7.  **Merge:** Once approved, the branch is merged into `develop`.
8.  **Delete Branch:** After merging, the feature branch can be safely deleted.

### b. Conflict Resolution

Conflicts occur when two developers make different changes to the same part of a file, and Git can't automatically decide which change to keep.

*   Git will notify you of conflicts during a `pull` or `merge`.
*   You'll need to manually edit the conflicted files, choosing which changes to keep.
*   After resolving, `git add` the files and `git commit` to complete the merge.

### c. Best Practices for XR Teams:

*   **Clear Commit Messages:** Explain *what* was changed and *why*.
*   **Small, Focused Commits:** Avoid "mega-commits" that combine many unrelated changes.
*   **Regular Pulls:** `git pull` frequently to stay updated with team changes and minimize merge conflicts.
*   **Dedicated LFS Tracking:** Ensure all relevant large binary assets are tracked by Git LFS from the start.
*   **`.gitignore` File:** Use a comprehensive `.gitignore` to exclude temporary files, build artifacts, library files (e.g., Unity's `Library`, `Temp` folders, `obj`, `bin`), and other unnecessary files from being tracked by Git.
*   **Consistent File Naming:** Maintain clear and consistent naming conventions for assets and scripts.

## 5. Practical Example: Setting up Git LFS

Here's how to install and configure Git LFS for a new or existing repository, assuming Git is already installed:

```bash
# 1. Install Git LFS (one-time setup on your machine)
# On macOS: brew install git-lfs
# On Windows (via Chocolatey): choco install git-lfs
# Or download from https://git-lfs.github.com/

# After installation, run this to globally initialize LFS for Git
git lfs install

# 2. Navigate to your Git repository
cd /path/to/your/xr_project

# 3. Tell Git LFS which file types to track
# Use wildcards for common XR asset types.
# This adds a line to your .gitattributes file.
git lfs track "*.psd"
git lfs track "*.fbx"
git lfs track "*.obj"
git lfs track "*.gltf"
git lfs track "*.glb"
git lfs track "*.blend"
git lfs track "*.max"
git lfs track "*.ma"
git lfs track "*.wav"
git lfs track "*.mp3"
git lfs track "*.ogg"
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.unity" # Unity scene files
git lfs track "*.asset" # Unity asset files (e.g., ScriptableObjects, Prefabs)
git lfs track "*.prefab" # Unity Prefab files
git lfs track "*.png" # High-res textures
git lfs track "*.jpg" # High-res textures
git lfs track "*.tga"
git lfs track "*.dds"

# 4. Stage and commit the .gitattributes file (crucial!)
# This ensures that LFS tracking rules are shared with the team.
git add .gitattributes
git commit -m "Configure Git LFS to track large XR assets"

# 5. Add and commit your actual large files
# Now, when you add files of the tracked types, Git LFS will handle them.
# Example: Adding a 3D model and a scene file
git add Assets/Models/MyCharacter.fbx
git add Assets/Scenes/MainScene.unity
git commit -m "Added character model and main scene"

# 6. Push your changes (including LFS objects) to the remote
git push origin main
```

## 6. Quick Understanding Check

1.  **Question:** Explain why Git LFS is essential for an XR development project involving 3D models and high-resolution textures, even if regular Git is already in use.
2.  **Task:** You are about to start developing a new "teleportation system" feature. Describe the Git commands you would use, starting from your `develop` branch, to create a new branch, switch to it, and prepare for development.
3.  **Scenario:** Two team members simultaneously edit different parts of the same script file (`PlayerController.cs`) on the same `feature` branch. What common issue might arise when they try to integrate their changes, and how would Git typically signal this?
