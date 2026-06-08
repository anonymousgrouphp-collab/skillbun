# Azure Networking Services: Study Guide

Azure Networking Services provide the backbone for connecting resources within Azure, to on-premises environments, and to the internet, all while ensuring security, scalability, and high availability. Mastering these services is crucial for designing robust cloud solutions.

## 1. Introduction to Azure Networking

Azure networking allows you to build isolated, secure, and highly available networks in the cloud. It encompasses a wide range of services that enable various connectivity scenarios, from simple VM-to-VM communication to complex hybrid cloud architectures. Understanding these services is fundamental for any Azure Cloud Engineer.

## 2. Core Concepts and Services

### 2.1 Azure Virtual Network (VNet)

The fundamental building block for your private network in Azure. A VNet is an isolated network where you can deploy your Azure resources (like Virtual Machines, Azure Kubernetes Service clusters, etc.).

*   **Key Features:**
    *   **IP Address Space:** Define a custom private IP address range (e.g., `10.0.0.0/16`).
    *   **Subnets:** Divide your VNet into smaller, isolated network segments. Each subnet must have its own unique address range within the VNet's address space. Resources within a subnet cannot directly communicate with resources in another subnet without explicit routing or peering.
    *   **Isolation:** Resources within a VNet can communicate with each other, but are isolated from other VNets by default unless VNet Peering is configured.

### 2.2 IP Addressing

*   **Public IP Addresses:** Used for internet-facing communication (e.g., web servers, load balancers, VPN gateways). Can be dynamic (changes over time) or static (persists until explicitly deleted).
*   **Private IP Addresses:** Used for communication within a VNet. Can be assigned dynamically or statically to resources (e.g., Virtual Machine Network Interfaces, Internal Load Balancers).

### 2.3 Network Security Groups (NSGs)

Act as a virtual firewall for your VNet resources. NSGs filter network traffic to and from Azure resources in an Azure VNet.

*   **Key Features:**
    *   **Rules:** Define inbound and outbound security rules based on source/destination IP, port, and protocol.
    *   **Priority:** Rules are processed in order of priority (lower number is higher priority). Once a rule matches, processing stops.
    *   **Association:** Can be associated with a subnet (applies to all resources in the subnet) or a specific network interface (NIC) of a VM.
    *   **Default Rules:** Implicit deny rules exist at the lowest priority, ensuring that any traffic not explicitly allowed is denied.

### 2.4 Azure Load Balancer

Distributes incoming network traffic across multiple healthy virtual machines or instances. Operates at Layer 4 (TCP/UDP) of the OSI model.

*   **Types:**
    *   **Public Load Balancer:** Distributes traffic from the internet to VMs within a VNet.
    *   **Internal Load Balancer:** Distributes traffic within a VNet to VMs.
*   **Key Features:**
    *   Health probes to monitor backend instance health.
    *   Supports various load-balancing rules and session persistence.

### 2.5 Azure Application Gateway

A web traffic load balancer that enables you to manage traffic to your web applications. Operates at Layer 7 (HTTP/HTTPS) of the OSI model.

*   **Key Features:**
    *   **Web Application Firewall (WAF):** Protects web applications from common web vulnerabilities (e.g., SQL injection, cross-site scripting).
    *   **SSL/TLS Termination:** Offloads SSL encryption/decryption from backend servers, improving performance.
    *   **URL-based Routing:** Routes requests to different backend pools based on URL paths.
    *   **Cookie-based Session Affinity:** Ensures requests from a user go to the same backend server.

### 2.6 Azure VPN Gateway

Connects your on-premises networks to Azure Virtual Networks over the public internet using encrypted tunnels (IPsec/IKE). This creates a secure, site-to-site connection.

*   **Types:**
    *   **Site-to-Site VPN:** Connects your on-premises network to an Azure VNet.
    *   **Point-to-Site VPN:** Connects individual client computers to an Azure VNet, ideal for remote users.

### 2.7 Azure ExpressRoute

Provides a private, dedicated, high-bandwidth connection between your on-premises infrastructure and Azure data centers. Unlike VPN Gateway, ExpressRoute traffic does not traverse the public internet, offering higher reliability, speed, and lower latency.

*   **Key Benefits:**
    *   Higher bandwidth and lower latency.
    *   Increased reliability and security.
    *   Consistent network performance.

### 2.8 Azure DNS

A hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure. You can host your domains in Azure and manage your DNS records, including A, CNAME, MX, and TXT records.

### 2.9 Azure Firewall

A managed, cloud-based network security service that protects your Azure Virtual Network resources. It's a fully stateful firewall as a service, offering centralized policy management across multiple VNets and subscriptions.

*   **Key Features:**
    *   High availability and unlimited cloud scalability.
    *   DNAT (Destination Network Address Translation) and SNAT (Source Network Address Translation).
    *   Threat intelligence-based filtering.
    *   Application and Network rule collections to control outbound/inbound traffic.

## 3. Configuration Example: Creating an NSG Rule

Here's an example using Azure CLI to create a Network Security Group (NSG) and an inbound rule to allow HTTP traffic (port 80) to a specific subnet. This demonstrates how to implement basic network segmentation and security.

```bash
# 1. Create a Resource Group to organize resources
az group create --name MyNetworkRG --location eastus

# 2. Create a Virtual Network with a subnet
az network vnet create \
  --resource-group MyNetworkRG \
  --name MyVNet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name MySubnet \
  --subnet-prefix 10.0.0.0/24

# 3. Create a Network Security Group
az network nsg create \
  --resource-group MyNetworkRG \
  --name MyWebServerNSG

# 4. Add an inbound security rule to allow HTTP traffic (port 80)
# Priority 100 ensures this rule is evaluated early.
az network nsg rule create \
  --resource-group MyNetworkRG \
  --nsg-name MyWebServerNSG \
  --name AllowHTTPInbound \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --destination-port-ranges 80 \
  --source-port-ranges "*" \
  --destination-address-prefixes "*" \
  --source-address-prefixes "*"

# 5. Associate the NSG to the subnet
# This applies the rules defined in MyWebServerNSG to all resources within MySubnet.
az network vnet subnet update \
  --resource-group MyNetworkRG \
  --vnet-name MyVNet \
  --name MySubnet \
  --network-security-group MyWebServerNSG

# To delete the resources after exercise:
# az group delete --name MyNetworkRG --yes --no-wait
```

This example demonstrates how to set up a basic firewall rule to protect resources within `MySubnet` by explicitly allowing web traffic.

## 4. Quick Checklist/Exercises

1.  **VNet and Subnet Design:** You need to deploy two applications (AppA and AppB) in Azure. AppA's backend VMs should be isolated from AppB's backend VMs, but both applications' frontends need to be accessible via an Application Gateway in a shared subnet. How would you design your VNets and subnets to achieve this isolation while allowing shared frontend services?
2.  **NSG Rule Implementation:** A database server running in Azure needs to accept connections only from a specific application subnet (`10.0.1.0/24`) on port 1433 (SQL Server) and deny all other inbound traffic. Describe the specific NSG inbound rule(s) you would create, including priority, direction, access, protocol, port ranges, and source/destination ranges.
3.  **Hybrid Connectivity Decision:** Your organization requires a low-latency, high-bandwidth connection between your on-premises data center and Azure for mission-critical applications. The connection must offer guaranteed uptime and bypass the public internet. Which Azure networking service is best suited for this requirement, and what are its key advantages over alternative solutions?