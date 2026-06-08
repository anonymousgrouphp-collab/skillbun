# Live Response & Endpoint Triage

Live Response & Endpoint Triage is a critical phase in Digital Forensics and Incident Response (DFIR) that involves collecting volatile data from an active system *without* disrupting ongoing operations. The goal is to capture ephemeral information that would be lost upon system shutdown or reboot, providing immediate insights into an incident and aiding in rapid containment. This process prioritizes data based on its order of volatility, ensuring the most transient evidence is collected first.

## 1. Understanding Volatile Data

Volatile data is information stored in memory or temporary storage that changes frequently or is lost when the system loses power or is shut down. Its collection is paramount because it can reveal real-time attacker activities, malware presence, and system state.

**Order of Volatility (Generally Accepted):**
1.  **CPU Cache, Registers:** Extremely volatile, rarely directly collectible in live response.
2.  **RAM (System Memory):** Running processes, open files, network connections, encryption keys.
3.  **Network State:** Active connections, routing tables, ARP cache.
4.  **Running Processes:** List of active processes, their PIDs, parent processes, open handles.
5.  **Disk Cache, Temporary File Systems:** Recently accessed files, temporary data.
6.  **Persistent Storage (Hard Drives/SSDs):** File systems, logs, installed programs (less volatile, usually part of dead-box forensics).

## 2. Key Data Collection Areas & Techniques

### a. Capturing Memory Dumps

Memory dumps capture the entire contents of a system's RAM at a specific moment. This is invaluable for analyzing running processes, injected code, open network sockets, cryptographic keys, and more.

*   **Purpose**: Reveal hidden processes, malware in memory, active network sessions, and recently accessed files.
*   **Tools**:
    *   **Windows**: `FTK Imager Lite`, `WinPmem`, `dumpit`, `Belkasoft RAM Capturer`.
    *   **Linux**: `LiME (Linux Memory Extractor)`, `fmem`.
*   **Example (Windows - using dumpit)**:
    ```powershell
    # Download dumpit.exe and place it in a known directory
    # Run as Administrator
    .\dumpit.exe
    # This will create a memory.dmp file in the current directory.
    ```
*   **Example (Linux - using LiME)**:
    ```bash
    # Assuming LiME module is compiled and ready
    sudo insmod lime-forensics.ko "path=/path/to/output/mem.lime format=lime"
    ```

### b. Running Processes

Identifying all active processes, their parent-child relationships, and associated user accounts can quickly highlight anomalous or malicious activity.

*   **Purpose**: Detect malicious executables, process injection, suspicious parent processes, and unauthorized running applications.
*   **Tools**:
    *   **Windows**: `tasklist /svc`, `tasklist /m`, `Process Explorer`, `Process Monitor`.
    *   **Linux**: `ps aux`, `pstree`, `top`, `htop`.
*   **Example (Windows)**:
    ```cmd
    tasklist /v /fo csv > C:\IR\processlist.csv
    # Exports a detailed list of processes including user, CPU time, and window title.
    ```
*   **Example (Linux)**:
    ```bash
    ps aux --sort=-%mem > /tmp/processlist.txt
    # Lists all processes, sorted by memory usage.
    ```

### c. Network Connections

Active network connections reveal communication with command-and-control (C2) servers, data exfiltration attempts, and internal lateral movement.

*   **Purpose**: Identify suspicious inbound/outbound connections, unknown listening ports, and active C2 channels.
*   **Tools**:
    *   **Windows**: `netstat -ano`, `TCPView`, `CurrPorts`.
    *   **Linux**: `netstat -tulnp`, `ss -tulnp`, `lsof -i`.
*   **Example (Windows)**:
    ```cmd
    netstat -ano > C:\IR\netconnections.txt
    # Lists all active TCP connections and listening ports with associated PIDs.
    ```
*   **Example (Linux)**:
    ```bash
    ss -tulnp > /tmp/network_connections.txt
    # Shows listening and established sockets.
    ```

### d. Command History

Collecting command history can directly expose attacker actions, executed tools, and attempted commands.

*   **Purpose**: Reconstruct attacker activity, identify tools used, and understand their objectives.
*   **Tools**:
    *   **Windows**: `Get-History` (PowerShell), `doskey /history` (CMD - limited). PowerShell transcription logs (if enabled).
    *   **Linux**: `~/.bash_history`, `~/.zsh_history`, `history` command.
*   **Example (PowerShell)**:
    ```powershell
    Get-History | Export-Csv -Path C:\IR\powershell_history.csv -NoTypeInformation
    ```
*   **Example (Bash)**:
    ```bash
    history > /tmp/bash_history.txt
    ```

## 3. Live Response Scripting

Automating data collection with scripts ensures consistency, speed, and minimizes direct interaction with the compromised system, reducing the risk of further data alteration. PowerShell for Windows and Python/Bash for Linux are commonly used.

**Simple PowerShell Live Response Script Example (Windows)**

This script collects basic system information, process lists, and network connections.

```powershell
# Path to store output
$outputPath = "C:\IR_Evidence_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $outputPath -ErrorAction SilentlyContinue

Write-Host "Collecting volatile data to $outputPath..."

# 1. System Information
Get-ComputerInfo | Out-File "$outputPath\systeminfo.txt"
Write-Host " - System Info collected."

# 2. Running Processes
Get-Process | Select-Object Id, ProcessName, Path, StartTime, Handles, WorkingSet, CPU | Export-Csv "$outputPath\processes.csv" -NoTypeInformation
Write-Host " - Processes collected."

# 3. Network Connections
Get-NetTCPConnection | Export-Csv "$outputPath\netconnections.csv" -NoTypeInformation
Write-Host " - Network connections collected."

# 4. Scheduled Tasks
Get-ScheduledTask | Export-Csv "$outputPath\scheduledtasks.csv" -NoTypeInformation
Write-Host " - Scheduled tasks collected."

# 5. Event Logs (Last 24 hours - adjust as needed)
Get-WinEvent -FilterHashTable @{LogName='System','Security','Application'; StartTime=(Get-Date).AddHours(-24)} | Export-WinEvent -Path "$outputPath\eventlogs_last24h.evtx" -ErrorAction SilentlyContinue
Write-Host " - Event logs collected (last 24h)."

Write-Host "Live response data collection complete."
```

## 4. Endpoint Detection and Response (EDR) Tools

Modern EDR solutions are integral to live response. They provide continuous monitoring, real-time visibility into endpoint activities, and capabilities to remotely execute forensic commands, collect data, isolate endpoints, and terminate malicious processes. EDR tools significantly accelerate the triage process by centralizing data collection and enabling rapid response actions across an enterprise.

*   **Key Features**: Real-time alerts, process tree visualization, remote shell access, automated containment, threat hunting.
*   **Examples**: CrowdStrike Falcon, SentinelOne, Microsoft Defender for Endpoint, Carbon Black.

## 5. Best Practices for Live Response

*   **Minimize System Impact**: Use forensically sound tools and methods that have minimal footprint. Avoid installing new software if possible.
*   **Chain of Custody**: Document every step, tool used, and timestamp. Ensure data integrity (e.g., hash collected files).
*   **Prioritize**: Follow the order of volatility. Collect the most ephemeral data first.
*   **Work Remotely (if possible)**: Utilize EDR tools or remote access to avoid physically touching the system.
*   **Prepare in Advance**: Have live response kits (scripts, portable tools) ready.

---
## Quick Understanding Checklist/Exercise

1.  **Scenario**: A critical server is suspected of being compromised, but cannot be powered off immediately. What type of data would you prioritize collecting first, and why? Name two tools you might use for this.
2.  **Tool Identification**: You need to list all currently running processes, including their full paths and parent processes, on a Windows machine. Which command-line tool would be most effective for this, and what command would you run?
3.  **Automation Advantage**: Explain one significant advantage of using live response scripting over manual data collection during an incident.