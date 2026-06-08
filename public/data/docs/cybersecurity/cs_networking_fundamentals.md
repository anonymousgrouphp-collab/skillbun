# Networking Fundamentals & Services: A Cybersecurity Deep Dive

Welcome to the foundational module on Networking Fundamentals & Services. As a cybersecurity specialist, a deep understanding of how networks function is paramount. This guide will equip you with the essential knowledge of network models, devices, protocols, and critical security implications.

## 1. Network Models: OSI and TCP/IP

Networking models provide a conceptual framework for understanding how data travels across networks. They standardize communication, allowing different systems to interact seamlessly.

### The OSI Model (Open Systems Interconnection)

A seven-layer conceptual model that standardizes the functions of a telecommunication or computing system without regard to its underlying internal structure and technology. It's often used for troubleshooting and understanding network issues.

1.  **Layer 7: Application Layer** - Interacts with software applications (HTTP, FTP, DNS).
2.  **Layer 6: Presentation Layer** - Data formatting, encryption, compression.
3.  **Layer 5: Session Layer** - Manages sessions between applications.
4.  **Layer 4: Transport Layer** - End-to-end communication, segmentation, flow control (TCP, UDP).
5.  **Layer 3: Network Layer** - Logical addressing (IP), routing (IP, ICMP, ARP).
6.  **Layer 2: Data Link Layer** - Physical addressing (MAC), error detection (Ethernet, Wi-Fi).
7.  **Layer 1: Physical Layer** - Physical medium, raw bit transmission (cables, hubs).

### The TCP/IP Model (Transmission Control Protocol/Internet Protocol)

A more practical, four-layer model widely used in modern internet architectures. It maps closely to how protocols are actually implemented.

1.  **Layer 4: Application Layer** - Combines OSI's Application, Presentation, Session layers (HTTP, FTP, DNS).
2.  **Layer 3: Transport Layer** - End-to-end communication, reliability (TCP, UDP).
3.  **Layer 2: Internet Layer** - Logical addressing, routing (IP, ICMP, ARP).
4.  **Layer 1: Network Access Layer** - Combines OSI's Data Link and Physical layers (Ethernet, Wi-Fi).

**Security Implication:** Understanding these models helps identify at which layer an attack might occur (e.g., a SYN flood targets the Transport layer, a phishing attack targets the Application layer).

## 2. Network Devices

These are the hardware components that form the backbone of any network.

*   **Routers:** Operate at Layer 3 (Network Layer) of the OSI model. They connect different networks and forward data packets between them based on IP addresses, making routing decisions to find the best path.
*   **Switches:** Primarily operate at Layer 2 (Data Link Layer). They connect devices within a single network (LAN) and forward data frames to specific destination MAC addresses, reducing collisions and improving efficiency. Managed switches can also implement VLANs.
*   **Firewalls:** Can operate across multiple layers, primarily Layer 3 and 4, but advanced firewalls (Application Layer Firewalls) operate up to Layer 7. They enforce security policies by controlling incoming and outgoing network traffic based on predefined rules, acting as a barrier between trusted and untrusted networks.

## 3. Common Protocols & Their Security Implications

Protocols define the rules for communication. Understanding them is crucial for identifying vulnerabilities.

*   **ARP (Address Resolution Protocol):** Maps IP addresses to MAC addresses on a local network. **Security:** Vulnerable to ARP Spoofing/Poisoning, where an attacker sends fake ARP messages to associate their MAC address with another device's IP address (e.g., the gateway's), leading to Man-in-the-Middle (MiTM) attacks.
*   **ICMP (Internet Control Message Protocol):** Used for diagnostic and error reporting (e.g., `ping`, `traceroute`). **Security:** Can be exploited for reconnaissance (network mapping, host discovery) or Denial of Service (DoS) attacks (e.g., Smurf attack).
*   **TCP (Transmission Control Protocol):** Connection-oriented, reliable, ordered delivery. Used by applications requiring data integrity (e.g., HTTP, FTP, SSH). **Security:** Vulnerable to SYN floods (DoS), TCP sequence prediction attacks, and session hijacking.
*   **UDP (User Datagram Protocol):** Connectionless, unreliable, faster delivery. Used for applications where speed is critical and some data loss is acceptable (e.g., DNS, DHCP, streaming). **Security:** Vulnerable to DoS amplification attacks due to its connectionless nature and spoofing.
*   **DNS (Domain Name System):** Translates human-readable domain names into IP addresses. **Security:** DNS Spoofing/Cache Poisoning can redirect users to malicious sites. DNS-based DDoS attacks are common.
*   **DHCP (Dynamic Host Configuration Protocol):** Automatically assigns IP addresses and other network configuration parameters to devices. **Security:** DHCP starvation (DoS) and rogue DHCP servers can disrupt network access or facilitate MiTM attacks.
*   **HTTP/S (Hypertext Transfer Protocol/Secure):** The foundation of data communication for the World Wide Web. HTTPS uses SSL/TLS for encryption and authentication. **Security:** HTTP is unencrypted and vulnerable to eavesdropping. HTTPS mitigates this but can still be vulnerable to weak ciphers, misconfigured certificates, or SSL stripping attacks.

## 4. IP Addressing, Subnetting & Network Segmentation

### IP Addressing

IPv4 addresses are 32-bit numbers, typically represented in dotted-decimal format (e.g., `192.168.1.1`). They are categorized into classes (A, B, C, D, E) and further differentiated by public (routable on the internet) and private (reserved for local networks) ranges.

*   **Private IP ranges:**
    *   `10.0.0.0` - `10.255.255.255`
    *   `172.16.0.0` - `172.31.255.255`
    *   `192.168.0.0` - `192.168.255.255`

### Subnetting

Subnetting divides a larger network into smaller, more manageable sub-networks (subnets). It improves network efficiency, reduces broadcast traffic, and enhances security by segmenting devices. Classless Inter-Domain Routing (CIDR) uses a `/` notation (e.g., `192.168.1.0/24`) to specify the network portion of an IP address.

**Example:** A `192.168.1.0/24` network means the first 24 bits define the network, and the remaining 8 bits are for hosts. This allows for 2^8 - 2 = 254 usable host addresses.

### Network Segmentation

This is the practice of dividing a network into smaller, isolated segments. It's a critical security control to limit the lateral movement of attackers within a compromised network. Techniques include VLANs, firewalls, and separate physical networks.

## 5. Packet Analysis with Wireshark

Wireshark is a powerful open-source packet analyzer that allows you to see what's happening on your network at a microscopic level. It's indispensable for troubleshooting, network development, and cybersecurity investigations.

*   **Capture Filters:** Apply filters before capturing to limit the amount of data saved (e.g., `host 192.168.1.10 and port 80`).
*   **Display Filters:** Apply filters after capturing to narrow down the view of captured packets (e.g., `tcp.port eq 80 and ip.addr eq 192.168.1.10`).
*   **Identifying Malicious Traffic:** Look for unusual protocol usage, high volumes of specific traffic types (e.g., ICMP floods), connections to suspicious external IPs, unencrypted credentials, or anomalous application behavior.

**Wireshark Display Filter Example:**
```
ip.addr == 192.168.1.10 && tcp.port == 22
```
*This filter shows all TCP traffic on port 22 (SSH) involving the IP address 192.168.1.10.*

## 6. Network Troubleshooting & Security Implications

Troubleshooting involves systematically identifying and resolving network issues. Many tools provide insights that are also critical for security assessments.

*   **`ping`:** Tests network connectivity and round-trip time using ICMP.
*   **`traceroute` / `tracert`:** Maps the path packets take to a destination, showing intermediate routers (hops).
*   **`ipconfig` / `ifconfig`:** Displays network interface configuration (IP address, subnet mask, gateway, DNS servers).
*   **`netstat`:** Shows active network connections, routing tables, and network interface statistics.

**Example: Analyzing `netstat` output for suspicious connections (Linux/macOS):**
```bash
netstat -tulnp | grep -E 'ESTABLISHED|LISTEN'
```
*This command lists all active TCP/UDP connections and listening ports, along with the associated process ID and name. Look for unknown processes listening on unusual ports or making suspicious outbound connections.* 

**Security Best Practices:** Regular monitoring of network traffic (e.g., with Wireshark or IDS/IPS), maintaining up-to-date firewall rules, implementing strong network segmentation, keeping devices patched, and using secure configurations are vital.

## Quick Checklist/Exercise:

1.  **OSI Model Application:** If an attacker attempts a SYN flood, which OSI layer is primarily targeted, and which TCP/IP layer does this correspond to?
2.  **Subnetting Calculation:** For a network `172.16.0.0/22`, how many usable host addresses are available, and what is the range of IP addresses for this subnet?
3.  **Wireshark Filter:** You suspect a device with IP `192.168.1.50` is attempting to access an unauthorized website over HTTP. Write a Wireshark display filter to capture only the HTTP traffic originating from or destined for this IP address, excluding any HTTPS traffic.
