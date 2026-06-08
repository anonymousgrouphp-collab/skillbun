# Threat Modeling & Secure Design Principles

As an Application Security Engineer, mastering threat modeling and secure design principles is fundamental to building resilient and secure applications. This guide will walk you through key methodologies and principles to proactively identify, assess, and mitigate security risks early in the Software Development Life Cycle (SDLC).

## 1. Introduction to Threat Modeling

Threat modeling is a structured process for identifying potential security threats, vulnerabilities, and countermeasure requirements for an application or system. It's about thinking like an attacker to understand how a system could be compromised and then designing controls to prevent or detect such attacks. Integrating threat modeling early in the design phase is crucial for "shifting left" on security, making security fixes less costly and more effective.

## 2. Core Threat Modeling Methodologies

### 2.1. STRIDE Methodology

STRIDE is a mnemonic developed by Microsoft, used to categorize and identify threats based on common attack patterns. It helps in brainstorming potential threats for various components of a system.

*   **S**poofing: Impersonating someone or something else (e.g., attacker pretending to be a legitimate user).
*   **T**ampering: Unauthorized modification of data (e.g., changing parameters in an HTTP request).
*   **R**epudiation: Denying an action without being able to be disproven (e.g., a user denying they placed an order).
*   **I**nformation Disclosure: Unauthorized exposure of data (e.g., sensitive data leakage through error messages).
*   **D**enial of Service (DoS): Preventing legitimate users from accessing resources (e.g., flooding a server with traffic).
*   **E**levation of Privilege: Gaining capabilities beyond what is intended (e.g., a regular user gaining admin rights).

### 2.2. DREAD Methodology (Risk Rating)

DREAD is a risk assessment model used to quantify and prioritize identified threats. Each component is typically rated on a scale (e.g., 1-10 or Low/Medium/High), and the scores are combined to get an overall risk rating.

*   **D**amage: How bad would an attack be? (Impact on data, system, users).
*   **R**eproducibility: How easy is it to reproduce the attack?
*   **E**xploitability: How easy is it to launch the attack? (Skills, tools required).
*   **A**ffected Users: How many users would be impacted?
*   **D**iscoverability: How easy is it for an attacker to find the vulnerability?

### 2.3. PASTA Methodology (Process for Attack Simulation and Threat Analysis)

PASTA is a seven-step, risk-centric methodology that guides organizations through a structured approach to threat modeling. It aims to align business objectives with technical requirements and provides a dynamic approach to risk management.

1.  **Phase 1: Definition of Scope**: Define business objectives and identify key stakeholders.
2.  **Phase 2: Analysis of Attack Surfaces**: Decompose the application, identify entry points, data flows, and assets.
3.  **Phase 3: Threat Enumeration**: Identify threats using methodologies like STRIDE, attack trees, or threat libraries.
4.  **Phase 4: Risk Analysis**: Assess identified threats using models like DREAD, considering likelihood and impact.
5.  **Phase 5: Mitigation Planning**: Develop security controls and countermeasures to address prioritized risks.
6.  **Phase 6: Security Validation**: Verify that implemented controls are effective through testing (e.g., penetration testing, code review).
7.  **Phase 7: Management Reporting**: Document findings, risks, and mitigations for stakeholders.

## 3. Secure Design Principles

Beyond specific methodologies, integrating secure design principles into the architectural phase is paramount for building inherently secure systems.

*   **Principle of Least Privilege (PoLP)**: A user, program, or process should be given only the minimum set of privileges necessary to complete its task. No more, no less.
*   **Defense in Depth**: Employing multiple layers of security controls to protect against failure in one layer. If one control fails, another is in place to take over.
*   **Fail-safe Defaults**: Unless explicitly granted, access to a resource should be denied. Default settings should always be secure.
*   **Separation of Concerns**: Divide a system into distinct, independent components, each responsible for a specific function. This limits the impact of a compromise in one component.
*   **Minimizing Attack Surface**: Reduce the number of potential entry points an attacker can use to compromise a system (e.g., close unused ports, disable unnecessary services).
*   **Secure by Default**: Design systems to be secure out-of-the-box, requiring explicit configuration by administrators to loosen security.

## 4. Practical Application Example: Simple DREAD Risk Assessment

Consider a user registration feature where a new user provides their email and password. A potential threat could be SQL Injection during the registration process if the input fields are not properly sanitized.

```python
# Scenario: User registration form, potential SQL Injection in username field

# Threat: Attacker injects malicious SQL into the username field to bypass authentication
# or extract data.

# DREAD Assessment for this specific threat:
# 1. Damage Potential (D): High (e.g., full database compromise, data theft, admin access)
# 2. Reproducibility (R): Medium (requires knowledge of SQLi techniques, potentially automation)
# 3. Exploitability (E): Medium (depends on backend query structure, lack of prepared statements)
# 4. Affected Users (A): High (all user data could be compromised, system integrity affected)
# 5. Discoverability (D): Low (basic input validation might miss it, requires specific probes)

# Example Risk Score (simple sum, higher is worse):
# DREAD Score = D + R + E + A + D = 4 + 3 + 3 + 4 + 2 = 16 (out of 20, if using 1-4 scale)

# Mitigation for this threat would include:
# - Using prepared statements or parameterized queries.
# - Input validation and sanitization on all user-supplied data.
# - Least privilege for database connections.
```

## 5. Exercises/Checklist

1.  For an API endpoint that allows a user to update their profile information (e.g., `PUT /api/v1/users/{id}`), identify at least one STRIDE threat and explain how it applies.
2.  Explain how the 