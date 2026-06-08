# Linux System Administration: A Deep Dive Study Guide

This study guide provides a comprehensive overview of essential Linux system administration tasks, covering file systems, permissions, process management, user/group management, package management, and system monitoring utilities. Mastering these concepts is crucial for any DevOps or Cloud Engineer.

## 1. Linux File System Hierarchy (FHS)

Linux organizes its files in a hierarchical structure, rooted at `/`. Understanding this hierarchy is fundamental to navigating and managing a Linux system.

**Key Directories:**

*   `/`: The root directory of the entire file system.
*   `/bin`: Contains essential user binaries (e.g., `ls`, `cp`, `mv`).
*   `/etc`: Configuration files for the system and installed services (e.g., `passwd`, `fstab`, `apache2.conf`).
*   `/home`: Home directories for regular users. Each user usually has a directory here (e.g., `/home/username`).
*   `/var`: Variable data files, such as logs (`/var/log`), mail queues, and temporary files (`/var/tmp`).
*   `/opt`: Optional application software packages.
*   `/usr`: User programs and data; contains most user utilities and applications (e.g., `/usr/bin`, `/usr/local`).
*   `/dev`: Device files for hardware components.
*   `/proc`: A virtual file system providing process and kernel information.

**Example: Viewing File System Structure**

To get a visual representation of a directory tree, you can use the `tree` command (you might need to install it first: `sudo apt install tree` or `sudo dnf install tree`).

```bash
tree -L 2 /etc/ssh
```

This command displays the contents of `/etc/ssh` up to two levels deep, showing configuration files for the SSH server.

## 2. File Permissions

Linux uses a robust permission system to control who can access and modify files and directories. Permissions are granted to three entities: **user (owner)**, **group**, and **others**.

**Permission Types:**

*   `r`: Read (4) - Allows viewing content.
*   `w`: Write (2) - Allows modifying content or deleting files/directories.
*   `x`: Execute (1) - Allows running a file (for programs) or entering a directory (for directories).

Permissions are often represented in symbolic (`rwx`) or octal (numeric) notation.

**Common Commands:**

*   `chmod`: Change file permissions.
    *   `chmod u+x filename.sh`: Add execute permission for the owner.
    *   `chmod 755 script.sh`: Give owner rwx, group rx, others rx.
    *   `chmod -R 644 /path/to/directory`: Recursively change permissions to rw-r--r-- for all files in a directory.
*   `chown`: Change file owner.
    *   `chown user:group filename`: Change owner and group.
*   `chgrp`: Change file group.
    *   `chgrp newgroup filename`: Change only the group.

**Example: Changing Permissions**

```bash
touch myfile.txt
ls -l myfile.txt
# Output will be something like: -rw-r--r-- 1 user group 0 May 10 10:00 myfile.txt

chmod 600 myfile.txt # Owner has read/write, no one else has access
ls -l myfile.txt
# Output: -rw------- 1 user group 0 May 10 10:00 myfile.txt

chmod +x myfile.txt # Add execute permission for all
ls -l myfile.txt
# Output: -rwx--x--x 1 user group 0 May 10 10:00 myfile.txt
```

## 3. Process Management

Processes are running instances of programs. Efficiently managing them is critical for system stability and performance.

**Viewing Processes:**

*   `ps`: Report a snapshot of the current processes.
    *   `ps aux`: Display all processes running on the system.
    *   `ps -ef | grep apache`: Find processes related to Apache.
*   `top`: Display Linux processes (real-time).
    *   Provides an interactive, real-time view of system processes, CPU usage, memory, etc.
    *   Press `k` to kill a process (requires PID), `q` to quit.
*   `htop`: An enhanced interactive process viewer (installable).

**Managing Processes:**

*   `kill PID`: Send a termination signal to a process (default is SIGTERM, graceful shutdown).
*   `kill -9 PID`: Send a forceful kill signal (SIGKILL, immediate termination).
*   `killall process_name`: Kill all processes with a given name.
*   `pkill -u username`: Kill all processes owned by a specific user.
*   `&`: Run a command in the background.
    *   `sleep 60 &`: Runs `sleep` in the background.
*   `nohup command &`: Run a command in the background, immune to hangup signals.

**Example: Monitoring and Killing a Process**

```bash
sleep 300 &
# Output: [1] 12345 (where 12345 is the PID)

ps aux | grep sleep
# Find the PID of the sleep process

kill 12345
# The sleep process should terminate gracefully
```

## 4. User and Group Management

Managing users and groups is essential for security and resource allocation. Each user has a unique ID (UID), and each group has a Group ID (GID).

**Key Files:**

*   `/etc/passwd`: Stores user account information (username, UID, GID, home directory, shell).
*   `/etc/shadow`: Stores encrypted user passwords and password expiration information (readable only by root).
*   `/etc/group`: Stores group information (group name, GID, members).

**User Management Commands:**

*   `useradd [options] username`: Create a new user.
    *   `sudo useradd -m -s /bin/bash newuser`: Create `newuser` with a home directory and bash shell.
*   `passwd username`: Set or change a user's password.
*   `usermod [options] username`: Modify user account properties.
    *   `sudo usermod -aG sudo newuser`: Add `newuser` to the `sudo` group.
    *   `sudo usermod -l new_name old_name`: Change a username.
*   `userdel [options] username`: Delete a user account.
    *   `sudo userdel -r olduser`: Delete `olduser` and their home directory.

**Group Management Commands:**

*   `groupadd groupname`: Create a new group.
*   `groupdel groupname`: Delete a group.
*   `gpasswd -a user group`: Add a user to a group.
*   `gpasswd -d user group`: Remove a user from a group.

**Example: Creating a User and Group**

```bash
sudo groupadd devops
sudo useradd -m -s /bin/bash john_doe
sudo passwd john_doe # Set password for john_doe
sudo usermod -aG devops john_doe # Add john_doe to devops group

# Verify
id john_doe
# Output should show john_doe's UID, primary GID, and supplementary groups including devops
```

## 5. Package Management

Package managers simplify installing, updating, and removing software. The specific commands depend on your Linux distribution.

**Debian/Ubuntu (APT - Advanced Package Tool):**

*   `sudo apt update`: Refresh the list of available packages from repositories.
*   `sudo apt install package_name`: Install a new package.
    *   `sudo apt install nginx`: Install the Nginx web server.
*   `sudo apt upgrade`: Upgrade all installed packages to their latest versions.
*   `sudo apt remove package_name`: Remove a package (keeps configuration files).
*   `sudo apt purge package_name`: Remove a package and its configuration files.
*   `sudo apt autoremove`: Remove unused dependencies.

**RHEL/CentOS/Fedora (YUM/DNF):**

`YUM` (Yellowdog Updater, Modified) is an older package manager, while `DNF` (Dandified YUM) is its modern successor, commonly used in Fedora and newer RHEL/CentOS versions.

*   `sudo dnf update` / `sudo yum update`: Update all installed packages.
*   `sudo dnf install package_name` / `sudo yum install package_name`: Install a new package.
    *   `sudo dnf install httpd`: Install the Apache HTTP Server.
*   `sudo dnf remove package_name` / `sudo yum remove package_name`: Remove a package.

**Example: Installing a Package**

```bash
# For Debian/Ubuntu
sudo apt update
sudo apt install htop

# For Fedora/RHEL/CentOS
sudo dnf update
sudo dnf install htop
```

## 6. System Monitoring Utilities

Monitoring utilities help you keep track of system resources, performance, and logs.

*   `top`: (Covered in Process Management) Real-time view of system processes, CPU, and memory.
*   `df`: Report file system disk space usage.
    *   `df -h`: Display disk space in human-readable format.
*   `du`: Estimate file space usage.
    *   `du -sh /var/log`: Summarize disk usage for the `/var/log` directory in human-readable format.
    *   `du -h --max-depth=1 /home/user`: Show disk usage of subdirectories in a user's home directory.
*   `journalctl`: Query the systemd journal.
    *   `sudo journalctl`: View all system logs.
    *   `sudo journalctl -f`: Follow (tail) new log entries in real-time.
    *   `sudo journalctl -u nginx.service`: View logs for a specific service (e.g., Nginx).
    *   `sudo journalctl --since 