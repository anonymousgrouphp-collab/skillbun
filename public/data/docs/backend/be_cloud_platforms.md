# Cloud Platforms (AWS/GCP/Azure) Study Guide

Cloud platforms have revolutionized how backend services are deployed, managed, and scaled. Understanding the core services across major providers like Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure is crucial for any modern backend developer.

## 1. Introduction to Cloud Platforms

Cloud computing delivers on-demand computing services—from applications to storage and processing power—typically over the internet with a pay-as-you-go pricing model. This eliminates the need for businesses to purchase, own, and maintain their own data centers and servers.

### Why Cloud?
*   **Scalability**: Easily scale resources up or down based on demand.
*   **Cost-Effectiveness**: Pay only for what you use, reducing capital expenditure.
*   **Reliability & Availability**: High uptime and disaster recovery options.
*   **Global Reach**: Deploy applications closer to users worldwide.
*   **Managed Services**: Focus on development, not infrastructure management.

## 2. Core Cloud Concepts

### Service Models
*   **IaaS (Infrastructure as a Service)**: Provides virtualized computing resources over the internet. You manage the OS, applications, and data. (e.g., EC2, GCE, Azure VMs)
*   **PaaS (Platform as a Service)**: Provides a platform allowing customers to develop, run, and manage applications without the complexity of building and maintaining the infrastructure. (e.g., AWS Elastic Beanstalk, Google App Engine, Azure App Service)
*   **SaaS (Software as a Service)**: Delivers software over the internet, typically on a subscription basis. Users just use the application. (e.g., Gmail, Salesforce, Dropbox)

### Regions and Availability Zones
*   **Regions**: Geographical areas where cloud providers have data centers. Each region is isolated to provide fault tolerance and stability.
*   **Availability Zones (AZs)**: Isolated locations within a region, designed to be independent of failures in other AZs. They provide high availability and fault tolerance within a single region.

## 3. Key Services Comparison

### 3.1. Compute Services (Virtual Machines)
These services provide virtual servers for running your backend applications. You have full control over the operating system and installed software.

*   **AWS: Elastic Compute Cloud (EC2)**
    *   Offers resizable compute capacity. Launch virtual servers (instances) with various operating systems.
    *   Key concepts: Instances, Amazon Machine Images (AMIs), Security Groups (firewall rules), Elastic IPs.
*   **GCP: Google Compute Engine (GCE)**
    *   Scalable, high-performance virtual machines.
    *   Key concepts: VM Instances, Custom Machine Images, Firewall Rules.
*   **Azure: Azure Virtual Machines (VMs)**
    *   On-demand, scalable compute resources.
    *   Key concepts: Virtual Machines, VM Images, Network Security Groups (NSGs).

### 3.2. Storage Services (Object Storage)
Used for storing unstructured data like images, videos, backups, static website content, and application binaries. Highly scalable and durable.

*   **AWS: Simple Storage Service (S3)**
    *   Object storage with high scalability, data availability, security, and performance. Data is stored in "buckets".
    *   Key concepts: Buckets, Objects, Access Control Lists (ACLs), Bucket Policies.
*   **GCP: Google Cloud Storage (GCS)**
    *   Unified object storage for developers and enterprises. Data is stored in "buckets".
    *   Key concepts: Buckets, Objects, Access Control.
*   **Azure: Blob Storage**
    *   Optimized for storing massive amounts of unstructured data. Data is stored in "containers" as "blobs".
    *   Key concepts: Storage Accounts, Containers, Blobs.

### 3.3. Networking Services (Virtual Networks)
These services enable you to define your own isolated network in the cloud, allowing your cloud resources to communicate securely.

*   **AWS: Virtual Private Cloud (VPC)**
    *   Logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define.
    *   Key concepts: Subnets, Route Tables, Internet Gateway, Network ACLs, Security Groups.
*   **GCP: Virtual Private Cloud (VPC)**
    *   Global networking that connects resources across multiple regions.
    *   Key concepts: Subnets, Firewall Rules, Routes.
*   **Azure: Virtual Network (VNet)**
    *   Enables many types of Azure resources to securely communicate with each other, the internet, and on-premises networks.
    *   Key concepts: Subnets, Network Security Groups (NSGs), Route Tables.

### 3.4. Identity and Access Management (IAM)
Manages who has authentication and authorization to use cloud resources. Critical for security.

*   **AWS IAM**:
    *   Manage access to AWS services and resources securely.
    *   Key concepts: Users, Groups, Roles, Policies (JSON documents defining permissions).
*   **GCP IAM**:
    *   Defines who (member) has what access (role) for which resource.
    *   Key concepts: Members (users, service accounts), Roles, Policies.
*   **Azure AD / Azure IAM**:
    *   Azure Active Directory (Azure AD) is the multi-tenant, cloud-based directory and identity management service. Azure IAM uses Role-Based Access Control (RBAC).
    *   Key concepts: Users, Groups, Service Principals, Roles, Role Definitions.

### 3.5. Managed Database Services
These services manage the operational aspects of a database (provisioning, patching, backups, etc.), allowing developers to focus on schema and application logic.

*   **AWS: Relational Database Service (RDS)**
    *   Managed relational databases (MySQL, PostgreSQL, Oracle, SQL Server, MariaDB, Aurora).
    *   Key concepts: Database Instances, Read Replicas, Multi-AZ deployments.
*   **GCP: Cloud SQL**
    *   Fully managed relational database service (MySQL, PostgreSQL, SQL Server).
    *   Key concepts: Instances, Backups, Replication.
*   **Azure: Azure SQL Database / Azure Database for (MySQL/PostgreSQL)**
    *   Managed relational database as a service (SQL Server, MySQL, PostgreSQL).
    *   Key concepts: Servers, Databases, Geo-replication.

## 4. Simple Configuration Example (Conceptual)

Deploying a simple web API often involves:
1.  **Compute**: A virtual machine (EC2/GCE/VM) to run the API code (e.g., Node.js, Python Flask).
2.  **Database**: A managed relational database (RDS/Cloud SQL/Azure SQL DB) to store application data.
3.  **Storage**: Object storage (S3/GCS/Blob Storage) for static assets or user-uploaded files.
4.  **Networking**: A virtual private network (VPC/VPC/VNet) to ensure secure communication between the VM and the database, with appropriate firewall rules.
5.  **IAM**: Roles/policies defining permissions for the VM to access the database and storage.

A very basic example using AWS CLI to upload a file to S3:
```bash
# First, ensure your AWS CLI is configured with credentials and a default region.
# Create a new S3 bucket (bucket names must be globally unique)
aws s3 mb s3://my-skillbun-backend-data-bucket-12345

# Create a sample text file
echo "Hello from SkillBun Backend!" > hello.txt

# Upload the file to the bucket
aws s3 cp hello.txt s3://my-skillbun-backend-data-bucket-12345/data/hello.txt

# List contents of the bucket (optional verification)
aws s3 ls s3://my-skillbun-backend-data-bucket-12345/data/
```
This demonstrates interacting with a core cloud storage service. Similar operations exist for GCP (gsutil) and Azure (az storage).

## 5. Quick Check-up / Exercises

1.  **Identify the right service**: If you need to run a custom Python Flask application on a virtual server, which compute service would you primarily use on AWS, GCP, and Azure, respectively?
2.  **Secure communication**: How would you ensure that your backend application running on an EC2 instance can only communicate with its designated RDS database instance within AWS, and not with the public internet directly? Name two networking/security components.
3.  **Data storage**: You need to store millions of user-uploaded profile pictures and ensure high durability and availability. Which storage service (by type and name) would be most suitable on any of the three cloud platforms?
