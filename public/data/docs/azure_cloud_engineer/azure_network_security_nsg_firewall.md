# Azure Network Security (NSG, ASG, Azure Firewall)

Network security is paramount in cloud environments, and Azure provides robust services to protect your virtual networks and resources. This guide covers three fundamental services: Network Security Groups (NSGs) for granular traffic control, Application Security Groups (ASGs) for simplified rule management, and Azure Firewall for centralized, stateful network protection.

## 1. Network Security Groups (NSG)

A Network Security Group (NSG) acts as a virtual firewall that controls inbound and outbound network traffic to Azure resources. You can apply NSGs to an Azure network interface (NIC) or a subnet, allowing for granular control over network communication.

### Core Concepts

*   **Rules:** NSGs contain security rules that specify traffic direction (inbound/outbound), priority, source, source port range, destination, destination port range, protocol, and action (allow/deny).
*   **Priority:** Rules are processed in order of priority (lower number = higher priority). Once a rule matches, processing stops.
*   **Default Rules:** Every NSG comes with a set of default rules that cannot be deleted but can be overridden by custom rules with higher priority. These rules allow traffic within the VNet and deny all other inbound traffic.
*   **Association:** An NSG can be associated with:
    *   **Subnets:** All resources within that subnet inherit the NSG rules.
    *   **Network Interfaces (NICs):** Only the specific NIC (and the VM it belongs to) is affected.
*   **Effective Security Rules:** When an NSG is associated with both a subnet and a NIC, all rules from both NSGs are evaluated. Inbound traffic is processed first by the subnet NSG, then by the NIC NSG. Outbound traffic is processed first by the NIC NSG, then by the subnet NSG.

### Configuration Example (Azure CLI)

Let's create an NSG to allow inbound HTTP (port 80) and block RDP (port 3389) from the internet, while allowing RDP from a specific internal subnet.

```bash
# Create an NSG
az network nsg create --resource-group MyResourceGroup --name MyWebNSG

# Allow inbound HTTP from any source to any destination (Port 80)
az network nsg rule create \
  --resource-group MyResourceGroup \
  --nsg-name MyWebNSG \
  --name AllowHttpInbound \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes "*" \
  --source-port-ranges "*" \
  --destination-address-prefixes "*" \
  --destination-port-ranges 80

# Deny inbound RDP from the internet (Port 3389)
az network nsg rule create \
  --resource-group MyResourceGroup \
  --nsg-name MyWebNSG \
  --name DenyRdpFromInternet \
  --priority 110 \
  --direction Inbound \
  --access Deny \
  --protocol Tcp \
  --source-address-prefixes "Internet" \
  --source-port-ranges "*" \
  --destination-address-prefixes "*" \
  --destination-port-ranges 3389

# Allow inbound RDP from a specific internal management subnet (e.g., 10.0.1.0/24)
az network nsg rule create \
  --resource-group MyResourceGroup \
  --nsg-name MyWebNSG \
  --name AllowRdpFromMgmtSubnet \
  --priority 90 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes "10.0.1.0/24" \
  --source-port-ranges "*" \
  --destination-address-prefixes "*" \
  --destination-port-ranges 3389
```

**Note:** The `AllowRdpFromMgmtSubnet` rule has a higher priority (90) than `DenyRdpFromInternet` (110), ensuring that RDP is allowed from the management subnet despite the broader denial rule.

## 2. Application Security Groups (ASG)

Application Security Groups (ASGs) simplify network security configuration by allowing you to group virtual machines (VMs) or network interfaces based on their application function (e.g., "WebServers", "DatabaseServers"). You can then use these ASGs in NSG security rules instead of explicit IP addresses, making rule management more dynamic and scalable.

### Core Concepts

*   **Grouping:** You define an ASG and assign network interfaces of your VMs to it.
*   **Referencing in NSGs:** NSG rules can then specify an ASG as a source or destination.
*   **Dynamic Updates:** When you add or remove VMs from an ASG, the associated NSG rules automatically update to reflect these changes, eliminating the need to manually update IP addresses.

### Benefits

*   **Simplified Management:** Easier to manage rules for large numbers of VMs.
*   **Improved Readability:** Rules become more descriptive (e.g., "Allow traffic from WebServers to DatabaseServers on port 1433").
*   **Reduced Error:** Less chance of misconfiguring IP addresses.

### Configuration Example (Conceptual)

Imagine you have a group of web servers and a group of database servers.

1.  **Create ASGs:**
    *   `WebServersASG`
    *   `DatabaseServersASG`
2.  **Assign NICs:** Assign the NICs of your web servers to `WebServersASG` and database servers to `DatabaseServersASG`.
3.  **NSG Rule:** In an NSG applied to your database subnet:

    ```text
    Rule: Allow traffic
    Priority: 200
    Direction: Inbound
    Source: WebServersASG
    Source Port Range: *
    Destination: DatabaseServersASG
    Destination Port Range: 1433 (SQL Server)
    Protocol: Tcp
    Action: Allow
    ```
    This rule allows any web server in the `WebServersASG` to communicate with any database server in the `DatabaseServersASG` on port 1433.

## 3. Azure Firewall

Azure Firewall is a managed, cloud-native network security service that provides threat protection for your Azure Virtual Network resources. It's a stateful firewall-as-a-service with built-in high availability and unrestricted cloud scalability.

### Core Features

*   **Stateful Firewall:** Monitors the state of active connections and makes filtering decisions based on the context of those connections.
*   **Built-in High Availability:** Automatically deploys with high availability.
*   **Scalability:** Scales automatically to meet demand.
*   **Threat Intelligence:** Integrates with Microsoft's threat intelligence feeds to block known malicious IP addresses and domains.
*   **FQDN Filtering:** Allows you to filter outbound traffic based on fully qualified domain names (FQDNs), not just IP addresses.
*   **Network Rules:** Allow/deny traffic based on IP address, port, and protocol.
*   **Application Rules:** Allow/deny outbound HTTP/HTTPS traffic based on FQDNs.
*   **Centralized Management:** Provides a central point of control for network security across multiple virtual networks and subscriptions.
*   **SNAT/DNAT:** Supports Source Network Address Translation (SNAT) for outbound traffic and Destination Network Address Translation (DNAT) for inbound traffic.
*   **Logging and Monitoring:** Integrates with Azure Monitor logs for centralized logging and analytics.

### When to Use Azure Firewall

Azure Firewall is ideal for enterprise and hybrid cloud scenarios requiring:

*   Centralized network security across multiple VNets (hub-spoke topology).
*   Advanced threat protection.
*   FQDN-based filtering for outbound traffic.
*   SNAT/DNAT capabilities.
*   Compliance requirements for a robust, managed firewall service.

### Comparison and Usage

*   **NSGs:** Best for granular, VM/subnet-level access control. Think of them as internal network segmentation. Every VNet workload should have NSGs.
*   **ASGs:** Enhance NSG management by grouping VMs logically, making rules easier to read and maintain, especially in dynamic environments. Use them whenever you have groups of similar resources needing common NSG rules.
*   **Azure Firewall:** Provides a perimeter firewall for your VNet, offering centralized, stateful protection, advanced threat intelligence, and FQDN filtering. It's typically deployed at the VNet hub in a hub-spoke topology to control traffic flow between spokes, to on-premises networks, and to the internet.

You often use all three together: Azure Firewall at the VNet perimeter for broad, centralized protection, and NSGs (leveraging ASGs) within spokes/subnets for internal segmentation and workload-specific access control.

## Quick Checklist / Exercises

1.  **Scenario:** You have a web server and a database server in the same Azure VNet, but in different subnets. You need to ensure the web server can initiate connections to the database server on port 1433 (SQL Server), but no other server can. Which security service(s) would you use and how?
2.  **Scenario:** Your organization requires all outbound internet traffic from all VMs in your Azure subscription to be filtered based on specific FQDNs (e.g., only allow access to `*.microsoft.com`, `*.github.com`). Additionally, all outbound traffic must be logged centrally. Which Azure network security service is best suited for this requirement?
3.  **Scenario:** You have 50 virtual machines that serve as web frontends. You need to allow inbound HTTP/HTTPS traffic to these VMs. In the future, you anticipate adding or removing web servers frequently. How can you simplify the management of NSG rules for these web servers?
