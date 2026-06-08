# Azure Network Security Deep Dive

Network security is a critical aspect of any cloud deployment, ensuring that your applications and data are protected from unauthorized access and various cyber threats. In Azure, a robust set of services and features allows you to implement granular control over network traffic, from the virtual machine level to centralized network-wide protection. This guide will cover key Azure network security components: Network Security Groups (NSGs), Application Security Groups (ASGs), Azure Firewall, and Azure DDoS Protection.

## 1. Network Security Groups (NSGs)

**Network Security Groups (NSGs)** act as a virtual firewall for your Azure resources. They allow or deny inbound and outbound network traffic to or from various Azure resources like Virtual Machines (VMs), Network Interfaces (NICs), and subnets within your Azure Virtual Networks (VNets).

### How NSGs Work:
*   **Rules:** An NSG contains a list of security rules that evaluate traffic. Each rule specifies:
    *   **Priority:** A number (100-4096). Lower numbers have higher priority.
    *   **Source/Destination:** IP address or range, Service Tag (e.g., VirtualNetwork, Internet, AzureLoadBalancer), or Application Security Group (ASG).
    *   **Port:** Individual port or port range.
    *   **Protocol:** TCP, UDP, ICMP, or Any.
    *   **Action:** Allow or Deny.
*   **Default Rules:** Every NSG comes with several default rules that cannot be deleted but can be overridden by higher-priority custom rules. Examples include:
    *   `AllowVnetInBound` (Allows traffic within the VNet).
    *   `AllowAzureLoadBalancerInBound` (Allows Azure Load Balancer to probe VMs).
    *   `AllowInternetOutBound` (Allows all outbound traffic to the Internet).
*   **Association:** NSGs can be associated with:
    *   **Subnets:** Rules apply to all resources within that subnet.
    *   **Network Interfaces (NICs):** Rules apply only to that specific NIC.

### Precedence:
When an NSG is associated with both a subnet and a NIC, the following precedence applies:
1.  **Inbound:** Subnet NSG rules are evaluated first, then NIC NSG rules.
2.  **Outbound:** NIC NSG rules are evaluated first, then Subnet NSG rules.

## 2. Application Security Groups (ASGs)

**Application Security Groups (ASGs)** simplify the management of NSGs by allowing you to configure network security as a natural extension of an application's structure. Instead of explicitly listing individual IP addresses in NSG rules, you can create ASGs and group virtual machines by their application workload (e.g., `web-servers`, `database-servers`).

### Benefits:
*   **Simplified Rule Management:** You define rules once for an ASG, and all VMs added to that ASG automatically inherit those rules.
*   **Dynamic Updates:** As VMs are added or removed from an ASG, the underlying NSG rules are automatically updated without manual intervention.
*   **Enhanced Segmentation:** Promotes clear network segmentation based on application tiers rather than specific IP addresses.

## 3. Azure Firewall

**Azure Firewall** is a managed, cloud-based network security service that protects your Azure Virtual Network resources. It is a fully stateful firewall as a service with built-in high availability and unrestricted cloud scalability.

### Key Features:
*   **Centralized Protection:** Provides centralized network protection across various VNets and subscriptions.
*   **Stateful L3-L7 Filtering:** Filters traffic based on IP address, port, protocol, and fully qualified domain names (FQDNs).
*   **Threat Intelligence:** Built-in Microsoft threat intelligence-based filtering that alerts and denies traffic from known malicious IP addresses and domains.
*   **SNAT & DNAT:** Supports Source Network Address Translation (SNAT) for outbound traffic and Destination Network Address Translation (DNAT) for inbound traffic.
*   **Azure Firewall Policy:** A hierarchical management model to define and apply firewall rules and settings across multiple Azure Firewalls.
*   **Deployment:** Often deployed in a hub-spoke topology, where the firewall resides in the hub VNet and inspects traffic between spoke VNets and to/from the internet.

## 4. Azure DDoS Protection

**DDoS (Distributed Denial of Service) attacks** are attempts to overwhelm an online service with a flood of traffic from multiple sources, making it unavailable to legitimate users. Azure offers two tiers of DDoS protection:

### Azure DDoS Protection Basic:
*   This tier is **free** and automatically enabled for all Azure services. It provides always-on traffic monitoring and real-time mitigation of common network-layer (Layer 3/4) DDoS attacks.
*   It focuses on protecting the Azure platform itself rather than individual customer resources.

### Azure DDoS Protection Standard:
*   Provides **enhanced DDoS mitigation capabilities** for your specific virtual networks.
*   **Key Features:**
    *   **Adaptive Tuning:** Learns your application's traffic patterns over time to detect and mitigate attacks more effectively.
    *   **Attack Analytics, Metrics, and Alerting:** Provides detailed insights into DDoS attacks and allows you to configure alerts.
    *   **Cost Optimization:** Provides DDoS Protection Standard data transfer cost credits for attacks.
    *   **Protection Scope:** Protects public IP addresses within virtual networks.
*   It's designed to protect critical applications from sophisticated attacks by analyzing and scrubbing malicious traffic.

## Configuration Sample: Creating an NSG Rule with Azure CLI

This example demonstrates how to create a Network Security Group and add an inbound rule to allow RDP (port 3389) from a specific IP address range.

```bash
# Define variables
RESOURCE_GROUP="myNetworkSecurityRG"
LOCATION="eastus"
NSG_NAME="myWebAppNSG"

# Create a Resource Group if it doesn't exist
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create a Network Security Group
az network nsg create \
    --resource-group $RESOURCE_GROUP \
    --name $NSG_NAME \
    --location $LOCATION

# Add an inbound rule to allow RDP (port 3389) from a specific IP range
az network nsg rule create \
    --resource-group $RESOURCE_GROUP \
    --nsg-name $NSG_NAME \
    --name "AllowRDPFromAdminIPRange" \
    --priority 100 \
    --direction Inbound \
    --source-address-prefixes "203.0.113.0/24" \
    --source-port-ranges "*" \
    --destination-address-prefixes "*" \
    --destination-port-ranges "3389" \
    --protocol Tcp \
    --access Allow \
    --description "Allow RDP from specific admin IP range"

# To verify the rules (optional)
az network nsg show --resource-group $RESOURCE_GROUP --name $NSG_NAME --query securityRules
```

## Checklist / Exercises

1.  Explain the primary difference between associating an NSG with a subnet versus a network interface. Which takes precedence for inbound traffic, and which for outbound traffic?
2.  You need to allow HTTP traffic (port 80) only from your corporate network (IP range 192.168.1.0/24) to a group of five web servers. Describe how you would use NSGs and ASGs to achieve this efficiently, explaining the configuration steps.
3.  When would you choose to implement Azure Firewall in your network architecture instead of relying solely on NSGs? List at least two distinct scenarios where Azure Firewall provides superior capabilities.