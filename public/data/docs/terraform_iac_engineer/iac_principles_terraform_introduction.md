# IaC Principles & Terraform Introduction

## What Is Infrastructure as Code?

Infrastructure as Code (IaC) is the practice of managing and provisioning computing infrastructure through machine-readable configuration files rather than manual processes. Instead of logging into a cloud console and clicking buttons, you write code that describes exactly what you want.

## Declarative vs. Imperative IaC

There are two fundamental approaches to IaC:

### Declarative (What)

You describe the **desired end state**. The tool figures out how to get there.

```hcl
# Terraform (Declarative) — "I want this to exist"
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
```

### Imperative (How)

You write **step-by-step instructions**. The tool executes them in order.

```bash
# AWS CLI (Imperative) — "Do these steps"
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-server}]'
```

**Terraform is declarative.** You tell it what the infrastructure should look like, and Terraform computes the minimal set of API calls to make it so.

## Core IaC Benefits

1. **Version Control** — Infrastructure changes live in Git with full history, blame, and rollback
2. **Reproducibility** — Identical environments from the same code, every time
3. **Automation** — CI/CD pipelines can provision infrastructure without human intervention
4. **Documentation** — The code *is* the documentation of what's deployed
5. **Collaboration** — Teams review infrastructure changes via pull requests

## Where Terraform Fits

The IaC landscape includes several tools:

| Tool | Approach | Strength |
|------|----------|----------|
| **Terraform** | Declarative, multi-cloud | Provider ecosystem, state management |
| **Pulumi** | Declarative, general-purpose languages | Use Python/TypeScript/Go instead of HCL |
| **CloudFormation** | Declarative, AWS-only | Deep AWS integration |
| **Ansible** | Imperative/procedural | Configuration management + provisioning |
| **CDK** | Declarative via code | AWS constructs in familiar languages |

Terraform's killer feature is its **provider model** — a single tool that works across AWS, Azure, GCP, Kubernetes, GitHub, Datadog, and hundreds more.

## Your First Terraform Configuration

Every Terraform project starts with these building blocks:

```hcl
# 1. Terraform settings — version constraints and backend
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 2. Provider configuration — how to authenticate
provider "aws" {
  region = "us-east-1"
}

# 3. Resource — the infrastructure you want to create
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-first-terraform-bucket-12345"

  tags = {
    Environment = "learning"
    ManagedBy   = "terraform"
  }
}

# 4. Output — values you want to see after apply
output "bucket_arn" {
  value = aws_s3_bucket.my_bucket.arn
}
```

## HCL Basics at a Glance

HCL (HashiCorp Configuration Language) uses a block-based syntax:

- **Blocks** — `resource`, `variable`, `output`, `data`, `module`, `terraform`, `provider`
- **Arguments** — Key-value pairs inside blocks (`bucket = "my-bucket"`)
- **Expressions** — References (`aws_s3_bucket.my_bucket.arn`), functions (`join`, `lookup`), and interpolation

## Common IaC Challenges

- **State management** — Keeping the state file secure, consistent, and synchronized
- **Secret handling** — Avoiding credentials in code or state files
- **Blast radius** — A misconfigured `terraform apply` can destroy production resources
- **Learning curve** — HCL has its own idioms that take time to internalize

---

## ✅ Checklist & Exercises

1. **Create a `main.tf` file** that declares a Terraform block, a provider, and one resource. Run `terraform init` and `terraform plan` — what output do you see?
2. **Compare declarative vs. imperative** — Write out (in pseudocode or prose) how you would create a VPC, subnet, and EC2 instance using both approaches. Which is more maintainable?
3. **List three providers** from the [Terraform Registry](https://registry.terraform.io/) that you might use in a real project. What resources does each provider offer?
