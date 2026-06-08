# Virtualization & Security Lab Setup

This guide will walk you through establishing a secure and isolated environment for practical cybersecurity exercises. Understanding virtualization and basic containerization is crucial for safely experimenting with attacks, defenses, and malware analysis without impacting your host system.

## 1. Introduction to Virtualization and Containerization

### Virtualization
Virtualization involves creating a virtual version of a physical resource, such as a server, operating system, storage device, or network resource. In our context, it means running multiple operating systems (Guest OS) on a single physical machine (Host OS) using a piece of software called a **hypervisor**.

**Key Benefits for Security Labs:**
*   **Isolation:** Each VM runs in its own isolated environment, preventing security incidents within the lab from affecting your host system.
*   **Snapshots:** You can save the state of a VM at any point, allowing you to revert to a clean state after performing potentially destructive actions.
*   **Safe Testing:** Provides a sandboxed environment to experiment with malware, exploits, and various security tools without risk.
*   **Resource Allocation:** Dynamically allocate CPU, RAM, and storage to different VMs as needed.

### Containerization (Docker)
Containerization, exemplified by Docker, provides a more lightweight form of virtualization. Instead of virtualizing the entire operating system, containers virtualize the application layer. They share the host system's OS kernel but isolate applications and their dependencies into separate packages.

**Why for Security Labs?**
*   **Lightweight & Fast:** Containers start up much faster than VMs and use fewer resources.
*   **Portability:** Applications packaged in containers can run consistently across any environment that supports Docker.
*   **Quick Deployment:** Ideal for rapidly deploying vulnerable web applications (like DVWA) or specific security tools without setting up an entire OS.
*   **Easy Cleanup:** Containers can be easily created, stopped, and removed without leaving residual files.

## 2. Understanding Virtualization Technologies (Hypervisors)

Hypervisors are the software layer that enables virtualization.

*   **Type 2 (Hosted) Hypervisors:** These run as an application on top of an existing host operating system. They are generally easier to set up and are ideal for personal use and security labs.
    *   **VMware Workstation Player/Pro:** A powerful, feature-rich hypervisor. Player is free for personal use, Pro is paid. Known for stability and performance.
    *   **Oracle VirtualBox:** Free, open-source, and cross-platform. Excellent choice for beginners due to its ease of use and broad compatibility.
*   **Type 1 (Bare-metal) Hypervisors:** These run directly on the host hardware, without an underlying operating system. They offer better performance and security but are more complex to manage and typically require a dedicated machine.
    *   **Microsoft Hyper-V:** Built into Windows 10/11 Pro/Enterprise editions. A good option if you are working primarily within a Windows ecosystem.

**Recommendation:** For a personal security lab, **VirtualBox** or **VMware Workstation Player** are highly recommended due to their ease of use and cost-effectiveness.

## 3. Basic Containerization with Docker

Docker is a platform designed to make it easier to create, deploy, and run applications by using containers.

**Core Docker Concepts:**
*   **Image:** A lightweight, standalone, executable package that includes everything needed to run a piece of software, including the code, a runtime, libraries, environment variables, and config files.
*   **Container:** A runnable instance of an image. You can create, start, stop, move, or delete a container.
*   **Dockerfile:** A text file that contains instructions for Docker to build an image.
*   **Docker Hub:** A cloud-based registry service for sharing and finding Docker images.

**Why use Docker in a Security Lab?**
*   Quickly spin up vulnerable web applications (e.g., OWASP Juice Shop, DVWA).
*   Experiment with specific security tools or versions without cluttering your main OS.
*   Isolate potentially dangerous tools or applications.

## 4. Setting Up Your Secure Virtual Lab

### Host System Requirements
*   **RAM:** 8GB minimum, 16GB+ recommended for running multiple VMs smoothly.
*   **CPU:** Modern multi-core CPU with virtualization extensions enabled (Intel VT-x or AMD-V).
*   **Storage:** 100GB+ free space, SSD highly recommended for better VM performance.

### Hypervisor Installation
1.  **Download:** Get the installer for your chosen hypervisor (e.g., VirtualBox from `virtualbox.org` or VMware Workstation Player from `vmware.com`).
2.  **Install:** Follow the on-screen instructions. For VirtualBox, ensure you also install the **VirtualBox Extension Pack** (download separately from the VirtualBox website) to enable features like USB 2.0/3.0 support and RDP.

### Network Configuration for VMs
Proper network setup is critical for isolating your lab and controlling communication.

*   **NAT (Network Address Translation):**
    *   **Description:** VMs share the host's IP address and can access external networks (internet). They are isolated from your host's local network (LAN).
    *   **Use Case:** Providing internet access to your attacking VM (e.g., Kali Linux) while keeping it isolated from your home network.
*   **Host-Only Adapter:**
    *   **Description:** Creates a private network between VMs and the host machine. VMs on this network can communicate with each other and the host, but cannot access external networks.
    *   **Use Case:** Ideal for an isolated lab where your attacking VM communicates directly with a vulnerable VM, without any external exposure.
*   **Internal Network (VirtualBox) / Custom VMnet (VMware):**
    *   **Description:** Creates a completely isolated network where VMs can only communicate with other VMs on the same internal network. No access to the host or external networks.
    *   **Use Case:** Maximum isolation for sensitive experiments or malware analysis.
*   **Bridged Adapter:**
    *   **Description:** VMs connect directly to your physical network, obtaining an IP address from your router. They appear as separate devices on your LAN.
    *   **Use Case:** Rarely recommended for security labs due to lack of isolation. Use with extreme caution.

**Recommended Lab Network Setup:** Combine NAT for internet access on your attacking machine and Host-Only/Internal Network for communication between attacking and vulnerable VMs.

### Security Best Practices for Your Lab
*   **Snapshots:** Take snapshots of your VMs (especially vulnerable ones) before making significant changes or running exploits. This allows for quick reversion to a clean state.
*   **Network Isolation:** Always prioritize Host-Only or Internal networks for sensitive interactions within your lab.
*   **Resource Allocation:** Allocate sufficient, but not excessive, CPU and RAM to VMs. Over-allocating can starve your host machine.
*   **Updates:** Keep your host OS and hypervisor software up-to-date.
*   **Separate Storage:** Consider using a dedicated external SSD for your VM files.

## 5. Installing Security-Focused Operating Systems

### Kali Linux
*   **Purpose:** A Debian-based Linux distribution pre-loaded with hundreds of penetration testing, ethical hacking, and digital forensics tools.
*   **Installation Steps (VMware/VirtualBox):**
    1.  **Download:** Obtain the Kali Linux VM image (OVA/VDI) or ISO from `kali.org`. Using a pre-built VM image (.ova for VirtualBox/VMware) is often the easiest.
    2.  **Import/Create VM:** If using an OVA, simply import it into your hypervisor. If using an ISO, create a new VM, select Linux as the OS type, and point the virtual CD/DVD drive to the Kali ISO.
    3.  **Basic Setup:** Follow the on-screen installation prompts. Choose typical options for disk partitioning and user setup.
    4.  **Install Guest Additions/Open VM Tools:** After installation, install `open-vm-tools` (for VMware) or VirtualBox Guest Additions to improve VM performance, enable features like clipboard sharing, and automatic screen resizing.
        ```bash
sudo apt update
sudo apt install -y open-vm-tools-desktop # For VMware
sudo apt install -y virtualbox-guest-x11 # For VirtualBox
```

### Parrot OS
*   **Purpose:** Another Debian-based distribution focusing on security, privacy, and development. Often considered lighter and more user-friendly than Kali for some tasks.
*   **Installation:** The process is very similar to Kali Linux. Download the ISO or VM image from `parrotsec.org` and follow the same VM creation/import and installation steps.

## 6. Deploying Vulnerable Machines for Practice

These are intentionally insecure systems or applications designed for ethical hacking practice.

### Metasploitable 2/3
*   **Purpose:** A Linux-based VM specifically designed to be vulnerable. It contains numerous intentionally exploitable services (FTP, SSH, Samba, Web applications like DVWA, Mutillidae, phpMyAdmin, etc.).
*   **Deployment:**
    1.  **Download:** Get the Metasploitable 2 (or 3) VM image (usually a `.vmdk` or `.ova` file) from `sourceforge.net/projects/metasploitable/`.
    2.  **Import:** Import the OVA into your hypervisor or create a new VM and attach the `.vmdk` as an existing virtual disk.
    3.  **Network Configuration:** Crucially, set its network adapter to the same **Host-Only** or **Internal Network** that your Kali Linux VM is on. This ensures your attacking VM can communicate with Metasploitable without exposing it to your main network.
    4.  **Identify IP:** Boot Metasploitable. Log in (username `msfadmin`, password `msfadmin`). Use `ifconfig` to find its IP address within your isolated lab network. You should then be able to ping this IP from your Kali Linux VM.

### Damn Vulnerable Web Application (DVWA)
*   **Purpose:** A PHP/MySQL web application that is highly vulnerable to common web attacks (SQL Injection, XSS, CSRF, File Inclusion, etc.). Excellent for practicing web application penetration testing.
*   **Deployment Options:**
    1.  **On a dedicated Linux VM:** Install Apache, MySQL, PHP (LAMP stack) on a lightweight Linux VM (e.g., Ubuntu Server), then download/clone DVWA into the web server's document root.
    2.  **Using Docker (Recommended for ease):** This is the quickest and cleanest way to get DVWA running.

### Other Vulnerable Resources:
*   **OWASP Broken Web Applications Project (BWA):** A collection of vulnerable web applications provided as a single VM.
*   **VulnHub:** A repository of pre-built vulnerable VMs designed for practice.
*   **Hack The Box / TryHackMe:** Online platforms offering a vast array of vulnerable machines (CTF-style) and guided labs.

## 7. Configuration Example: Setting up DVWA with Docker

This example demonstrates how to quickly deploy DVWA using Docker, assuming Docker is installed on your host machine or a dedicated Linux VM.

```bash
# 1. Ensure Docker is installed (Docker Desktop for Windows/macOS, Docker Engine for Linux).
#    (Refer to Docker's official documentation for installation: https://docs.docker.com/get-docker/)

# 2. Pull the DVWA Docker image from Docker Hub (optional, 'docker run' will pull it if not present)
docker pull vulnerables/web-dvwa

# 3. Run the DVWA container
#    -p 80:80 maps the container's port 80 to the host's port 80.
#    --rm ensures the container is removed automatically when it exits.
#    -it runs the container in interactive mode with a pseudo-TTY.
docker run --rm -it -p 80:80 vulnerables/web-dvwa

# 4. Access DVWA
#    Open a web browser on the machine where Docker is running (or a VM that can reach it).
#    Navigate to http://localhost (or the IP address of the VM running Docker).
#    Default credentials: username `admin`, password `password`.
```

## **Checklist/Exercise:**

1.  Successfully install and configure either VirtualBox or VMware Workstation Player on your host operating system.
2.  Create a new virtual machine, install Kali Linux (or Parrot OS) into it, and configure its network adapter to 