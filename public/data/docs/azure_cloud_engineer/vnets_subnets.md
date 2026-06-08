# Virtual Networks (VNets) & Subnets in Azure

## Introduction to Azure Virtual Networks (VNets)
Azure Virtual Networks (VNets) are the fundamental building block for your private network in Azure. VNets enable many types of Azure resources, such as Azure Virtual Machines (VMs), to securely communicate with each other, the internet, and on-premises networks. A VNet is an isolated logical representation of your network in the cloud.

**Key Characteristics:**
*   **Isolation:** Your VNet is logically isolated from other VNets in Azure.
*   **Connectivity:** Resources within a VNet can communicate with each other. VNets can also be connected to on-premises networks (VPN Gateway, ExpressRoute) or to other VNets (VNet Peering).
*   **IP Addressing:** You define a private IP address space for your VNet using CIDR notation. Azure allocates IPs from this range to resources.
*   **Security:** Network Security Groups (NSGs) can be used to filter network traffic to and from Azure resources in a VNet.

## Understanding Subnets
Subnets allow you to segment your VNet into one or more smaller logical networks. Each subnet is assigned a portion of the VNet's address space.

**Why Use Subnets?**
*   **Organization:** Group resources with common security or connectivity requirements.
*   **Security:** Apply different Network Security Groups (NSGs) to each subnet to control inbound and outbound traffic at a granular level.
*   **Service Delegation:** Certain Azure services (e.g., Azure App Gateway, Azure Firewall, Azure Kubernetes Service) require dedicated subnets.

**Important Note on IP Addresses:**
Azure reserves the first four and last IP addresses in each subnet for internal use:
*   `.0`: Network address.
*   `.1`: Default gateway.
*   `.2`, `.3`: Reserved by Azure for internal VNet management.
*   `.255` (for /24): Broadcast address.
This means for a `/24` subnet, you'll have 251 usable IP addresses (256 - 5 reserved).

## IP Addressing Schemes and CIDR Notation
**Classless Inter-Domain Routing (CIDR)** is a method for allocating IP addresses and routing Internet Protocol packets. It's crucial for defining your VNet and subnet address spaces.

**Private IP Address Ranges:**
Azure VNets typically use private IP address ranges defined in RFC 1918:
*   `10.0.0.0/8` (10.0.0.0 to 10.255.255.255)
*   `172.16.0.0/12` (172.16.0.0 to 172.31.255.255)
*   `192.168.0.0/16` (192.168.0.0 to 192.168.255.255)

**Example:**
If your VNet has an address space of `10.0.0.0/16`, it means you have 65,536 possible IP addresses (2^(32-16)).
You can then create subnets within this range, e.g.:
*   `10.0.1.0/24` (256 IP addresses, 251 usable)
*   `10.0.2.0/24` (256 IP addresses, 251 usable)
*   `10.0.3.0/27` (32 IP addresses, 27 usable)

**Key Concept: Network Segmentation**
Segmentation involves dividing a network into smaller, isolated segments. In Azure, VNets and subnets are primary tools for this:
*   **VNets:** Provide macro-segmentation, isolating entire application environments.
*   **Subnets:** Provide micro-segmentation within a VNet, allowing different tiers of an application (e.g., web, app, database) to reside in separate security zones.

## Creating & Configuring VNets and Subnets (Azure CLI Example)

Here's how you can create a VNet and a subnet using Azure CLI:

```bash
# Define variables
RESOURCE_GROUP="my-vnet-rg"
LOCATION="eastus"
VNET_NAME="myVNet"
VNET_ADDRESS_PREFIX="10.0.0.0/16"
SUBNET_NAME="mySubnet"
SUBNET_ADDRESS_PREFIX="10.0.1.0/24"

# Create a resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create a Virtual Network
az network vnet create \
  --resource-group $RESOURCE_GROUP \
  --name $VNET_NAME \
  --address-prefixes $VNET_ADDRESS_PREFIX

# Create a Subnet within the VNet
az network vnet subnet create \
  --resource-group $RESOURCE_GROUP \
  --vnet-name $VNET_NAME \
  --name $SUBNET_NAME \
  --address-prefixes $SUBNET_ADDRESS_PREFIX

echo "VNet and Subnet created successfully!"
```

## Checklist/Exercise to Test Understanding

1.  **Purpose of VNet Isolation:** Explain why Azure VNets are designed to be isolated from other VNets by default. What security benefit does this provide?
2.  **Subnet IP Calculation:** If a VNet has an address space of `172.16.0.0/20`, and you want to create a subnet called `AppSubnet` that can host up to 50 virtual machines, what would be a suitable CIDR range for `AppSubnet`?
3.  **Network Security Groups (NSGs):** Briefly describe how Network Security Groups (NSGs) are typically used in conjunction with subnets to enhance network security within an Azure VNet.