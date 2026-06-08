### Study Guide: Core Technical Skills & Implementation in DFIR

Digital Forensics and Incident Response (DFIR) analysts require a robust set of technical skills to effectively identify, preserve, analyze, and report on digital evidence. This guide covers the foundational disciplines essential for collecting and interpreting digital artifacts from diverse sources.

#### 1. Digital Evidence Collection & Preservation

The first critical step in any forensic investigation is the proper collection and preservation of digital evidence. Maintaining the integrity and admissibility of evidence is paramount.

*   **Volatile Data Collection:** Data that can be lost when a system is powered off (e.g., RAM, running processes, network connections).
    *   **Techniques:** Memory acquisition (e.g., using `dumpit` or `FTK Imager Lite`), live response tools for network connections (`netstat`), open files, and running processes.
*   **Non-Volatile Data Collection:** Data that persists after power-off (e.g., hard drives, SSDs, USB drives).
    *   **Techniques:** Forensic imaging (bit-for-bit copies) of storage devices. This creates an exact duplicate, preserving the original state.
*   **Chain of Custody:** A documented chronological record of evidence handling, from collection to presentation in court. It ensures the integrity and authenticity of the evidence.
    *   **Key Elements:** Who collected, when, where, how, who took possession, who stored, who analyzed, any changes made.

#### 2. File System Forensics

Understanding various file systems (FAT, NTFS, ext2/3/4, HFS+) is crucial for analyzing how data is stored, retrieved, and potentially hidden or deleted.

*   **Metadata Analysis:** Examining creation, modification, and access (MAC) times of files and directories. This can reveal user activity patterns.
*   **Deleted File Recovery:** Techniques to recover files that have been "deleted" but whose data blocks still exist on the disk and haven't been overwritten.
*   **File Carving:** Recovering files based on their headers and footers (signatures) without relying on file system metadata. Useful for severely corrupted file systems or unallocated space.
*   **Tools:** The Sleuth Kit (TSK) and Autopsy provide robust capabilities for file system analysis, carving, and timeline generation.

#### 3. Network Forensics

Analyzing network traffic provides insights into communication patterns, malicious activity, and data exfiltration.

*   **Packet Capture:** Intercepting and logging network data packets.
*   **Protocol Analysis:** Deciphering the various network protocols (TCP, UDP, HTTP, DNS, etc.) to understand communication flows.
*   **Identifying Malicious Traffic:** Detecting command-and-control (C2) communications, unauthorized access attempts, and data transfer anomalies.
*   **Tools:**
    *   `Wireshark`: A powerful graphical packet analyzer.
    *   `tcpdump`: A command-line packet sniffer for Unix-like systems.
    *   `Snort`/`Suricata`: Intrusion Detection/Prevention Systems (IDS/IPS) that can also be used for network traffic analysis.

#### 4. Memory Forensics

Memory forensics involves analyzing the contents of a computer's RAM to uncover hidden processes, malware artifacts, network connections, and other volatile data not available on disk.

*   **RAM Acquisition:** Capturing a complete dump of a system's physical memory.
*   **Process Analysis:** Identifying running processes, their associated executables, and parent-child relationships.
*   **Network Connection Analysis:** Extracting active and recently closed network connections from memory.
*   **Malware Detection:** Identifying code injection, rootkits, and other malicious artifacts residing only in memory.
*   **Tools:** `Volatility Framework` is the leading open-source memory forensics tool, capable of extracting a wealth of information from memory dumps.

#### 5. Operating System Forensics

Investigating specific operating system artifacts to understand user activities, system configurations, and events.

*   **Windows Forensics:**
    *   **Registry Analysis:** Examining the Windows Registry for user settings, installed programs, recent files, and system configurations.
    *   **Event Logs:** Analyzing Security, System, Application, and other event logs for evidence of compromise, user logins, and critical system events.
    *   **Prefetch/Superfetch Files:** Hint at executed programs.
    *   **ShellBags:** Store information about folders accessed by a user.
*   **Linux/macOS Forensics:**
    *   **Log Files:** Analyzing `/var/log` (syslog, auth.log, apache access logs, etc.) for system events, user activity, and service interactions.
    *   **Bash History:** Examining user command history for suspicious commands.
    *   **Cron Jobs:** Checking scheduled tasks for persistence mechanisms.
*   **Tools:**
    *   `Sysinternals Suite` (for Windows): Powerful utilities like `Autoruns`, `Process Monitor`, `PsExec`.
    *   `Registry Explorer`, `Event Log Explorer`.
    *   `plaso`/`log2timeline`: For timeline generation from various artifacts across OS types.

---

### Example: Basic Network Packet Capture with `tcpdump`

`tcpdump` is a command-line tool used to capture and analyze network packets. This simple example shows how to capture traffic on a specific interface and save it to a file.

```bash
# Capture all traffic on interface eth0 and save to output.pcap
sudo tcpdump -i eth0 -w output.pcap

# Capture HTTP (port 80) traffic on interface eth0
sudo tcpdump -i eth0 port 80

# Capture traffic from a specific host
sudo tcpdump -i eth0 host 192.168.1.100
```

These commands demonstrate basic usage. `output.pcap` can then be analyzed with `Wireshark` for a more graphical inspection.

---

### Quick Understanding Checklist/Exercise

1.  **Preservation:** List three types of volatile data and briefly explain why their immediate preservation is critical in a DFIR investigation.
2.  **Tool Identification:** Which open-source framework is widely used for memory forensics analysis, and what is one key artifact it can extract?
3.  **Integrity:** Define the "Chain of Custody" in the context of digital forensics and explain its primary purpose.