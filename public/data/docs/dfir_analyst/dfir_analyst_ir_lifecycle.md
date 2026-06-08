# Incident Response Life Cycle & Frameworks

Incident Response (IR) is a structured approach to managing the aftermath of a security breach or cyberattack. Its primary goal is to minimize the impact of an incident, contain its spread, eradicate the root cause, and restore normal operations as quickly and efficiently as possible. Understanding the Incident Response Life Cycle and adhering to established frameworks are critical skills for any DFIR Analyst.

## The Incident Response Life Cycle

While specific terminology may vary slightly between frameworks, the core stages of incident response are universally recognized. We'll primarily refer to the six stages defined by the National Institute of Standards and Technology (NIST) in SP 800-61 Rev. 2, which are closely mirrored by the SANS Institute's approach.

### 1. Preparation
This foundational stage involves laying the groundwork *before* an incident occurs. Proactive measures are key to effective response.

*   **Policies and Procedures:** Develop comprehensive incident response policies, plans, and procedures.
*   **Incident Response Team (IRT):** Establish and train a dedicated team with clearly defined roles and responsibilities.
*   **Tools and Technology:** Implement and configure security tools (e.g., SIEM, EDR, network monitoring, vulnerability scanners) to detect and respond to incidents.
*   **Training and Awareness:** Conduct regular training for the IRT and general security awareness for all employees.
*   **Communication Plans:** Define communication channels and stakeholders (internal and external) for various incident types.
*   **Playbooks & Runbooks:** Develop detailed guides for specific incident scenarios.

### 2. Identification
This stage focuses on detecting and confirming a security incident.

*   **Detection:** Identify potential security incidents through various sources (e.g., SIEM alerts, IDS/IPS, user reports, antivirus software, threat intelligence).
*   **Analysis:** Analyze the detected events to determine if an actual incident has occurred. This involves correlating data, reviewing logs, and assessing the scope and nature of the activity.
*   **Prioritization:** Assign a severity level to the incident based on its potential impact on business operations, data confidentiality, integrity, and availability.
*   **Documentation:** Begin logging all observations, actions taken, and evidence collected.

### 3. Containment
Once an incident is confirmed, the goal is to limit the damage and prevent further spread.

*   **Short-Term Containment:** Isolate affected systems, segment networks, or disable compromised accounts to stop the immediate threat.
*   **Long-Term Containment:** Implement temporary solutions to allow systems to continue operating while full eradication is planned (e.g., patching a vulnerability, blocking malicious IP addresses at the perimeter).
*   **Evidence Preservation:** Ensure that critical evidence is preserved during containment actions for later analysis and legal purposes.

### 4. Eradication
This stage involves removing the root cause of the incident and any malicious artifacts.

*   **Malware Removal:** Delete malicious files, clean infected systems.
*   **Vulnerability Patching:** Address the vulnerabilities exploited by the attacker (e.g., apply security patches, reconfigure systems).
*   **Account Remediation:** Reset passwords for compromised accounts, remove unauthorized accounts.
*   **System Rebuilding:** Rebuild affected systems from trusted backups or golden images if contamination is widespread or uncertain.

### 5. Recovery
After eradication, the focus shifts to restoring affected systems and services to full operational status.

*   **System Restoration:** Restore systems and data from clean backups.
*   **Testing:** Thoroughly test restored systems and applications to ensure full functionality and security.
*   **Monitoring:** Continuously monitor recovered systems for any signs of re-infection or residual threats.
*   **Phased Rollout:** Bring systems back online in a controlled, phased manner to minimize risks.

### 6. Post-Incident Activity (Lessons Learned)
This crucial stage occurs after an incident has been resolved and aims to improve future incident response capabilities.

*   **Documentation:** Create a comprehensive incident report detailing the incident timeline, actions taken, evidence, and impact.
*   **Lessons Learned Meeting:** Conduct a post-mortem review with all involved parties to analyze what went well, what could be improved, and identify systemic issues.
*   **Policy & Procedure Updates:** Update incident response plans, policies, and playbooks based on lessons learned.
*   **Technical Improvements:** Implement technical controls or configurations to prevent similar incidents in the future.
*   **Training Enhancements:** Revise training programs to address identified gaps.

## Incident Response Frameworks

### NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide
This is the most widely adopted framework, providing a detailed guide for establishing and operating an incident response capability. It outlines the six stages discussed above and offers practical advice for each. Its comprehensive nature makes it a cornerstone for IR planning.

### SANS Incident Handler's Handbook
The SANS Institute's approach to incident handling is highly practical and hands-on, often breaking down the NIST stages into more granular, actionable steps. While the stages are conceptually similar, SANS emphasizes the practical aspects of forensics, evidence collection, and analysis during the identification and containment phases.

### Other Frameworks
*   **ISO/IEC 27035:** Information security incident management.
*   **PCI DSS (Payment Card Industry Data Security Standard):** Includes specific requirements for incident response within environments handling cardholder data.

## Playbooks and Runbooks

These are essential tools for structured incident management:

*   **Playbook:** A high-level, strategic guide for responding to a specific type of incident (e.g., a 