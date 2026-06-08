# VNet Peering & Custom Routing (UDRs)

## Introduction

In the intricate landscape of Azure networking, connecting virtual networks (VNets) and precisely controlling traffic flow are fundamental requirements for robust and secure cloud deployments. This guide explores two critical capabilities: **VNet Peering** for seamless VNet integration and **User-Defined Routes (UDRs)** for advanced traffic management, often in conjunction with Network Virtual Appliances (NVAs). Mastering these concepts is crucial for any Azure Cloud Engineer aiming to design scalable and secure network architectures.

## VNet Peering

VNet Peering allows you to connect two Azure virtual networks seamlessly. Once peered, the virtual networks appear as one for connectivity purposes. Traffic between peered VNets uses the Microsoft backbone infrastructure, similar to how traffic is routed between subnets in the same VNet. This means ultra-low latency, high bandwidth connectivity.

### Key Characteristics:

*   **Non-Transitive:** If VNet A is peered with VNet B, and VNet B is peered with VNet C, VNet A and VNet C are NOT automatically peered. Direct peering is required between A and C if connectivity is needed.
*   **Cross-Subscription/Region:** VNets can be peered across different Azure subscriptions and even different Azure regions (Global VNet Peering).
*   **Gateway Transit:** Allows a peered VNet to use the VPN Gateway in the hub VNet to connect to on-premises networks, eliminating the need for a separate gateway in the spoke VNet.
*   **No Public IP:** Communication between peered VNets happens through private IP addresses; no public internet is involved.

### Use Cases:

*   **Hub-Spoke Topologies:** Centralizing shared services (e.g., AD DS, firewalls) in a hub VNet and connecting spoke VNets for different applications or environments.
*   **Application Tiers:** Separating application tiers (e.g., web, app, database) into different VNets for enhanced security and isolation, then peering them for communication.
*   **Cross-Region Disaster Recovery:** Connecting VNets in different regions for redundancy.

### Configuration Example (Azure CLI):

Let's say you have two VNets: `vnet-prod-westus` (10.1.0.0/16) and `vnet-dev-westus` (10.2.0.0/16).

```bash
# Create vnet-prod-westus
az network vnet create \
  --name vnet-prod-westus \
  --resource-group myResourceGroup \
  --location westus \
  --address-prefix 10.1.0.0/16

# Create vnet-dev-westus
az network vnet create \
  --name vnet-dev-westus \
  --resource-group myResourceGroup \
  --location westus \
  --address-prefix 10.2.0.0/16

# Create peering from prod to dev
az network vnet peering create \
  --name VNet-Prod-to-Dev \
  --resource-group myResourceGroup \
  --vnet-name vnet-prod-westus \
  --remote-vnet vnet-dev-westus \
  --allow-vnet-access

# Create peering from dev to prod (required for full connectivity)
az network vnet peering create \
  --name VNet-Dev-to-Prod \
  --resource-group myResourceGroup \
  --vnet-name vnet-dev-westus \
  --remote-vnet vnet-prod-westus \
  --allow-vnet-access
```

## User-Defined Routes (UDRs)

By default, Azure automatically handles routing within and between VNets, to the internet, and to on-premises networks via a VPN Gateway. However, there are scenarios where you need to override Azure's default routing behavior to force traffic along specific paths. This is where **User-Defined Routes (UDRs)** come into play.

UDRs allow you to define custom routes that control how traffic flows out of a subnet. They are essential for scenarios involving Network Virtual Appliances (NVAs) like firewalls, load balancers, or IDS/IPS systems.

### Components of a UDR:

A UDR consists of:

*   **Route Table:** A collection of UDRs that are associated with one or more subnets.
*   **Address Prefix:** The destination IP address range for which the route applies.
*   **Next Hop Type:** Specifies where the traffic should be sent. Common types include:
    *   **Virtual appliance:** Directs traffic to a specific private IP address of a VM (often an NVA).
    *   **Virtual network gateway:** Directs traffic to an Azure VPN Gateway.
    *   **Virtual network:** Directs traffic within the VNet.
    *   **Internet:** Directs traffic to the internet.
    *   **None:** Drops traffic (useful for blackholing routes).
*   **Next Hop IP Address:** The IP address of the next hop resource (only required for `Virtual appliance` next hop type).

### How UDRs Work with NVAs:

Consider a common scenario: you want all internet-bound traffic from a specific subnet to first pass through an NVA (e.g., an Azure Firewall or a third-party firewall VM) for inspection and filtering.

1.  **Deploy NVA:** Place your NVA in a dedicated subnet (e.g., `DMZSubnet`).
2.  **Create Route Table:** Create a route table.
3.  **Add UDR:** Add a route to this table with:
    *   **Address Prefix:** `0.0.0.0/0` (all internet-bound traffic).
    *   **Next Hop Type:** `Virtual appliance`.
    *   **Next Hop IP Address:** The private IP address of your NVA.
4.  **Associate Route Table:** Associate this route table with the subnet from which you want to force traffic through the NVA.

### Configuration Example (Azure CLI):

Let's say you want to route all internet-bound traffic from `AppSubnet` through an NVA with IP `10.1.0.4` in `vnet-prod-westus`.

```bash
# Create a route table
az network route-table create \
  --name myRouteTable \
  --resource-group myResourceGroup \
  --location westus

# Create a route to direct 0.0.0.0/0 traffic to the NVA
az network route create \
  --name RouteToNVA \
  --resource-group myResourceGroup \
  --route-table-name myRouteTable \
  --address-prefix 0.0.0.0/0 \
  --next-hop-type VirtualAppliance \
  --next-hop-ip-address 10.1.0.4

# Associate the route table with a subnet (e.g., 'AppSubnet')
az network vnet subnet update \
  --name AppSubnet \
  --vnet-name vnet-prod-westus \
  --resource-group myResourceGroup \
  --route-table myRouteTable
```

## Quick Checklist/Exercise:

1.  **Scenario:** You have `VNetA` (10.0.0.0/16) and `VNetB` (10.1.0.0/16) in different subscriptions but the same region. How would you enable connectivity between them, and what specific option must be enabled if `VNetA` has a VPN Gateway that `VNetB` needs to use for on-premises access?
2.  **Problem:** VMs in `SubnetX` are directly accessing the internet, but your security policy requires all outbound internet traffic to pass through a firewall NVA (private IP: `10.0.0.100`) located in `SubnetY`. Describe the steps you would take to enforce this policy using UDRs.
3.  **True or False:** VNet peering is transitive, meaning if VNet A peers with B, and B peers with C, then A can communicate directly with C without further configuration. Explain your answer.
