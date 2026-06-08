# Cybersecurity Fundamentals: A Core Study Guide

Welcome to the foundational module on Cybersecurity Fundamentals! As a Cloud Security Engineer, a deep understanding of these core principles is paramount for designing, implementing, and maintaining secure cloud environments. This guide will equip you with the essential knowledge required to identify threats, mitigate risks, and build resilient systems.

## 1. Core Principles: The CIA Triad

The CIA Triad is a foundational model for information security, defining the three core objectives that guide security practices:

*   **Confidentiality**: Ensuring that information is accessible only to authorized individuals or systems. This protects sensitive data from unauthorized disclosure.
    *   *Examples*: Encryption of data at rest and in transit, strong access controls, data anonymization.
*   **Integrity**: Maintaining the accuracy, consistency, and trustworthiness of data over its entire lifecycle. It prevents unauthorized modification or destruction of information.
    *   *Examples*: Hashing, digital signatures, version control, checksums.
*   **Availability**: Guaranteeing that authorized users can access information and resources when needed. It ensures systems and data are operational and responsive.
    *   *Examples*: Redundancy, backup and recovery, disaster recovery plans, load balancing.

## 2. Common Attack Vectors

Understanding how attackers compromise systems is crucial for defense. Here are some prevalent attack vectors:

*   **Phishing & Social Engineering**: Deceiving individuals to gain unauthorized access to systems or information (e.g., fake login pages, malicious attachments).
*   **Malware**: Malicious software designed to disrupt, damage, or gain unauthorized access to computer systems (e.g., Viruses, Worms, Ransomware, Spyware, Trojans).
*   **Denial of Service (DoS/DDoS)**: Overwhelming a system or network with traffic to make it unavailable to legitimate users.
*   **SQL Injection**: Injecting malicious SQL code into input fields to manipulate database queries and gain unauthorized access to data.
*   **Cross-Site Scripting (XSS)**: Injecting malicious scripts into web pages viewed by other users, often to steal session cookies or credentials.
*   **Man-in-the-Middle (MITM)**: Intercepting communication between two parties without their knowledge, allowing the attacker to eavesdrop or alter messages.

## 3. Security Models & Best Practices

These models guide the design and implementation of secure systems:

*   **Defense in Depth**: Employing multiple layers of security controls (physical, technical, administrative) to protect assets, so if one control fails, another is still in place.
*   **Zero Trust Architecture (ZTA)**: Assumes no implicit trust is granted to assets or user accounts based solely on their physical or network location. All access attempts must be authenticated and authorized.
*   **Principle of Least Privilege (PoLP)**: Granting users or systems only the minimum necessary permissions to perform their required tasks, reducing the attack surface.

## 4. Foundational Technologies

### Encryption
The process of encoding information in such a way that only authorized parties can access it.

*   **Symmetric Encryption**: Uses a single secret key for both encryption and decryption (e.g., AES). Faster, good for bulk data encryption.
*   **Asymmetric Encryption (Public Key Cryptography)**: Uses a pair of keys (a public key for encryption and a private key for decryption). Slower, typically used for secure key exchange and digital signatures (e.g., RSA, ECC).

### Hashing
A one-way mathematical function that transforms an input (or 'message') into a fixed-size string of bytes, typically a 'hash value' or 'message digest'.

*   **Properties**: One-way (irreversible), fixed output size, collision resistance (difficult to find two different inputs that produce the same hash).
*   **Use Cases**: Verifying data integrity, securely storing passwords (store hash, not plaintext), digital signatures.

**Example: Python Hashing with SHA256**
```python
import hashlib

def hash_string(input_string):
    # Encode the string to bytes
    encoded_string = input_string.encode('utf-8')
    # Create a SHA256 hash object
    sha256_hash = hashlib.sha256()
    # Update the hash object with the encoded string
    sha256_hash.update(encoded_string)
    # Get the hexadecimal representation of the hash
    return sha256_hash.hexdigest()

data = "This is a secret message."
hashed_data = hash_string(data)
print(f"Original: {data}")
print(f"SHA256 Hash: {hashed_data}")
# Example Output: SHA256 Hash: 928d32b8e3e4f71a0d7d9e4a3c1a8f9a2b5d4e6f7a8b9c0d1e2f3a4b5c6d7e8f
```

### Public Key Infrastructure (PKI)
A system that creates, manages, distributes, uses, stores, and revokes digital certificates. It enables the secure exchange of information over insecure networks by establishing trust.

*   **Components**: Certificate Authorities (CAs), Registration Authorities (RAs), Digital Certificates, Certificate Revocation Lists (CRLs), Online Certificate Status Protocol (OCSP).
*   **How it works**: CAs issue digital certificates that cryptographically bind a public key to an entity's identity. This enables secure communication through authentication, data integrity, and confidentiality services.

### Authentication vs. Authorization
These two distinct concepts are often confused but are critical for access control.

*   **Authentication**: *Verifies the identity* of a user, system, or process. It answers the question, "Who are you?"
    *   *Mechanisms*: Passwords, Multi-Factor Authentication (MFA), biometrics (fingerprint, facial recognition), digital certificates.
*   **Authorization**: *Determines what an authenticated entity is permitted to do* or access. It answers the question, "What can you do?"
    *   *Mechanisms*: Role-Based Access Control (RBAC), Access Control Lists (ACLs), policies, permissions.

## 5. Overview of Major Security Frameworks

Security frameworks provide a structured approach to managing cybersecurity risks.

*   **NIST Cybersecurity Framework (CSF)**: Developed by the National Institute of Standards and Technology, it's a voluntary framework for organizations to manage and reduce cybersecurity risk. It consists of five core functions:
    1.  **Identify**: Develop an organizational understanding to manage cybersecurity risk to systems, assets, data, and capabilities.
    2.  **Protect**: Develop and implement appropriate safeguards to ensure the delivery of critical services.
    3.  **Detect**: Develop and implement appropriate activities to identify the occurrence of a cybersecurity event.
    4.  **Respond**: Develop and implement appropriate activities to take action regarding a detected cybersecurity incident.
    5.  **Recover**: Develop and implement appropriate activities to maintain plans for resilience and to restore any capabilities or services that were impaired due to a cybersecurity incident.

*   **ISO 27001 (Information Security Management System - ISMS)**: An international standard that specifies requirements for establishing, implementing, maintaining, and continually improving an information security management system (ISMS). It follows a Plan-Do-Check-Act (PDCA) model. Achieving ISO 27001 certification demonstrates that an organization follows best practices for information security.

## Quick Check / Exercises

1.  **Scenario**: A database containing customer credit card numbers is encrypted at rest, and only authorized financial team members have decryption keys. This primarily addresses which component of the CIA Triad? If an attacker somehow gains access to the encrypted database but cannot decrypt it, what security principle prevented a major breach?
2.  **Distinguish**: Explain the fundamental difference between symmetric and asymmetric encryption, providing a common real-world use case for each.
3.  **Application**: You're designing a new cloud application. Describe how you would apply the Principle of Least Privilege and the concept of "Authorization" when setting up access for different types of users (e.g., "admin" vs. "regular user").
