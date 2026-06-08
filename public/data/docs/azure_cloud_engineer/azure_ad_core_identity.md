# Study Guide: Azure Active Directory Fundamentals

This guide introduces the core concepts of Azure Active Directory (Azure AD), a critical component for identity and access management (IAM) in the Microsoft Azure ecosystem. You'll learn about managing users, groups, and devices, and how to configure enterprise applications for Single Sign-On (SSO).

## 1. Introduction to Azure Active Directory (Azure AD)

Azure Active Directory is Microsoft's cloud-based identity and access management service. It helps your employees sign in and access internal and external resources.

*   **Cloud-Native IAM:** Unlike traditional Windows Server Active Directory, which is typically deployed on-premises, Azure AD is a multi-tenant, cloud-based directory service.
*   **Key Capabilities:**
    *   **Authentication:** Verifies user identities (e.g., passwords, multi-factor authentication).
    *   **Authorization:** Determines what resources authenticated users can access.
    *   **Single Sign-On (SSO):** Allows users to log in once and access multiple connected applications.
    *   **Device Management:** Manages identities for devices accessing corporate resources.
    *   **Application Management:** Integrates with thousands of SaaS applications and custom line-of-business apps.

### Azure AD vs. Windows Server Active Directory

| Feature                  | Windows Server Active Directory (On-Premises)         | Azure Active Directory (Cloud)                           |
| :----------------------- | :---------------------------------------------------- | :------------------------------------------------------- |
| **Deployment**           | On-premises servers                                   | Cloud-based (Microsoft-managed infrastructure)           |
| **Primary Protocol**     | Kerberos, NTLM, LDAP                                  | OAuth 2.0, OpenID Connect, SAML, REST                    |
| **Primary Use Case**     | Network domain services, device management, group policy for corporate network | Cloud application access, modern authentication, SaaS SSO |
| **Domain Join**          | Traditional domain join                               | Azure AD Join, Azure AD Register, Hybrid Azure AD Join   |
| **Synchronization**      | Azure AD Connect for hybrid identity                  | N/A (Cloud-native)                                       |

## 2. Azure AD Tenants and Subscriptions

*   **Azure AD Tenant:** A dedicated instance of Azure AD for an organization. When you sign up for a Microsoft cloud service (like Azure, Microsoft 365, or Intune), an Azure AD tenant is automatically created. It serves as a container for users, groups, applications, and devices.
*   **Relationship with Azure Subscriptions:** An Azure subscription is linked to an Azure AD tenant, which is used for authentication and authorization to access Azure resources within that subscription. Multiple subscriptions can trust the same Azure AD tenant.

## 3. Managing Users and Groups

### Users

Azure AD stores information about users who need to access resources.

*   **User Types:**
    *   **Member Users:** Users internal to your organization (e.g., employees). These can be cloud-only or synchronized from an on-premises AD.
    *   **Guest Users (B2B Collaboration):** External users invited from other Azure AD tenants or consumer accounts (e.g., Gmail, Outlook.com).
*   **Creating a New User (Azure Portal):**
    ```
    1. Navigate to the Azure portal.
    2. Search for and select "Azure Active Directory".
    3. Under "Manage", select "Users".
    4. Click "New user" -> "Create new user".
    5. Fill in required details like User principal name (UPN), Display name, and password.
    ```

### Groups

Groups in Azure AD are used to manage access to resources more efficiently than assigning permissions to individual users.

*   **Types of Groups:**
    *   **Security Groups:** Used to manage access to Azure resources, applications, and shared resources.
    *   **Microsoft 365 Groups:** Provide collaboration capabilities (shared mailbox, calendar, SharePoint site, Teams) in addition to access management.
*   **Creating a New Security Group (Azure Portal):**
    ```
    1. Navigate to Azure Active Directory -> "Groups".
    2. Click "New group".
    3. Select "Security" as the Group type.
    4. Provide a Group name and Group description.
    5. Add members to the group.
    ```

## 4. Managing Devices

Azure AD device management ensures that devices accessing your resources meet security and compliance standards.

*   **Device States:**
    *   **Azure AD Registered:** Personal devices (BYOD) that are registered with Azure AD without joining the organization's domain. Provides users with SSO to cloud resources and allows for Conditional Access policies.
    *   **Azure AD Joined:** Devices owned by the organization that are joined directly to Azure AD. Best for cloud-native organizations or users primarily accessing cloud resources. Provides SSO, Conditional Access, and device management via Intune.
    *   **Hybrid Azure AD Joined:** Devices owned by the organization that are joined to an on-premises Active Directory and simultaneously registered with Azure AD. Common in hybrid environments to manage devices both on-premises and in the cloud.

## 5. Enterprise Applications and Single Sign-On (SSO)

Enterprise applications in Azure AD represent SaaS applications (e.g., Salesforce, ServiceNow) or custom line-of-business applications that your organization uses.

*   **Purpose:**
    *   **Centralized Identity:** Manage user access to various applications from a single location.
    *   **Single Sign-On (SSO):** Allow users to access multiple applications with a single set of credentials. This improves user experience and security.
*   **How SSO Works (Briefly):**
    *   When a user tries to access an enterprise application, Azure AD acts as the identity provider (IdP).
    *   The application (service provider, SP) redirects the user's authentication request to Azure AD.
    *   Azure AD authenticates the user and then sends a security token (e.g., SAML assertion, OpenID Connect ID token) back to the application.
    *   The application validates the token and grants access to the user.
*   **Configuring an Enterprise Application for SSO (Basic Steps):**
    ```
    1. Navigate to Azure Active Directory -> "Enterprise applications".
    2. Click "New application".
    3. Choose to add an application from the gallery (recommended for SaaS apps) or create your own.
    4. Once added, configure the "Single sign-on" method (e.g., SAML, Password-based, OAuth/OpenID Connect). For SAML, you'll typically configure basic SAML configuration (identifier, reply URL) and user attributes & claims.
    5. Assign users and groups to the application to control who can access it.
    ```

## Quick Check / Exercise

1.  Explain the key differences between a device that is **Azure AD Joined** and one that is **Hybrid Azure AD Joined**. In which scenario would you typically use each?
2.  Your organization wants to allow external contractors to access a specific SharePoint Online site. Which type of user account in Azure AD would be most appropriate, and what is its primary benefit?
3.  Describe the main purpose of "Enterprise Applications" in Azure AD and how they facilitate **Single Sign-On (SSO)** for cloud applications.
