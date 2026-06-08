# Linux & Shell Scripting Basics for Data Engineers

## 1. Introduction

Linux and shell scripting are indispensable tools for Data Engineers. They provide the fundamental capabilities to interact with server environments, automate repetitive tasks, manage data files, monitor processes, and integrate various data tools. Mastering these basics enhances efficiency, improves system control, and is crucial for deploying and maintaining data pipelines.

## 2. Linux Command Line Fundamentals

### 2.1. Navigating the File System

Understanding how to move around and manage files is core to working in a Linux environment.

*   `pwd`: **P**rint **W**orking **D**irectory. Shows your current location.
*   `ls`: **L**i**s**t directory contents. Use `ls -l` for a long listing format (permissions, owner, size, date) or `ls -a` to show hidden files.
*   `cd [directory]`: **C**hange **D**irectory. E.g., `cd /var/log`, `cd ..` (parent directory), `cd ~` (home directory).
*   `mkdir [directory_name]`: **M**a**k**e **dir**ectory.
*   `rmdir [directory_name]`: **R**e**m**ove empty **dir**ectory.
*   `cp [source] [destination]`: **C**o**p**y files or directories. Use `cp -r` for recursive copy of directories.
*   `mv [source] [destination]`: **M**o**v**e or rename files/directories.
*   `rm [file/directory]`: **R**e**m**ove files or directories. Use `rm -r` for directories and `rm -f` for force removal.

### 2.2. Viewing File Content

*   `cat [file]`: **Cat**enate and display file content. Good for small files.
*   `less [file]`: View file content page by page. Allows scrolling forward and backward.
*   `more [file]`: Similar to `less`, but generally only allows scrolling forward.
*   `head -n [number] [file]`: Display the **head** (first `n` lines) of a file. Default is 10 lines.
*   `tail -n [number] [file]`: Display the **tail** (last `n` lines) of a file. Default is 10 lines. Useful for logs: `tail -f [log_file]` watches for new lines.

### 2.3. File Permissions

File permissions (`rwx` for read, write, execute) define who can do what with a file or directory. They are often represented in octal (numeric) format:
*   `r` = 4, `w` = 2, `x` = 1
*   Permissions are set for Owner, Group, and Others.
*   Example: `755` means owner has `rwx` (4+2+1=7), group has `rx` (4+0+1=5), others have `rx` (4+0+1=5).

*   `chmod [permissions] [file]`: **Ch**ange **mod**e (permissions).
    ```bash
    # Give owner full permissions, group and others read/execute
    chmod 755 myscript.sh
    # Add execute permission for owner and group
    chmod ug+x another_script.py
    ```
*   `chown [user][:group] [file]`: **Ch**ange **own**er.
*   `chgrp [group] [file]`: **Ch**ange **gr**ou**p**.

### 2.4. Searching for Files and Patterns

*   `find [path] [expression]`: Search for files and directories based on various criteria.
    ```bash
    # Find all .log files in the current directory and subdirectories
    find . -name "*.log"
    # Find all directories modified in the last 7 days
    find /data -type d -mtime -7
    ```
*   `grep [pattern] [file(s)]`: Search for text patterns within files.
    ```bash
    # Search for 