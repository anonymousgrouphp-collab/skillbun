# Azure Key Vault for Secrets Management

Azure Key Vault is a cloud service that provides a secure store for secrets, keys, and certificates. It helps solve the problem of managing sensitive information by centralizing storage, controlling access, and logging usage. This eliminates the need for developers to store sensitive data in application code or configuration files, enhancing security and compliance.

## 1. Core Concepts

*   **Vaults**: The secure containers where keys, secrets, and certificates are stored. Each vault is associated with an Azure subscription and a resource group.
*   **Secrets**: Small data blobs (e.g., passwords, connection strings, API keys) that are intended to be securely stored. Key Vault ensures that secrets are not directly exposed in plain text within applications or configurations.
*   **Keys**: Cryptographic keys used for encryption, decryption, signing, and verification. These can be hardware security module (HSM) protected or software-protected. Key Vault allows you to create new keys or import existing ones.
*   **Certificates**: X.509 certificates, which are often used for TLS/SSL, code signing, or other authentication scenarios. Key Vault allows you to create new certificates or import existing ones, and manage their lifecycle (renewal, revocation).

## 2. Key Features and Benefits

*   **Centralized Secure Storage**: Securely store and control access to sensitive data away from application code.
*   **Access Control**: Granular access policies (using Azure role-based access control or Key Vault access policies) to define who (users, applications, services) can perform which operations (get, list, set, delete) on secrets, keys, or certificates.
*   **Managed Identities for Azure Resources**: Allows Azure services (like Azure App Service, Azure Functions, Azure VMs) to authenticate to Key Vault and access secrets without explicit credentials in code. This is the recommended and most secure way to integrate.
*   **Monitoring and Auditing**: Key Vault logs all activities, providing a trail for auditing and monitoring. Integration with Azure Monitor and Azure Log Analytics allows for comprehensive logging and alerts.
*   **Soft-Delete and Purge Protection**: Prevents accidental deletion of vaults, keys, secrets, or certificates by retaining them for a configurable period (soft-delete) and providing an option to prevent permanent deletion (purge protection).
*   **Data Encryption**: All data stored in Key Vault is encrypted at rest using industry-standard algorithms.

## 3. Integrating with Applications

The most secure and recommended way for Azure applications to access secrets from Key Vault is using Managed Identities:

1.  **Enable Managed Identity**: Enable a System-Assigned or User-Assigned Managed Identity for your Azure service (e.g., App Service, VM, Function App).
2.  **Grant Access**: Grant the Managed Identity appropriate permissions to the Key Vault (e.g., "Get" and "List" secrets) using either an Azure Key Vault access policy or Azure RBAC roles.
3.  **Access Secrets in Code**: Use a Key Vault client library (e.g., Azure.Security.KeyVault.Secrets for .NET, `@azure/keyvault-secrets` for Node.js) to retrieve secrets. The client library will automatically use the Managed Identity to authenticate.

## 4. Practical Example: Storing and Retrieving a Secret with Azure CLI

This example demonstrates how to create a Key Vault, store a secret, and retrieve it using Azure CLI.

```bash
# 1. Sign in to Azure (if not already logged in)
az login

# 2. Set your default subscription (optional, but good practice)
az account set --subscription "<YOUR_SUBSCRIPTION_ID>"

# 3. Create a resource group (if you don't have one)
az group create --name "my-kv-resource-group" --location "eastus"

# 4. Create an Azure Key Vault
# Note: Vault names must be globally unique.
az keyvault create \
  --name "mySkillBunKeyVault12345" \
  --resource-group "my-kv-resource-group" \
  --location "eastus" \
  --sku "standard"

# 5. Store a secret in the Key Vault
az keyvault secret set \
  --vault-name "mySkillBunKeyVault12345" \
  --name "MyDatabaseConnectionString" \
  --value "Server=tcp:myserver.database.windows.net,1433;Database=mydb;User ID=myuser;Password=mysecretpassword;" \
  --tags "Environment=Development" "Owner=SkillBun"

# 6. Retrieve the secret from the Key Vault
az keyvault secret show \
  --vault-name "mySkillBunKeyVault12345" \
  --name "MyDatabaseConnectionString" \
  --query value \
  --output tsv

# Expected output (your connection string)
# Server=tcp:myserver.database.windows.net,1433;Database=mydb;User ID=myuser;Password=mysecretpassword;

# 7. (Optional) Delete the Key Vault
az keyvault delete --name "mySkillBunKeyVault12345" --resource-group "my-kv-resource-group"
```

## 5. Checklist/Exercise

1.  Explain the primary security advantage of using Azure Key Vault for application secrets compared to storing them in application configuration files.
2.  Describe how Managed Identities for Azure Resources simplifies and secures the process of an Azure Function App accessing a secret in Key Vault.
3.  Outline the high-level steps required to grant an Azure AD user access to retrieve certificates from an existing Azure Key Vault.
