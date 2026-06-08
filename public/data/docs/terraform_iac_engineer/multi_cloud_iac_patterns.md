# Multi-Cloud & Hybrid Cloud IaC Patterns

## Why Multi-Cloud?

Organizations adopt multiple cloud providers for several strategic reasons:

- **Avoid vendor lock-in** — Reduce dependency on a single provider's pricing and availability
- **Best-of-breed services** — Use AWS for compute, GCP for ML, Azure for enterprise integrations
- **Regulatory compliance** — Data residency requirements may mandate specific providers in specific regions
- **Acquisition** — Merging companies often bring different cloud environments
- **Disaster recovery** — Cross-cloud redundancy for critical workloads

Terraform is uniquely positioned for multi-cloud because it uses a **single workflow** across all providers.

## Multi-Provider Configuration

```hcl
# Configure multiple providers in a single project
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
}

provider "google" {
  project = var.gcp_project_id
  region  = "us-central1"
}
```

### Provider Aliases for Multi-Region

```hcl
provider "aws" {
  alias  = "us_east"
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu_west"
  region = "eu-west-1"
}

resource "aws_s3_bucket" "us_data" {
  provider = aws.us_east
  bucket   = "my-app-data-us"
}

resource "aws_s3_bucket" "eu_data" {
  provider = aws.eu_west
  bucket   = "my-app-data-eu"
}
```

## Abstraction Patterns

### Pattern 1: Cloud-Agnostic Module Interface

Create modules with a consistent interface that wraps provider-specific resources:

```hcl
# modules/compute/variables.tf
variable "cloud_provider" {
  type        = string
  description = "Which cloud to deploy to: aws, azure, or gcp"
}

variable "instance_name" {
  type = string
}

variable "instance_size" {
  type        = string
  description = "Normalized size: small, medium, large"
}

# modules/compute/main.tf
locals {
  size_map = {
    aws   = { small = "t3.micro",        medium = "t3.medium",    large = "t3.large" }
    azure = { small = "Standard_B1s",    medium = "Standard_B2s", large = "Standard_B4ms" }
    gcp   = { small = "e2-micro",        medium = "e2-medium",    large = "e2-standard-4" }
  }
}
```

### Pattern 2: Separate Stacks with Shared Data

```
infrastructure/
├── shared/           # Cross-cloud DNS, monitoring
├── aws/              # AWS-specific resources
│   ├── networking/
│   └── compute/
├── azure/            # Azure-specific resources
│   ├── networking/
│   └── compute/
└── modules/          # Shared module library
    ├── tagging/
    └── naming/
```

Each stack has its own state file but can read outputs from other stacks via `terraform_remote_state`.

### Pattern 3: Terragrunt for DRY Multi-Cloud

```hcl
# terragrunt.hcl at root
remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }
  config = {
    bucket = "my-terraform-state"
    key    = "${path_relative_to_include()}/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## Cross-Cloud Challenges

| Challenge | Complexity | Approach |
|-----------|-----------|----------|
| **Identity federation** | High | Use OIDC/SAML between cloud IAM systems |
| **Networking** | High | VPN/peering between VPCs and VNets |
| **Naming conventions** | Medium | Shared naming module with cloud-specific prefixes |
| **Tagging standards** | Medium | Common tag module applied everywhere |
| **Secret sharing** | High | Central Vault with cloud-specific auth methods |
| **Cost tracking** | Medium | Unified tagging + cross-cloud cost tools |
| **State management** | Medium | Separate state per cloud, shared backend |

## Cross-Cloud Networking Example

```hcl
# AWS VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Azure VNet
resource "azurerm_virtual_network" "main" {
  name                = "main-vnet"
  address_space       = ["10.1.0.0/16"]
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
}

# VPN Gateway for cross-cloud connectivity would connect these networks
# (simplified — real implementation involves VPN gateways on both sides)
```

## Hybrid Cloud Considerations

Hybrid cloud adds on-premises infrastructure to the mix:

- **VMware vSphere provider** — Manage on-prem VMs with Terraform
- **Consul** — Service discovery across cloud and on-prem
- **Network connectivity** — Direct Connect (AWS), ExpressRoute (Azure), Interconnect (GCP)
- **Consistent policies** — Same Sentinel/OPA policies apply everywhere

---

## ✅ Checklist & Exercises

1. **Configure a Terraform project** with two providers (e.g., AWS and Azure). Create one resource in each cloud from the same codebase.
2. **Design a naming convention module** that generates cloud-appropriate resource names from a common set of inputs (project, environment, component).
3. **Draw an architecture diagram** for a multi-cloud application where the frontend runs on AWS CloudFront, the API runs on GCP Cloud Run, and data is stored in Azure Cosmos DB. How would Terraform manage this?
