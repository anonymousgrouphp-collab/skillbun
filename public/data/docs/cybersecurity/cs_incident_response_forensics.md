# Incident Response & Digital Forensics Basics Study Guide

Welcome to the foundational study guide for Incident Response (IR) and Digital Forensics (DF). In the ever-evolving landscape of cyber threats, the ability to effectively respond to security incidents and investigate digital evidence is paramount for any cybersecurity specialist.

## 1. Mastering the NIST Incident Response Lifecycle

The National Institute of Standards and Technology (NIST) provides a widely adopted framework for managing cybersecurity incidents. The NIST Special Publication 800-61, "Computer Security Incident Handling Guide," outlines a structured approach to incident response, divided into six phases:

### 1.1. Preparation
This phase focuses on establishing a robust foundation *before* an incident occurs. Key activities include:
*   **Policy Development:** Creating comprehensive incident response policies and procedures.
*   **Team Formation:** Building and training an Incident Response Team (IRT).
*   **Tooling:** Implementing necessary tools (e.g., SIEM, EDR, forensic workstations).
*   **Communication Plans:** Defining internal and external communication strategies.
*   **Documentation:** Maintaining up-to-date documentation for systems, networks, and incident playbooks.
*   **Training & Awareness:** Conducting regular security awareness training for all staff.

### 1.2. Detection & Analysis
This phase involves identifying and thoroughly understanding the nature of a security incident. Activities include:
*   **Monitoring:** Continuous monitoring of network traffic, logs, and system events.
*   **Alert Triage:** Prioritizing and investigating security alerts.
*   **Incident Confirmation:** Verifying if an event is indeed a security incident.
*   **Scope Assessment:** Determining the affected systems, data, and potential impact.
*   **Documentation:** Recording all observations, findings, and actions taken.
*   **Indicators of Compromise (IOCs):** Identifying unique indicators that can help detect similar future incidents.

### 1.3. Containment
Once an incident is detected and analyzed, the primary goal is to prevent further damage and limit the scope of the compromise. This phase involves:
*   **Short-term Containment:** Taking immediate actions like isolating affected systems or blocking malicious IPs.
*   **Long-term Containment:** Implementing temporary fixes to ensure business continuity while planning for full remediation.
*   **Evidence Preservation:** Ensuring that evidence is not destroyed or altered during containment efforts.
*   **Strategy Formulation:** Developing a containment strategy based on the type of incident.

### 1.4. Eradication
This phase focuses on removing the root cause of the incident and eliminating any remaining malicious components from the environment. Activities include:
*   **Malware Removal:** Deleting malicious files and processes.
*   **Vulnerability Patching:** Fixing the security flaws that were exploited.
*   **System Rebuilding:** Rebuilding compromised systems from trusted backups or golden images.
*   **Account Remediation:** Changing compromised credentials and removing unauthorized accounts.

### 1.5. Recovery
After eradication, the goal is to restore affected systems and services to full operation and ensure they are secure. This involves:
*   **System Restoration:** Bringing systems back online after eradication.
*   **Verification:** Thoroughly testing systems to ensure they are fully functional and secure.
*   **Monitoring:** Enhanced monitoring to detect any recurrence or lingering threats.
*   **Business Continuity:** Restoring critical business functions.

### 1.6. Post-Incident Activity (Lessons Learned)
This crucial final phase involves reviewing the entire incident response process to identify areas for improvement. Key activities include:
*   **Lessons Learned Meeting:** Conducting a formal review with all stakeholders.
*   **Reporting:** Creating a detailed incident report.
*   **Process Improvement:** Updating policies, procedures, and playbooks based on lessons learned.
*   **Tool/Technology Review:** Evaluating the effectiveness of security tools.
*   **Training Updates:** Modifying training programs based on new insights.

## 2. Introduction to Digital Forensics

Digital forensics is the process of identifying, preserving, analyzing, and presenting digital evidence in a legally admissible manner. Its primary goal is to investigate cybercrimes, security incidents, and other legal matters involving digital information.

Key principles include:
*   **Integrity:** Ensuring the evidence remains unaltered.
*   **Authenticity:** Verifying the origin and legitimacy of the evidence.
*   **Admissibility:** Presenting evidence that meets legal standards.
*   **Reproducibility:** Ensuring the analysis process can be replicated by others.

## 3. Chain of Custody

The chain of custody is a critical documented process that shows the chronological order of evidence handling, from collection to analysis and presentation. It ensures the integrity and authenticity of evidence for legal proceedings.

Key elements to document for each piece of evidence:
*   **Who:** The identity of each person who handled the evidence.
*   **What:** A detailed description of the evidence.
*   **When:** The dates and times of evidence collection, transfer, and analysis.
*   **Where:** The location from which the evidence was collected and where it was stored.
*   **Why:** The purpose of collecting and handling the evidence.
*   **How:** The methods and tools used for collection and handling.

## 4. Evidence Collection

Collecting digital evidence must be performed carefully to maintain its integrity and prevent contamination. The principle of **volatility** is key: collect the most volatile data (e.g., RAM contents, active network connections) before less volatile data (e.g., hard drive contents).

General steps:
1.  **Preparation:** Ensure forensic tools, storage, and documentation are ready.
2.  **Identification:** Identify all potential sources of digital evidence.
3.  **Preservation:** Create forensic images (bit-for-bit copies) of storage devices.
4.  **Documentation:** Record every step taken, including timestamps, tools used, and hash values.
5.  **Transportation:** Securely transport evidence to a forensic lab.
6.  **Storage:** Store evidence in a secure, tamper-proof environment.

## 5. Basic Forensic Tools: Autopsy & FTK Imager

These tools are fundamental for digital forensics practitioners:

*   **Autopsy:** A leading open-source digital forensics platform. It's a graphical interface to The Sleuth Kit (TSK) and is used for analyzing disk images, file systems, web history, email, and more. It helps in recovering deleted files, keyword searching, and timeline analysis.

*   **FTK Imager:** A free data preview and imaging tool from AccessData (now Exterro). It's primarily used to create forensic images of hard drives, partitions, or logical files. It can also mount images for viewing, export files and folders, and calculate hash values (MD5 and SHA1) during the imaging process to verify data integrity.

### Example: Verifying Evidence Integrity with Hashing (Conceptual)

During evidence collection, creating a cryptographic hash of the original media or forensic image is crucial. This hash acts as a digital fingerprint. If even a single bit of the data changes, the hash value will be different, indicating potential tampering.

```bash
# Conceptual command to create an MD5 hash of a disk image file
# This hash would be recorded in the chain of custody documentation.
md5sum /path/to/evidence_disk_image.dd > /path/to/evidence_disk_image.dd.md5

# Later, to verify the integrity of the image:
md5sum -c /path/to/evidence_disk_image.dd.md5
# If output is 'OK', the file's integrity is preserved.
```

## Quick Understanding Checklist/Exercise

1.  **Scenario:** A company server has been breached. During which NIST Incident Response phase would you prioritize isolating the compromised server from the network to prevent further spread?
2.  **Concept:** Explain why maintaining a meticulous Chain of Custody is as important for digital evidence as it is for physical evidence in a legal context.
3.  **Tool Application:** If you need to create a bit-for-bit copy of a suspect's hard drive for forensic analysis, which basic tool (Autopsy or FTK Imager) would be your primary choice for the imaging process, and why?
