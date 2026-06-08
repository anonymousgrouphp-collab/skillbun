# Git & GitHub for Version Control

Welcome to the essential guide for mastering Git and GitHub, critical tools for any modern developer, especially a Geospatial Data Scientist. Version control allows you to track changes, collaborate effectively, and manage complex geospatial codebases without losing your work.

## 1. What is Version Control?

Version Control Systems (VCS) like Git track changes to files over time, allowing you to revert to previous versions, compare changes, and collaborate with others. It's like having an unlimited undo button and a perfect historical record of your project.

## 2. Core Git Concepts

*   **Repository (Repo):** A project's directory tracked by Git. It contains all your files and the entire history of changes.
*   **Commit:** A snapshot of your repository at a specific point in time. Each commit has a unique ID, a message describing the changes, and an author.
*   **Branch:** An independent line of development. Branches allow you to work on new features or bug fixes without affecting the main project.
*   **Merge:** The process of combining changes from one branch into another.
*   **Remote:** A version of your repository hosted on the internet (e.g., GitHub). This enables collaboration and backup.
*   **Local:** The copy of the repository on your machine.

## 3. Essential Git Commands

Here are the fundamental Git commands you'll use daily:

*   `git init`: Initializes a new Git repository in the current directory.
*   `git clone [url]`: Creates a local copy of an existing remote repository.
*   `git add [file]`: Stages changes from your working directory to the staging area, preparing them for a commit. Use `git add .` to stage all changes.
*   `git commit -m "[message]"`: Records the staged changes to the repository's history with a descriptive message.
*   `git status`: Shows the status of changes as untracked, modified, or staged.
*   `git log`: Displays the commit history.
*   `git branch`: Lists all local branches. `git branch [branch-name]` creates a new branch.
*   `git checkout [branch-name]` / `git switch [branch-name]`: Switches to a different branch.
*   `git merge [branch-name]`: Integrates changes from the specified branch into the current branch.
*   `git remote add origin [url]`: Connects your local repository to a remote repository (usually named `origin`).
*   `git push origin [branch-name]`: Uploads your local commits to the remote repository.
*   `git pull origin [branch-name]`: Downloads and integrates changes from the remote repository into your local branch.
*   `git fetch origin`: Downloads new data from a remote repository without integrating it into your working files.

## 4. GitHub Workflow for Collaboration

GitHub is a web-based platform built around Git, providing hosting for software development and version control. It facilitates collaboration through:

*   **Pull Requests (PRs):** A way to propose changes from your branch (or a forked repository) to be merged into another branch. It allows for code review and discussion before merging.
*   **Forking:** Creating a personal copy of someone else's repository. This is common for open-source contributions.
*   **Issues:** A system for tracking tasks, enhancements, and bugs for your project.

## 5. Handling Geospatial Data with Git-LFS

Geospatial datasets often contain very large files (e.g., shapefiles, GeoTIFFs, NetCDF files). Git is not optimized for tracking large binary files, as it stores a full copy of each version. This can lead to massive repository sizes and slow performance.

**Git Large File Storage (Git-LFS)** solves this by replacing large files in your Git repository with text pointers, while storing the actual file content on a remote LFS server.

### Git-LFS Commands:

1.  **Install Git LFS:**
    ```bash
    git lfs install
    ```
2.  **Track file types:** Tell Git LFS which file types to track. For geospatial data, you might track `*.shp`, `*.shx`, `*.dbf`, `*.prj`, `*.tiff`, `*.tif`, `*.nc`, etc.
    ```bash
    git lfs track "*.shp"
    git lfs track "*.tiff"
    # Add more as needed
    ```
    These commands add entries to a `.gitattributes` file. Make sure to commit this file.
    ```bash
    git add .gitattributes
    git commit -m "Add Git LFS tracking for geospatial files"
    ```
3.  **Regular Git workflow:** Once tracked, you can add, commit, and push your large files as usual. Git-LFS handles the binary storage in the background.
    ```bash
    git add my_large_map.shp
    git commit -m "Add new shapefile"
    git push origin main
    ```

## 6. Simple Workflow Example

Let's create a new project, add a Python script, introduce a new feature, and use Git-LFS for a dummy large file.

```bash
# 1. Initialize a new repository
mkdir geospatial_project
cd geospatial_project
git init

# 2. Create an initial Python script
echo "print('Hello Geospatial World!')" > script.py
git add script.py
git commit -m "Initial commit: Add base script"

# 3. Set up Git LFS for potential large files (e.g., dummy TIFF)
git lfs install
git lfs track "*.tif"
echo "large_data_placeholder" > dummy_image.tif # Simulate a large TIFF

# 4. Add .gitattributes and the dummy file
git add .gitattributes dummy_image.tif
git commit -m "Configure Git LFS and add a dummy TIFF"

# 5. Create a new branch for a feature
git branch develop_feature
git checkout develop_feature

# 6. Make changes on the feature branch
echo "print('New feature added!')" >> script.py
git add script.py
git commit -m "Feature: Add new print statement"

# 7. Switch back to main and merge the feature
git checkout main
git merge develop_feature -m "Merge feature into main"

# 8. (Optional) Connect to GitHub and push
# git remote add origin https://github.com/yourusername/geospatial_project.git
# git push -u origin main
```

## 7. Checklist/Exercise

1.  **Repository Setup:** Initialize a new Git repository, create two simple text files, add them, and make an initial commit.
2.  **Branching & Merging:** Create a new branch, make a change to one of the files on that branch, commit it, switch back to the `main` branch, and then merge your feature branch into `main`.
3.  **Git-LFS Integration:** In your repository, track `*.gpkg` files using Git-LFS. Create a dummy `data.gpkg` file and verify that Git-LFS is correctly managing it by inspecting `.gitattributes` and the LFS status.

This foundation will equip you to manage your geospatial projects efficiently and collaborate seamlessly with others.