# Networking & Operating System Basics for AppSec

Understanding the fundamentals of networking and operating systems is crucial for any Application Security Engineer. This guide covers core concepts essential for identifying application attack vectors and securing deployment environments.

## 1. Networking Fundamentals

Applications don't exist in a vacuum; they communicate over networks. A solid grasp of how networks function is vital for understanding how applications can be exploited and protected.

### 1.1. The TCP/IP Model

The TCP/IP model is a conceptual framework for understanding network communication. While it has four layers, AppSec often focuses on:

*   **Application Layer:** Where applications (like web browsers, email clients) communicate using protocols like HTTP, HTTPS, DNS, FTP, SSH. This is the layer where most application-level attacks occur.
*   **Transport Layer:** Handles reliable (TCP) or unreliable (UDP) data transfer between processes on different hosts. Ports are crucial here for identifying services.
*   **Internet Layer:** Deals with logical addressing (IP addresses) and routing of data packets across networks.
*   **Network Access Layer:** Handles physical network technologies like Ethernet, Wi-Fi.

### 1.2. Common Network Protocols (and their AppSec relevance)

*   **HTTP/HTTPS:**
    *   **HTTP (Hypertext Transfer Protocol):** Unencrypted, transmits data in plain text. Vulnerable to eavesdropping and man-in-the-middle attacks.
    *   **HTTPS (HTTP Secure):** Encrypted version using TLS/SSL. Protects data confidentiality and integrity. AppSec ensures proper TLS configuration, strong ciphers, and valid certificates.
*   **DNS (Domain Name System):** Translates human-readable domain names into IP addresses. Vulnerable to DNS spoofing, cache poisoning.
*   **SSH (Secure Shell):** Encrypted protocol for remote command-line access. Securing SSH access is critical (strong passwords/keys, disabling root login).
*   **FTP (File Transfer Protocol):** Often unencrypted, used for file transfer. Secure alternatives like SFTP (SSH File Transfer Protocol) or FTPS (FTP over SSL/TLS) should be preferred.

### 1.3. Firewalls

Firewalls act as a barrier between trusted and untrusted networks, controlling incoming and outgoing network traffic based on predefined security rules.

*   **Network Firewalls:** Operate at network/transport layers, filtering traffic based on IP addresses, ports, and protocols.
*   **Web Application Firewalls (WAFs):** Operate at the application layer, inspecting HTTP/HTTPS traffic for common web application attacks (e.g., SQL injection, XSS, CSRF).
*   **Stateful vs. Stateless:** Stateful firewalls track the state of active connections, allowing legitimate responses back. Stateless firewalls filter each packet independently.

**Example: Basic `iptables` rule to allow SSH and HTTP**
```bash
# Allow incoming SSH (port 22)
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
sudo iptables -A OUTPUT -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT

# Allow incoming HTTP (port 80)
sudo iptables -A INPUT -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT
sudo iptables -A OUTPUT -p tcp --sport 80 -m state --state ESTABLISHED -j ACCEPT

# Drop all other incoming traffic
sudo iptables -P INPUT DROP
```

### 1.4. Proxies

Proxies act as intermediaries for requests from clients seeking resources from other servers.

*   **Forward Proxy:** Sits between a client and the internet, forwarding client requests to external servers. Used for anonymization, content filtering, caching.
*   **Reverse Proxy:** Sits in front of one or more web servers, forwarding client requests to those servers. Used for load balancing, SSL termination, caching, and WAF integration. Often the first line of defense for web applications.

## 2. Operating System Security Fundamentals

Operating systems provide the environment for applications. Securing the underlying OS is foundational to application security.

### 2.1. User Management and Least Privilege

*   **Users and Groups:** OSes manage access via user accounts and groups. Users are assigned to groups, inheriting their permissions.
*   **Principle of Least Privilege (PoLP):** Users, applications, and processes should only be granted the minimum necessary permissions to perform their specific tasks. This limits the damage an attacker can do if an account or process is compromised.
*   **`sudo` (Superuser Do):** Allows authorized users to run commands as root or another user, providing granular control over administrative tasks without sharing the root password.

### 2.2. File and Directory Permissions

Permissions control who can read, write, or execute files and directories. Incorrect permissions are a common source of vulnerabilities.

*   **Linux/Unix Permissions:**
    *   `r` (read), `w` (write), `x` (execute)
    *   Permissions are set for three categories: `user` (owner), `group`, `others`.
    *   Represented as octal numbers (e.g., `755`, `644`).
        *   `4` = read
        *   `2` = write
        *   `1` = execute
        *   `7` = read, write, execute (4+2+1)

**Example: `chmod` and `chown`**
```bash
# Set permissions for 'myscript.sh' to owner: rwx, group: rx, others: rx
chmod 755 myscript.sh

# Set permissions for 'config.ini' to owner: rw, group: r, others: no access
chmod 640 config.ini

# Change owner of 'myscript.sh' to 'appuser' and group to 'appgroup'
sudo chown appuser:appgroup myscript.sh
```

### 2.3. Process Isolation

Isolating application processes prevents a compromise in one application from affecting others or the entire system.

*   **Sandboxing:** Running a program in a restricted environment to limit its access to system resources.
*   **Containers (e.g., Docker, Kubernetes):** Provide lightweight, isolated environments for applications and their dependencies. Each container has its own filesystem, process space, and network interface, offering strong isolation. While not a full VM, they significantly enhance process isolation compared to running applications directly on the host.
*   **Virtual Machines (VMs):** Provide complete hardware virtualization, offering the strongest isolation but with higher overhead.

### 2.4. Services and Daemons

Applications often run as background services or daemons. It's critical that these services run with the minimum necessary privileges and are properly secured.

*   Avoid running services as `root`.
*   Ensure services only listen on necessary network interfaces (e.g., `127.0.0.1` for local services).
*   Regularly patch and update OS and service software.

## Quick Understanding Checklist/Exercise

1.  An attacker successfully exploits a web application vulnerability and gains unauthorized access. Which networking layer is most directly involved in this initial attack?
2.  Your application stores sensitive configuration files. What Linux file permission (e.g., `755`, `644`, `600`) would you recommend for these files if only the application owner should be able to read and write them, and no one else?
3.  Explain how a Web Application Firewall (WAF) differs from a traditional network firewall in terms of its operational layer and types of threats it addresses.