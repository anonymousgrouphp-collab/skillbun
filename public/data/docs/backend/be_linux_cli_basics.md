# Linux & Command Line Basics: Study Guide

Welcome to the foundational module on Linux and Command Line Basics! As a backend developer, a strong grasp of the Linux command line interface (CLI) is indispensable. It's the primary way to interact with servers, automate tasks, manage deployments, and troubleshoot issues in production environments. This guide will equip you with essential commands and concepts.

## 1. Why Linux & CLI for Backend Developers?

Most backend servers run on Linux-based operating systems. Proficiency with the command line allows you to:
*   **Navigate File Systems**: Locate configuration files, logs, and application code.
*   **Manage Processes**: Start, stop, and monitor backend services.
*   **Automate Tasks**: Write scripts for deployment, backups, and routine maintenance.
*   **Configure Servers**: Install software, manage users, and set up network services.
*   **Troubleshoot Issues**: Analyze logs, inspect system performance, and debug applications.

## 2. Basic Commands & Navigation

### Core Commands
*   `pwd`: **P**rint **W**orking **D**irectory. Shows your current location in the file system.
    ```bash
pwd
# Expected output: /home/username
    ```
*   `ls`: **L**i**s**t directory contents. Use flags for more detail.
    *   `ls -l`: Long listing format (permissions, owner, size, date).
    *   `ls -a`: List all files, including hidden ones (starting with `.`)
    *   `ls -lh`: Long listing, human-readable sizes.
    ```bash
ls -lh
# Expected output: 
# total 4.0K
# -rw-r--r-- 1 user user 0 Mar 10 10:00 my_file.txt
# drwxr-xr-x 2 user user 4.0K Mar 10 09:55 my_folder
    ```
*   `cd <directory>`: **C**hange **D**irectory. Navigate between folders.
    *   `cd ..`: Go up one level (parent directory).
    *   `cd ~`: Go to your home directory.
    *   `cd -`: Go to the previous directory.
    ```bash
cd my_folder
pwd
# Expected output: /home/username/my_folder
    ```
*   `man <command>`: Display the **man**ual page for a command. Press `q` to exit.

### File System Hierarchy Standard (FHS) Basics
*   `/`: The root directory. All other directories branch from here.
*   `/bin`, `/usr/bin`: Essential user command binaries.
*   `/etc`: Host-specific system-wide configuration files.
*   `/home`: User home directories (e.g., `/home/username`).
*   `/var`: Variable data, like log files (`/var/log`), mail queues, etc.
*   `/tmp`: Temporary files.

## 3. File & Directory Management

*   `mkdir <directory_name>`: **M**a**k**e **dir**ectory.
*   `touch <file_name>`: Create an empty file or update a file's timestamp.
*   `cp <source> <destination>`: **C**o**p**y files or directories.
    *   `cp -r <source_dir> <destination_dir>`: Recursively copy directories.
*   `mv <source> <destination>`: **M**o**v**e or rename files/directories.
*   `rm <file_name>`: **R**e**m**ove files.
    *   `rm -r <directory_name>`: Recursively remove directories and their contents.
    *   `rm -f <file_name>`: Force removal (without prompt).
    *   `rm -rf <directory_name>`: Force recursive removal (use with extreme caution!).
*   `cat <file_name>`: Con**cat**enate files and print to standard output (useful for small files).
*   `less <file_name>`: View file contents page by page (better for large files, navigate with arrow keys, `q` to quit).
*   `head <file_name>`: Display the first 10 lines of a file.
*   `tail <file_name>`: Display the last 10 lines of a file.
    *   `tail -f <file_name>`: Continuously display new lines as they are added (great for logs).

## 4. File Permissions

Linux uses a permission system based on three entities and three types of access.

### Entities
*   **User (u)**: The owner of the file.
*   **Group (g)**: Users belonging to the file's group.
*   **Others (o)**: Everyone else.

### Access Types
*   **Read (r)**: Permission to view file contents or list directory contents.
*   **Write (w)**: Permission to modify file contents or create/delete files in a directory.
*   **Execute (x)**: Permission to run a file (if it's a program/script) or enter a directory.

Permissions are often represented in `ls -l` as `rwxrwxrwx` or numerically (octal notation).
*   `r = 4`, `w = 2`, `x = 1`
*   Sum them up for each entity: `user` `group` `others`
    *   `7 (rwx)` = 4+2+1
    *   `6 (rw-)` = 4+2+0
    *   `5 (r-x)` = 4+0+1
    *   `4 (r--)` = 4+0+0

### Commands
*   `chmod <permissions> <file>`: **Ch**ange **mod**e (permissions).
    *   **Symbolic Mode**: `chmod u+x script.sh`, `chmod go-w file.txt`, `chmod a=rw file.txt`
    *   **Octal Mode**: `chmod 755 script.sh` (owner: rwx, group: r-x, others: r-x)
*   `chown <user>:<group> <file>`: **Ch**ange **own**er.
    ```bash
# Give execute permission to the owner of script.sh
chmod u+x script.sh

# Set read/write for owner, read-only for group and others for data.txt
chmod 644 data.txt

# Change owner of app.log to 'nginx' user and 'nginx' group
chown nginx:nginx app.log
    ```

## 5. Process Management

A process is an executing program. Understanding how to manage them is crucial for server health.

*   `ps`: Display information about running processes.
    *   `ps aux`: Shows all processes (user, PID, CPU, memory, command, etc.).
*   `top`: Real-time view of running processes, CPU usage, memory, etc. (press `q` to quit).
*   `kill <PID>`: Send a signal to a process, typically to terminate it. `PID` is the Process ID.
    *   `kill -9 <PID>`: Forcefully kill a process (SIGKILL, cannot be ignored by process).
*   `killall <process_name>`: Kill all processes with a given name.
*   `jobs`: List processes running in the background/stopped in the current shell.
*   `&`: Run a command in the background (e.g., `my_app &`).
*   `bg`: Resume a stopped process in the background.
*   `fg`: Bring a background process to the foreground.

## 6. Input/Output Redirection & Pipes

These features allow you to control the flow of data between commands and files.

*   `>`: Redirect standard output to a file (overwrites file).
    ```bash
echo "Hello World" > message.txt
    ```
*   `>>`: Append standard output to a file.
    ```bash
echo "Another line" >> message.txt
    ```
*   `<`: Redirect standard input from a file.
*   `|`: **Pipe**. Sends the standard output of one command as the standard input to another command.
    ```bash
ls -l /var/log | grep "apache" # List log files and filter for "apache"
ps aux | grep "nginx" | wc -l # Count the number of running nginx processes
    ```

## 7. Basic Shell Scripting

Shell scripting automates repetitive tasks. A shell script is simply a text file containing a sequence of commands.

### Key Elements
*   **Shebang**: `#!` followed by the path to the interpreter (e.g., `#!/bin/bash`). Must be the first line.
*   **Variables**: Declare with `VAR_NAME=value`. Access with `$VAR_NAME` or `${VAR_NAME}`.
*   **Comments**: Start a line with `#`.
*   **`echo`**: Print text to the console.

### Example: Simple System Info Script

Create a file named `sysinfo.sh`:

```bash
#!/bin/bash

# This script gathers basic system information.

echo "System Information Report"
echo "-------------------------"

# Hostname
echo "Hostname: $(hostname)"

# Uptime
echo "Uptime: $(uptime -p)"

# Disk Usage for root partition
echo "Disk Usage (/):"
df -h /

# Memory Usage
echo "Memory Usage:"
free -h

# Currently logged in users
echo "Logged-in Users:"
who

echo "-------------------------"
echo "Report generated on $(date)"
```

To run the script:
1.  Make it executable: `chmod u+x sysinfo.sh`
2.  Execute it: `./sysinfo.sh`

## Checklist/Exercises

1.  **File & Directory Challenge**: Create a new directory named `backend_project`, navigate into it, create an empty file named `server.js`, and then list its contents in long format. Finally, remove both the file and the directory.
2.  **Permission Practice**: Create a simple shell script (`myscript.sh`) that just prints "Hello from script!". Initially, try to run it without execute permissions. Then, add execute permissions for yourself and successfully run it. Display its permissions before and after with `ls -l`.
3.  **Process Monitoring & Logging**: Start a simple background process (e.g., `tail -f /var/log/syslog` or `sleep 600 &`). Use `ps aux | grep <process_name>` or `top` to find it. Then, `kill` it using its PID. (If `syslog` doesn't exist, pick any log file that does, or `sleep 600 &` is a safe alternative).
