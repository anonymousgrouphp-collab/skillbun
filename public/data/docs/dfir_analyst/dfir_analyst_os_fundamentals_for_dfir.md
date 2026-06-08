# Operating System Fundamentals for Forensics

## Introduction

Understanding the foundational components and operational mechanisms of various operating systems (OS) is paramount for any Digital Forensics and Incident Response (DFIR) analyst. Forensic investigations often involve dissecting system states, tracking user activity, identifying malicious processes, and analyzing persistence mechanisms. A deep grasp of how Windows, Linux, and macOS manage resources, execute programs, and store data allows an analyst to effectively locate, interpret, and preserve digital evidence.

This guide will cover core OS components critical for forensic analysis, highlighting their relevance across different platforms.

## Core Operating System Components

### 1. Processes and Threads

*   **Definition**: A process is an instance of a computer program that is being executed. It contains the program code and its current activity. A thread is a sequence of executed instructions within a process. A process can have multiple threads executing concurrently.
*   **Forensic Relevance**: Analyzing process lists helps identify suspicious executables, malware, and unauthorized user activity. Process metadata (parent process, execution time, user context) is crucial for timeline reconstruction.
*   **Key Data Points**: Process ID (PID), Parent Process ID (PPID), user running the process, command line arguments, executable path, start time, network connections.

### 2. Services and Daemons

*   **Definition**: Services (Windows) or Daemons (Linux/macOS) are background processes that run without direct user interaction, performing system-level functions (e.g., web server, database, logging). They often start at boot and run continuously.
*   **Forensic Relevance**: Malware often establishes persistence by registering itself as a service/daemon. Examining service configurations can reveal unauthorized programs or modifications.
*   **Key Data Points**: Service name, display name, executable path, start type (manual, automatic, disabled), service account.

### 3. User Accounts and Authentication

*   **Definition**: User accounts provide a way to identify and authenticate users, granting them specific privileges and access to system resources. Authentication verifies a user's identity, while authorization determines what they can do.
*   **Forensic Relevance**: Understanding user accounts helps track who did what, when. Compromised accounts are a common entry point for attackers. Analyzing login/logout events, user groups, and account privileges is vital.
*   **Key Data Points**: Usernames, User IDs (UID/SID), group memberships, last login times, password policies, account creation/modification dates.

### 4. File Systems and Permissions

*   **Definition**: A file system organizes how data is stored and retrieved on a storage device. Permissions control who can access files and directories and what operations they can perform (read, write, execute).
*   **Forensic Relevance**: The file system is where all data resides. Identifying suspicious files, understanding their creation/modification/access times (MACB timestamps), and analyzing ownership/permissions can point to unauthorized data access or malware installation.
*   **Common File Systems**: NTFS (Windows), Ext4 (Linux), APFS/HFS+ (macOS).

### 5. Kernel Modules and Drivers

*   **Definition**: Kernel modules (Linux) or drivers (Windows/macOS) are pieces of code that can be loaded into the kernel (the core of the OS) dynamically. They allow the OS to interact with hardware or extend kernel functionality without recompiling the entire kernel.
*   **Forensic Relevance**: Rootkits often operate by manipulating or inserting malicious kernel modules/drivers to hide their presence or control the system at a low level. Detecting unauthorized modules is critical.
*   **Key Data Points**: Module name, load address, size, dependencies, signer information (Windows).

### 6. Boot Processes

*   **Definition**: The sequence of events that occurs from the moment a computer is powered on until the operating system is fully loaded and ready for user interaction.
*   **Forensic Relevance**: Boot sector malware (bootkits) and rootkits can modify the boot process to achieve early-stage persistence. Analyzing boot logs and configurations can reveal tampering.
*   **Stages (simplified)**: BIOS/UEFI POST > Bootloader (GRUB, Windows Boot Manager) > Kernel loading > Init system (systemd, SysVinit) > User environment.

### 7. System Architecture (Kernel-mode vs. User-mode)

*   **Definition**: Operating systems generally separate operations into two modes: kernel-mode (or supervisor mode), which has unrestricted access to hardware and memory, and user-mode, which has limited access and must request services from the kernel.
*   **Forensic Relevance**: Understanding this separation helps in comprehending how malware can bypass security controls (e.g., by exploiting kernel vulnerabilities or installing kernel-mode rootkits).

## OS-Specific Nuances

*   **Windows**: Registry (central hierarchical database for configuration), Event Logs (detailed system activity records), Prefetch (records frequently run applications), USN Journal (tracks all changes to files on an NTFS volume).
*   **Linux**: `/proc` filesystem (virtual filesystem providing process and kernel information), `/sys` filesystem (provides an interface to kernel data structures), `/var/log` (standard location for system logs), `systemd` (modern init system).
*   **macOS**: Plist files (XML-based configuration files), Unified Log (centralized logging system), `launchd` (init system, manages services/daemons).

## Practical Examples for Investigation

### Windows

To view running processes:
```powershell
Get-Process | Format-Table Id, ProcessName, Path, StartTime -AutoSize
```
To query service status:
```powershell
Get-Service -Name 