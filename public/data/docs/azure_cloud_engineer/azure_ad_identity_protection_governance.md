# Azure AD Identity Protection & Governance: Mastering Identity Security

This study guide delves into Azure AD Identity Protection and Identity Governance, crucial components for securing and managing identities in your Azure environment. We'll explore how to detect and remediate identity-based risks, and leverage governance features like Privileged Identity Management (PIM) and Access Reviews to enforce least privilege and ensure compliance.

## 1. Azure AD Identity Protection

Azure AD Identity Protection is a powerful tool designed to detect, investigate, and remediate identity-based risks. It uses Microsoft's extensive threat intelligence and machine learning capabilities to identify suspicious activities related to user accounts and sign-ins.

### Core Concepts

*   **Risk Detection:**
    *   **User Risk:** Represents the probability that a given identity has been compromised. Examples include leaked credentials, offline brute-force attacks, and unfamiliar sign-in properties.
    *   **Sign-in Risk:** Represents the probability that a given sign-in attempt isn't performed by the legitimate owner of the identity. Examples include sign-ins from unfamiliar locations, anonymous IP addresses, or impossible travel scenarios.
*   **Policies:** Identity Protection allows you to configure automated responses based on detected risks.
    *   **Sign-in Risk Policy:** Configured to respond to real-time sign-in risks. Common actions include requiring MFA, blocking access, or requiring a password change.
    *   **User Risk Policy:** Configured to respond to user accounts deemed at risk. Common actions include forcing password resets for high-risk users.
*   **Remediation:** Policies automate remediation, reducing manual intervention. Users might be prompted for MFA, forced to reset their password, or blocked from signing in until an administrator resolves the risk.

### How it Works

Azure AD Identity Protection continuously monitors sign-in attempts and user behavior. It aggregates data from various sources, including global threat intelligence, to build a profile of normal user behavior. Any deviation from this baseline or known attack patterns triggers a risk detection.

### Benefits

*   **Automated Risk Response:** Reduces the burden on security teams by automating remediation.
*   **Proactive Threat Detection:** Identifies potential compromises before they cause significant damage.
*   **Enhanced Security Posture:** Strengthens overall identity security by addressing common attack vectors.

### Configuration Sample: Enabling a Sign-in Risk Policy

While not a code block, here's a conceptual walkthrough for configuring a sign-in risk policy:

1.  Navigate to the **Azure portal**.
2.  Search for and select **Azure Active Directory**.
3.  Under **Security**, select **Identity Protection**.
4.  Choose **Sign-in risk policy**.
5.  **Assignments:**
    *   **Users:** Select "All users" or specific groups/users to apply the policy.
    *   **Cloud apps:** Typically, "All cloud apps" for comprehensive protection.
6.  **Conditions:**
    *   **Sign-in risk:** Set the risk level (e.g., "Medium and above").
7.  **Access:**
    *   **Access:** Select "Allow access".
    *   **Session control:** Choose an action like "Require multi-factor authentication".
8.  Set **Enforce policy** to **On**.
9.  **Save** the policy.

## 2. Azure AD Identity Governance

Azure AD Identity Governance helps organizations balance security and productivity with the right processes and visibility. It ensures that the right people have the right access to the right resources at the right time.

### 2.1. Privileged Identity Management (PIM)

Azure AD Privileged Identity Management (PIM) is a service that enables you to manage, control, and monitor access to important resources in Azure AD, Azure, and other Microsoft Online Services. It minimizes the number of people who have access to sensitive information or resources, reducing the chance of a malicious actor gaining access.

### Core Concepts

*   **Just-in-Time (JIT) Access:** Users activate privileged roles only when needed, for a limited time, instead of having standing administrative access.
*   **Time-bound Access:** Access to roles and resources is granted for a specific duration, after which it automatically expires.
*   **Approval Workflows:** Require approval from designated approvers before a user can activate a privileged role.
*   **Multi-Factor Authentication (MFA):** Can be enforced during role activation for an additional layer of security.
*   **Audit History:** PIM provides a detailed audit log of all activations, deactivations, and assignments.

### Benefits

*   **Principle of Least Privilege:** Enforces the "just enough, just-in-time" access model.
*   **Reduced Attack Surface:** Minimizes the window of opportunity for attackers to exploit privileged accounts.
*   **Enhanced Accountability:** Provides clear audit trails of who accessed what and when.

### Configuration Sample: Activating a Role in PIM

As an end-user with an eligible PIM role, the process is:

1.  Navigate to the **Azure portal**.
2.  Search for and select **Azure AD Privileged Identity Management**.
3.  Under **Manage**, select **My roles**.
4.  Choose **Azure AD roles** or **Azure resources roles**.
5.  Find the eligible role you need to activate and click **Activate**.
6.  Provide a **justification** and optionally specify a **custom activation start/end time**.
7.  If configured, complete an **MFA prompt** and await **approval**.

### 2.2. Access Reviews

Azure AD Access Reviews enable organizations to efficiently manage group memberships, access to enterprise applications, and role assignments. They ensure that users do not retain access that they no longer need, reducing the risk of unauthorized access.

### Core Concepts

*   **Periodic Review:** Schedule recurring reviews for group memberships or application access.
*   **Reviewers:** Assign specific individuals (e.g., group owners, managers, self) to review and attest to users' access.
*   **Automated Actions:** Configure actions to take upon review completion, such as removing users from groups or disabling accounts.
*   **Recommendations:** Azure AD can provide recommendations based on user activity (e.g., inactive users).

### Benefits

*   **Compliance:** Helps meet regulatory requirements by providing documented proof of access attestation.
*   **Reduced Stale Access:** Automatically identifies and removes unnecessary access rights.
*   **Improved Security:** Minimizes the risk associated with "privilege creep" or orphaned accounts.

### Configuration Sample: Creating an Access Review

1.  Navigate to the **Azure portal**.
2.  Search for and select **Azure Active Directory**.
3.  Under **Identity Governance**, select **Access reviews**.
4.  Click **New access review**.
5.  **Select what to review:** Choose "Teams + groups", "Applications", or "Azure AD roles".
6.  **Select scope:** Define which specific groups, applications, or roles to review.
7.  **Review scope:** Define who to include in the review.
8.  **Reviewers:** Specify who will perform the review (e.g., Group owners, Selected users, Managers of users).
9.  **Duration:** Set the start and end dates for the review.
10. **Review recurrence:** Choose how often the review should repeat (e.g., Weekly, Monthly, Quarterly, Annually, One-time).
11. **Upon completion settings:** Define actions for denied users (e.g., "Remove user from group").
12. **Create** the access review.

## Integration & Best Practices

Identity Protection, PIM, and Access Reviews work synergistically:
*   Identity Protection detects risks, and its policies can integrate with PIM to require MFA for role activation.
*   PIM enforces just-in-time access, reducing the attack surface.
*   Access Reviews ensure that even PIM eligible roles are regularly attested for continued necessity.

## Quick Check / Exercise

1.  Explain the primary difference between a "User Risk" and a "Sign-in Risk" as detected by Azure AD Identity Protection.
2.  Describe a scenario where Privileged Identity Management (PIM) would significantly enhance security compared to standing administrative access.
3.  Your organization needs to ensure that all members of the "Global Admins" group still require that level of access on a quarterly basis for compliance reasons. Which Identity Governance feature would you implement, and why?
