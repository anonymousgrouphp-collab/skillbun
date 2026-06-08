# Cloud Security Fundamentals

Welcome to the Cloud Security Fundamentals module, an essential component of the Cybersecurity Specialist roadmap. In today's interconnected world, cloud computing has become ubiquitous, making a robust understanding of cloud security indispensable for any cybersecurity professional. This guide will introduce you to the core concepts of cloud computing, security models, common challenges, and fundamental security controls within leading cloud platforms like AWS and Azure.

## 1. Cloud Computing Models

Cloud computing offers various service models, each defining a different level of management responsibility shared between the cloud provider and the consumer.

### 1.1. Infrastructure as a Service (IaaS)
IaaS provides virtualized computing resources over the internet. You get the raw infrastructure – virtual machines, storage, networks, and operating systems – but you are responsible for managing the operating system, applications, and data.
*   **Examples:** Amazon EC2, Azure Virtual Machines, Google Compute Engine.
*   **You manage:** Applications, Data, Runtime, OS, Middleware.
*   **Provider manages:** Virtualization, Servers, Storage, Networking.

### 1.2. Platform as a Service (PaaS)
PaaS offers a complete development and deployment environment in the cloud, with resources that enable you to deliver everything from simple cloud-based apps to sophisticated, cloud-enabled enterprise applications. The provider manages the underlying infrastructure, operating systems, and middleware.
*   **Examples:** AWS Elastic Beanstalk, Azure App Service, Google App Engine, Heroku.
*   **You manage:** Applications, Data.
*   **Provider manages:** Runtime, OS, Middleware, Virtualization, Servers, Storage, Networking.

### 1.3. Software as a Service (SaaS)
SaaS delivers fully functional applications over the internet, typically on a subscription basis. Users simply access the software via a web browser or client application; they do not manage any infrastructure, platforms, or even application settings beyond user-specific configurations.
*   **Examples:** Salesforce, Gmail, Microsoft 365, Dropbox.
*   **You manage:** (User-specific configuration).
*   **Provider manages:** Applications, Data, Runtime, OS, Middleware, Virtualization, Servers, Storage, Networking.

## 2. Cloud Deployment Models

Cloud services can be deployed in different environments based on ownership, scale, and access.

### 2.1. Public Cloud
Services are delivered over the public internet and can be used by anyone who wants to purchase them. It's owned and operated by a third-party cloud service provider.
*   **Characteristics:** High scalability, cost-effectiveness, shared infrastructure.
*   **Examples:** AWS, Microsoft Azure, Google Cloud Platform.

### 2.2. Private Cloud
Cloud infrastructure is operated exclusively for a single organization. It can be physically located on-premises or hosted by a third-party service provider.
*   **Characteristics:** Greater control, enhanced security, dedicated resources.

### 2.3. Hybrid Cloud
A combination of two or more distinct cloud infrastructures (public, private) that remain unique entities but are bound together by proprietary technology or standardized technology that enables data and application portability.
*   **Characteristics:** Flexibility, optimized cost, enhanced security for sensitive data.

## 3. The Shared Responsibility Model

A cornerstone of cloud security, the Shared Responsibility Model defines what the cloud provider is responsible for and what the customer is responsible for. It's often summarized as:

*   **Cloud Provider:** Responsible for **Security *of* the Cloud** (e.g., physical security of data centers, hardware, global infrastructure, network infrastructure, virtualization).
*   **Customer:** Responsible for **Security *in* the Cloud** (e.g., customer data, applications, operating systems, network configuration, client-side encryption, server-side encryption, identity and access management).

The exact demarcation of responsibilities varies depending on the cloud service model (IaaS, PaaS, SaaS).

| Responsibility Area        | IaaS                  | PaaS                  | SaaS                                |
| :------------------------- | :-------------------- | :-------------------- | :---------------------------------- |
| **Physical Infrastructure**| Provider              | Provider              | Provider                            |
| **Virtualization Layer**   | Provider              | Provider              | Provider                            |
| **Operating System**       | Customer              | Provider              | Provider                            |
| **Applications/Runtime**   | Customer              | Provider              | Provider                            |
| **Data & Configuration**   | Customer              | Customer              | Customer (access, classification)   |
| **Network Configuration**  | Customer              | Customer              | Provider (with customer input/rules)|
| **Identity & Access Mgmt** | Customer              | Customer              | Customer                            |

## 4. Common Cloud Security Challenges

Organizations face unique security challenges when moving to the cloud:

*   **Data Breaches:** Unauthorized access to sensitive data due to misconfigurations, weak access controls, or vulnerabilities.
*   **Misconfigurations:** Incorrectly configured services (e.g., publicly exposed storage buckets, insecure network settings) are a leading cause of breaches.
*   **Insecure APIs:** Cloud services rely heavily on APIs for management; insecure APIs can be exploited.
*   **Identity and Access Management (IAM) Issues:** Weak authentication, excessive permissions, or poor credential management.
*   **Lack of Visibility:** Difficulty in monitoring and auditing cloud resources, leading to blind spots.
*   **Compliance & Governance:** Ensuring adherence to regulatory requirements across diverse cloud environments.

## 5. Basic Security Controls in Major Cloud Providers

Understanding and implementing fundamental security controls is crucial.

### 5.1. AWS Security Controls

*   **Identity and Access Management (IAM):**
    *   Manages access to AWS services and resources securely.
    *   **Users:** Individual entities representing people or applications.
    *   **Groups:** Collections of IAM users, making it easier to manage permissions for multiple users.
    *   **Roles:** Identities with specific permissions that can be assumed by trusted entities (users, services, or applications).
    *   **Policies:** JSON documents defining permissions.
    *   *Example (IAM Policy for S3 read-only access):*
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
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
              ]
            }
          ]
        }
        ```
*   **Security Groups:**
    *   Act as virtual firewalls for EC2 instances, controlling inbound and outbound traffic at the instance level.
    *   You define rules that allow or deny traffic based on protocol, port, and source/destination IP address.
*   **S3 Security:**
    *   **Bucket Policies:** JSON-based policies attached to S3 buckets to define permissions for users and services.
    *   **Access Control Lists (ACLs):** Legacy mechanism for bucket and object permissions.
    *   **Encryption:** Server-side (SSE-S3, SSE-KMS, SSE-C) and client-side encryption options for data at rest.
    *   **Block Public Access:** A suite of settings to prevent public access to S3 buckets, highly recommended for most use cases.

### 5.2. Azure Security Controls

*   **Azure Active Directory (Azure AD):**
    *   Microsoft's cloud-based identity and access management service.
    *   Provides single sign-on (SSO), multi-factor authentication (MFA), and conditional access policies for users and applications.
    *   Manages access to Azure resources, Microsoft 365, and thousands of SaaS applications.
*   **Network Security Groups (NSGs):**
    *   Similar to AWS Security Groups, NSGs filter network traffic to and from Azure resources in a virtual network.
    *   You define inbound and outbound security rules allowing or denying traffic based on source, destination, port, and protocol.
    *   *Example (NSG Rule for allowing SSH traffic):*
        ```json
        {
          "name": "AllowSSH",
          "properties": {
            "priority": 100,
            "direction": "Inbound",
            "access": "Allow",
            "protocol": "Tcp",
            "sourcePortRange": "*",
            "destinationPortRange": "22",
            "sourceAddressPrefix": "0.0.0.0/0",
            "destinationAddressPrefix": "*"
          }
        }
        ```
        *(Note: In a real-world scenario, `sourceAddressPrefix` "0.0.0.0/0" should be narrowed down to specific trusted IP ranges for SSH.)*

## Quick Understanding Checklist/Exercise

1.  **Differentiate:** Explain the key difference in customer responsibility between IaaS, PaaS, and SaaS models. Provide one example for each model.
2.  **Shared Responsibility:** A company hosts its website on AWS EC2. A hacker exploits an unpatched vulnerability in the operating system of the EC2 instance. According to the Shared Responsibility Model, whose responsibility was it to patch the OS, the customer's or AWS's? Justify your answer.
3.  **Mitigation:** You discover that an AWS S3 bucket containing sensitive customer data is publicly accessible. What immediate security control would you implement to mitigate this risk, and why?
