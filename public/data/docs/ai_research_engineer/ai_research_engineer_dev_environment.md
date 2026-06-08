# Development Environment & Version Control

## Introduction
An efficient development environment and robust version control are fundamental for any AI research engineer. They ensure reproducibility, collaboration, and streamlined experimentation. This guide covers setting up your workspace, mastering command-line tools, utilizing virtual environments, and leveraging Git for version control.

## 1. Setting Up Your Development Environment
Your development environment is your primary workspace. Choosing the right tools can significantly boost productivity.

*   **Integrated Development Environment (IDE) / Text Editor:**
    *   **VS Code:** Highly recommended for Python and AI development due to its rich extension ecosystem (Python, Pylance, Jupyter, Docker, GitLens) and excellent integration with terminals and virtual environments. Lightweight yet powerful.
    *   **PyCharm:** A full-featured IDE specifically designed for Python, offering advanced debugging, refactoring, and project management tools. Often preferred for larger, complex projects.
*   **Operating System:**
    *   **Linux/macOS:** Generally preferred in AI research for their native command-line interface (CLI) and compatibility with many open-source tools and frameworks.
    *   **Windows Subsystem for Linux (WSL):** For Windows users, WSL provides a powerful Linux environment directly integrated with Windows, offering the best of both worlds for AI development.

## 2. Command-Line Interface (CLI) Fundamentals
The CLI is an indispensable tool for AI engineers, enabling efficient file management, script execution, server interaction, and automation.

*   **Why CLI?**
    *   **Efficiency:** Perform complex operations with concise commands.
    *   **Automation:** Script repetitive tasks.
    *   **Remote Access:** Interact with remote servers (e.g., cloud VMs, compute clusters).
*   **Basic Commands:**
    *   `ls` (list): List files and directories.
    *   `cd <directory>` (change directory): Navigate through the file system.
    *   `pwd` (print working directory): Show the current directory's path.
    *   `mkdir <directory>` (make directory): Create a new directory.
    *   `rm <file>` / `rm -r <directory>` (remove): Delete files or directories.
    *   `cp <source> <destination>` (copy): Copy files or directories.
    *   `mv <source> <destination>` (move): Move or rename files/directories.
    *   `cat <file>` (concatenate): Display file content.
    *   `grep <pattern> <file>`: Search for patterns within files.
*   **Input/Output Redirection & Piping:**
    *   `>`: Redirects output to a file, overwriting it (`ls > files.txt`).
    *   `>>`: Appends output to a file (`echo "Hello" >> log.txt`).
    *   `|` (pipe): Sends the output of one command as input to another (`ls -l | grep .py`).

## 3. Managing Dependencies with Virtual Environments
Python projects often have specific dependency requirements. Virtual environments isolate these dependencies, preventing conflicts between different projects.

*   **Why Virtual Environments?**
    *   **Isolation:** Each project can have its own set of libraries and Python version.
    *   **Reproducibility:** Easily share `requirements.txt` to recreate the exact environment.
    *   **Cleanliness:** Avoid polluting the global Python installation.

*   **`venv` (Python's built-in module):**
    *   **Creation:** `python -m venv myenv` (creates a directory named `myenv` with a local Python installation)
    *   **Activation:**
        *   Linux/macOS: `source myenv/bin/activate`
        *   Windows PowerShell: `.\myenv\Scripts\Activate.ps1`
        *   Windows Command Prompt: `.\myenv\Scripts\activate.bat`
    *   **Deactivation:** `deactivate`
    *   **Install Packages:** `pip install <package_name>` (e.g., `pip install torch torchvision`)
    *   **Generate Requirements:** `pip freeze > requirements.txt`
    *   **Install from Requirements:** `pip install -r requirements.txt`

*   **Conda (for Anaconda/Miniconda users):**
    *   **Creation:** `conda create -n myenv python=3.9` (creates an environment named `myenv` with Python 3.9)
    *   **Activation:** `conda activate myenv`
    *   **Deactivation:** `conda deactivate`
    *   **Install Packages:** `conda install <package_name>` or `pip install <package_name>`
    *   **Export Environment:** `conda env export > environment.yml`

## 4. Version Control with Git
Git is the most widely used distributed version control system, essential for tracking changes, collaborating with others, and managing code history in AI projects.

*   **What is Git?** A system that records changes to files over time, allowing you to recall specific versions later.
*   **Core Concepts:**
    *   **Repository (Repo):** A project's history (files and changes) stored in a `.git` directory.
    *   **Commit:** A snapshot of your repository at a specific point in time, with a message describing the changes.
    *   **Branch:** An independent line of development. Useful for feature development or experimentation without affecting the main codebase.
    *   **Merge:** Combining changes from one branch into another.
    *   **Remote:** A version of your repository hosted on a server (e.g., GitHub, GitLab, Bitbucket).

*   **Basic Git Workflow:**
    1.  **Initialize a new repository:**
        ```bash
git init
        ```
    2.  **Configure your identity (first-time setup):**
        ```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
        ```
    3.  **Add files to the staging area:**
        ```bash
git add .
# or git add <file_name>
        ```
    4.  **Commit changes:**
        ```bash
git commit -m "Descriptive commit message"
        ```
    5.  **View history:**
        ```bash
git log
        ```
    6.  **Branching and Merging:**
        ```bash
git branch feature/new-model # Create a new branch
git checkout feature/new-model # Switch to the new branch
# ... make changes and commit ...
git checkout main # Switch back to main
git merge feature/new-model # Merge changes into main
        ```
    7.  **Working with Remote Repositories (e.g., GitHub):**
        ```bash
git remote add origin <repository_url> # Link local repo to a remote
git push -u origin main # Push local changes to the remote (first time)
git pull origin main # Pull remote changes to your local repo
        ```

*   **`.gitignore` File:**
    *   A text file that tells Git which files or directories to ignore and not commit to the repository.
    *   **Common entries for AI projects:**
        ```
# Virtual environment
venv/
.venv/

# Python bytecode
*.pyc
__pycache__/

# IDE-specific files
.vscode/
.idea/

# Data and logs (often large or sensitive)
data/
logs/
results/
models/

# Jupyter notebooks checkpoints
.ipynb_checkpoints

# Environment variables
.env
        ```

## Example: Setting up an AI Project with Git and venv

```bash
# 1. Create your project directory
mkdir ai_model_project
cd ai_model_project

# 2. Initialize Git for version control
git init

# 3. Create a Python virtual environment
python -m venv venv

# 4. Activate the virtual environment
source venv/bin/activate # On Windows: .\venv\Scripts\activate

# 5. Install necessary libraries (example)
pip install torch torchvision pandas numpy scikit-learn

# 6. Generate a requirements file
pip freeze > requirements.txt

# 7. Create a .gitignore file to exclude unnecessary files
echo -e "venv/\n__pycache__/\n*.pyc\ndata/\nmodels/\nlogs/" > .gitignore

# 8. Add and commit initial project setup files
git add .
git commit -m "Initial project setup: venv, requirements, gitignore"

# 9. Deactivate the virtual environment when done
deactivate

# Now you can add your code, data, etc., commit changes regularly, and push to a remote repository.
```

## Checklist/Exercise:
1.  Create a new directory named `my_ml_workflow`, initialize it as a Git repository, and create a Python virtual environment inside it named `ml_env`.
2.  Activate `ml_env`, install `matplotlib` and `seaborn` using `pip`, and then generate a `requirements.txt` file listing these dependencies.
3.  Create a `.gitignore` file that ensures the `ml_env/` directory, any `*.pyc` files, and a hypothetical `data/` folder are ignored by Git. Add and commit `requirements.txt` and `.gitignore` to your Git repository, ensuring `ml_env/` is not tracked.
