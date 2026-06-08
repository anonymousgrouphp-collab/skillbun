# Security Architecture & Design Patterns

Designing secure and resilient application architectures is fundamental to building robust software systems. This study guide explores key security design patterns and practices essential for embedding security from the ground up, ensuring applications are protected against evolving threats.

## 1. Core Security Design Patterns

Effective security architecture relies on applying proven design patterns that address various threat vectors.

### a) Zero Trust Architecture (ZTA)

Zero Trust is a security model based on the principle of "never trust, always verify." It assumes that no user, device, or application should be inherently trusted, regardless of whether it's inside or outside the traditional network perimeter.

**Key Tenets:**
*   **Verify Explicitly:** Authenticate and authorize every access request based on all available data points, including user identity, device posture, location, and service.
*   **Least Privilege Access:** Grant users and services only the minimum access necessary to perform their tasks.
*   **Assume Breach:** Design systems with the assumption that breaches will occur, focusing on minimizing blast radius and enabling rapid detection and response.
*   **Micro-segmentation:** Segment networks into small, isolated zones to limit lateral movement of attackers.
*   **Multi-factor Authentication (MFA):** Enforce strong authentication for all users and administrative access.

**Example Scenario:**
An employee accessing an internal application from a corporate laptop. In a Zero Trust model, even though the device is corporate-owned and inside the office network, the user's identity is re-verified via MFA, the device's posture (patches, antivirus status) is checked, and access is granted only to the specific resources needed for their role, potentially via a secure access proxy.

### b) Defense-in-Depth

Defense-in-Depth is a layered security approach where multiple security controls are strategically placed throughout an IT system. If one security control fails, another is in place to provide protection. This significantly increases the effort an attacker needs to compromise a system.

**Layers can include:**
*   **Perimeter Security:** Firewalls, IDS/IPS, WAFs.
*   **Network Security:** Network segmentation, VPNs, access control lists.
*   **Endpoint Security:** Antivirus, EDR, host-based firewalls.
*   **Application Security:** Secure coding practices, input validation, authentication/authorization.
*   **Data Security:** Encryption at rest and in transit, data loss prevention (DLP).
*   **Operational Security:** Logging, monitoring, incident response.
*   **Physical Security:** Securing data centers and hardware.

### c) Security Isolation

Security isolation involves separating components or systems to limit the impact of a compromise. This minimizes the "blast radius" if a vulnerability is exploited in one part of the system.

**Techniques:**
*   **Process Sandboxing:** Running untrusted code in a restricted environment (e.g., browser tabs, containerization).
*   **Network Segmentation:** Dividing a network into smaller, isolated subnets, often with strict firewall rules between them.
*   **Virtualization/Containerization:** Using VMs or containers to isolate applications and their dependencies from the host system and each other.
*   **Principle of Least Privilege:** Applying minimum necessary permissions to processes, users, and resources.

## 2. Microservices Security

Microservices architectures, while offering flexibility and scalability, introduce new security challenges due to their distributed nature.

**Key Security Considerations & Patterns:**
*   **API Gateway Security:** The API Gateway acts as the single entry point, handling authentication, authorization, rate limiting, and traffic routing.
*   **Secure Inter-service Communication:**
    *   **Mutual TLS (mTLS):** Encrypts and authenticates communication between services.
    *   **Service Mesh:** Tools like Istio or Linkerd can manage mTLS, traffic encryption, and policy enforcement between services.
*   **Token-based Authentication:** Using JWTs (JSON Web Tokens) for authentication and authorization across services.
*   **Centralized Secret Management:** Tools like HashiCorp Vault or AWS Secrets Manager to securely store and distribute API keys, database credentials, and other sensitive information.
*   **Container Security:** Securing Docker images, scanning for vulnerabilities, and applying least privilege to containers.

## 3. Architectural Reviews and Threat Modeling

Embedding security from the ground up requires proactive security activities throughout the software development lifecycle (SDLC).

### a) Security Architectural Reviews

These reviews involve evaluating an application's design and architecture against security best practices and organizational security policies *before* code is written or deployed.

**Objectives:**
*   Identify potential security weaknesses in the design.
*   Ensure compliance with security standards.
*   Propose secure design patterns and controls.

### b) Threat Modeling

Threat modeling is a structured approach to identify potential threats, vulnerabilities, and counter-measures within an application or system. It typically involves:

1.  **Diagramming the System:** Understanding the components, data flows, and trust boundaries.
2.  **Identifying Threats:** Using methodologies like STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to categorize potential attacks.
3.  **Identifying Vulnerabilities:** Mapping threats to potential weaknesses in the design or implementation.
4.  **Determining Countermeasures:** Proposing security controls to mitigate identified risks.
5.  **Verifying Countermeasures:** Ensuring the implemented controls effectively address the threats.

**Example: Threat Modeling for an E-commerce Checkout Service**
*   **System Component:** Payment Gateway Integration.
*   **Data Flow:** User -> Frontend -> Backend (Checkout Service) -> Payment Gateway API.
*   **STRIDE Threat (Tampering):** An attacker intercepts the payment request to modify the amount or recipient.
*   **Vulnerability:** Insufficient integrity checks on payment data before sending to gateway.
*   **Countermeasure:** Implement digital signatures or HMAC for payment request payloads; use TLS for all communication; server-side validation of all user input related to payment.

---

### Quick Check / Exercise:

1.  Explain how the "Assume Breach" principle of Zero Trust Architecture influences network segmentation strategy.
2.  Imagine you are designing a new microservice for user authentication. List two security concerns specific to microservices that you would prioritize and describe how you would address them.
3.  You are conducting a threat model for an existing file upload service. Using the STRIDE methodology, identify one potential threat for "Information Disclosure" and propose a countermeasure.