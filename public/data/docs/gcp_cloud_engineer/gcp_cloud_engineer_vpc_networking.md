# Virtual Private Cloud (VPC) Networking Fundamentals

Google Cloud's Virtual Private Cloud (VPC) provides a robust and scalable networking foundation for your cloud resources. It allows you to define and manage your own isolated network in the cloud, offering granular control over IP addresses, routing, and security policies.

## 1. Introduction to GCP VPC Networks

A VPC network is a global, software-defined network that is logically isolated from other virtual networks in Google Cloud. It enables your Google Cloud resources (like Compute Engine instances, GKE clusters, Cloud SQL instances) to connect to each other and to the internet.

### Key Characteristics:
*   **Global Reach:** While subnets are regional, a VPC network itself is global, allowing resources from different regions to communicate internally across the network.
*   **Isolation:** Your VPC network is logically isolated from other customers' networks.
*   **Scalability:** Easily expand your network by adding more subnets and resources.
*   **Granular Control:** Define custom IP ranges, firewall rules, and routing tables to precisely control traffic flow.

## 2. VPC Networks and Subnets

### VPC Networks
Google Cloud offers two main types of VPC networks:
*   **Default Mode VPC:** Automatically created for new projects, it includes one subnet in each Google Cloud region with pre-defined IPv4 ranges. This is convenient for quick starts but offers less control over IP space.
*   **Custom Mode VPC:** Allows you to manually create and manage all subnets. You define the regions and IP ranges for each subnet, providing complete control over your network topology and IP address allocation. This is recommended for production environments.

### Subnets
Subnetworks (subnets) are regional resources within a VPC network. Each subnet defines a range of IP addresses (CIDR block) that resources in that region can use. Resources (like VM instances) obtain their internal IP addresses from the primary IP range of the subnet they are located in.

*   **Primary IP Range:** The main IPv4 CIDR block for instances within the subnet.
*   **Secondary IP Ranges (Alias IPs):** Can be configured for specific purposes, such as GKE pods or advanced application setups, allowing multiple internal IP addresses on a single network interface.

## 3. Firewall Rules

Firewall rules protect your instances by controlling ingress (inbound) and egress (outbound) traffic. They are applied at the network level, not at the instance level, meaning a single rule can apply to multiple instances.

### Key Components of a Firewall Rule:
*   **Network:** The VPC network to which the rule applies.
*   **Direction:** `INGRESS` (inbound to instances) or `EGRESS` (outbound from instances).
*   **Action:** `ALLOW` or `DENY` traffic.
*   **Priority:** An integer from 0 to 65535. Lower numbers indicate higher priority (0 is highest). If rules conflict, the one with the highest priority (lowest number) wins.
*   **Targets:** Defines which instances the rule applies to. Can be specified by `network tags` (e.g., `web-server`), `service accounts`, or `all instances in the network`.
*   **Source/Destination Filters:** 
    *   For `INGRESS`: `Source IP ranges`, `source network tags`, `source service accounts`, or `source custom routes`.
    *   For `EGRESS`: `Destination IP ranges`, `destination network tags`, `destination service accounts`, or `destination custom routes`.
*   **Protocols and Ports:** Specifies the protocols (e.g., TCP, UDP, ICMP) and port numbers (e.g., `tcp:80`, `udp:53`) to which the rule applies.

## 4. Routing Tables

Routing tables determine how packets are forwarded within your VPC network. Every VPC network has an implicit routing table and can have custom routes defined.

### Types of Routes:
*   **Implicit Routes:**
    *   **Default Route (0.0.0.0/0):** Automatically created, directs traffic to an internet gateway (or a custom next hop if configured) if no other route matches. Essential for internet connectivity.
    *   **Subnet Routes:** Automatically created for each subnet, enabling communication between instances within the same VPC network (even across regions) using their internal IP addresses.
*   **Custom Routes:**
    *   Manually created to define specific paths for traffic that deviate from implicit routes.
    *   Can direct traffic to specific **next-hops**, such as:
        *   A VPN tunnel to connect to on-premises networks.
        *   A Google Cloud Interconnect connection.
        *   An internal IP address of a VM instance (e.g., for a NAT gateway or proxy).
        *   A Load Balancer.

## 5. Connecting Resources Securely

Secure communication is a cornerstone of VPC networking:
*   **Internal IP Communication:** Resources within the same VPC network communicate using private internal IP addresses, never traversing the public internet.
*   **Private Google Access:** Allows VM instances *without external IP addresses* in a subnet to access Google APIs and services (like Cloud Storage, BigQuery) over Google's internal network, enhancing security by keeping traffic private.
*   **Shared VPC (XPN):** Allows multiple projects to use a common, centrally managed VPC network in a host project. This simplifies network administration and resource connectivity for large organizations.
*   **VPC Network Peering:** Connects two VPC networks directly, allowing resources in each network to communicate using internal IP addresses. This is useful for connecting networks from different organizations or projects without using public IPs.

## 6. Configuration Example: Creating a Custom VPC and Firewall Rule

This example uses the `gcloud` command-line tool to set up a basic custom mode VPC network, a subnet, and a firewall rule.

```bash
# 1. Create a Custom Mode VPC Network named 'skillbun-vpc'
gcloud compute networks create skillbun-vpc \
    --subnet-mode=custom \
    --description="Custom VPC for SkillBun topic"

# 2. Create a Subnet named 'skillbun-subnet-us-central1' in the new VPC
gcloud compute networks subnets create skillbun-subnet-us-central1 \
    --network=skillbun-vpc \
    --range=10.0.0.0/20 \
    --region=us-central1 \
    --description="Subnet in us-central1 for skillbun-vpc"

# 3. Create a Firewall Rule to allow SSH (tcp:22) to instances with the 'dev-instance' network tag
gcloud compute firewall-rules create allow-ssh-dev \
    --network=skillbun-vpc \
    --action=ALLOW \
    --direction=INGRESS \
    --rules=tcp:22 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=dev-instance \
    --description="Allow SSH from any IP to instances tagged 'dev-instance'"
```

## 7. Quick Check / Exercise

1.  **Question:** What is the primary advantage of using a Custom Mode VPC over a Default Mode VPC for a production environment?
2.  **Scenario:** You've deployed a web application on a Compute Engine instance within `skillbun-vpc`. You want this instance to be accessible via HTTP from the internet but not SSH. How would you configure a firewall rule to achieve this, assuming the instance has the network tag `web-app`?
3.  **Task:** Briefly explain how Private Google Access enhances security for VM instances interacting with Google APIs.