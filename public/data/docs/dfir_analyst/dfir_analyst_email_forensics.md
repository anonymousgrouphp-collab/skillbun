# Email Forensics: A DFIR Study Guide

Email forensics is a critical discipline within Digital Forensics and Incident Response (DFIR) that involves the scientific examination of email communications. Its primary goal is to uncover evidence related to cyber incidents, identify threat actors, and understand the scope and impact of attacks.

## 1. Introduction to Email Forensics

Email remains a primary vector for cyberattacks, making its analysis indispensable for DFIR analysts. Common scenarios requiring email forensics include:

*   **Phishing Attempts:** Identifying and mitigating credential theft or malware delivery via deceptive emails.
*   **Business Email Compromise (BEC):** Investigating fraudulent financial requests or data exfiltration attempts.
*   **Malware Delivery:** Tracing the origin and characteristics of malware distributed through attachments or links.
*   **Insider Threats:** Detecting unauthorized data exfiltration or policy violations by internal personnel.
*   **Legal & Compliance:** Providing evidence for legal proceedings or regulatory compliance audits.

## 2. Understanding Email Protocols

To perform effective email forensics, understanding the underlying protocols is crucial:

*   **SMTP (Simple Mail Transfer Protocol):** Used for sending emails between mail servers. It primarily handles the mail transfer agent (MTA) communication. Forensic analysis often involves examining SMTP logs for sender IP, recipient, and timestamps.
*   **POP3 (Post Office Protocol version 3):** Used by email clients to retrieve emails from a mail server. By default, POP3 often downloads emails to the local client and deletes them from the server. This can make server-side forensics challenging if not configured to leave a copy.
*   **IMAP (Internet Message Access Protocol):** Also used by email clients to retrieve emails, but IMAP keeps emails on the server by default. This allows for synchronization across multiple devices and provides a more centralized repository for forensic acquisition.

**Forensic Impact:** IMAP generally provides richer server-side forensic artifacts than POP3, as emails and folder structures are retained on the server.

## 3. Email Structure for Forensics

An email is composed of several key components, each offering forensic value:

*   **Headers:** Metadata prepended to the email message, providing a chronological record of servers the email traversed, sender/recipient information, authentication results, and more. This is often the most critical part for tracing an email's origin.
*   **Body Content:** The main text or HTML content of the email. It may contain suspicious links, social engineering lures, or encoded malicious payloads.
*   **Attachments:** Files appended to the email. These can be documents, executables, archives, or other file types, often used to deliver malware or sensitive information.
*   **Links (URLs):** Embedded hyperlinks within the email body. These can lead to phishing sites, malware downloads, or command-and-control (C2) servers.

## 4. Key Techniques for Email Analysis

### 4.1. Header Analysis

Email headers contain a wealth of information crucial for forensic investigations. Key fields include:

*   `Received`: Each `Received` header entry represents a server that processed the email. Read them from bottom-up (oldest to newest) to trace the email's path from origin to destination.
*   `From`, `To`, `Subject`: Basic sender, recipient, and topic information. Note that the `From` header can be easily spoofed.
*   `Message-ID`: A unique identifier for the email, useful for tracking across mail systems.
*   `X-Mailer`, `User-Agent`: May indicate the email client or software used by the sender.
*   `Authentication-Results`: Shows the results of SPF, DKIM, and DMARC checks, vital for identifying spoofed emails.
*   **IP Addresses:** Extract IP addresses from `Received` headers to identify the sending host, intermediate mail servers, and potentially the originating sender's public IP.

### 4.2. Body and Link Analysis

*   **Keyword Search:** Look for common phishing phrases (e.g., 