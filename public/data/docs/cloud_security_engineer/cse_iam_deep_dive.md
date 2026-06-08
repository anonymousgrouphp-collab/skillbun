# Cloud Identity & Access Management (IAM) Study Guide

Cloud Identity & Access Management (IAM) is the cornerstone of cloud security. It enables you to securely control who can do what with your cloud resources. Mastering IAM is critical for implementing the principle of least privilege, ensuring that users and services only have the permissions necessary to perform their tasks, and nothing more.

## 1. Core IAM Concepts

At its heart, IAM manages identities and their corresponding permissions.

### a. Identities
*   **Users:** Represents an individual person or service that interacts with cloud resources. These can be human users or programmatic users (e.g., API keys for applications).
*   **Groups:** A collection of users. Permissions applied to a group are inherited by all its members, simplifying administration.
*   **Roles:** A set of permissions that can be assumed by an identity. Roles are often used for temporary access or for granting permissions to services/applications rather than specific users. In AWS, roles are powerful; in Azure and GCP, roles are more directly linked to permissions.

### b. Policies
Policies are JSON or YAML documents that define permissions. They specify what actions are allowed or denied on which resources, under what conditions.

*   **Identity-based Policies:** Attached directly to users, groups, or roles. They define what the identity *can do*.
*   **Resource-based Policies:** Attached directly to a resource (e.g., an S3 bucket in AWS, a Key Vault in Azure). They define who *can access that specific resource* and what actions they can perform.

### c. Least Privilege Principle
This fundamental security principle dictates that every user, program, or process should be granted only the minimum set of permissions necessary to perform its function, and for the shortest duration. This significantly reduces the attack surface and potential damage from compromised accounts.

### d. Multi-Factor Authentication (MFA)
MFA adds an extra layer of security by requiring users to provide two or more verification factors to gain access to a resource. This typically involves something they know (password), something they have (phone, hardware token), and/or something they are (biometrics).

## 2. Advanced IAM Concepts

### a. Identity Federation & Single Sign-On (SSO)
*   **Identity Federation:** Allows external identity providers (IdPs) like corporate directories (e.g., Active Directory, Okta, Ping Identity) to authenticate users to your cloud environment. Users log in once to their corporate IdP and gain access to cloud resources without needing separate cloud credentials.
*   **Single Sign-On (SSO):** A user authentication process that allows a user to access multiple applications with one set of login credentials. Federation often enables SSO.

### b. Workload Identities
Workload identities refer to the identities used by applications, services, or virtual machines to access other cloud resources. Instead of hardcoding credentials, these identities leverage roles or service accounts to obtain temporary, programmatic access keys.
*   **AWS:** IAM Roles for EC2 instances, Lambda functions.
*   **Azure:** Managed Identities for Azure resources (VMs, App Services).
*   **GCP:** Service Accounts for GCE instances, Cloud Functions.

### c. Just-in-Time (JIT) Access
JIT access grants temporary, elevated permissions only when explicitly requested and only for a limited duration. This drastically reduces the window of opportunity for attackers to exploit standing elevated privileges.

## 3. Robust Secrets Management Strategies

Secrets management involves securely storing and managing sensitive information like API keys, database credentials, and cryptographic keys. Cloud providers offer services for this:
*   **AWS Secrets Manager / AWS Systems Manager Parameter Store**
*   **Azure Key Vault**
*   **GCP Secret Manager**

These services help rotate secrets automatically, control access through IAM policies, and encrypt secrets at rest and in transit.

## 4. IAM Across Cloud Providers

While the core principles remain, the implementation details vary.

### a. AWS IAM
*   **Users, Groups, Roles:** Explicitly defined entities.
*   **Policies:** JSON documents attached to users, groups, roles (identity-based) or resources (resource-based).
*   **Identity Center (formerly SSO):** Centralized access management for multiple AWS accounts and third-party applications.
*   **Service Control Policies (SCPs):** Apply preventative guardrails at the AWS Organization level.

**Example AWS IAM Policy (Identity-based):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-secure-bucket",
        "arn:aws:s3:::my-secure-bucket/*"
      ]
    },
    {
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::my-secure-bucket/*"
    }
  ]
}
```
This policy grants read access to `my-secure-bucket` but explicitly denies delete permissions.

### b. Azure Active Directory (Azure AD)
*   **Users, Groups:** Managed within Azure AD.
*   **Roles:** Azure RBAC (Role-Based Access Control) roles (e.g., Owner, Contributor, Reader) define permissions at different scopes (management group, subscription, resource group, resource).
*   **Service Principals:** Identities used by applications/services to access Azure resources.
*   **Managed Identities:** Special type of Service Principal for Azure resources to authenticate to services that support Azure AD authentication.
*   **Conditional Access:** Fine-grained access control based on conditions like user location, device state, and application.

### c. Google Cloud Platform (GCP) IAM
*   **Members:** Who (users, groups, service accounts, domains).
*   **Roles:** What (a collection of permissions). GCP has primitive roles (Owner, Editor, Viewer), predefined roles (specific to services), and custom roles.
*   **Policies:** Defined at various levels of the resource hierarchy (Organization, Folder, Project, Resource) and specify which members have which roles. Inherits permissions down the hierarchy.
*   **Service Accounts:** Special type of identity for applications and VMs.

## 5. Quick Check / Exercises

1.  Explain the difference between an identity-based policy and a resource-based policy, providing a scenario where each would be most appropriate.
2.  Your organization wants to ensure that developers can only access sensitive production databases during working hours and require MFA. Which IAM concepts and features would you combine across cloud providers to achieve this?
3.  Why is "least privilege" a critical principle in cloud security, and how does it relate to "just-in-time access"?
