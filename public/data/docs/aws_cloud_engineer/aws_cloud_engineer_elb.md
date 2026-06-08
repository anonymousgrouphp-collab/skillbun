# Elastic Load Balancing (ELB)

Elastic Load Balancing (ELB) automatically distributes incoming application traffic across multiple targets, such as Amazon EC2 instances, containers, IP addresses, or Lambda functions, in one or more Availability Zones. It increases the fault tolerance of your applications, improves scalability, and ensures high availability.

ELB offers three types of load balancers, each with specific use cases:

## 1. Application Load Balancer (ALB)

An ALB operates at **Layer 7** (the application layer) of the OSI model, routing HTTP/HTTPS traffic. It's ideal for modern applications, microservices, and container-based architectures.

### Key Features:
*   **Path-based routing:** Route requests to different target groups based on the URL path (`/users`, `/products`).
*   **Host-based routing:** Route requests based on the hostname in the HTTP header (`api.example.com`, `mobile.example.com`).
*   **Query string and HTTP header routing:** Advanced routing rules based on query parameters or custom HTTP headers.
*   **Sticky sessions:** Ensures requests from a user are routed to the same target for a consistent experience.
*   **Support for:** EC2 instances, containers (ECS, EKS), Lambda functions, and IP addresses as targets.

### Use Cases:
*   Load balancing for web applications and APIs.
*   Routing traffic to different microservices.
*   Serverless applications with Lambda.

## 2. Network Load Balancer (NLB)

An NLB operates at **Layer 4** (the transport layer) of the OSI model, routing TCP, UDP, and TLS traffic. It's designed for extreme performance and static IP address needs.

### Key Features:
*   **Ultra-high performance:** Capable of handling millions of requests per second with very low latency.
*   **Static IP addresses:** Provides static IP addresses for each Availability Zone, and supports Elastic IP addresses.
*   **Source IP preservation:** Preserves the client's source IP address.
*   **Support for:** EC2 instances and IP addresses as targets.

### Use Cases:
*   High-throughput, low-latency applications (gaming, IoT).
*   Applications requiring static IP addresses.
*   Load balancing non-HTTP/HTTPS protocols.

## 3. Gateway Load Balancer (GWLB)

A GWLB operates at **Layer 3** (the network layer) of the OSI model. It acts as a transparent network gateway and a single entry point for all traffic, distributing it to a fleet of virtual appliances (e.g., firewalls, intrusion detection/prevention systems).

### Key Features:
*   **Transparent network gateway:** All traffic passes through the GWLB to a fleet of appliances and then back to the GWLB before reaching its destination.
*   **GENEVE protocol:** Uses the Generic Network Virtualization Encapsulation (GENEVE) protocol to encapsulate and de-encapsulate traffic between the GWLB and its targets (virtual appliances).
*   **Scalability for appliances:** Scales appliance fleets elastically.

### Use Cases:
*   Centralized inspection of network traffic by third-party virtual appliances.
*   Deploying and scaling firewalls, intrusion detection systems, and deep packet inspection systems.

## Key ELB Components & Concepts

*   **Listeners:** Check for connection requests from clients, using the protocol and port that you configure. Listeners contain rules that determine how the load balancer routes requests to its registered targets.
*   **Target Groups:** Route requests to registered targets using the protocol and port that you specify. You can register targets such as EC2 instances or IP addresses to a target group.
*   **Health Checks:** Load balancers use health checks to monitor the health of registered targets, ensuring traffic is only sent to healthy instances.
*   **Cross-Zone Load Balancing:** Distributes traffic evenly across registered targets in all enabled Availability Zones, improving resilience.

## Configuration Example (Conceptual AWS CLI for ALB)

Here's a simplified conceptual workflow using the AWS CLI to set up an ALB:

```bash
# 1. Create a Target Group for your backend instances
aws elbv2 create-target-group \
  --name my-web-app-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxxxxxxxxxxxxxx \
  --health-check-protocol HTTP \
  --health-check-port 80 \
  --health-check-path /health \
  --target-type instance

# 2. Create an Application Load Balancer
aws elbv2 create-load-balancer \
  --name my-application-alb \
  --subnets subnet-xxxxxxxxxxxxxxxxx subnet-yyyyyyyyyyyyyyyyy \
  --security-groups sg-zzzzzzzzzzzzzzzzz \
  --scheme internet-facing \
  --type application

# (After creating, you would get the ALB's ARN, e.g., using 'aws elbv2 describe-load-balancers')
# For demonstration, let's assume ALB_ARN is obtained.

# 3. Create a Listener for the ALB
aws elbv2 create-listener \
  --load-balancer-arn "arn:aws:elasticloadbalancing:REGION:ACCOUNT_ID:loadbalancer/app/my-application-alb/1234567890abcdef" \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn="arn:aws:elasticloadbalancing:REGION:ACCOUNT_ID:targetgroup/my-web-app-tg/fedcba0987654321"

# 4. Register your instances with the Target Group
# aws elbv2 register-targets --target-group-arn "<TARGET_GROUP_ARN>" --targets Id=i-0abcdef1234567890 Id=i-0fedcba9876543210
```

## Quick Check/Exercise

1.  You have a containerized application running on Amazon ECS and need to route traffic based on URL paths. Which ELB type would you choose and why?
2.  What is the primary function of a Target Group in the context of AWS Elastic Load Balancing?
3.  Your security team requires all inbound and outbound network traffic to pass through a centralized firewall appliance. Which ELB type would facilitate this setup?
