# Core Networking Fundamentals for Cloud Architects

Understanding networking is paramount for any cloud architect. Cloud environments abstract much of the underlying physical network, but the principles remain the same. This guide covers the essential networking components you'll encounter across major cloud providers (AWS, Azure, GCP).

## 1. Virtual Private Clouds (VPCs) / Virtual Networks (VNets)

At the heart of cloud networking lies the concept of an isolated network space.

*   **Definition:** A logically isolated section of the cloud where you launch your cloud resources. It's like having your own data center in the cloud, completely separate from others.
*   **Key Features:**
    *   **Isolation:** Resources in one VPC/VNet cannot directly communicate with resources in another unless explicitly configured.
    *   **IP Address Range:** You define a private IP address range using Classless Inter-Domain Routing (CIDR) notation (e.g., `10.0.0.0/16`). This range determines all available IP addresses within your VPC/VNet.

## 2. Subnets

Subnets allow you to segment your VPC/VNet's IP address range into smaller, manageable networks.

*   **Definition:** A subdivision of a VPC/VNet's IP address range. Resources are launched into specific subnets.
*   **Availability Zones:** Subnets are typically associated with a single Availability Zone (AZ) or Region, providing fault isolation.
*   **Types:**
    *   **Public Subnet:** Resources in this subnet can directly access the internet via an Internet Gateway. They often host public-facing resources like web servers.
    *   **Private Subnet:** Resources in this subnet do *not* have direct access to the internet. They are typically used for backend services, databases, or application servers that should not be publicly exposed. They can still access the internet through a NAT Gateway.

## 3. IP Addressing

Cloud resources use various types of IP addresses for communication.

*   **Private IP Address:**
    *   Assigned to instances within your VPC/VNet.
    *   Used for communication *within* your private network.
    *   Not routable over the public internet.
*   **Public IP Address:**
    *   Allows direct communication with the internet.
    *   Assigned to instances in public subnets (or resources needing internet access).
    *   Dynamic by default (changes on stop/start) or static (Elastic IP in AWS, Static Public IP in Azure/GCP).
*   **Elastic IP (AWS Specific):** A static, public IPv4 address that you can associate with any instance or network interface in a specific region. It remains constant even if the associated instance is stopped or terminated, making it ideal for stable public endpoints.

## 4. Route Tables

Route tables determine where network traffic from your subnets is directed.

*   **Purpose:** A set of rules (routes) that control where network traffic for your subnet or gateway is directed.
*   **Components:**
    *   **Destination:** The IP address range (CIDR block) of the traffic.
    *   **Target:** The gateway, network interface, or connection through which the traffic should be routed.
*   **Default Route:** A common route is `0.0.0.0/0`, which means "all traffic not otherwise specified." This route usually points to an Internet Gateway for public subnets or a NAT Gateway for private subnets needing internet access.

## 5. Network Gateways

Gateways connect your VPC/VNet to other networks.

*   **Internet Gateway (IGW - AWS):**
    *   A horizontally scaled, redundant, and highly available VPC component that allows direct communication between instances in public subnets and the internet.
    *   It's a target in your route table for `0.0.0.0/0` in public subnets.
*   **NAT Gateway (Network Address Translation Gateway):**
    *   Allows instances in a private subnet to connect to the internet or other cloud services, but prevents the internet from initiating a connection with those instances.
    *   It sits in a public subnet and uses its public IP to facilitate outbound connections from private subnets.
    *   Instances in private subnets have a route in their route table pointing `0.0.0.0/0` to the NAT Gateway.

## 6. Basic Load Balancing (L4)

Load balancers distribute incoming network traffic across multiple targets, improving availability and scalability.

*   **Purpose:** Distributes incoming application traffic across multiple targets, such as instances, containers, and IP addresses, in multiple Availability Zones. This increases the fault tolerance of your applications.
*   **Layer 4 (L4) Load Balancing:**
    *   Operates at the transport layer (TCP/UDP).
    *   Distributes traffic based on IP address and port number.
    *   Does not inspect the content of the traffic.
    *   Examples: AWS Network Load Balancer (NLB), Azure Load Balancer, Google Cloud Network Load Balancer.

## 7. DNS Resolution Fundamentals

The Domain Name System (DNS) translates human-readable domain names into machine-readable IP addresses.

*   **Role:** Essential for service discovery and accessing resources by name instead of IP address.
*   **Cloud DNS Services:**
    *   **AWS Route 53:** A highly available and scalable cloud DNS web service. It can also act as a domain registrar.
    *   **Azure DNS:** A hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure.
    *   **Google Cloud DNS:** A scalable, reliable, and managed authoritative domain name service running on Google's infrastructure.
*   All major cloud providers offer robust, integrated DNS services for internal and external name resolution.

## 8. Network Security Groups (NSGs)

NSGs act as virtual firewalls that control inbound and outbound traffic to network interfaces or instances.

*   **Definition:** A virtual firewall for your instances to control inbound and outbound traffic.
*   **Key Characteristics:**
    *   **Stateful:** If you allow inbound traffic, the response outbound traffic is automatically allowed, and vice versa.
    *   **Rules:** Consist of rules specifying protocol, port range, source/destination IP address, and an allow/deny action.
    *   **Default Deny:** Implicitly denies all inbound traffic and implicitly allows all outbound traffic (with exceptions for some services).
    *   **Scope:** Applied at the instance level (via the Elastic Network Interface in AWS) or subnet level (common in Azure and GCP, complementing instance-level firewalls).

---

### Conceptual Configuration Example (AWS VPC)

Imagine setting up a simple web application in AWS:

```yaml
# Conceptual AWS VPC Configuration Snippet (Simplified)

# 1. VPC Definition
VPC:
  Name: MyWebAppVPC
  CIDR: 10.0.0.0/16

# 2. Subnets
SubnetPublicA:
  Name: WebPublicSubnet-AZ1
  CIDR: 10.0.1.0/24
  AvailabilityZone: us-east-1a
  # Associated with Public Route Table
SubnetPrivateA:
  Name: AppPrivateSubnet-AZ1
  CIDR: 10.0.2.0/24
  AvailabilityZone: us-east-1a
  # Associated with Private Route Table

# 3. Internet Gateway
InternetGateway:
  Name: MyWebApp-IGW
  AttachedTo: MyWebAppVPC

# 4. NAT Gateway
NATGateway:
  Name: MyWebApp-NATGW
  Subnet: WebPublicSubnet-AZ1 # NAT Gateway lives in a public subnet
  ElasticIP: my-nat-elastic-ip # Requires an EIP

# 5. Route Tables
RouteTablePublic:
  Name: PublicRouteTable
  Routes:
    - Destination: 0.0.0.0/0
      Target: InternetGateway # Directs internet traffic to IGW
  AssociatedSubnets: [WebPublicSubnet-AZ1]

RouteTablePrivate:
  Name: PrivateRouteTable
  Routes:
    - Destination: 0.0.0.0/0
      Target: NATGateway # Directs internet-bound traffic from private subnet to NAT GW
  AssociatedSubnets: [AppPrivateSubnet-AZ1]

# 6. Network Security Group (for Web Servers)
WebServerSecurityGroup:
  Name: SG-WebServers
  VPC: MyWebAppVPC
  InboundRules:
    - Protocol: TCP
      Port: 80
      Source: 0.0.0.0/0 # Allow HTTP from anywhere
    - Protocol: TCP
      Port: 443
      Source: 0.0.0.0/0 # Allow HTTPS from anywhere
  OutboundRules:
    - Protocol: All
      Port: All
      Destination: 0.0.0.0/0 # Allow all outbound

# 7. Basic Load Balancer (Network Load Balancer - L4)
NLB:
  Name: MyWebApp-NLB
  Type: network
  VPC: MyWebAppVPC
  Subnets: [WebPublicSubnet-AZ1] # Or across multiple public subnets/AZs
  Listeners:
    - Protocol: TCP
      Port: 80
      TargetGroup: WebServerTargetGroup
```

---

### Quick Check/Exercise

1.  **Scenario:** You have a database server in a private subnet. What two key networking components are essential to allow this database server to download security patches from the internet, *without* exposing it directly to inbound internet traffic?
2.  **Difference:** Explain the primary difference between a Public Subnet and a Private Subnet, specifically regarding how resources within them access the internet.
3.  **Security:** You need to allow HTTP (Port 80) and HTTPS (Port 443) access to your web servers. Which networking construct would you configure these rules on, and where would this construct typically be applied?