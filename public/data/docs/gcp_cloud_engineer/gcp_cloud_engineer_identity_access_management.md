# Identity and Access Management (IAM) in Google Cloud Platform (GCP)

## Introduction
Google Cloud IAM allows you to define who has what access to which resources within your GCP projects and organization. It's a fundamental service for securing your cloud environment by implementing the principle of least privilege, ensuring that members only have the necessary permissions to perform their tasks.

## Core Concepts

### 1. Members (Who)
Members are the "who" in an IAM policy. They can be:
*   **Google Accounts**: End-user accounts (e.g., `user@gmail.com`).
*   **Service Accounts**: Special accounts used by applications, VMs, or other GCP services to authenticate and access resources.
*   **Google Groups**: Collections of Google Accounts and Service Accounts (e.g., `devs@example.com`).
*   **Google Workspace (formerly G Suite) domains**: All users within a specific domain.
*   **Cloud Identity domains**: All users within a Cloud Identity domain.
*   **All authenticated users**: A special identifier that represents any user authenticated with a Google Account.
*   **All users**: Represents anyone on the internet, authenticated or not (use with extreme caution!).

### 2. Roles (What)
Roles define the set of permissions that a member is granted. Permissions dictate what actions a member can perform on a resource (e.g., `compute.instances.start`, `storage.objects.get`).

*   **Primitive Roles**: Broad roles applied at the project level, inheriting traditional owner/editor/viewer access.
    *   `Owner`: Full access, including managing roles and billing.
    *   `Editor`: Can modify resources, but not manage roles or billing.
    *   `Viewer`: Read-only access to all resources.
    *   *Best Practice*: Avoid using primitive roles outside of initial setup; prefer more granular roles.
*   **Predefined Roles**: Google-managed roles that grant fine-grained access for specific services (e.g., `roles/compute.viewer`, `roles/storage.admin`). These are recommended for most use cases.
*   **Custom Roles**: If predefined roles don't meet your specific needs, you can create custom roles by combining a specific set of permissions. This allows for ultimate granularity.

### 3. IAM Policy (How)
An IAM policy is a collection of role bindings that define which members have which roles on a specific resource. Policies are attached to resources (projects, folders, organizations, or even individual resources like buckets or VMs).

The policy structure generally looks like this:
```json
{
  "bindings": [
    {
      "role": "roles/viewer",
      "members": [
        "user:alice@example.com",
        "group:devs@example.com"
      ]
    },
    {
      "role": "roles/storage.admin",
      "members": [
        "serviceAccount:my-app-sa@my-project.iam.gserviceaccount.com"
      ],
      "condition": {
        "title": "Expires after 2024-12-31",
        "description": "Access expires at the end of 2024",
        "expression": "request.time < timestamp(\"2025-01-01T00:00:00Z\")"
      }
    }
  ],
  "etag": "BwW1N7WpLAA=",
  "version": 3
}
```

### 4. Resources (What)
Resources are the GCP entities that members want to access. IAM policies are inherited down the resource hierarchy: Organization > Folders > Projects > Resources. A policy set at the project level applies to all resources within that project unless overridden by a more specific policy lower in the hierarchy.

## Service Accounts
Service accounts are non-human accounts that applications and services use to make authorized API calls.
*   **Managed Keys**: GCP automatically manages these keys. Preferred.
*   **User-Managed Keys**: You create and manage these keys. Less secure, use only if necessary for external applications.
*   **Impersonation**: A service account can be granted permissions to impersonate another service account or user, allowing it to act on their behalf.

## IAM Conditions
IAM Conditions allow you to grant roles conditionally. This adds another layer of granularity by enabling role bindings to be enforced only if specified conditions are met. Conditions can be based on:
*   **Time**: Access valid only during certain hours or until a specific date.
*   **IP Address**: Access only from specific IP ranges.
*   **Resource Tags**: Access based on whether a resource has a specific tag.
*   **API Arguments**: Access based on specific attributes of an API request.

## Audit Logs
GCP Audit Logs (part of Cloud Logging) record administrative activities, data access, and system events. They are crucial for security analysis, compliance, and debugging.
*   **Admin Activity Audit Logs**: Operations that modify the configuration or metadata of resources (e.g., creating a VM, changing IAM policy). Always enabled.
*   **Data Access Audit Logs**: Operations that read or modify data within a resource (e.g., reading data from a Cloud Storage bucket, querying a BigQuery table). Must be explicitly enabled for certain services.
*   **System Event Audit Logs**: GCP system events that modify resources. Always enabled.
*   **Policy Denied Audit Logs**: Records when a request is denied by an IAM policy.

## Best Practices for IAM Security
1.  **Least Privilege**: Grant only the necessary permissions to perform a task.
2.  **Use Predefined Roles**: Prefer predefined roles over primitive roles. Create custom roles only when predefined roles are insufficient.
3.  **Service Account Management**:
    *   Assign specific service accounts to specific applications/VMs.
    *   Do not reuse service accounts across different applications with different security requirements.
    *   Regularly audit service account permissions.
4.  **IAM Conditions**: Leverage IAM Conditions for temporary access or context-aware access.
5.  **Audit Logs**: Regularly monitor Audit Logs for unusual or unauthorized activity. Export logs to a SIEM for long-term analysis.
6.  **Multi-Factor Authentication (MFA)**: Enforce MFA for all user accounts, especially privileged ones.
7.  **Organization Policies**: Use Organization Policies to set guardrails and enforce compliance across your organization (e.g., restrict API usage, define allowed external IP ranges).
8.  **Regular Review**: Periodically review and revoke unnecessary IAM grants.

---
## Configuration Sample
Granting the `Storage Object Viewer` role to a user on a specific Cloud Storage bucket using `gcloud`:

```bash
gcloud storage buckets add-iam-policy-binding gs://my-unique-bucket-name \
    --member="user:john.doe@example.com" \
    --role="roles/storage.objectViewer"
```
This command ensures that `john.doe@example.com` can only view objects within `my-unique-bucket-name` and nothing else.

---
## Quick Understanding Checklist/Exercise

1.  **Scenario**: A new developer needs to deploy functions to Cloud Functions in a specific project. Which IAM role(s) would you recommend assigning, and why, adhering to the principle of least privilege?
2.  **Identify**: What is the primary difference between a `Google Account` and a `Service Account` in the context of IAM, and when would you use each?
3.  **Explain**: How do IAM Conditions enhance security compared to just using roles and members? Provide an example of a use case.
