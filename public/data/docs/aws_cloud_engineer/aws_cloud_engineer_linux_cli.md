# Linux & Command Line Basics: Study Guide

Welcome to the foundational module on Linux and Command Line Basics, a critical skill set for any aspiring AWS Cloud Engineer. Proficiency in Linux commands, shell scripting, and the AWS Command Line Interface (CLI) empowers you to efficiently manage cloud resources, automate tasks, and troubleshoot systems.

## 1. Introduction to Linux & Command Line

Linux is the dominant operating system in cloud environments, including AWS. Interacting with Linux servers primarily happens through the command line interface (CLI). Mastering the CLI allows for powerful, scriptable, and repeatable operations.

## 2. Core Linux Commands

Here are essential commands categorized by their function:

### 2.1. File System Navigation

*   `pwd`: **P**rint **W**orking **D**irectory. Shows your current location.
    ```bash
    pwd
    # Expected output: /home/ubuntu
    ```
*   `ls`: **L**i**S**t directory contents.
    *   `ls -l`: Long listing format (permissions, owner, size, date).
    *   `ls -a`: List all files, including hidden ones (starting with `.`).
    *   `ls -lh`: Long format with human-readable file sizes.
*   `cd <directory>`: **C**hange **D**irectory.
    *   `cd ..`: Go up one directory level.
    *   `cd ~`: Go to your home directory.
    *   `cd /`: Go to the root directory.

### 2.2. File and Directory Management

*   `mkdir <directory_name>`: **M**a**K**e **DIR**ectory.
*   `touch <file_name>`: Create an empty file or update its timestamp.
*   `cp <source> <destination>`: **C**o**P**y files or directories.
    *   `cp -r <source_dir> <destination_dir>`: Copy directories recursively.
*   `mv <source> <destination>`: **M**o**V**e (or rename) files/directories.
*   `rm <file_name>`: **R**e**M**ove files.
    *   `rm -r <directory_name>`: Remove directories recursively.
    *   `rm -rf <directory_name>`: Forcefully remove directories recursively (use with caution!).

### 2.3. Viewing File Contents

*   `cat <file_name>`: **CAT**enate and display the entire content of a file.
*   `less <file_name>`: View file content page by page (allows scrolling, press `q` to exit).
*   `head <file_name>`: Display the beginning (default 10 lines) of a file.
*   `tail <file_name>`: Display the end (default 10 lines) of a file.
    *   `tail -f <log_file>`: Follows (streams) new content added to a file (useful for logs).
*   `grep <pattern> <file_name>`: Search for text patterns within files.
    ```bash
    grep 