## Foundational Skills: Linux, Git, and Networking

Establishing a strong foundation in Linux, Git, and Networking is paramount for any aspiring DevOps or Cloud Engineer. These core competencies provide the operational understanding and tools necessary to manage infrastructure, collaborate on code, and ensure robust application delivery.

### 1. Linux Fundamentals

Linux is the dominant operating system in cloud environments and servers. Proficiency with its command-line interface (CLI) is non-negotiable.

#### Core Concepts:
*   **Kernel:** The core of the OS, managing system resources.
*   **Shell:** A command-line interpreter (e.g., Bash) that allows users to interact with the kernel.
*   **Filesystem Hierarchy Standard (FHS):** A standardized directory structure for Linux systems (e.g., `/bin`, `/etc`, `/home`, `/var`).
*   **Permissions:** Controls access to files and directories (read, write, execute) for owner, group, and others.

#### Essential Commands:
*   **Navigation:**
    *   `pwd`: Print working directory.
    *   `ls`: List directory contents.
    *   `cd <directory>`: Change directory.
*   **File & Directory Management:**
    *   `mkdir <directory>`: Create directory.
    *   `touch <file>`: Create an empty file.
    *   `cp <source> <destination>`: Copy files or directories.
    *   `mv <source> <destination>`: Move or rename files/directories.
    *   `rm <file/directory>`: Remove files or directories (use `rm -r` for directories).
*   **File Content Viewing & Manipulation:**
    *   `cat <file>`: Concatenate and display file content.
    *   `less <file>`: View file content page by page.
    *   `grep <pattern> <file>`: Search for patterns in files.
    *   `echo <text>`: Display text or redirect to a file.
*   **System & Permissions:**
    *   `sudo <command>`: Execute a command as the superuser.
    *   `chmod <permissions> <file>`: Change file permissions (e.g., `chmod 755 script.sh`).
    *   `apt` (Debian/Ubuntu) / `yum` (Red Hat/CentOS): Package managers for installing software.

#### Example: Basic File Operations and Permissions

```bash
mkdir my_project
cd my_project
touch hello.txt
echo "This is my first Linux file." > hello.txt
cat hello.txt
ls -l # View file permissions
chmod 644 hello.txt # Owner: rw, Group: r, Others: r
ls -l hello.txt
```

#### Quick Checklist/Exercise:
1.  Identify the root directory in the FHS and its purpose.
2.  Create a new directory named `devops_sandbox` in your home directory, then navigate into it.
3.  Create a file named `my_script.sh` inside `devops_sandbox` and set its permissions to be executable only by the owner.

### 2. Git Essentials

Git is the most widely used distributed version control system, crucial for collaborative development and tracking changes in code and configuration.

#### Core Concepts:
*   **Repository (Repo):** A project's complete history, including all files and revisions.
*   **Commit:** A snapshot of your changes at a specific point in time, with a message.
*   **Branch:** A parallel line of development that diverges from the main project.
*   **Merge:** Combining changes from different branches.
*   **Remote:** A version of your repository hosted on a server (e.g., GitHub, GitLab).

#### Basic Git Workflow:
1.  **Initialize a repository:** `git init`
2.  **Add changes to the staging area:** `git add <file(s)>` or `git add .`
3.  **Commit changes:** `git commit -m "Your commit message"`
4.  **Check status:** `git status`
5.  **View history:** `git log` or `git log --oneline`
6.  **Branching:**
    *   `git branch <branch-name>`: Create a new branch.
    *   `git checkout <branch-name>`: Switch to a different branch.
    *   `git merge <branch-name>`: Merge changes from one branch into the current branch.
7.  **Remote Operations:**
    *   `git remote add origin <url>`: Connect local repo to a remote.
    *   `git push origin <branch>`: Upload local commits to the remote repository.
    *   `git pull origin <branch>`: Download changes from the remote repository.

#### Example: Simple Commit Sequence

```bash
mkdir devops_repo
cd devops_repo
git init
echo "# My DevOps Project" > README.md
git add README.md
git commit -m "Initial commit: Add README"
echo "- Project setup" >> README.md
git add README.md
git commit -m "Update: Add project setup details"
git log --oneline
```

#### Quick Checklist/Exercise:
1.  Initialize a new Git repository in an empty directory.
2.  Create a file `config.txt`, add some content, and commit it with a descriptive message.
3.  Create a new branch called `feature-A`, make a change to `config.txt` on that branch, and commit the change.

### 3. Networking Basics

Understanding networking is fundamental to designing, deploying, and troubleshooting cloud applications and infrastructure.

#### Core Concepts:
*   **IP Address:** A numerical label assigned to each device connected to a computer network (e.g., `192.168.1.1`, `172.16.0.10`). IPv4 and IPv6 are common protocols.
*   **Port:** A communication endpoint in an operating system, identified by a number (e.g., HTTP on port 80, HTTPS on 443, SSH on 22).
*   **Protocols (TCP/IP, HTTP, DNS):**
    *   **TCP/IP:** The foundational suite of protocols for internet communication (TCP for reliable connection, IP for addressing).
    *   **HTTP/HTTPS:** Protocols for transmitting web pages and data over the internet.
    *   **DNS (Domain Name System):** Translates human-readable domain names (e.g., `google.com`) into IP addresses.
*   **OSI Model (Briefly):** A conceptual framework for understanding network communication in seven layers (Physical, Data Link, Network, Transport, Session, Presentation, Application).

#### Key Tools & Concepts:
*   `ping <hostname/IP>`: Test reachability to a host.
*   `ip addr` (Linux) / `ipconfig` (Windows) / `ifconfig` (older Linux): Display network interface configuration.
*   `ss` (Linux) / `netstat` (cross-platform): Display network connections, routing tables, interface statistics.
*   `curl <url>` / `wget <url>`: Command-line tools for making HTTP requests and downloading content.
*   `traceroute <hostname/IP>`: Trace the route taken by packets to a network host.

#### Example: Checking Network Configuration and Connectivity

```bash
ip addr show # Display IP addresses for all network interfaces
ping -c 4 google.com # Send 4 ICMP packets to google.com to test connectivity
ss -tuln # List all listening TCP and UDP ports
curl -I https://www.example.com # Make a HEAD request to example.com to view headers
```

#### Quick Checklist/Exercise:
1.  Find your computer's primary IPv4 address using a command-line tool.
2.  Ping a well-known website (e.g., `bing.com`) and interpret the output.
3.  List all currently open TCP listening ports on your system.