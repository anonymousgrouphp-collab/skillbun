# Memory Forensics Study Guide

Memory forensics is a critical discipline within Digital Forensics and Incident Response (DFIR) that focuses on extracting and analyzing volatile data from a computer's Random Access Memory (RAM). Unlike disk forensics, which examines persistent storage, memory forensics deals with data that vanishes when a system is powered off. This makes it invaluable for uncovering sophisticated threats like fileless malware, rootkits, and in-memory injection techniques that leave little to no trace on the hard drive.

## 1. Introduction to Memory Forensics

*   **Definition**: The art and science of analyzing a computer's volatile memory (RAM) to recover forensic artifacts. These artifacts provide a snapshot of the system's state at the time of acquisition.
*   **Importance**: 
    *   **Detection of Ephemeral Threats**: Reveals running processes, open network connections, loaded DLLs, API hooks, and command history that might not be logged or saved to disk.
    *   **Malware Analysis**: Helps in understanding malware behavior, identifying injected code, decrypting memory regions, and extracting configuration data or encryption keys.
    *   **Incident Response**: Provides immediate insights into ongoing attacks, attacker tools, and user activity.
    *   **Rootkit Detection**: Can identify hidden processes, manipulated kernel modules, or modified kernel data structures.

## 2. Memory Acquisition Techniques

Acquiring a forensically sound memory dump is the crucial first step. The goal is to obtain a complete and untainted copy of the system's RAM without altering the original memory contents.

*   **Key Considerations**: 
    *   **Minimize Impact**: Use tools that have a small footprint and run from a separate medium if possible.
    *   **Timeliness**: Acquire memory as quickly as possible, as data is volatile.
    *   **Integrity**: Hash the acquired memory dump to ensure its integrity and prevent tampering.
*   **Common Acquisition Tools**: 
    *   **Windows**: 
        *   **DumpIt**: A simple, standalone tool from Comae Technologies that creates a full memory dump.
        *   **FTK Imager Lite**: Can acquire physical memory and create forensic images.
        *   **winpmem**: A physical memory acquisition tool, part of the Rekall project, known for reliability.
    *   **Linux**: 
        *   **LiME (Linux Memory Extractor)**: A loadable kernel module (LKM) that allows for the acquisition of volatile memory from Linux and Android-based devices.
    *   **Virtual Machines**: Most hypervisors (e.g., VMware, VirtualBox) allow for direct memory snapshots or dumps of the guest OS.

## 3. Memory Analysis with Volatility Framework

The Volatility Framework is the leading open-source tool for memory forensics. It's written in Python and supports memory dumps from Windows, Linux, macOS, and Android.

*   **Overview**: Volatility extracts digital artifacts from RAM samples, allowing analysts to examine the state of a system at the time the dump was taken. Volatility 3 is the latest major version, offering improved performance and a more modular plugin architecture.
*   **Basic Installation (Volatility 3)**:
    ```bash
    git clone https://github.com/volatilityfoundation/volatility3.git
    cd volatility3
    pip install -r requirements.txt
    python3 vol.py --help
    ```
*   **Core Workflow**: 
    1.  **Identify Profile**: The first step is almost always to determine the operating system and build number of the memory dump. This is crucial for Volatility to correctly interpret the memory structures.
    2.  **Run Plugins**: Execute various plugins to extract specific artifacts.

## 4. Key Memory Analysis Techniques and Volatility Plugins (Volatility 3 Examples)

Assume `memdump.mem` is your memory image.

1.  **Identify OS Profile (Critical first step)**:
    ```bash
    python3 vol.py -f memdump.mem windows.info
    ```
    *Output:* Provides details like operating system, build number, and kernel debug information, which helps confirm the memory image's origin.

2.  **Process Analysis**: 
    *   **Listing Processes**: 
        ```bash
        python3 vol.py -f memdump.mem windows.pslist
        python3 vol.py -f memdump.mem windows.pstree
        ```
        *   `pslist`: Lists currently active processes.
        *   `pstree`: Shows parent-child relationships, useful for spotting suspicious process hierarchies (e.g., `cmd.exe` spawned by Word).
    *   **Detecting Hidden Processes**: 
        ```bash
        python3 vol.py -f memdump.mem windows.psscan
        ```
        *   `psscan`: Scans for `EPROCESS` structures in raw memory, which can reveal processes unlinked from the active process list by rootkits.
    *   **Malicious Code Identification**: 
        ```bash
        python3 vol.py -f memdump.mem windows.malfind
        ```
        *   `malfind`: Identifies potentially malicious injected code within processes by scanning for characteristics like `PAGE_EXECUTE_READWRITE` regions or suspicious memory patterns.
    *   **Loaded Modules/DLLs**: 
        ```bash
        python3 vol.py -f memdump.mem windows.dlllist --pid <PID>
        ```
        *   `dlllist`: Lists DLLs loaded by specific processes. Useful for identifying unusual or unknown DLLs.

3.  **Network Activity Analysis**: 
    *   **Active Network Connections**: 
        ```bash
        python3 vol.py -f memdump.mem windows.netscan
        ```
        *   `netscan`: Lists active and recently closed network connections and open sockets. Crucial for identifying Command and Control (C2) communication, suspicious outbound connections, or unexpected listening services.

4.  **User Activity & Command History**: 
    *   **Command History**: 
        ```bash
        python3 vol.py -f memdump.mem windows.cmdscan
        python3 vol.py -f memdump.mem windows.consoles
        ```
        *   `cmdscan`: Extracts command history from `cmd.exe` sessions.
        *   `consoles`: Recovers input and output buffers from console windows.
    *   **Password Hashes**: 
        ```bash
        python3 vol.py -f memdump.mem windows.hashdump
        ```
        *   `hashdump`: Extracts NTLM hashes from memory (typically from the `LSASS` process), which can be used for cracking or pass-the-hash attacks.

5.  **Code Injection & Rootkit Detection**: 
    *   **Unlinked Modules**: 
        ```bash
        python3 vol.py -f memdump.mem windows.ldrmodules
        ```
        *   `ldrmodules`: Checks for unlinked or injected DLLs that have been manually mapped into a process's address space without being properly linked into the standard module lists.
    *   **API Hooks**: 
        ```bash
        python3 vol.py -f memdump.mem windows.apihooks
        ```
        *   `apihooks`: Detects modifications to Windows API calls, a common technique used by rootkits and malware to intercept or alter system functionality.
    *   **Kernel Callbacks**: 
        ```bash
        python3 vol.py -f memdump.mem windows.callbacks
        ```
        *   `callbacks`: Lists kernel callbacks, which can be hijacked by rootkits to execute malicious code during specific kernel events.

## Quick Checklist/Exercise:

1.  Describe why memory forensics is crucial for detecting fileless malware, even if disk forensics yields no results.
2.  You've acquired a memory dump of a suspected compromised Windows machine. What is the very first Volatility command you should typically run to begin your analysis, and why?
3.  An analyst suspects a rootkit is hiding a process. Which Volatility plugin(s) would you recommend they use to verify this, and what specific output would be indicative of a hidden process?