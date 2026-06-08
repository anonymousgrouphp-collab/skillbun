# Azure Identity & Access Management Study Guide

## 1. Introduction to Azure Identity & Access Management (IAM)
Azure Identity & Access Management (IAM) is the framework of policies and technologies that ensures the appropriate users have the right access to technology resources. In Azure, IAM is crucial for securing your cloud environment, complying with regulations, and managing access to your valuable resources efficiently. It adheres to principles like 'least privilege' (granting only the necessary permissions) and 'separation of duties'.

## 2. Azure Active Directory (Azure AD / Microsoft Entra ID)
**Azure Active Directory (now Microsoft Entra ID)** is Microsoft's cloud-based identity and access management service. It provides a comprehensive solution for managing users, groups, devices, and applications, enabling secure access to both cloud and on-premises resources.

### Key Features:
*   **Single Sign-On (SSO):** Users can access multiple applications and services with a single set of credentials.
*   **Multi-Factor Authentication (MFA):** Adds an extra layer of security by requiring two or more verification methods.
*   **Device Management:** Register and manage devices to control access based on device state.
*   **Application Management:** Securely integrate and manage access to thousands of SaaS applications and custom line-of-business apps.
*   **Hybrid Identity:** Synchronize on-premises Active Directory identities to Azure AD using Azure AD Connect, creating a unified identity experience.

### Users and Groups
Azure AD allows you to create and manage user accounts and groups. Groups simplify access management by allowing you to assign permissions to a collection of users rather than individually.

### Application Registrations
For applications to authenticate with Azure AD and access protected resources, they must be registered in Azure AD. This process provides the application with an identity (Application ID) and enables it to obtain tokens for authentication.

## 3. Azure Role-Based Access Control (RBAC)
Azure Role-Based Access Control (RBAC) is the authorization system you use to manage who has access to Azure resources, what they can do with those resources, and what areas they have access to. RBAC is a fundamental component of Azure's security model, offering fine-grained control over resource access.

### Core Components:
*   **Security Principal (Who):** An object that represents an identity requesting access to an Azure resource. This can be a user, group, service principal (for applications), or a managed identity.
*   **Role Definition (What):** A collection of permissions. Azure provides many built-in roles (e.g., Owner, Contributor, Reader, User Access Administrator), and you can also create custom roles.
*   **Scope (Where):** The set of resources to which the access applies. This can be a subscription, a resource group, or an individual resource.

### How RBAC Assignments Work
An RBAC assignment combines a security principal, a role definition, and a scope to grant permissions. The structure is typically expressed as: `<Security Principal> has <Role Definition> over <Scope>`.

## 4. Managed Identities for Azure Resources
Managed Identities simplify identity management for applications running on Azure. They provide an automatically managed identity in Azure AD for Azure services, eliminating the need for developers to manage credentials (like connection strings or secrets) for authentication when accessing other Azure services (e.g., Azure Key Vault, Azure Storage).

### Benefits:
*   No need to manage credentials yourself.
*   Automatically rotates credentials.
*   Works with services that support Azure AD authentication.

### Types:
*   **System-assigned managed identity:** Directly tied to the lifecycle of an Azure resource (e.g., a Virtual Machine or Azure Function). When the resource is deleted, the identity is also deleted.
*   **User-assigned managed identity:** A standalone Azure resource that can be assigned to multiple Azure resources. It has its own lifecycle separate from the resources it's assigned to.

## 5. Azure Conditional Access
Azure Conditional Access is a powerful tool used with Azure AD to enforce policies based on specific conditions to grant or block access to resources. It enables organizations to ensure that only trusted users, accessing from trusted devices, and from trusted locations, can access company resources.

### Policy Components:
*   **Users and Groups:** Who the policy applies to.
*   **Cloud apps or actions:** What resources or actions the policy protects.
*   **Conditions:** When the policy applies (e.g., user risk, sign-in risk, device platform, location, client apps).
*   **Grant/Block Controls:** What happens if the conditions are met (e.g., block access, require MFA, require device to be marked as compliant).

## 6. Azure Privileged Identity Management (PIM)
Azure Privileged Identity Management (PIM) is a service within Azure AD that manages, controls, and monitors access to important resources in Azure AD, Azure, and other Microsoft services. PIM minimizes the attack surface by reducing the time users spend in privileged roles.

### Key Features:
*   **Just-in-Time (JIT) access:** Grant elevated access temporarily, reducing the window of opportunity for malicious actors.
*   **Approval workflows:** Require approval for role activation.
*   **Role activation requirements:** Enforce MFA or justify activation.
*   **Auditing and review history:** Track privileged role usage and run access reviews.

## 7. Authentication vs. Authorization
It's important to distinguish between these two core IAM concepts:
*   **Authentication:** The process of verifying the identity of a user or service. It answers the question, "Who are you?" (e.g., by checking a username and password, or an MFA code).
*   **Authorization:** The process of determining what an authenticated user or service is allowed to do. It answers the question, "What are you allowed to do?" (e.g., using RBAC to define permissions).

## Configuration Sample: Assigning a Role using Azure CLI

To assign the 'Contributor' role to a specific user for a resource group:

```bash
az role assignment create --assignee "user@example.com" \
                          --role "Contributor" \
                          --resource-group "myResourceGroup"
```

To assign a 'Reader' role to a system-assigned managed identity of an Azure Virtual Machine, allowing it to read secrets from a Key Vault:

```bash
# First, get the principal ID of the VM's system-assigned managed identity
VM_PRINCIPAL_ID=$(az vm identity show --name myVM --resource-group myVMResourceGroup --query principalId --output tsv)

# Then assign the 'Reader' role to the Key Vault scope
az role assignment create --assignee $VM_PRINCIPAL_ID \
                          --role "Reader" \
                          --scope "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/myKeyVaultResourceGroup/providers/Microsoft.KeyVault/vaults/myKeyVaultName"
```
*(Remember to replace `user@example.com`, `myResourceGroup`, `myVM`, `myVMResourceGroup`, `YOUR_SUBSCRIPTION_ID`, `myKeyVaultResourceGroup`, and `myKeyVaultName` with your actual values.)*

## Quick Check / Exercise

1.  **Scenario:** Your organization needs to ensure that administrative users accessing Azure resources from outside the corporate network are always prompted for Multi-Factor Authentication. Which Azure IAM feature would you configure to achieve this, and what conditions and controls would you set?
2.  **Difference:** You've been asked to explain the difference between a 'Security Principal' and a 'Role Definition' in Azure RBAC. How would you describe each, and how do they work together to grant access?
3.  **Credential Management:** An Azure Web App needs to store sensitive connection strings to a backend database, but you want to avoid hardcoding these credentials in the application's code or configuration files. Describe how you would use an Azure Key Vault along with a Managed Identity for the Web App to securely manage and retrieve these connection strings without manual credential handling.