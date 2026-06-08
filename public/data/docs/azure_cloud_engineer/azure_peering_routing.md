# VNet Peering & Custom Routing (UDRs)

This study guide covers two fundamental networking concepts in Azure: VNet Peering, which allows you to connect virtual networks, and User-Defined Routes (UDRs), which provide granular control over network traffic flow.

## 1. Azure VNet Peering

Azure VNet Peering enables you to seamlessly connect two or more Azure Virtual Networks (VNets) with each other. This connection is low-latency, high-bandwidth, and private. Traffic between peered VNets remains on the Microsoft backbone network and doesn't traverse the public internet.

### What is VNet Peering?

VNet Peering creates a network connection between two VNets, allowing resources in one VNet to communicate with resources in the other VNet as if they were in the same VNet.

### Key Characteristics:

*   **Private Connectivity:** Traffic stays on the Microsoft backbone, ensuring high security and performance.
*   **Low Latency, High Bandwidth:** Peering connections provide optimal network performance.
*   **Non-Transitive:** If VNet A is peered with VNet B, and VNet B is peered with VNet C, VNet A and VNet C *cannot* directly communicate unless they are also explicitly peered.
*   **Cross-Subscription and Cross-Region:** VNets can be peered across different subscriptions and even different Azure regions (Global VNet Peering).
*   **No Gateway Requirement:** Peering removes the need for VPN Gateways for VNet-to-VNet communication, simplifying architecture and reducing costs for direct VNet connections.

### When to use VNet Peering:

*   **Hub-and-Spoke Topologies:** Connect multiple spoke VNets to a central hub VNet (e.g., for shared services like firewalls or domain controllers).
*   **Application Tiers in Separate VNets:** Isolate different application tiers (web, app, DB) into their own VNets while maintaining seamless communication.
*   **Connecting VNets from Different Business Units:** Allow departments to manage their own VNets while enabling inter-department communication.

### Configuration Example (Azure CLI):

To peer `VNet1` with `VNet2`:

```bash
# Create VNet1
az network vnet create --name VNet1 --resource-group MyResourceGroup --address-prefix 10.0.0.0/16 --location eastus

# Create VNet2
az network vnet create --name VNet2 --resource-group MyResourceGroup --address-prefix 10.1.0.0/16 --location eastus

# Create peering from VNet1 to VNet2
az network vnet peering create --name VNet1ToVNet2 --resource-group MyResourceGroup --vnet-name VNet1 --remote-vnet VNet2 --allow-vnet-access

# Create peering from VNet2 to VNet1 (Bi-directional peering is required for full connectivity)
az network vnet peering create --name VNet2ToVNet1 --resource-group MyResourceGroup --vnet-name VNet2 --remote-vnet VNet1 --allow-vnet-access
```
*Note: `--allow-vnet-access` is essential for enabling traffic flow.*

## 2. User-Defined Routes (UDRs)

By default, Azure automatically creates system routes for all subnets within a VNet. These routes enable communication within the VNet, to the internet, and potentially to on-premises networks via a VPN Gateway. User-Defined Routes (UDRs) allow you to override these system routes and define custom next-hop addresses for specific IP prefixes, giving you granular control over network traffic flow.

### What are UDRs?

UDRs are manually configured routes within a route table, which is then associated with one or more subnets. When a packet leaves a VM in a subnet, Azure checks the subnet's associated route table for the most specific route matching the destination IP address.

### Key Scenarios for UDRs:

*   **Forcing Tunneling:** Route all internet-bound traffic through a Network Virtual Appliance (NVA) or an on-premises firewall via a VPN Gateway.
*   **Integrating Network Virtual Appliances (NVAs):** Direct traffic to a firewall, load balancer, or other network appliance deployed in an Azure VNet.
*   **Custom Network Topologies:** Implement advanced routing scenarios not covered by default Azure routing.

### Next Hop Types for UDRs:

*   **Virtual Appliance:** Routes traffic to a specific private IP address of a VM (e.g., a firewall VM).
*   **Virtual Network Gateway:** Routes traffic to an Azure VPN Gateway for hybrid connectivity.
*   **Internet:** Routes traffic directly to the internet.
*   **None:** Drops traffic (useful for blocking specific IP ranges).
*   **Virtual Network:** Routes traffic within the virtual network (useful for overriding default system routes for specific subnets).

### Configuration Example (Azure CLI):

Imagine you have a firewall NVA at `10.0.0.4` in `SubnetA` of `VNet1`, and you want all traffic from `SubnetB` to the internet to go through this firewall.

```bash
# Create a Route Table
az network route-table create --name MyRouteTable --resource-group MyResourceGroup --location eastus

# Create a route in MyRouteTable to send all internet-bound traffic (0.0.0.0/0)
# through the NVA (10.0.0.4)
az network route-table route create --name RouteToNVA --route-table-name MyRouteTable --resource-group MyResourceGroup --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.0.4

# Associate the route table with SubnetB
az network vnet subnet update --vnet-name VNet1 --name SubnetB --resource-group MyResourceGroup --route-table MyRouteTable
```

## 3. Study Guide Checklist/Exercise

1.  **Scenario:** You have two VNets, `VNet_Prod` (10.10.0.0/16) and `VNet_Dev` (10.20.0.0/16), in the same subscription but different resource groups. Describe the steps you would take to enable communication between VMs in these two VNets using VNet Peering.
2.  **UDR Application:** Explain how you would use a UDR to force all outbound traffic from a specific subnet (`AppSubnet`) through a Network Virtual Appliance (NVA) located at `10.0.1.5` within the same VNet. What `next-hop-type` would you choose?
3.  **Peering Limitation:** A security policy dictates that VMs in `VNet_A` should *not* be able to directly communicate with `VNet_C` if `VNet_A` is peered with `VNet_B`, and `VNet_B` is peered with `VNet_C`. What is this fundamental characteristic of VNet Peering, and why does this policy naturally align with it?