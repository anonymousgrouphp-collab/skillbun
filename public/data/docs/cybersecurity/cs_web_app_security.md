# Web Application Security (OWASP Top 10 Deep Dive)

Welcome to this comprehensive study guide on Web Application Security, focusing on the OWASP Top 10 vulnerabilities. Understanding and mitigating these risks is crucial for any cybersecurity professional protecting web applications.

## 1. Introduction to OWASP Top 10

The Open Worldwide Application Security Project (OWASP) is a non-profit foundation that works to improve the security of software. The OWASP Top 10 is a standard awareness document for developers and web application security professionals. It represents a broad consensus about the most critical security risks to web applications.

Each vulnerability listed in the OWASP Top 10 (2021 edition) highlights a critical area where applications commonly fail to protect themselves against attacks.

## 2. Key OWASP Top 10 Vulnerabilities and Deep Dive

### A01:2021 - Broken Access Control

**Concept:** Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data, or performing a business function outside of the user's limits.

**Example:** An attacker modifies the `userID` parameter in a URL from `http://example.com/profile?userID=123` to `http://example.com/profile?userID=456` and can view another user's profile details without authentication.

**Mitigation:**
*   Implement strong access control mechanisms based on the principle of least privilege.
*   Deny all access by default, then grant specific roles/permissions.
*   Test access control thoroughly, including vertical and horizontal privilege escalation.

### A03:2021 - Injection (SQL Injection, Command Injection, NoSQL Injection)

**Concept:** Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization.

**SQL Injection (SQLi) Deep Dive:**
*   **Concept:** Inserting malicious SQL queries into input fields to manipulate database queries.
*   **Example:** A login form processes input directly:
    ```sql
    SELECT * FROM users WHERE username = '" + input_username + "' AND password = '" + input_password + "';
    ```
    An attacker enters `admin' OR '1'='1--` for the username. The resulting query becomes:
    ```sql
    SELECT * FROM users WHERE username = 'admin' OR '1'='1'--' AND password = 'password';
    ```
    The `--` comments out the rest of the query, allowing the attacker to bypass authentication.

*   **Mitigation:**
    *   Use **Parameterized Queries (Prepared Statements)**: Separate SQL code from user-supplied data.
    *   **Input Validation:** Sanitize and validate all user input.
    *   **Least Privilege:** Restrict database user permissions.

### Cross-Site Scripting (XSS)

**Concept:** XSS flaws allow attackers to inject client-side scripts into web pages viewed by other users. These scripts can steal session cookies, deface websites, or redirect users to malicious sites.

**Types:**
*   **Reflected XSS:** Malicious script is reflected off the web server to the user's browser.
    *   **Example:** `http://example.com/search?query=<script>alert('You are hacked!')</script>`
*   **Stored XSS:** Malicious script is permanently stored on the target servers (e.g., in a database) and served to users.
*   **DOM-based XSS:** Vulnerability arises in the client-side code rather than server-side.

**Mitigation:**
*   **Output Encoding:** Encode user-supplied data before rendering it in HTML, JavaScript, or URLs.
*   **Input Validation:** Filter out or escape dangerous characters from user input.
*   **Content Security Policy (CSP):** Implement CSP headers to restrict resources (scripts, styles) a browser is allowed to load.

### A05:2021 - Security Misconfiguration

**Concept:** Security misconfiguration is the most commonly seen issue. This can be anything from insecure default configurations, incomplete configurations, open cloud storage, misconfigured HTTP headers, verbose error messages containing sensitive information, or unpatched systems.

**Example:** An application server is deployed with default credentials (e.g., `admin/admin`), which are never changed. Or, directory listing is enabled on a production server, exposing sensitive files.

**Mitigation:**
*   **Hardening:** Implement a repeatable hardening process for all environments.
*   **Patch Management:** Promptly patch and upgrade all operating systems, applications, and libraries.
*   **Least Privilege:** Remove or disable unused features, components, documentation, and samples.
*   **Review:** Perform regular security configuration reviews.

### A07:2021 - Identification and Authentication Failures

**Concept:** Failures related to session management and authenticating user identities. This includes weak password policies, multi-factor authentication (MFA) not implemented or bypassed, weak session IDs, or exposure of session tokens.

**Example:** An application uses weak or predictable session IDs, making it easy for an attacker to guess a valid session token and hijack an active user session.

**Mitigation:**
*   Implement strong, multi-factor authentication (MFA).
*   Enforce strong password policies and regularly rotate credentials.
*   Use secure, random session IDs with appropriate expiration and invalidation.
*   Avoid exposing session IDs in URLs.

### A08:2021 - Software and Data Integrity Failures (Insecure Deserialization)

**Concept:** This new category focuses on issues related to software updates, critical data, and CI/CD pipelines without integrity verification. A key component of this is Insecure Deserialization.

**Insecure Deserialization Deep Dive:**
*   **Concept:** When untrusted or malicious data is used to reconstruct an object, it can lead to remote code execution, denial of service, or authentication bypass.
*   **Example:** An application deserializes user-supplied input without validation, allowing an attacker to inject specially crafted serialized objects that execute arbitrary code upon deserialization.
*   **Mitigation:**
    *   Avoid deserializing untrusted data entirely.
    *   Implement integrity checks (e.g., digital signatures) on serialized objects.
    *   Run deserialization code in isolated, low-privileged environments.

### A10:2021 - Server-Side Request Forgery (SSRF)

**Concept:** SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL. Attackers can abuse this to make the server generate requests to internal resources within the organization's network or to external systems, often bypassing firewalls.

**Example:** An application allows users to submit a URL for a PDF generation service. An attacker provides an internal IP address or a cloud metadata endpoint (`http://169.254.169.254/latest/meta-data/`) as the URL, causing the server to expose sensitive internal information.

**Mitigation:**
*   **Input Validation:** Validate and sanitize all user-supplied URLs.
*   **Whitelisting:** Create an explicit whitelist of allowed domains and protocols.
*   **Network Segmentation:** Use network segmentation to isolate systems.
*   **Disable Redirects:** Do not follow HTTP redirects programmatically.

## 3. Hands-on Practice with Burp Suite

Burp Suite is an essential tool for web application security testing. It functions as an intercepting proxy, allowing you to intercept, inspect, and modify all traffic between your browser and the web application. Key features include:
*   **Proxy:** Intercept and modify HTTP/S requests and responses.
*   **Intruder:** Automate customized attacks (e.g., brute-forcing, fuzzing).
*   **Repeater:** Manually modify and resend individual requests.
*   **Scanner:** Automatically discover various web vulnerabilities.

Using Burp Suite, you can practice identifying and exploiting the vulnerabilities discussed above by setting up a local test environment (e.g., OWASP Juice Shop, Damn Vulnerable Web Application - DVWA).

## 4. Quick Checklist / Exercise

To solidify your understanding, consider these exercises:

1.  **Identify SQLi Vulnerabilities:** Using Burp Suite's Repeater, try to bypass a login form on a deliberately vulnerable application using common SQL injection payloads (`' OR 1=1--`, `' OR 'a'='a`).
2.  **Exploit XSS:** Find an input field that reflects user input (e.g., search bar). Attempt to inject a basic XSS payload like `<script>alert(document.domain)</script>` to see if a popup appears.
3.  **Detect Broken Access Control:** On a test application, try to access administrative functions or other users' data by directly navigating to URLs or modifying request parameters after logging in as a standard user.
