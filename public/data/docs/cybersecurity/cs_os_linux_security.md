# Linux OS Fundamentals & Security: Study Guide

Welcome to the Linux OS Fundamentals & Security module. This guide will equip you with the essential Linux skills crucial for any cybersecurity specialist, from navigating the command line to implementing basic security hardening and automating tasks with Bash scripting.

## 1. Mastering the Linux Command Line & File System

The command line interface (CLI) is your primary tool in Linux. Understanding fundamental commands and the file system hierarchy is paramount.

### Core Concepts
*   **Navigation:** `pwd` (print working directory), `ls` (list contents), `cd` (change directory).
*   **File/Directory Management:** `mkdir` (make directory), `rmdir` (remove empty directory), `touch` (create empty file), `cp` (copy), `mv` (move/rename), `rm` (remove).
*   **Viewing File Content:** `cat` (concatenate and display), `less` (page through file), `head` (first lines), `tail` (last lines).
*   **Searching:** `grep` (search text patterns), `find` (search files/directories).
*   **Piping & Redirection:** `|` (pipe output of one command to another), `>` (redirect output to file, overwrite), `>>` (redirect output to file, append).
*   **File System Hierarchy Standard (FHS):** Understanding directories like `/bin`, `/etc`, `/home`, `/var`, `/usr`, `/opt`, `/tmp`.

### Example: Basic File Operations
```bash
mkdir my_security_logs
cd my_security_logs
touch audit.log access.log
ls -l
echo "Failed login attempt from 192.168.1.100" >> audit.log
cat audit.log
cp audit.log audit.log.bak
grep "Failed" audit.log
```

## 2. User, Group, & Privilege Management

Proper user and group management, along with understanding `sudo` (superuser do), is critical for access control and maintaining system security.

### Core Concepts
*   **Users & Groups:** Every file and process belongs to a user and a group. Users can be members of multiple groups.
*   **User Management:** `useradd` (create user), `passwd` (set/change password), `usermod` (modify user), `userdel` (delete user).
*   **Group Management:** `groupadd` (create group), `groupdel` (delete group).
*   **File Permissions:** Read (`r`), Write (`w`), Execute (`x`) for owner (u), group (g), others (o). Represented numerically (e.g., `755`).
    *   `chmod` (change permissions).
    *   `chown` (change owner and group).
*   **`sudo`:** Allows authorized users to execute commands as root or another user. Configuration is in `/etc/sudoers` (edited with `visudo`).

### Example: Managing Permissions and Sudo
```bash
# Create a new user for specific tasks
sudo useradd -m analyst -s /bin/bash
sudo passwd analyst

# Grant analyst user sudo privileges (add to sudo group, e.g., 'sudo' or 'wheel')
sudo usermod -aG sudo analyst

# Change file ownership
chown analyst:analyst audit.log
chmod 640 audit.log # Owner can read/write, group can read, others no access
ls -l audit.log
```

## 3. Process & Service Management

Understanding how to monitor, control, and manage running processes and system services is vital for troubleshooting and security.

### Core Concepts
*   **Processes:** Running instances of programs.
    *   `ps` (display current processes), `top` (dynamic real-time view), `htop` (interactive process viewer).
    *   `kill` (send signal to process by PID), `killall` (kill by name).
*   **Services (Daemons):** Background processes that provide functionality (e.g., web server, SSH server).
    *   **`systemd`:** The default init system in modern Linux distributions. Manages services, startup, and other system resources.
    *   **`systemctl`:** Command-line utility to control `systemd`.
        *   `start`, `stop`, `restart`, `enable` (start on boot), `disable` (don't start on boot), `status`.

### Example: Managing a Service
```bash
# Check the status of the SSH service
systemctl status ssh

# Stop the SSH service
sudo systemctl stop ssh

# Restart the SSH service
sudo systemctl restart ssh

# Disable the Apache web server from starting on boot (if installed)
sudo systemctl disable apache2

# Kill a process by name (e.g., if you have 'apache2' running as a process)
# pgrep apache2 # Find PID
# sudo killall apache2
```

## 4. Logging Mechanisms & Package Management

Effective logging helps in detecting security incidents, while robust package management ensures software is up-to-date and secure.

### Core Concepts
*   **Logging:** System events, security alerts, and application messages are recorded.
    *   **`syslog` (rsyslog/syslog-ng):** Traditional logging daemon. Logs typically found in `/var/log` (e.g., `auth.log`, `syslog`, `kern.log`).
    *   **`journald` (part of `systemd`):** Modern logging system. Stores logs in a binary format.
    *   `journalctl` (query `journald` logs).
*   **Package Management:** Installing, updating, and removing software.
    *   **Debian/Ubuntu:** `apt` (Advanced Package Tool), `dpkg` (low-level package manager).
        *   `sudo apt update` (refresh package lists).
        *   `sudo apt upgrade` (upgrade installed packages).
        *   `sudo apt install <package>`.
        *   `sudo apt remove <package>`.
    *   **Red Hat/CentOS/Fedora:** `yum`/`dnf`.
        *   `sudo dnf update`.
        *   `sudo dnf install <package>`.

### Example: Viewing Logs and Installing Software
```bash
# View the last 20 lines of the authentication log
sudo tail /var/log/auth.log

# View systemd journal logs for the last hour
sudo journalctl --since "1 hour ago"

# View logs specifically for the SSH service
sudo journalctl -u ssh.service

# Update package lists and upgrade all installed packages
sudo apt update && sudo apt upgrade -y

# Install a utility like 'nmap'
sudo apt install nmap -y
```

## 5. Basic Security Hardening Techniques

Implementing foundational security practices is essential to protect Linux systems from common threats.

### Core Concepts
*   **SSH Hardening:** Securing the Secure Shell protocol.
    *   Disable root login.
    *   Disable password authentication (use key-based auth).
    *   Change default SSH port (22).
    *   Limit user access.
*   **Firewall:** Control incoming and outgoing network traffic.
    *   **`ufw` (Uncomplicated Firewall):** Easy-to-use firewall for Ubuntu/Debian.
    *   **`firewalld`:** Dynamic firewall management for Red Hat-based systems.
*   **Disabling Unnecessary Services:** Reduce the attack surface by stopping and disabling services not in use.
*   **Regular Updates:** Keep the OS and all software patched against known vulnerabilities.

### Example: SSH Hardening & UFW Configuration
```bash
# Edit SSH configuration (requires restarting SSH service)
sudo nano /etc/ssh/sshd_config

# Inside sshd_config, change/add:
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222 # Choose a high custom port
# AllowUsers your_username # Limit access to specific users

# After editing, restart SSH
sudo systemctl restart ssh

# Enable UFW and allow SSH on the new port
sudo ufw enable
sudo ufw allow 2222/tcp
sudo ufw allow http
sudo ufw status verbose
```

## 6. Bash Scripting for Security Automation

Bash scripting allows you to automate repetitive tasks, which is invaluable for system administration and security operations.

### Core Concepts
*   **Shebang:** `#!/bin/bash` (specifies interpreter).
*   **Variables:** `NAME="John"`, `$NAME`.
*   **Input/Output:** `echo`, `read`.
*   **Conditionals:** `if`, `elif`, `else` (`[[ condition ]]`).
*   **Loops:** `for`, `while`.
*   **Functions:** Reusable blocks of code.
*   **Exit Status:** `$?` (exit status of the last command).

### Example: Simple Security Log Monitor Script
```bash
#!/bin/bash

LOG_FILE="/var/log/auth.log"
KEYWORD="Failed password"

if [[ ! -f "$LOG_FILE" ]]; then
    echo "Error: Log file '$LOG_FILE' not found."
    exit 1
fi

echo "Monitoring '$LOG_FILE' for '$KEYWORD' events..."
tail -f "$LOG_FILE" | grep --line-buffered "$KEYWORD"
```

## Quick Exercises

1.  **File System Navigation & Permissions:** Create a directory named `cyber_project`, inside it create a file `sensitive_data.txt`. Set its permissions so only you (the owner) can read and write to it, but no one else has any access. Verify the permissions using `ls -l`.
2.  **Service Management:** Identify three running services on your Linux system using `systemctl list-unit-files --type=service`. Choose one non-critical service (e.g., `cups.service` if you don't use printing, or `apache2.service` if not in use), stop it, and then check its status. Restart it if necessary.
3.  **Bash Scripting:** Write a simple Bash script that takes a directory path as an argument. The script should list all `.log` files in that directory and print their names. If no directory is provided, it should list `.log` files in the current directory. Make the script executable and run it.
