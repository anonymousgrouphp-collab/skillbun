# Practice: IAM Policy Review & Remediation Lab

## Introduction
Identity and Access Management (IAM) is the cornerstone of cloud security, controlling who can do what within your cloud environments. Misconfigured IAM policies are a leading cause of security breaches, often granting more permissions than necessary. This hands-on lab focuses on developing the critical skills to identify overly broad IAM permissions, refactor them to enforce the principle of least privilege, document associated risks, and implement automated guardrails to prevent future regressions across AWS, Azure, and GCP.

## The Principle of Least Privilege

**Definition:** The principle of least privilege dictates that a user, application, or service account should be granted only the minimum necessary permissions to perform its intended task, and no more. 

**Why it Matters:**
*   **Reduces Attack Surface:** Limits the potential impact of compromised credentials.
*   **Limits Blast Radius:** In case of a breach, the attacker's ability to move laterally or inflict damage is significantly restricted.
*   **Improves Compliance:** Many regulatory frameworks (e.g., PCI DSS, HIPAA, GDPR) mandate least privilege access controls.
*   **Better Auditing:** Easier to track and understand who did what, as permissions are tightly scoped.

## Common IAM Misconfigurations

Overly broad permissions are a prevalent issue. Here are some common patterns:
*   **Wildcard Actions (`*`):** Granting `s3:*` or `ec2:*` allows all actions within a service, often far more than required.
*   **Wildcard Resources (`*`):** Allowing access to `arn:aws:s3:::*` or `/subscriptions/xyz/resourceGroups/*/providers/*` means the policy applies to all resources of that type, not just specific ones.
*   **Unused Permissions:** Policies attached to inactive users, roles, or groups that are no longer needed.
*   **Overly Permissive Trust Policies:** Allowing too many entities to assume a powerful role.
*   **Default Roles:** Using default roles (e.g., AWS `AdministratorAccess`, Azure `Owner`, GCP `Owner`) for service accounts or applications that only need specific operations.

## Identifying Overly Broad Permissions

Effective review requires understanding the tools and logs available in each cloud provider.

### AWS
*   **IAM Access Analyzer:** Identifies resources shared with an external entity or publicly accessible. Also provides findings for unused access.
*   **IAM Policy Simulator:** Tests the effects of a policy on specific actions and resources before deployment.
*   **CloudTrail:** Logs API activity, providing crucial insights into what actions are *actually* being performed by users and roles.
*   **AWS CLI/SDK:** Programmatic inspection.
    *   `aws iam get-policy-version --policy-arn <ARN>`
    *   `aws iam simulate-principal-policy --policy-source-arn <ARN> --action-names s3:GetObject --resource-arns arn:aws:s3:::mybucket/myobject`

### Azure
*   **Azure AD Identity Protection:** Detects identity-based risks and vulnerabilities.
*   **Azure Policy:** Can be used to audit for non-compliant resource configurations, including role assignments that grant excessive permissions.
*   **Azure Monitor (Activity Logs):** Records subscription-level events, including who performed specific actions.
*   **Azure CLI/PowerShell:** Inspect role definitions and assignments.
    *   `az role assignment list --assignee <principal-id>`
    *   `az role definition list --name 