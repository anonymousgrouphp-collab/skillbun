# Bug Bounty Hunting & Responsible Disclosure

This study guide delves into the dynamic world of bug bounty hunting, equipping you with the knowledge to identify vulnerabilities in live applications, navigate leading bug bounty platforms, adhere to ethical disclosure principles, and craft impactful reports.

## 1. Introduction to Bug Bounty Hunting

Bug bounty hunting is a cybersecurity program offered by many organizations to compensate ethical hackers for discovering and reporting software bugs and vulnerabilities. It's a proactive security measure that leverages the global hacking community to identify flaws before malicious actors can exploit them.

*   **For Organizations:** Enhances security posture, reduces attack surface, cost-effective vulnerability discovery.
*   **For Hackers:** Financial rewards, recognition, skill development, real-world experience.

## 2. Key Concepts in Bug Bounty

Before diving in, understanding these core concepts is crucial:

*   **Vulnerability Types:** Familiarize yourself with common web application vulnerabilities, often categorized by the OWASP Top 10 (e.g., Injection, Broken Authentication, Cross-Site Scripting (XSS), Insecure Deserialization, Security Misconfiguration).
*   **Scope & Rules of Engagement (RoE):** Every bug bounty program defines what is in scope (which assets/domains to test) and what is out of scope. It also outlines rules, such as acceptable testing methods, rate limits, and what constitutes a valid submission. Adhering strictly to the RoE is paramount to stay ethical and legal.
*   **Impact & Severity:** Vulnerabilities are typically rated based on their potential impact (e.g., data breach, denial of service, unauthorized access) and ease of exploitation. Common severity ratings include Critical, High, Medium, Low, and Informational.

## 3. Leading Bug Bounty Platforms

These platforms connect organizations with security researchers:

*   **HackerOne:** One of the largest platforms, known for its extensive range of programs and comprehensive tooling for both hackers and companies.
*   **Bugcrowd:** Another major player, offering a diverse set of programs and often emphasizing crowdsourced security testing.
*   **Intigriti:** A growing European platform gaining traction with a focus on quality and a good researcher experience.

These platforms provide a structured environment for reporting, communication, and reward distribution.

## 4. Strategies and Tools for Finding Bugs

Effective bug bounty hunting combines methodical strategies with powerful tools.

### Reconnaissance (Recon)

The initial phase focuses on gathering as much information about the target as possible.

*   **Passive Recon:** Gathering publicly available information without direct interaction (e.g., Shodan, Censys, WHOIS, Google Dorks).
*   **Active Recon:** Direct interaction with the target (e.g., port scanning with Nmap, subdomain enumeration with Subfinder, directory bruteforcing with Dirsearch).

### Common Tools

*   **Burp Suite (Community/Pro):** An essential tool for web penetration testing, acting as a proxy to intercept, inspect, and modify HTTP/S traffic. It includes features for scanning, fuzzing, and much more.
*   **Nmap:** A network scanner used for discovery and security auditing.
*   **Subfinder / Amass:** Tools for fast passive subdomain enumeration.
*   **Dirsearch / GoBuster:** For bruteforcing directories and files on web servers.
*   **Nuclei:** A fast and customizable vulnerability scanner based on simple YAML based templates.

### Methodologies

Follow structured methodologies like the **OWASP Web Security Testing Guide (WSTG)** to ensure comprehensive coverage during your testing.

## 5. Responsible Disclosure

Responsible disclosure is the ethical practice of submitting vulnerabilities to an organization privately, giving them a reasonable amount of time to fix the issue before any public disclosure.

*   **Principles:**
    *   **Private Notification:** Inform the vendor/organization directly and privately.
    *   **Timeliness:** Allow a reasonable period (e.g., 60-90 days) for remediation.
    *   **Non-Disclosure:** Do not disclose the vulnerability publicly until it's fixed or the agreed-upon timeframe expires.
    *   **No Exploitation:** Do not exploit the vulnerability beyond what is necessary to prove its existence.
*   **Why it's Crucial:** Protects users, prevents black hat exploitation, builds trust between researchers and organizations.
*   **Vulnerability Disclosure Programs (VDPs):** Many organizations have formal VDPs, even without a bounty, that outline how to report vulnerabilities responsibly.

## 6. Writing Effective Bug Bounty Reports

A clear, concise, and reproducible report is key to getting your bug accepted and rewarded.

### Essential Report Structure

```markdown
# Bug Report: [Vulnerability Type] in [Affected Component/Feature]

**Program:** [Name of Bug Bounty Program]
**Reporter:** [Your HackerOne/Bugcrowd Username]
**Date:** [Date of Submission]
**Severity:** [Critical/High/Medium/Low/Informational]
**CVSS v3.1 Score:** [Optional, but good practice if you can calculate it]

---

## 1. Summary

A brief, high-level description of the vulnerability, its impact, and the affected functionality.
*Example: An unauthenticated reflected Cross-Site Scripting (XSS) vulnerability exists on the search page, allowing an attacker to execute arbitrary JavaScript in the victim's browser.*

## 2. Steps to Reproduce

A detailed, step-by-step guide on how to trigger the vulnerability. Assume the reader has no prior knowledge.

1.  Navigate to `[URL of affected page]`.
2.  In the search bar, enter the following payload: `<script>alert('XSS')</script>`
3.  Click the "Search" button.
4.  Observe the alert box popping up.

## 3. Proof of Concept (PoC)

Provide any relevant evidence, such as:
*   Screenshot(s) showing the vulnerability.
*   Video recording demonstrating the exploit.
*   Raw HTTP request/response from Burp Suite.

```http
GET /search?q=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 ...
...
```

## 4. Expected Behavior

What should have happened?
*Example: The search input should have been properly sanitized/encoded, preventing the execution of JavaScript.*

## 5. Actual Behavior

What actually happened?
*Example: The JavaScript payload was executed, displaying an alert box.*

## 6. Impact

Explain the potential consequences of this vulnerability.
*Example: An attacker could steal session cookies, deface the website, redirect users to malicious sites, or perform actions on behalf of the victim (if XSS leads to CSRF).*

## 7. Remediation (Optional, but highly recommended)

Suggest how the organization can fix the vulnerability.
*Example: Implement robust input sanitization and output encoding for all user-supplied data displayed on the page. Consider using an OWASP-recommended XSS prevention library.*

---
```

## 7. Checklist / Exercise

1.  **Scenario Analysis:** You discover a critical SQL Injection vulnerability on an internal staging environment of a company that *does not* have a public bug bounty program or a VDP. What is your immediate next step, considering responsible disclosure principles?
2.  **Report Structure Recall:** List the five most critical sections that *must* be included in every bug bounty report for it to be actionable and understood by the development team.
3.  **Tool Identification:** Which commonly used tool would you utilize to intercept and modify HTTP requests when testing for web vulnerabilities like XSS or SQLi?
