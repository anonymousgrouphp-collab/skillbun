# Linux & macOS Host Forensics: A Deep Dive into Digital Investigations

## Introduction
Host forensics is a critical discipline within Digital Forensics and Incident Response (DFIR) that focuses on acquiring and analyzing data from computing devices to uncover evidence of malicious activity, policy violations, or other relevant events. This study guide covers the essential techniques and artifacts for performing forensic investigations on both Linux and macOS systems, highlighting their unique characteristics and commonalities.

## Linux Host Forensics
Linux systems are prevalent in server environments, cloud infrastructure, and various specialized devices. Understanding their forensic artifacts is crucial for any DFIR analyst.

### Filesystem Analysis (Ext4)
Ext4 is the default filesystem for most modern Linux distributions. Key forensic considerations include:
*   **Inode Table:** Stores metadata about files (permissions, ownership, timestamps, data block pointers).
*   **Journal:** Records filesystem changes, which can sometimes provide clues about recent activity even after a crash or power loss.
*   **Deleted Files:** While data blocks of deleted files might persist, inode entries are typically marked as free, making direct recovery challenging without specialized tools or prior imaging.
*   **Timestamps:** Access Time (atime), Modify Time (mtime), Change Time (ctime). `atime` often updates on read access, `mtime` on content modification, and `ctime` on inode changes (e.g., permissions, ownership).

### System Logs
Linux systems generate extensive logs, providing a wealth of information about system operations, user activities, and potential security incidents. Key locations include `/var/log`:
*   `/var/log/syslog` or `/var/log/messages`: General system activity, kernel messages.
*   `/var/log/auth.log` or `/var/log/secure`: Authentication attempts, sudo usage.
*   `/var/log/kern.log`: Kernel-specific messages.
*   `/var/log/boot.log`: System boot messages.
*   `/var/log/apt/history.log`: Package installation/removal history (Debian/Ubuntu).
*   `/var/log/dmesg`: Kernel ring buffer messages.

### Bash History
The Bash shell keeps a history of commands executed by users. This is a primary source for understanding user actions.
*   **Location:** `~/.bash_history` (user-specific).
*   **Environment Variables:** `HISTFILESIZE` (max lines in history file), `HISTSIZE` (max commands in memory), `HISTCONTROL` (ignoredups, ignorespace).
*   **Timestamps:** By default, Bash history does not include timestamps. However, `HISTTIMEFORMAT` can be set (e.g., `export HISTTIMEFORMAT="%F %T "`) to prepend timestamps to each command.

### Process Accounting
Process accounting tracks commands executed on the system, providing a more robust record than Bash history, especially if history logging is tampered with.
*   **`acct` or `psacct`:** These packages record executed commands, user, TTY, start/end times, and resource usage.
    *   `lastcomm`: Displays information about previously executed commands.
*   **`auditd` (Linux Audit Framework):** A more comprehensive auditing system that can track file access, system calls, and more, based on configured rules.

### Cron Jobs
Cron jobs are scheduled tasks that run at specific intervals. Malicious actors often use cron to maintain persistence.
*   **System-wide Cron:**
    *   `/etc/crontab`: System-wide crontab file.
    *   `/etc/cron.d/`: Directory for service-specific cron jobs.
    *   `/etc/cron.hourly/`, `/etc/cron.daily/`, `/etc/cron.weekly/`, `/etc/cron.monthly/`: Directories for scripts to be run at these frequencies.
*   **User-specific Cron:** Each user can have their own crontab, typically managed with `crontab -e` and stored in `/var/spool/cron/crontabs/<username>`.

### Network Configurations
Network configurations reveal how a system is connected and communicates, which can indicate unauthorized access or data exfiltration.
*   **Current Connections:** `ss -tulnp` or `netstat -tulnp` (deprecated in favor of `ss`).
*   **Firewall Rules:** `iptables -L -n -v` or `ufw status`.
*   **Network Interfaces:** `ip a`, `ifconfig`.
*   **DNS Resolution:** `/etc/resolv.conf`.
*   **Network Configuration Files:** `/etc/network/interfaces` (Debian/Ubuntu), `/etc/sysconfig/network-scripts/ifcfg-*` (RedHat/CentOS).

#### Example: Checking Network Connections
To list all listening and established TCP/UDP connections with associated processes and numeric output:
```bash
ss -tulnp
```

#### Exercise: Linux Forensics Checklist
1.  Locate the Bash history file for the `root` user and identify the last 5 commands executed.
2.  Examine `/var/log/auth.log` (or `secure.log`) for any failed SSH login attempts from an unusual IP address within the last 24 hours.
3.  Check the system-wide cron jobs (`/etc/crontab`, `/etc/cron.d/`) for any suspicious or newly added entries.

## macOS Host Forensics
macOS, built on a Unix-like core, has distinct forensic artifacts due to its proprietary desktop environment and security features.

### Filesystem Analysis (APFS)
Apple File System (APFS) is the default filesystem for modern macOS versions.
*   **Copy-on-Write (CoW):** APFS uses CoW for metadata, which means changes create new blocks, potentially leaving older versions of data accessible in unallocated space.
*   **Snapshots:** APFS supports efficient snapshots, which can be forensically valuable as they represent the state of the filesystem at a point in time. Time Machine utilizes APFS snapshots.
*   **Containers:** APFS operates within containers, which can house multiple volumes (e.g., System, Data, Preboot, Recovery, VM).

### Unified Log
macOS introduced the Unified Log in Sierra (10.12), consolidating various log files into a more structured, queryable system.
*   **Accessing:** `log show` command or the Console.app.
*   **Persistence:** Log data is stored in `/var/db/diagnostics/` and `/private/var/db/systemstats/`.
*   **Querying:** Can filter by time, process, subsystem, message type, and more. E.g., `log show --predicate 'process == "ssh"' --info --last 1d`.

### Plists
Property List (Plist) files are XML or binary formatted files used by macOS applications and the system to store configuration settings and preferences.
*   **Location:** Often in `~/Library/Preferences/` (user-specific) or `/Library/Preferences/` (system-wide).
*   **Analysis:** Can reveal application usage, recent documents, network settings, and other user/system configurations.
*   **Tools:** `plutil` (built-in) or text editors for XML plists.

### Time Machine Backups
Time Machine is macOS's built-in backup solution. If available, it can be a goldmine for forensic analysis.
*   **Snapshots:** Time Machine creates local snapshots on the boot drive (APFS snapshots) even when the backup disk is not connected.
*   **Recovery:** Allows for recovery of previous versions of files or the entire system, potentially showing pre-compromise states.
*   **Location:** External drives for full backups, `/Volumes/com.apple.TimeMachine.localsnapshots/` for local snapshots.

### TCC Database (Transparency, Consent, and Control)
Introduced for privacy, TCC records user consent for applications to access sensitive resources like contacts, calendar, camera, microphone, and full disk access.
*   **Location:** `~/Library/Application Support/com.apple.TCC/TCC.db` (user-specific) and `/Library/Application Support/com.apple.TCC/TCC.db` (system-wide).
*   **Format:** SQLite database.
*   **Forensic Value:** Can indicate which applications were granted sensitive permissions, potentially revealing unauthorized data access by malware.

### Browser Artifacts
Web browsers store a wealth of user activity data, including history, downloads, cookies, and cached content. Major browsers like Safari, Chrome, and Firefox are relevant.
*   **Safari:** `~/Library/Safari/History.db`, `~/Library/Caches/com.apple.Safari/`.
*   **Google Chrome:** `~/Library/Application Support/Google/Chrome/Default/` (contains History, Downloads, Cookies, Cache, Login Data SQLite databases).
*   **Mozilla Firefox:** `~/Library/Application Support/Firefox/Profiles/*.default/` (contains places.sqlite for history/bookmarks, cookies.sqlite, etc.).

### Spotlight Metadata
Spotlight is macOS's indexing and search technology, which creates metadata files for almost every file on the system.
*   **Location:** `/Volumes/<Drive Name>/.Spotlight-V100/`.
*   **Contents:** Contains creation dates, modification dates, last opened dates, file type, author, keywords, and sometimes even snippets of file content.
*   **Forensic Value:** Can reveal recent file access, newly created files, and user interactions, even if the original files are deleted.
*   **Tools:** `mdfind` and `mdls` commands.

#### Example: Examining a TCC Entry
To query the TCC database for applications granted full disk access:
```bash
sqlite3 "/Users/your_username/Library/Application Support/com.apple.TCC/TCC.db" \
"SELECT service, client FROM access WHERE service = 'kTCCServiceSystemPolicyAllFiles';"
```
(Replace `your_username` with the actual username)

#### Exercise: macOS Forensics Checklist
1.  Use `log show` to identify all processes that crashed or encountered a major error within the last 48 hours.
2.  Locate the main configuration Plist file for the Safari browser and determine its last modification date.
3.  Examine the `TCC.db` for the current user and identify any applications granted access to the camera.

## Conclusion
Mastering both Linux and macOS host forensics is essential for a well-rounded DFIR analyst. While their underlying architectures share some similarities, the distinct operating system features, filesystem structures, and logging mechanisms require specific toolsets and methodologies. Continuous practice and staying updated with OS changes are key to successful investigations.
