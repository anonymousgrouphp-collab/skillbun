# AWS Compute Services: EC2, Elastic Load Balancing & Auto Scaling Study Guide

This guide explores the fundamental AWS compute services that form the backbone of scalable and highly available applications: Amazon EC2, Elastic Load Balancing, and Auto Scaling. Understanding these services is crucial for any AWS Cloud Engineer.

## 1. Amazon Elastic Compute Cloud (EC2)

Amazon EC2 provides scalable computing capacity in the AWS cloud. It allows you to launch virtual servers, known as *instances*, with various operating systems and software packages.

### Core Concepts:

*   **EC2 Instances:** Virtual machines that run your applications. You choose the instance type based on your CPU, memory, storage, and networking requirements.
*   **Instance Types:** Categorized by their purpose (e.g., `t` for burstable performance, `m` for general purpose, `c` for compute optimized, `r` for memory optimized, `g` for GPU instances).
*   **Amazon Machine Images (AMIs):** Templates that contain the software configuration (operating system, application server, applications) required to launch your instance. You can use AWS-provided AMIs, AWS Marketplace AMIs, or create your own.
*   **Elastic Block Store (EBS) Volumes:** Persistent block storage volumes for use with EC2 instances. They are network-attached and remain independent of the instance's lifecycle. Key types include `gp2`/`gp3` (general purpose SSD), `io1`/`io2` (provisioned IOPS SSD), and `st1`/`sc1` (HDD).
    *   **EBS Snapshots:** Point-in-time backups of EBS volumes, stored incrementally in S3.
*   **Security Groups:** Act as virtual firewalls for your instances, controlling inbound and outbound traffic at the instance level. They are stateful.
*   **Key Pairs:** Used for secure shell (SSH) access to Linux instances and RDP access to Windows instances. You generate a key pair and download the private key (.pem file) which is required to connect to the instance.
*   **User Data:** A script or configuration that runs when an EC2 instance is launched. Useful for automating setup tasks like installing software, updating packages, or starting services.

### Simple EC2 Launch Example (Conceptual)

To launch a basic web server on an EC2 instance, you would typically follow these steps:

1.  **Choose an AMI:** Select an Amazon Linux 2 AMI.
2.  **Choose an Instance Type:** Select `t2.micro` for cost-effectiveness.
3.  **Configure Instance Details:**
    *   Network: Select a VPC and subnet.
    *   Auto-assign Public IP: Enable.
    *   **User Data:** Provide a script to install and start a web server.
        ```bash
        #!/bin/bash
        sudo yum update -y
        sudo yum install -y httpd
        sudo systemctl start httpd
        sudo systemctl enable httpd
        echo "<h1>Hello from EC2!</h1>" | sudo tee /var/www/html/index.html
        ```
4.  **Add Storage:** Keep the default 8GB `gp2` root volume.
5.  **Configure Security Group:** Create a new security group allowing inbound traffic on port 22 (SSH) from your IP and port 80 (HTTP) from anywhere (0.0.0.0/0).
6.  **Review and Launch:** Select an existing key pair or create a new one.

## 2. Elastic Load Balancing (ELB)

Elastic Load Balancing automatically distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones. This increases the fault tolerance of your applications.

### ELB Types:

*   **Application Load Balancer (ALB):** Operates at the application layer (Layer 7). Ideal for HTTP and HTTPS traffic, offering advanced request routing capabilities based on URL path, host header, or query string parameters.
*   **Network Load Balancer (NLB):** Operates at the transport layer (Layer 4). Ideal for high-performance TCP, UDP, and TLS traffic where extreme performance and static IP addresses are required.
*   **Gateway Load Balancer (GWLB):** Operates at the network layer (Layer 3). Used for deploying, managing, and scaling third-party virtual appliances such as firewalls, intrusion detection systems, and deep packet inspection systems.

### Key Concepts:

*   **Listeners:** Check for connection requests from clients, using the protocol and port that you configure. For example, an HTTP listener on port 80.
*   **Target Groups:** Route requests to one or more registered targets (e.g., EC2 instances) using the protocol and port that you specify. Each target group can be associated with an Auto Scaling Group.
*   **Health Checks:** Automatically monitor the health of registered targets. If a target fails health checks, the load balancer stops routing traffic to it until it becomes healthy again.

## 3. Auto Scaling

AWS Auto Scaling helps you maintain application availability and allows you to automatically scale your EC2 capacity up or down according to conditions you define. This ensures you have the right number of EC2 instances available to handle the load for your application.

### Core Components:

*   **Auto Scaling Group (ASG):** A collection of EC2 instances that are treated as a logical grouping for the purposes of automatic scaling and management. An ASG maintains a specified number of instances.
    *   **Desired Capacity:** The number of instances the ASG should ideally have.
    *   **Minimum Capacity:** The smallest number of instances the ASG can scale down to.
    *   **Maximum Capacity:** The largest number of instances the ASG can scale up to.
*   **Launch Template/Configuration:** Specifies the instance configuration details for instances launched by the ASG (e.g., AMI ID, instance type, security groups, EBS volumes, user data).
    *   **Launch Templates** are preferred as they offer more features and integration with EC2 features.
*   **Scaling Policies:** Define when and how the ASG should scale.
    *   **Target Tracking Scaling:** Scales based on a target value for a specific metric (e.g., keep average CPU utilization at 70%).
    *   **Simple Scaling:** Scales based on a single CloudWatch alarm threshold (e.g., add 2 instances if CPU > 80%).
    *   **Step Scaling:** Scales based on a set of scaling adjustments that vary based on the size of the alarm breach.
    *   **Scheduled Scaling:** Scales based on a schedule (e.g., increase capacity every weekday morning).
*   **Health Checks:** Auto Scaling Groups perform health checks to determine if an instance is running correctly. If an instance becomes unhealthy, the ASG terminates it and launches a new one.

### How Auto Scaling Works with ELB:

ELB distributes traffic, and Auto Scaling adjusts the number of instances behind the ELB. When an ASG scales out, new instances are automatically registered with the associated ELB target group. When it scales in, instances are de-registered and terminated.

---

### Quick Understanding Checklist/Exercise:

1.  **Scenario:** You have a web application experiencing fluctuating traffic. During peak hours, it slows down significantly. During off-peak, many instances are idle. How would you combine ELB and Auto Scaling to address this, and which ELB type would you likely choose?
2.  **EC2 Troubleshooting:** Your EC2 instance is unreachable via SSH. List two common misconfigurations related to networking or security that could cause this issue.
3.  **Storage Choice:** You need persistent, high-performance block storage for a database running on an EC2 instance that requires consistent low-latency I/O. Which EBS volume type would you recommend and why?
