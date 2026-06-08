# Windows Host Forensics: A Study Guide

## Introduction to Windows Host Forensics

Windows Host Forensics is a specialized discipline within Digital Forensics and Incident Response (DFIR) focused on investigating compromised or suspicious Windows operating systems. Its primary goal is to identify, collect, preserve, analyze, and report on digital evidence found on a Windows host to reconstruct events, determine the extent of a breach, identify threat actors, and understand their methodologies. This involves meticulously examining various system artifacts that record user activity, program execution, network connections, and system changes.

## Key Artifacts & Analysis Techniques

Windows systems are rich in artifacts that provide invaluable insights into system usage and potential malicious activity. Mastering their analysis is crucial for any DFIR analyst.

### 1. File Systems (NTFS, FAT)

Windows primarily uses NTFS (New Technology File System), though older systems or removable media might use FAT (File Allocation Table). NTFS offers advanced features critical for forensics, such as journaling, permissions, and robust file attribute storage.

*   **NTFS Key Features:**
    *   **Journaling:** Records metadata changes before they occur, enhancing data recovery and providing a timeline of file system modifications.
    *   **Alternate Data Streams (ADS):** Allows data to be hidden within existing files without affecting their apparent size or functionality, a common technique for malware.
    *   **Timestamps:** MACB (Modified, Accessed, Created, Entry Modified) times provide crucial temporal data for files and directories.
    *   **Permissions (ACLs):** Access Control Lists define who can access or modify files and folders.

### 2. Registry Hives Analysis

The Windows Registry is a hierarchical database that stores low-level settings for the operating system, applications, and user profiles. It's a goldmine for forensic investigators, revealing user activities, installed software, system configurations, and more.

*   **Key Hives and Their Significance:**
    *   `SAM`: Stores local user account security information (hashed passwords).
    *   `SECURITY`: Stores system-wide security settings, including local policies.
    *   `SOFTWARE`: Stores system and installed software configuration.
    *   `SYSTEM`: Stores system startup information, device drivers, and service configurations.
    *   `NTUSER.DAT`: User-specific settings, one per user profile.
*   **Analysis Tools:** RegRipper, Registry Explorer (Eric Zimmerman's tool suite), KAPE.

### 3. Event Logs (.evtx)

Windows Event Logs record significant events on the system, providing a chronological record of activities. They are categorized by type:

*   **Types:**
    *   `System`: Records events related to OS components (e.g., startup, shutdown, driver failures).
    *   `Security`: Records security-related events (e.g., login attempts, file access, policy changes).
    *   `Application`: Records events logged by applications.
    *   `Setup`: Records events during Windows installation or updates.
    *   `Forwarded Events`: Contains events collected from remote computers.
*   **Key Event IDs (Examples):**
    *   `4624`: Successful Logon
    *   `4625`: Failed Logon
    *   `4648`: A logon was attempted using explicit credentials (RunAs)
    *   `4720`: A user account was created
    *   `1074`: The system has been shut down or rebooted
*   **Analysis Tools:** Event Viewer (built-in), Event Log Explorer, Log Parser.

### 4. Prefetch Files (.pf)

Windows Prefetch files store information about applications frequently run on the system to optimize their startup performance. They record the executable name, run count, and associated files/directories accessed during execution.

*   **Location:** `%SystemRoot%\Prefetch` (e.g., `C:\Windows\Prefetch`)
*   **Significance:** Provides evidence of program execution, even if the executable itself has been deleted. Helps determine application run count and last execution time.
*   **Analysis Tools:** PECmd (Eric Zimmerman's tool).

### 5. JumpLists (.automaticDestinations-ms, .customDestinations-ms)

JumpLists provide quick access to recently opened files for specific applications. They store information about user interaction with files and applications.

*   **Location:** `%APPDATA%\Microsoft\Windows\Recent\AutomaticDestinations` and `%APPDATA%\Microsoft\Windows\Recent\CustomDestinations`
*   **Significance:** Reveals recently accessed documents, programs, and often the path to the original file, even if moved or deleted.
*   **Analysis Tools:** JLECmd (Eric Zimmerman's tool).

### 6. ShellBags

ShellBags are registry keys that store settings for folders viewed in Windows Explorer, such as size, position, and icon view. They passively record information about directories accessed by a user.

*   **Location:** Registry: `NTUSER.DAT\Software\Microsoft\Windows\Shell\Bags` and `NTUSER.DAT\Software\Microsoft\Windows\ShellNoRoam\Bags`
*   **Significance:** Shows evidence of folder access, including network shares and removable media, even if the folders no longer exist or were accessed remotely.
*   **Analysis Tools:** ShellBags Explorer, Registry Explorer.

### 7. LNK Files (Shell Link Files)

LNK files are shortcuts to files or applications. They contain metadata about the target file, including its path, timestamps, size, and often the volume serial number and MAC address of the device where the target resided.

*   **Location:** `%APPDATA%\Microsoft\Windows\Recent` (for recently accessed items), Desktop, Start Menu.
*   **Significance:** Provides evidence of file access and execution, including when the shortcut was created, modified, and last accessed. They can point to files on removable media or network shares.
*   **Analysis Tools:** LECmd (Eric Zimmerman's tool).

### 8. ShimCache (AppCompatCache)

The ShimCache (Application Compatibility Cache) is a registry-based artifact that tracks executables run on a system, primarily to help with application compatibility.

*   **Location:** Registry: `SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache\AppCompatCache` (Windows 7/8/2008R2/2012) or `SYSTEM\CurrentControlSet\Control\Session Manager\AppPatch\AppCompatCache` (Windows XP/2003). For Windows 10/11, it's often `AppCompatCache` under `SYSTEM\CurrentControlSet\Control\Session Manager`.
*   **Significance:** Provides a list of executables run on the system, along with their file paths, last modification times, and file sizes. Excellent for identifying previously executed malware or suspicious tools.
*   **Analysis Tools:** AppCompatCacheParser.py, KAPE.

### 9. Amcache.hve

Amcache.hve is a registry hive that tracks programs executed on a system, similar to ShimCache but often with more detailed information, especially regarding file paths and hashes.

*   **Location:** `%SystemRoot%\AppCompat\Programs\Amcache.hve`
*   **Significance:** Records information about programs run, including SHA1 hashes of executables, program paths, and execution times. Very useful for identifying known malware or unauthorized software.
*   **Analysis Tools:** AmcacheParser (Eric Zimmerman's tool).

### 10. Master File Table (MFT)

The MFT is the heart of an NTFS file system. It's a special file (named `$MFT`) that stores an entry for every file and directory on the volume. Each entry contains metadata about the file, such as its name, size, timestamps, data location, and attributes.

*   **Location:** The `$MFT` file is usually located at the beginning of the NTFS volume, hidden from regular view.
*   **Significance:** Even if a file has been deleted, its MFT entry might still exist, containing valuable metadata. It's crucial for recovering deleted file information and reconstructing file system activity.
*   **Analysis Tools:** Foremost, Autopsy, FTK Imager (to extract MFT), various MFT parsers.

### Common Artifacts for User Activity, Execution, and Persistence

These artifacts provide direct evidence for different stages of an attack or user interaction:

*   **User Activity:** JumpLists, LNK files, ShellBags, NTUSER.DAT (Registry - e.g., TypedURLs, RecentDocs).
*   **Execution:** Prefetch files, ShimCache, Amcache.hve, Event Logs (Security logs for process creation/logons), Registry (Run keys).
*   **Persistence:** Registry Run keys (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`), Services (`SYSTEM\CurrentControlSet\Services`), Scheduled Tasks, WMI persistence.

## Quick Checklist/Exercise

1.  **Identify the tool:** Which Eric Zimmerman tool would you use to parse a Prefetch file to determine a program's execution count and last run time?
2.  **Locate the artifact:** Where would you typically find `Amcache.hve` on a Windows system, and what type of information does it primarily store for forensic analysis?
3.  **Interpret the evidence:** If you discover numerous `LNK` files pointing to a program on a USB drive that is no longer connected, what key forensic insights can these `LNK` files still provide about the deleted program and the connected device?

```
# Example: Conceptual command for extracting ShimCache data
# This is a conceptual command; actual tool syntax may vary slightly depending on the version and environment.

# Using AppCompatCacheParser.py (assuming Python environment is set up)
# python AppCompatCacheParser.py -i C:\Windows\System32\config\SYSTEM -o shimcache_output.csv --csv
# This command would parse the SYSTEM registry hive to extract ShimCache data
# and output it to a CSV file for review.

# Using KAPE (Kroll Artifact Parser and Extractor) for multiple artifacts
# kape.exe --target C: --tmf Shimcache,Prefetch --mdest D:\forensics_output --mcl shimcache.cli,prefetch.cli
# This command uses KAPE to collect ShimCache and Prefetch files from the C: drive
# of a target system and save the parsed output to D:\forensics_output.
```