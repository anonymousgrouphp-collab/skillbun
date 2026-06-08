# Windows OS Fundamentals & Security Study Guide

This guide provides a comprehensive overview of Windows operating system fundamentals and critical security aspects essential for any cybersecurity specialist. Understanding Windows is paramount, as it remains the dominant OS in enterprise environments.

## 1. Windows Architecture & File Systems

Windows is a complex operating system with a layered architecture. Key components include the Kernel (managing core functions), Hardware Abstraction Layer (HAL), Executive (core services), and various subsystems.

### NTFS (New Technology File System)
NTFS is the primary file system for Windows, offering robust security, performance, and reliability features:
*   **Security:** Access Control Lists (ACLs) for files and folders.
*   **Journaling:** Tracks changes to ensure data integrity and recoverability.
*   **Compression & Encryption:** Built-in capabilities for data management.
*   **Disk Quotas:** Limits storage space for users.

### NTFS Permissions
NTFS permissions control access to files and folders. They are applied at the file system level and take precedence over shared folder permissions when accessing locally or remotely.

**Basic Permissions:**
*   **Read:** View file contents, folder contents, and attributes.
*   **Write:** Create files, modify attributes.
*   **Execute:** Run executable files.
*   **Modify:** Read, Write, Delete, and Execute. Full control minus changing permissions or taking ownership.
*   **Full Control:** Complete access, including changing permissions and taking ownership.

**Effective Permissions:** The combination of explicitly assigned permissions, inherited permissions, and group memberships determines a user's *effective permissions*. Deny permissions always override Allow permissions.

## 2. User & Privilege Management

Windows manages user accounts and groups to control access to resources.

### Local vs. Domain Accounts
*   **Local Accounts:** Stored on the local machine's Security Account Manager (SAM) database, used for local access.
*   **Domain Accounts:** Stored in Active Directory, used for accessing resources across a domain.

### Built-in Security Groups
Windows includes several predefined groups with specific privileges:
*   **Administrators:** Full control over the local computer.
*   **Users:** Standard user privileges.
*   **Guests:** Limited, temporary access.
*   **Backup Operators:** Can back up and restore files, regardless of permissions.
*   **Network Configuration Operators:** Can manage network configuration.

### User Account Control (UAC)
UAC is a security feature that helps prevent unauthorized changes to the operating system. Even administrators run with standard user privileges by default; elevated permissions require explicit approval (consent prompt).

## 3. Active Directory (AD) Fundamentals

Active Directory is Microsoft's directory service for Windows domain networks. It stores information about users, computers, and other network resources and provides authentication and authorization services.

*   **Domain:** A logical group of network objects (users, computers, devices) that share a common database and security policies. It's the core unit of AD.
*   **Domain Controller (DC):** A server running AD Domain Services that authenticates users and computers, stores directory data, and enforces security policies.
*   **Forest:** The top-level logical structure in AD, consisting of one or more domains that share a common schema, configuration, and global catalog.
*   **Trust:** A security relationship between two domains or forests that allows users in one domain to access resources in another.
*   **Organizational Unit (OU):** A container within a domain used to organize objects (users, groups, computers) and apply Group Policy.

## 4. Group Policy Objects (GPOs)

GPOs are powerful tools for managing and configuring operating systems, applications, and users' settings in an Active Directory environment. They allow centralized enforcement of security policies.

**GPO Application Order (LSDOU):**
1.  **Local:** Applied to the local computer.
2.  **Site:** Applied to all computers/users within a specific AD site.
3.  **Domain:** Applied to all computers/users within a specific domain.
4.  **OU:** Applied to objects within a specific Organizational Unit.

*Policies applied later in this order override those applied earlier.* `Enforced` (No Override) links prevent lower-level GPOs from overriding settings, and `Block Inheritance` prevents GPOs from parent containers from applying.

**Common Security Configurations via GPOs:**
*   Password Policy (complexity, length, age, history).
*   Account Lockout Policy (threshold, duration, reset time).
*   Windows Firewall rules.
*   Software restriction policies.
*   Auditing policies.

## 5. Event Viewer for Security Analysis

The Event Viewer is a Microsoft Management Console (MMC) snap-in that allows users to browse and manage event logs. It's crucial for monitoring system health, troubleshooting, and detecting security incidents.

**Key Event Logs:**
*   **Application:** Events logged by applications.
*   **Security:** Events related to security (logon/logoff, object access, privilege use).
*   **System:** Events logged by Windows system components.
*   **Setup:** Events during Windows installation or upgrades.

**Important Security Event IDs (Examples):**
*   **4624:** An account was successfully logged on.
*   **4625:** An account failed to log on.
*   **4648:** A logon was attempted using explicit credentials.
*   **4720:** A user account was created.
*   **4732:** A member was added to a security-enabled local group.

Security analysts use filtering and custom views in Event Viewer to pinpoint suspicious activities among thousands of logs.

## 6. PowerShell for Administration & Automation

PowerShell is a powerful command-line shell and scripting language built on the .NET framework. It's essential for automating administrative tasks, managing system configurations, and conducting incident response on Windows systems.

**Security Relevance:**
*   Automating security audits (e.g., checking user permissions, service configurations).
*   Managing firewalls and security policies.
*   Collecting forensic data.
*   Detecting and responding to threats (e.g., stopping suspicious processes).

### Simple PowerShell Example: Inspecting Security Events
```powershell
# Get the 10 most recent security events from the Security log
Get-WinEvent -LogName Security -MaxEvents 10

# Filter for failed login attempts (Event ID 4625)
Get-WinEvent -LogName Security -FilterXPath '*/System/EventID=4625' | Format-List -Property TimeCreated, Id, LevelDisplayName, Message
```

## 7. Common Windows Security Hardening Measures

Hardening a Windows system involves reducing its attack surface and implementing controls to prevent exploitation.

*   **Regular Updates & Patching:** Apply security updates promptly to fix known vulnerabilities.
*   **Strong Password Policies:** Enforce complex, unique passwords and regular changes.
*   **Least Privilege Principle:** Grant users and services only the minimum necessary permissions.
*   **Windows Defender Firewall:** Configure rules to restrict network access and traffic.
*   **Disable Unnecessary Services:** Turn off services not required for the system's function.
*   **Antivirus/Antimalware Solutions:** Install and maintain up-to-date endpoint protection.
*   **Endpoint Detection and Response (EDR):** Deploy EDR solutions for advanced threat detection and response.
*   **Audit Logging:** Enable comprehensive logging for critical security events.
*   **Remove Unnecessary Software:** Uninstall applications that are not essential.

## Checklist/Exercise:

1.  **NTFS Permissions:** A user has `Read` permission on a folder and `Deny Write` permission on a specific file within that folder. What are the user's effective permissions for that file, and why?
2.  **GPO Application:** You have a GPO at the domain level enforcing a password policy and another GPO at an OU level that attempts to override the password complexity. If the domain GPO link is marked as "Enforced," which policy will apply?
3.  **Event Viewer:** What is the primary Event ID you would look for to detect a successful user logon, and in which log would you typically find it?
