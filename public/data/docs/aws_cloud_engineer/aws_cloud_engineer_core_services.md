# Core AWS Services & Infrastructure Study Guide

Welcome to the foundational module on Core AWS Services & Infrastructure. This guide is designed to equip you with a deep understanding of the fundamental building blocks of AWS, focusing on their architecture, configuration, and best practices for creating a robust cloud presence.

## 1. Introduction to Core AWS Services

Amazon Web Services (AWS) offers a vast array of cloud services. Understanding the core services is crucial for anyone building, managing, or optimizing applications in the AWS cloud. These services form the backbone of nearly every cloud solution, providing compute, storage, networking, database, and identity management capabilities.

## 2. Fundamental AWS Concepts

Before diving into specific services, it's vital to grasp these overarching concepts:

*   **Regions and Availability Zones (AZs):**
    *   **Regions:** Geographic areas containing multiple, isolated locations. Each region is completely independent. Choosing a region typically depends on latency, cost, and compliance requirements.
    *   **Availability Zones (AZs):** Isolated locations within a region. Each AZ consists of one or more data centers, designed to be isolated from failures in other AZs. They provide high availability and fault tolerance for your applications.
*   **Shared Responsibility Model:**
    *   **AWS's Responsibility (Security *of* the Cloud):** AWS is responsible for protecting the infrastructure that runs all of the services offered in the AWS Cloud. This includes the physical facilities, network infrastructure, hardware, and global infrastructure.
    *   **Customer's Responsibility (Security *in* the Cloud):** You are responsible for security *in* the cloud. This includes operating system patching, network configuration, client-side data encryption, server-side encryption, and protecting your credentials.
*   **High Availability & Fault Tolerance:**
    *   **High Availability:** Designing systems to be available as much as possible, minimizing downtime. Often achieved by distributing resources across multiple AZs.
    *   **Fault Tolerance:** The ability of a system to continue operating without interruption in the event of component failure. Achieved through redundancy and automatic failover mechanisms.
*   **Scalability & Elasticity:**
    *   **Scalability:** The ability of a system to handle a growing amount of work by adding resources (vertical scaling: increasing instance size; horizontal scaling: adding more instances).
    *   **Elasticity:** The ability to acquire and release resources dynamically as demand fluctuates, paying only for what you use. This is a key advantage of cloud computing.

## 3. Essential Core AWS Services

### 3.1. Compute Services

*   **Amazon EC2 (Elastic Compute Cloud):** Provides resizable compute capacity in the cloud. It's like having virtual servers that you can spin up and down as needed.
    *   **Key Components:** Instances (virtual machines), Amazon Machine Images (AMIs), Instance Types, Security Groups (firewall at instance level), Key Pairs, Elastic Block Store (EBS) volumes.

### 3.2. Storage Services

*   **Amazon S3 (Simple Storage Service):** An object storage service offering industry-leading scalability, data availability, security, and performance.
    *   **Key Components:** Buckets (containers for objects), Objects (files), Versioning, Lifecycle Policies, Storage Classes (e.g., Standard, Intelligent-Tiering, Glacier).
*   **Amazon EBS (Elastic Block Store):** Provides persistent block storage volumes for use with Amazon EC2 instances.
    *   **Key Components:** Volumes (attached to instances), Snapshots (point-in-time backups).

### 3.3. Networking Services

*   **Amazon VPC (Virtual Private Cloud):** Allows you to provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define.
    *   **Key Components:** Subnets (public/private), Route Tables, Internet Gateway (for internet access), NAT Gateway (for private subnet instances to access the internet), Network ACLs (stateless firewall at subnet level), Security Groups (stateful firewall at instance/ENI level).

### 3.4. Database Services

*   **Amazon RDS (Relational Database Service):** Makes it easy to set up, operate, and scale a relational database in the cloud. Supports popular engines like MySQL, PostgreSQL, SQL Server, Oracle, and Amazon Aurora.
*   **Amazon DynamoDB:** A fast and flexible NoSQL database service for all applications that need consistent, single-digit-millisecond latency at any scale.

### 3.5. Security, Identity, & Compliance

*   **AWS IAM (Identity and Access Management):** Enables you to securely control access to AWS services and resources.
    *   **Key Components:** Users (for individuals), Groups (collections of users), Roles (for temporary permissions to AWS services or trusted entities), Policies (JSON documents defining permissions).

## 4. Configuration Example: Securing an S3 Bucket with a Policy

Here's a basic example of an S3 bucket policy that grants public read access to objects within a specified bucket. This is illustrative for public content, but for most applications, S3 buckets should be private and accessed via IAM roles.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-unique-bucket-name/*"
    }
  ]
}
```

*   **`Version`**: The policy language version.
*   **`Statement`**: An array of individual policy statements.
*   **`Sid`**: Optional statement ID.
*   **`Effect`**: Whether the statement `Allow`s or `Deny`s access.
*   **`Principal`**: Who is allowed or denied access (`"*"` means everyone).
*   **`Action`**: The specific S3 API action allowed (`s3:GetObject` allows downloading objects).
*   **`Resource`**: The AWS resource to which the action applies (`arn:aws:s3:::your-unique-bucket-name/*` refers to all objects in the specified bucket).

## 5. Best Practices for Infrastructure Design

*   **Security First:** Implement the principle of least privilege with IAM. Encrypt data at rest and in transit. Use Security Groups and Network ACLs effectively.
*   **Cost Optimization:** Monitor resource usage, right-size instances, leverage Reserved Instances or Savings Plans, and delete unused resources.
*   **Automation:** Utilize Infrastructure as Code (IaC) tools like AWS CloudFormation or Terraform to define and manage your infrastructure, ensuring consistency and repeatability.
*   **Monitoring & Logging:** Implement AWS CloudWatch and CloudTrail to monitor your resources and track API calls for security and operational insights.

## 6. Quick Check / Exercises

1.  You are designing an application that requires high availability across different physical locations within the same AWS Region. Which AWS concept would you leverage, and why?
2.  Your development team needs to deploy a simple web application that serves static HTML, CSS, and JavaScript files. Which AWS storage service is the most cost-effective and suitable for this task, and what are its key advantages?
3.  Explain the key difference between a Security Group and a Network ACL in AWS VPC, and describe a scenario where you might use both simultaneously.