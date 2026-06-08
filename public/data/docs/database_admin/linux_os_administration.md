# Linux OS Administration for Databases: Study Guide

## Introduction to Linux for Database Administrators
Linux is the cornerstone of robust database environments due to its stability, security, performance, and flexibility. As a Database Administrator (DBA), mastering Linux is essential for installing, configuring, managing, and troubleshooting database servers like PostgreSQL, MySQL, MongoDB, and Oracle.

This guide will cover fundamental Linux administration concepts crucial for DBAs.

## 1. Linux Command Line Essentials
The command line interface (CLI) is your primary tool. Familiarity with basic commands and shell navigation is paramount.

*   **Navigation & Files:**
    *   `pwd`: Print working directory.
    *   `ls` (with `-l`, `-a`, `-h`): List directory contents.
    *   `cd <directory>`: Change directory.
    *   `cp <source> <destination>`: Copy files/directories.
    *   `mv <source> <destination>`: Move/rename files/directories.
    *   `rm` (with `-r`, `-f`): Remove files/directories.
    *   `mkdir <directory>`: Create directory.
    *   `cat <file>`, `less <file>`, `more <file>`: View file contents.
    *   `head <file>`, `tail <file>`: View beginning/end of a file.
*   **Help & Search:**
    *   `man <command>`: Access manual pages for commands.
    *   `grep <pattern> <file>`: Search for patterns in files.
*   **I/O Redirection & Piping:**
    *   `>`: Redirect standard output to a file (overwrite).
    *   `>>`: Append standard output to a file.
    *   `|`: Pipe output of one command as input to another.

**Example:**
```bash
# List all files including hidden ones, in long format, showing human-readable sizes
ls -lah /var/lib/mysql/

# Find 'error' messages in the PostgreSQL log file
grep -i "error" /var/log/postgresql/postgresql-14-main.log
```

## 2. File Systems and Storage Management
Understanding how Linux organizes files and manages storage is critical for database performance and integrity.

*   **File System Hierarchy Standard (FHS):** Key directories like `/etc` (configuration), `/var` (variable data, logs, database files), `/opt` (optional software).
*   **Disk Usage:**
    *   `df -h`: Report file system disk space usage (human-readable).
    *   `du -sh <path>`: Estimate file space usage of a directory (summary, human-readable).
*   **Mounting:**
    *   `mount <device> <mount_point>`: Attach a file system.
    *   `umount <mount_point>`: Detach a file system.
    *   `/etc/fstab`: Configuration file for static file systems to be mounted at boot.
*   **Permissions:**
    *   `chmod <permissions> <file/directory>`: Change file permissions (e.g., `chmod 640 file.txt`).
    *   `chown <user>:<group> <file/directory>`: Change file owner and group.

**Example:**
```bash
# Check disk space on all mounted filesystems
df -h

# Change ownership of a PostgreSQL data directory
sudo chown -R postgres:postgres /var/lib/postgresql/14/main
```

## 3. User and Group Management
Securely managing user accounts and groups is vital for controlling access to database resources.

*   `useradd <username>`: Create a new user.
*   `passwd <username>`: Set or change a user's password.
*   `usermod <options> <username>`: Modify user account properties (e.g., `usermod -aG sudo dbadmin` to add to group).
*   `userdel <username>`: Delete a user.
*   `groupadd <groupname>`: Create a new group.
*   `sudo` and `/etc/sudoers`: Granting administrative privileges to non-root users selectively. Use `visudo` to edit the `sudoers` file safely.

**Example (`/etc/sudoers` entry via `visudo`):**
```
# Allow user 'dbadmin' to restart the postgresql service without a password
dbadmin ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart postgresql
```

## 4. Process Management
Monitoring and managing processes helps in identifying performance bottlenecks or problematic applications.

*   `ps aux`: Display all running processes.
*   `top` / `htop`: Real-time interactive process viewer.
*   `kill <PID>`: Terminate a process by ID.
*   `killall <process_name>`: Terminate processes by name.
*   **Systemd (Service Management):** `systemctl` is used to control system and service manager.
    *   `systemctl status <service_name>`: Check service status.
    *   `systemctl start <service_name>`: Start a service.
    *   `systemctl stop <service_name>`: Stop a service.
    *   `systemctl restart <service_name>`: Restart a service.
    *   `systemctl enable <service_name>`: Enable a service to start at boot.
    *   `systemctl disable <service_name>`: Disable a service from starting at boot.

**Example:**
```bash
# Check the status of the MySQL service
systemctl status mysql

# Restart the PostgreSQL service
sudo systemctl restart postgresql
```

## 5. Package Management
Installing, updating, and removing software packages (including database servers and tools) is a daily DBA task.

*   **Debian-based (APT):** (Ubuntu, Debian)
    *   `sudo apt update`: Refresh package index.
    *   `sudo apt install <package_name>`: Install a package.
    *   `sudo apt remove <package_name>`: Remove a package.
    *   `sudo apt upgrade`: Upgrade all installed packages.
*   **RHEL-based (YUM/DNF):** (CentOS, RHEL, Fedora)
    *   `sudo yum update` / `sudo dnf update`: Refresh package index and upgrade packages.
    *   `sudo yum install <package_name>` / `sudo dnf install <package_name>`: Install a package.
    *   `sudo yum remove <package_name>` / `sudo dnf remove <package_name>`: Remove a package.

**Example:**
```bash
# Install the 'postgresql-client' package on a Debian-based system
sudo apt install postgresql-client

# Update all packages on a RHEL-based system
sudo dnf update
```

## 6. Logging and Monitoring
Logs are invaluable for troubleshooting. Effective log management is critical for DBAs.

*   `/var/log`: Standard directory for system and application logs.
    *   `/var/log/syslog` (Debian) or `/var/log/messages` (RHEL): General system messages.
    *   Database-specific logs: e.g., `/var/log/mysql/error.log`, `/var/log/postgresql/`.
*   `journalctl`: Query the systemd journal.
    *   `journalctl -u <service_name>`: View logs for a specific service.
    *   `journalctl -f`: Follow (tail) journal logs in real-time.
*   `tail -f <file>`: Monitor log files in real-time.
*   `logrotate`: Utility to manage log file rotation, compression, and removal.

**Example:**
```bash
# View the last 100 lines of the MySQL error log
tail -n 100 /var/log/mysql/error.log

# Follow PostgreSQL service logs in real-time
journalctl -f -u postgresql
```

## 7. Essential System Utilities for DBAs
Various utilities help manage network, backups, and general system health.

*   **Networking:**
    *   `ip a`: Display network interfaces and IP addresses.
    *   `ss -tunlp`: Display listening ports and connections.
    *   `ping <host>`: Test network connectivity.
    *   `ssh <user>@<host>`: Secure remote access.
*   **Archiving & Compression:**
    *   `tar -czvf <archive.tar.gz> <directory>`: Create compressed tar archive.
    *   `tar -xzvf <archive.tar.gz>`: Extract tar archive.
    *   `gzip`, `gunzip`, `bzip2`, `bunzip2`: Compression utilities.
*   **Synchronization:**
    *   `rsync -avz <source> <destination>`: Efficiently copy and synchronize files remotely or locally.

**Example:**
```bash
# Check open ports on the system
ss -tunlp

# Backup a database data directory using tar and rsync
tar -czvf /tmp/db_backup.tar.gz /var/lib/mysql
rsync -avz /tmp/db_backup.tar.gz dbadmin@remoteserver:/backups/
```

## Quick Checklist / Exercise
1.  **User & Sudoers:** Create a new user `dbuser` on your Linux machine. Grant `dbuser` `NOPASSWD` sudo access *only* to restart the `mysql` service (assuming it's installed). Verify the configuration.
2.  **Disk Usage:** Determine the total disk space occupied by the `/var/log` directory on your system. Use appropriate `du` and `df` commands.
3.  **Service Management & Logs:** Start the `nginx` service (install it if necessary with `sudo apt install nginx` or `sudo dnf install nginx`), check its status, and then view its most recent logs using `journalctl`.
