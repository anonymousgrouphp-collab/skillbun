# Core Skills and Implementation

## Building Your Terraform Skill Stack

This section is where you go from "I know what Terraform is" to "I can ship infrastructure." The core skills revolve around three pillars: **HCL fluency**, **state mastery**, and **testing discipline**.

## The Three Pillars

### 1. HCL Fluency

HashiCorp Configuration Language (HCL) is Terraform's DSL. Fluency means you can:

- Declare resources, variables, outputs, and locals without looking up syntax
- Use `for_each`, `count`, and dynamic blocks to eliminate repetition
- Build modules that other engineers can consume with minimal documentation
- Use data sources to read existing infrastructure into your configs

```hcl
# Example: Creating multiple S3 buckets with for_each
variable "bucket_names" {
  type    = list(string)
  default = ["logs", "artifacts", "backups"]
}

resource "aws_s3_bucket" "buckets" {
  for_each = toset(var.bucket_names)
  bucket   = "${var.project}-${each.value}"

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

### 2. State Mastery

Terraform state is the bridge between your code and reality. You need to understand:

- **Remote backends** — Store state in S3, Azure Blob, or GCS instead of locally
- **State locking** — Prevent two people from applying at the same time
- **State operations** — Move, remove, and import resources without destroying them
- **Workspaces** — Manage multiple environments (dev/staging/prod) from one codebase

### 3. Testing Discipline

Infrastructure bugs are expensive. Testing catches them before they hit production:

- **`terraform validate`** — Syntax and internal consistency checks
- **`terraform plan`** — Preview changes before applying
- **`tflint`** — Lint for best practices and provider-specific rules
- **`tfsec` / Checkov** — Security scanning for misconfigurations
- **Terratest** — Integration tests that provision real resources and verify behavior

## How These Skills Connect

```
HCL Fluency ──► Write clean, modular configs
                        │
                        ▼
State Mastery ──► Safely manage what's deployed
                        │
                        ▼
Testing ──────► Validate before every change
                        │
                        ▼
              Production-Ready Infrastructure
```

## Practical Advice

- **Start small.** Provision a single EC2 instance or a resource group before tackling VPCs and Kubernetes clusters.
- **Read plans carefully.** A `terraform plan` that shows `destroy` when you expected `update` means something is wrong.
- **Use `.tfvars` files** for environment-specific values. Never hardcode secrets in your HCL.
- **Tag everything.** Tags make resources searchable, auditable, and cost-attributable.
- **Version-pin providers.** Without version constraints, a provider update could break your configs silently.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}
```

## Common Mistakes at This Stage

| Mistake | Why It Hurts | Fix |
|---------|-------------|-----|
| Hardcoding values | Can't reuse configs across environments | Use variables and `.tfvars` |
| Ignoring state locking | Concurrent applies corrupt state | Use DynamoDB/Blob locking |
| Giant monolith configs | Hard to review, slow to plan | Split into modules |
| Skipping `plan` review | Unexpected destroys hit production | Always review plan output |

---

## ✅ Checklist & Exercises

1. **Write a Terraform config** that creates two cloud resources using `for_each`. Run `terraform plan` and read the output line by line.
2. **Explain the difference** between `count` and `for_each` — when would you choose one over the other?
3. **Set up a remote backend** (e.g., S3 + DynamoDB) for a small project. Verify that state locking works by checking the lock table.
