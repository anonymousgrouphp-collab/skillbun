# Terraform Cloud/Enterprise Operations

## What Is Terraform Cloud?

Terraform Cloud (TFC) is HashiCorp's managed platform for running Terraform in teams. It replaces the "run Terraform on someone's laptop" model with a centralized, auditable, policy-enforced workflow.

**Terraform Enterprise (TFE)** is the self-hosted version with the same features plus advanced security controls for air-gapped or on-premises environments.

## Core Features

### 1. Remote Runs

Instead of running `terraform apply` locally, TFC runs it on managed infrastructure:

```
Developer pushes code → TFC triggers a run → Plan → Policy Check → Apply
```

Benefits:

- Consistent execution environment (same Terraform version, same credentials)
- Full audit log of every plan and apply
- No cloud credentials on developer laptops

### 2. Workspaces

TFC workspaces are **not** the same as CLI workspaces. Each TFC workspace is a separate:

- State file
- Set of variables
- VCS connection
- Run history
- Team access policy

```
Organization: acme-corp
├── Workspace: networking-prod
│   ├── State: networking resources
│   ├── Variables: prod VPC CIDR, region
│   └── Team: platform-team (write)
├── Workspace: networking-staging
│   ├── State: staging networking resources
│   └── Team: platform-team (write), dev-team (read)
└── Workspace: app-compute-prod
    ├── State: compute resources
    └── Team: app-team (write)
```

### 3. Private Module Registry

Publish and version internal modules for your organization:

```hcl
# Consuming a private module from TFC registry
module "vpc" {
  source  = "app.terraform.io/acme-corp/vpc/aws"
  version = "~> 2.0"

  vpc_cidr    = var.vpc_cidr
  environment = var.environment
}
```

Benefits:

- Version-controlled modules with semantic versioning
- Documentation auto-generated from module inputs/outputs
- Access controlled by TFC organization teams

### 4. Sentinel Policy Enforcement

Sentinel policies run between plan and apply, blocking non-compliant changes:

```python
# policy: require-tags.sentinel
import "tfplan/v2" as tfplan

required_tags = ["Environment", "Owner", "CostCenter"]

main = rule {
    all tfplan.resource_changes as _, rc {
        all required_tags as tag {
            rc.change.after.tags contains tag
        }
    }
}
```

Policy sets can be applied to specific workspaces:

| Policy Level | Behavior |
|-------------|----------|
| **Advisory** | Warns but allows apply |
| **Soft Mandatory** | Blocks apply, but can be overridden by authorized users |
| **Hard Mandatory** | Blocks apply, no override possible |

### 5. Cost Estimation

TFC estimates the monthly cost impact of your planned changes:

```
Plan: 3 to add, 1 to change, 0 to destroy.

Cost Estimation:
  Resources: 4 of 4 estimated
  Monthly cost will increase by $127.40
  $12.50/mo → $139.90/mo
```

### 6. Run Triggers

Chain workspaces so that applying in one triggers a run in another:

```
networking-prod (apply) → triggers → compute-prod (plan)
                        → triggers → database-prod (plan)
```

This enables dependency management across loosely coupled infrastructure stacks.

## Setting Up TFC

### Connect to VCS

```hcl
# terraform.tf — configure TFC as the backend
terraform {
  cloud {
    organization = "acme-corp"

    workspaces {
      name = "networking-prod"
    }
  }
}
```

### Configure Variables

Variables in TFC can be:

- **Terraform variables** — Passed as `-var` to Terraform (e.g., `vpc_cidr`)
- **Environment variables** — Set in the run environment (e.g., `AWS_ACCESS_KEY_ID`)
- **Sensitive** — Masked in logs and API responses

### Team Access Control

| Permission | What It Allows |
|-----------|---------------|
| **Read** | View state, runs, and variables |
| **Plan** | Queue plans but not apply |
| **Write** | Queue plans and applies |
| **Admin** | Full workspace management |

## TFC vs. Self-Managed CI/CD

| Feature | Terraform Cloud | GitHub Actions + S3 Backend |
|---------|----------------|---------------------------|
| State management | Built-in, encrypted | You manage S3 + DynamoDB |
| Policy enforcement | Sentinel (built-in) | Manual OPA/Conftest setup |
| Cost estimation | Built-in | Third-party tools |
| Module registry | Built-in private registry | Git tags or custom registry |
| Run history & audit | Full UI and API | CI logs only |
| Pricing | Free tier + paid plans | Free for public repos |

## When to Use Terraform Enterprise

Choose TFE over TFC when you need:

- Self-hosted deployment (air-gapped, on-premises)
- SAML/SSO with your enterprise identity provider
- Audit logging to your own SIEM
- Custom concurrency limits
- Private networking (no public internet access)

---

## ✅ Checklist & Exercises

1. **Create a free Terraform Cloud account** and set up a workspace connected to a GitHub repository. Trigger a remote plan from a PR.
2. **Write a Sentinel policy** that blocks any `aws_instance` resource using an instance type larger than `t3.large`. Test it in a policy set.
3. **Publish a module** to the TFC private registry. Consume it from a workspace and verify versioning works correctly.
