# Virtual Private Cloud (VPC)

Amazon Virtual Private Cloud (VPC) allows you to provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define. This gives you complete control over your virtual networking environment, including selection of your own IP address range, creation of subnets, and configuration of route tables and network gateways. A VPC is fundamental to securing and organizing your resources within AWS.

## Core Concepts and Components

### 1. VPC and CIDR Blocks
A VPC is defined by a Classless Inter-Domain Routing (CIDR) block, which is a range of IP addresses for your network. For example, `10.0.0.0/16` defines a network with 65,536 private IP addresses. You can choose any private IP address range (RFC 1918) for your VPC.

### 2. Subnets
Subnets are subdivisions of a VPC's IP address range. They are tied to a single Availability Zone (AZ) and allow you to segment your network for security and organizational purposes.
*   **Public Subnet:** Resources in a public subnet can access the internet via an Internet Gateway. They typically have a route to an Internet Gateway in their route table.
*   **Private Subnet:** Resources in a private subnet cannot directly access the internet. They typically rely on a NAT Gateway for outbound internet access to the internet or other AWS services, or a VPC endpoint for private connectivity to AWS services.

### 3. Route Tables
A route table contains a set of rules, called routes, that determine where network traffic from your subnet or gateway is directed. Each subnet must be associated with a single route table (though multiple subnets can use the same table).
*   **Local Route:** Automatically added route that enables communication within the VPC.
*   **Custom Routes:** You add routes for traffic destined outside the VPC, e.g., `0.0.0.0/0` -> Internet Gateway for internet-bound traffic.

### 4. Internet Gateway (IGW)
An Internet Gateway is a horizontally scaled, redundant, and highly available VPC component that allows communication between your VPC and the internet. It provides a target in your VPC route tables for internet-routable traffic and performs network address translation (NAT) for instances that have public IPv4 addresses.

### 5. NAT Gateway (NAT GW)
A NAT Gateway enables instances in a private subnet to connect to the internet or other AWS services, but prevents the internet from initiating connections with those instances. It's a managed service, highly available, and requires an Elastic IP address. NAT Gateways are deployed in a public subnet and traffic from private subnets is routed through them to the internet.

### 6. Security Groups
Security groups act as a virtual firewall for your EC2 instances (or other associated resources like ENIs, RDS instances). They control inbound and outbound traffic at the instance level. They are **stateful**, meaning if you allow inbound traffic, the outbound reply is automatically allowed. You can only specify allow rules.

### 7. Network Access Control Lists (NACLs)
NACLs are optional security layers for your VPC that act as a firewall for controlling traffic in and out of one or more subnets. They are **stateless**, meaning you must explicitly allow both inbound and outbound rules. You can specify both allow and deny rules, and rules are evaluated in numbered order (lowest number first).

### 8. VPC Peering
VPC Peering allows you to connect two VPCs directly using private IP addresses. Instances in either VPC can communicate with each other as if they are within the same network. This connection is not transitive (if VPC A peers with VPC B, and VPC B peers with VPC C, VPC A cannot communicate with VPC C directly via the peering connection).

## Configuring a Custom VPC: A Simple Example (AWS CLI)

Let's create a basic VPC with a public subnet and an Internet Gateway using the AWS CLI. This setup provides basic internet access to resources launched in the public subnet.

```bash
# 1. Create a VPC with a /16 CIDR block
AWS_REGION="us-east-1" # Replace with your desired region
VPC_CIDR="10.0.0.0/16"

VPC_ID=$(aws ec2 create-vpc \
  --cidr-block $VPC_CIDR \
  --query Vpc.VpcId \
  --output text \
  --region $AWS_REGION)

echo "VPC created with ID: $VPC_ID"

# 2. Create an Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --query InternetGateway.InternetGatewayId \
  --output text \
  --region $AWS_REGION)

echo "Internet Gateway created with ID: $IGW_ID"

# 3. Attach the Internet Gateway to the VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID \
  --region $AWS_REGION

echo "Internet Gateway $IGW_ID attached to VPC $VPC_ID"

# 4. Create a Public Subnet (e.g., in us-east-1a)
PUBLIC_SUBNET_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_AZ="${AWS_REGION}a"

PUBLIC_SUBNET_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $PUBLIC_SUBNET_CIDR \
  --availability-zone $PUBLIC_SUBNET_AZ \
  --query Subnet.SubnetId \
  --output text \
  --region $AWS_REGION)

echo "Public Subnet created with ID: $PUBLIC_SUBNET_ID"

# 5. Create a Route Table for public subnet
PUBLIC_ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --query RouteTable.RouteTableId \
  --output text \
  --region $AWS_REGION)

echo "Public Route Table created with ID: $PUBLIC_ROUTE_TABLE_ID"

# 6. Add a route to the Internet Gateway in the public route table
aws ec2 create-route \
  --route-table-id $PUBLIC_ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID \
  --region $AWS_REGION

echo "Route added to Public Route Table for Internet Gateway"

# 7. Associate the Public Subnet with the Public Route Table
aws ec2 associate-route-table \
  --subnet-id $PUBLIC_SUBNET_ID \
  --route-table-id $PUBLIC_ROUTE_TABLE_ID \
  --region $AWS_REGION

echo "Public Subnet associated with Public Route Table"

# 8. (Optional) Enable auto-assign public IP for instances launched in this public subnet
aws ec2 modify-subnet-attribute \
  --subnet-id $PUBLIC_SUBNET_ID \
  --map-public-ip-on-launch \
  --region $AWS_REGION

echo "Auto-assign public IP enabled for Public Subnet"
```

## Quick Check / Exercise

1.  Explain the primary difference between a Security Group and a Network ACL regarding their scope, statefulness, and rule types (allow/deny). When would you use each?
2.  You are designing a VPC for a web application. Your web servers need to be publicly accessible, but your database servers must only be accessible from the web servers and should not have direct internet access. Describe the subnet and gateway configuration you would implement for this scenario.
3.  Your company has acquired another company, and you need to enable private network communication between resources in their AWS VPC and your existing AWS VPC, which are both in the same AWS region. What is the most appropriate AWS networking feature to achieve this connection, and what is its key limitation regarding transitive routing?