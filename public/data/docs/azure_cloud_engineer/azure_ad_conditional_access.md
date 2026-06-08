# Azure AD Conditional Access Study Guide

## Introduction to Azure AD Conditional Access

Azure Active Directory (Azure AD) Conditional Access is a powerful tool within Azure AD that enables organizations to enforce policies for accessing cloud applications. It allows you to implement automated access control decisions based on various signals such as user identity, device state, location, and application context. By leveraging Conditional Access, you can automate decisions and enforce organizational policies, significantly enhancing security and compliance by ensuring users only access resources under predefined, secure conditions.

## Core Concepts of Conditional Access

Conditional Access policies function as `if-then` statements: *If* a user wants to access a resource (the "if" part), *then* they must complete a specific action (the "then" part).

A typical Conditional Access policy is constructed from the following key components:

1.  **Users and Groups:** Defines the scope of the policy, specifying who it applies to. You can include specific users, groups, or all users, and importantly, exclude emergency access or "break glass" accounts.
2.  **Cloud apps or actions:** Identifies the target resources or user actions that the policy will protect. Examples include `Office 365`, `Azure Management`, or user actions like `Register security information`.
3.  **Conditions:** These are the signals that Azure AD evaluates to make an access decision. Common conditions include:
    *   **Device platforms:** Operating systems like Windows, iOS, Android, macOS, Linux.
    *   **Locations:** Specific IP ranges (e.g., corporate network) or geographical regions.
    *   **Client apps:** Browser, mobile apps and desktop clients, Exchange ActiveSync clients.
    *   **Device state:** Requiring a device to be marked as compliant (via Intune) or Hybrid Azure AD joined.
    *   **Sign-in risk:** Risk levels detected by Azure AD Identity Protection (e.g., high, medium, low).
4.  **Access controls:** These are the actions enforced once the conditions are met.
    *   **Grant access:** Allows access, often with additional requirements such as Multi-Factor Authentication (MFA), a compliant device, or an approved client app.
    *   **Block access:** Prevents access entirely.
    *   **Session controls:** Enforce restrictions during the user's session, such as app-enforced restrictions (e.g., read-only access in SharePoint) or managing sign-in frequency.

## How Conditional Access Works

When a user attempts to access a cloud application, Azure AD evaluates all applicable Conditional Access policies. The decision engine processes various signals (user, location, device, application, risk, etc.) against the defined conditions in your policies.

*   If conditions are met, the specified access controls (e.g., grant access with MFA, block access) are enforced.
*   If multiple policies apply, all "grant" controls must be satisfied. If any policy includes a "block" control, access will be denied regardless of other "grant" policies.

## Key Conditions in Detail

*   **Users and groups:** Crucial for scoping policies, enabling either broad application or granular control for specific user sets or administrative roles.
*   **Cloud apps or actions:** Specifies the target resource. Common targets are `All cloud apps` or specific services like `Microsoft Azure Management` and `Office 365`.
*   **Device platforms:** Allows policies to be tailored based on the operating system (e.g., only require a compliant device for Windows machines).
*   **Locations:** Essential for defining trusted network boundaries or blocking access from untrusted geographic regions.
*   **Client apps:** Differentiates between access from web browsers versus native mobile or desktop applications.
*   **Device state:** Integrates with Microsoft Intune for device compliance and Hybrid Azure AD Join to ensure only trusted devices can access resources.
*   **Sign-in risk:** Utilizes Azure AD Identity Protection to block or challenge high-risk sign-ins with MFA, based on real-time risk assessment.

## Access Controls: Grant and Session

### Grant Controls
These determine if a user is allowed to proceed and under what additional requirements:
*   **Require Multi-Factor Authentication (MFA):** The most common control, prompting users for a second form of verification.
*   **Require device to be marked as compliant:** Requires the device to meet policies defined in Microsoft Intune.
*   **Require Hybrid Azure AD joined device:** Ensures the device is joined to your on-premises Active Directory and registered with Azure AD.
*   **Require approved client app:** Restricts access to specific, managed mobile applications (e.g., Outlook Mobile).
*   **Require password change:** Prompts users to change their password, often used in response to detected user risk.

### Session Controls
These controls enforce restrictions *during* the user's session:
*   **Use app enforced restrictions:** Integrates with certain Microsoft cloud apps (e.g., Exchange Online, SharePoint Online) to enable scenarios like read-only access or preventing downloads based on policy.
*   **Use Conditional Access App Control:** Integrates with Microsoft Defender for Cloud Apps (formerly MCAS) to apply real-time session policies.
*   **Sign-in frequency:** Defines how often users are required to re-authenticate.
*   **Persistent browser session:** Allows users to remain signed in after closing and reopening their browser.

## Configuration Example: Requiring MFA for Admin Access to Azure Portal from Untrusted Locations

This policy aims to protect administrative access to Azure Management by mandating Multi-Factor Authentication when administrators sign in from outside the designated corporate network.

```markdown
# Conditional Access Policy: Admins Require MFA for Azure Management Outside Trusted Locations

**1. Name:** Admins - Require MFA for Azure Management from Untrusted Locations

**2. Assignments:**
    *   **Users or workload identities:**
        *   **Include:** Select "Directory roles" -> "Global Administrator", "Application Administrator", "Cloud Application Administrator", etc. (all relevant admin roles).
        *   **Exclude:** Emergency access or break-glass accounts.
    *   **Cloud apps or actions:**
        *   **Include:** "Microsoft Azure Management"

**3. Conditions:**
    *   **Locations:**
        *   **Configure:** Yes
        *   **Include:** "Any location"
        *   **Exclude:** "All trusted locations" (a pre-defined named location containing your corporate network IP ranges).
    *   **Device platforms:** Any device
    *   **Client apps:** All client apps
    *   **Sign-in risk:** N/A (or configure based on Identity Protection if desired)

**4. Access controls:**
    *   **Grant:**
        *   "Require Multi-Factor Authentication"
        *   [✓] "Require one of the selected controls"

**5. Enable policy:** Start with "Report-only" to monitor impact, then switch to "On" after thorough testing.
```

## Best Practices for Conditional Access Policies

*   **Pilot with a small group:** Always deploy new policies to a small test group before rolling out broadly to monitor impact.
*   **Use Report-only mode:** This allows you to observe the effects of a policy without enforcing it, providing critical insights into potential user disruption.
*   **Exclude emergency access accounts:** Ensure "break glass" accounts are excluded from all Conditional Access policies to prevent lockout in an emergency situation.
*   **Minimize policy complexity:** Keep policies as simple and focused as possible for easier management, troubleshooting, and understanding.
*   **Regular review:** Periodically review your policies to ensure they remain aligned with current security, compliance, and operational requirements.

---

## Quick Check / Exercise

1.  **Purpose:** What is the primary goal of using Azure AD Conditional Access in an organization?
2.  **Components:** List the four main components that constitute an Azure AD Conditional Access policy.
3.  **Scenario:** Your organization needs to ensure that users accessing the highly sensitive "HR Portal" application can only do so from devices that are marked as compliant by Microsoft Intune. Which Conditional Access policy conditions and access controls would you configure to achieve this?