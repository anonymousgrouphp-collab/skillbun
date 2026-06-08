## Linux System Utilities & Scripting

This guide provides an essential overview of Linux system utilities for monitoring and managing system resources, along with fundamental Bash scripting techniques for automation and task scheduling. For a Database Administrator (DBA), proficiency in these areas is crucial for maintaining optimal database performance, troubleshooting issues, and automating routine tasks.

### 1. Disk and Memory Management Tools

Effective management of disk space and memory is vital for database servers. These tools help DBAs monitor resource utilization and prevent outages.

#### 1.1 `df` (Disk Free)
Displays information about total space, used space, and available space on mounted filesystems. It's essential for tracking disk usage and ensuring sufficient space for data files, logs, and backups.

*   **Syntax:** `df [options]`
*   **Common Options:**
    *   `-h`: Human-readable format (e.g., K, M, G).
    *   `-T`: Include filesystem type.

```bash
df -hT
```

#### 1.2 `du` (Disk Usage)
Estimates file space usage. Useful for finding large files or directories consuming excessive space.

*   **Syntax:** `du [options] [file/directory]`
*   **Common Options:**
    *   `-h`: Human-readable format.
    *   `-s`: Summarize total for each argument.
    *   `-c`: Grand total.

```bash
du -sh /var/lib/mysql
```

#### 1.3 `free` (Display Memory Usage)
Shows the total amount of free and used physical and swap memory in the system.

*   **Syntax:** `free [options]`
*   **Common Options:**
    *   `-h`: Human-readable format.
    *   `-g`: Display in gigabytes.
    *   `-s [seconds]`: Update every N seconds.

```bash
free -h
```

### 2. CPU Monitoring Tools

Monitoring CPU usage helps identify performance bottlenecks and runaway processes that could impact database responsiveness.

#### 2.1 `top` (Table of Processes)
Provides a dynamic real-time view of a running system. It displays summary information as well as a list of tasks currently being managed by the Linux kernel.

*   **Key Features:**
    *   Real-time CPU and memory usage.
    *   Lists processes by CPU usage (default).
    *   Interactive commands (e.g., `k` to kill a process, `M` to sort by memory).

```bash
top
```

#### 2.2 `htop` (Enhanced top)
An interactive process viewer, similar to `top` but with a more user-friendly interface, easier navigation, and enhanced features like vertical and horizontal scrolling, and mouse support.

*   **Installation:** Usually not installed by default. `sudo apt install htop` (Debian/Ubuntu) or `sudo yum install htop` (RHEL/CentOS).
*   **Key Features:**
    *   Visual CPU, memory, and swap usage meters.
    *   Tree view for processes.
    *   Easier process management.

```bash
htop
```

### 3. I/O Monitoring Tools

Disk I/O performance is critical for databases. These tools help identify I/O bottlenecks and potential issues with storage.

#### 3.1 `iostat` (Input/Output Statistics)
Reports CPU utilization and I/O statistics for devices and partitions. It's part of the `sysstat` package.

*   **Installation:** `sudo apt install sysstat` or `sudo yum install sysstat`.
*   **Syntax:** `iostat [options] [interval] [count]`
*   **Common Options:**
    *   `-x`: Extended statistics.
    *   `-k` or `-m`: Display statistics in kilobytes or megabytes per second.
    *   `interval`: Report continuously at N-second intervals.

```bash
iostat -xm 5 3 # Report extended stats in MB every 5 seconds, 3 times
```

#### 3.2 `vmstat` (Virtual Memory Statistics)
Reports information about processes, memory, paging, block IO, traps, and CPU activity. Useful for a quick system health check.

*   **Syntax:** `vmstat [options] [delay] [count]`
*   **Key Metrics:**
    *   `r`: Number of runnable processes.
    *   `b`: Number of processes blocked.
    *   `swpd`: Amount of virtual memory used.
    *   `si/so`: Amount of memory swapped in/out from disk.
    *   `bi/bo`: Blocks received from/sent to a block device.
    *   `us/sy/id/wa`: CPU time spent by user, system, idle, and waiting for I/O.

```bash
vmstat 2 5 # Report every 2 seconds, 5 times
```

### 4. Basic Bash Scripting for Automation

Bash scripting allows DBAs to automate repetitive tasks, perform conditional actions, and integrate various commands into a single workflow.

#### 4.1 Script Structure

*   **Shebang:** `#!/bin/bash` (tells the system which interpreter to use).
*   **Comments:** Use `#` for single-line comments.
*   **Variables:** `MY_VAR="Hello World"` (no spaces around `=`). Access with `$MY_VAR`.
*   **Executing Commands:** Simply type the command.

#### 4.2 Simple Script Example: Disk Usage Alert

This script checks disk usage on a specific mount point and prints an alert if it exceeds a threshold.

```bash
#!/bin/bash

# Define variables
MOUNT_POINT="/"
THRESHOLD=90 # Percentage

# Get current disk usage percentage
USED_PERCENT=$(df -hP "$MOUNT_POINT" | awk 'NR==2 {print $5}' | sed 's/%//')

# Check if usage exceeds threshold
if [ "$USED_PERCENT" -gt "$THRESHOLD" ]; then
  echo "ALERT: Disk usage on $MOUNT_POINT is at ${USED_PERCENT}% which is above the ${THRESHOLD}% threshold!"
  # In a real scenario, you might add email notification here
else
  echo "INFO: Disk usage on $MOUNT_POINT is ${USED_PERCENT}% which is below the ${THRESHOLD}% threshold."
fi
```

To run: Save as `check_disk.sh`, then `chmod +x check_disk.sh` and `./check_disk.sh`.

### 5. Task Scheduling with `cron`

`cron` is a time-based job scheduler in Unix-like operating systems. It allows users to schedule commands or scripts to run automatically at a specified date and time.

#### 5.1 `crontab` Command

*   `crontab -e`: Edit your user's crontab file.
*   `crontab -l`: List your current crontab entries.
*   `crontab -r`: Remove your current crontab file (use with caution).

#### 5.2 Cron Syntax

A cron entry has five time fields followed by the command to execute:

`minute hour day_of_month month day_of_week command`

*   **Minute (0-59)**
*   **Hour (0-23)**
*   **Day of Month (1-31)**
*   **Month (1-12 or Jan-Dec)**
*   **Day of Week (0-7 or Sun-Sat, where 0 and 7 are Sunday)**

#### 5.3 Cron Example

To run the `check_disk.sh` script every day at 2:30 AM, add the following line to your crontab (`crontab -e`):

```cron
30 2 * * * /path/to/your/script/check_disk.sh >> /var/log/check_disk.log 2>&1
```

*   `30`: At minute 30
*   `2`: At hour 2 (2 AM)
*   `* * *`: Every day of the month, every month, every day of the week.
*   `/path/to/your/script/check_disk.sh`: The full path to your script.
*   `>> /var/log/check_disk.log 2>&1`: Redirects both standard output and standard error to a log file.

---

### Checklist / Exercises:

1.  **Disk & Memory:** How would you quickly find the top 5 largest directories under `/var/log` using a single command, displaying sizes in a human-readable format?
2.  **Scripting:** Write a simple Bash script that takes a directory path as an argument. If the directory exists, it should list its contents; otherwise, it should print an error message.
3.  **Scheduling:** You have a database backup script at `/opt/scripts/backup_db.sh`. Schedule this script to run every Sunday at midnight (00:00) using `cron`, ensuring all output is logged to `/var/log/db_backup.log`.