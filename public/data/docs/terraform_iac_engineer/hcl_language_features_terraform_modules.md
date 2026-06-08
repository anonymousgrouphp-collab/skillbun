# HCL Language Features & Terraform Modules

## Mastering HCL Beyond the Basics

HCL has more depth than it first appears. This guide covers the constructs that separate beginner configs from production-grade infrastructure code.

## Variables, Locals, and Outputs

### Input Variables

```hcl
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_config" {
  description = "EC2 instance configuration"
  type = object({
    instance_type = string
    ami_id        = string
    disk_size_gb  = number
  })
}
```

### Local Values

Locals are computed values scoped to the module — great for reducing repetition:

```hcl
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Team        = "platform"
  }
  name_prefix = "${var.project_name}-${var.environment}"
}
```

### Outputs

Expose values for other modules or human consumption:

```hcl
output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = [for s in aws_subnet.private : s.id]
}
```

## Data Sources

Data sources **read** existing infrastructure without creating anything:

```hcl
# Look up the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

## Looping: `count` vs. `for_each`

### `count` — Index-Based

```hcl
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
}
```

### `for_each` — Key-Based (Preferred)

```hcl
variable "subnets" {
  default = {
    public-1  = { cidr = "10.0.1.0/24", az = "us-east-1a" }
    public-2  = { cidr = "10.0.2.0/24", az = "us-east-1b" }
    private-1 = { cidr = "10.0.10.0/24", az = "us-east-1a" }
  }
}

resource "aws_subnet" "this" {
  for_each          = var.subnets
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az

  tags = merge(local.common_tags, { Name = each.key })
}
```

**Why prefer `for_each`?** Removing an item from the middle of a `count` list shifts all indices and forces recreation. `for_each` uses stable keys, so removals only affect the deleted resource.

## Dynamic Blocks

Generate repeated nested blocks programmatically:

```hcl
resource "aws_security_group" "web" {
  name   = "${local.name_prefix}-web-sg"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.allowed_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}
```

## Terraform Modules

Modules are reusable packages of Terraform configuration. Think of them as functions for infrastructure.

### Module Structure

```
modules/vpc/
├── main.tf         # Resources
├── variables.tf    # Inputs
├── outputs.tf      # Exposed values
└── README.md       # Usage docs
```

### Consuming a Module

```hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr     = "10.0.0.0/16"
  environment  = var.environment
  project_name = var.project_name
}

# Using a module from the Terraform Registry
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "${local.name_prefix}-assets"
  acl    = "private"
}
```

### Module Design Principles

1. **Single responsibility** — One module handles one concern (networking, compute, database)
2. **Expose only what's needed** — Outputs should be intentional, not "dump everything"
3. **Validate inputs** — Use `validation` blocks on variables
4. **Version your modules** — Use Git tags or a private registry
5. **Document with README** — Include usage examples and input/output tables

---

## ✅ Checklist & Exercises

1. **Refactor a flat config** into a module. Move a VPC + subnets into `modules/vpc/` with proper inputs, outputs, and a README.
2. **Use a `for_each` loop** to create three IAM users from a map variable. Output their ARNs.
3. **Consume a public module** from the Terraform Registry (e.g., `terraform-aws-modules/vpc/aws`). Customize it with your own variables and deploy it.
