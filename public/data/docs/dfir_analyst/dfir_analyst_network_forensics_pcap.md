# Network Forensics & Packet Analysis Study Guide

## Introduction
Network Forensics is a sub-branch of digital forensics that deals with the monitoring, interception, capture, recording, and analysis of network traffic for the purpose of gathering information, evidence, or detecting intrusion. Packet Analysis is the process of examining individual data packets that traverse a network. Together, these disciplines are crucial for understanding how attacks unfold, identifying compromised systems, and gathering intelligence for incident response and threat hunting.

## Core Concepts

### Indicators of Compromise (IOCs)
IOCs in network traffic are artifacts observed on a network or in an operating system that indicate, with high confidence, a computer intrusion. Common network-based IOCs include:
*   **Malicious IP Addresses/Domains:** Known C2 servers, phishing sites, or malware distribution points.
*   **Unusual Traffic Patterns:** High volume to/from unusual ports, unexpected geographical connections, or connections at odd hours.
*   **Protocol Anomalies:** Non-standard use of common protocols, tunneling, or unexpected protocol usage on specific ports.
*   **Specific HTTP User-Agents:** Known malicious user-agent strings.
*   **DNS Requests:** Queries for suspicious domains, high volume of NXDOMAIN responses, or DNS tunneling patterns.

### Common Network Protocols
Understanding the fundamental protocols is essential for effective analysis:
*   **TCP/IP Suite:** The bedrock of internet communication. Analysts must understand IP addresses, port numbers, and TCP/UDP header fields to trace connections and identify endpoints.
*   **DNS (Domain Name System):** Resolves human-readable domain names to IP addresses. DNS traffic can reveal communication with malicious domains, C2 activities, or data exfiltration via DNS tunneling.
*   **HTTP/HTTPS (Hypertext Transfer Protocol Secure):** Governs web communication. HTTP allows inspection of URLs, user-agents, methods (GET/POST), and responses. HTTPS encrypts much of this, requiring specialized techniques (e.g., SSL/TLS decryption with shared secrets) for deeper analysis.
*   **SMB (Server Message Block):** Used for file sharing, printer sharing, and interprocess communication in Windows networks. Often abused for lateral movement, reconnaissance, and malware delivery within an internal network.

### Packet Capture Tools
*   **Wireshark:** A widely used, powerful, open-source network protocol analyzer with a graphical user interface (GUI). It allows deep inspection of hundreds of protocols, real-time capture, and extensive filtering capabilities.
*   **TShark:** The command-line version of Wireshark. Ideal for scripting, automation, and capturing/analyzing traffic on remote or headless servers. It supports all Wireshark's dissection and filtering features.
*   **tcpdump:** A command-line packet analyzer for Linux/Unix-like systems. Excellent for quick captures and on-the-fly filtering, often used for live troubleshooting or initial triage.

### Network Flow Data (NetFlow, IPFIX)
Unlike full packet capture which records every byte of data, network flow data provides summarized information about network sessions. It records metadata like:
*   Source and Destination IP addresses
*   Source and Destination Ports
*   Protocol (TCP, UDP, ICMP, etc.)
*   Start and End Times of the flow
*   Number of bytes and packets transferred

**NetFlow** (Cisco proprietary) and **IPFIX** (standardized version) are invaluable for high-level visibility, identifying top talkers, unusual communication patterns, and for long-term storage where full packet capture is impractical due to volume. While they don't provide payload content, they are excellent for detecting anomalous connections or high-volume data transfers.

### Detecting Anomalies & Malicious Communication
*   **Baselining:** Establishing a normal pattern of network activity to identify deviations. Any significant departure from the baseline can indicate suspicious behavior.
*   **Thresholding:** Setting limits for specific metrics (e.g., number of failed logins, connection attempts per second). Exceeding these thresholds triggers alerts.
*   **Signature-based Detection:** Identifying known attack patterns or malware signatures within network traffic, often performed by Intrusion Detection/Prevention Systems (IDS/IPS).
*   **Behavioral Analysis:** Looking for non-random, repetitive, or unusual behaviors like C2 beaconing (regular, small communication from an infected host to a C2 server), data exfiltration (large outbound transfers to suspicious destinations), or port scanning activities.

## Practical Example: Wireshark Filtering for Suspicious HTTP Traffic

To identify potential C2 communication or data exfiltration attempts over HTTP, you might look for unusual HTTP methods, excessively large POST requests, or specific user-agents. Here's a Wireshark filter to find HTTP POST requests with a content length greater than 10,000 bytes (potentially indicative of data upload) or traffic to non-standard HTTP ports:

```
http.request.method == "POST" and http.content_length > 10000 or (tcp.port == 8080 or tcp.port == 8000) and http
```

*   `http.request.method == "POST" and http.content_length > 10000`: Filters for HTTP POST requests where the payload size exceeds 10KB.
*   `(tcp.port == 8080 or tcp.port == 8000) and http`: Filters for any HTTP traffic occurring on common alternate HTTP ports (8080 or 8000), which might indicate an attempt to bypass standard port monitoring.

## Checklist/Exercises

1.  **Packet Capture & Analysis:** Use `tcpdump` to capture 100 packets of HTTP traffic on your local network interface. Then, open the captured `.pcap` file in Wireshark and filter for all `GET` requests, identifying the most common host requested.
2.  **DNS Exfiltration Simulation:** Imagine a scenario where a compromised host attempts to exfiltrate data by encoding it into DNS queries. How would you craft a Wireshark filter to identify unusually long or malformed DNS queries that might indicate such activity?
3.  **Anomaly Detection:** Given a NetFlow record, identify key fields you would examine to spot a potential insider threat attempting to access a prohibited internal server during off-hours. What two specific pieces of information would be most critical?