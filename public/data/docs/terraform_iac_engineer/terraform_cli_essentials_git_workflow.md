# Terraform CLI Essentials & Git Workflow

## Setting Up Your Development Environment

Before writing any HCL, you need a proper local setup:

1. **Install Terraform** — Download from [terraform.io](https://developer.hashicorp.com/terraform/downloads) or use a package manager
2. **Install Git** — Version control is non-negotiable for IaC
3. **Configure cloud credentials** — AWS CLI, Azure CLI, or `gcloud` for authentication
4. **Choose an editor** — VS Code with the HashiCorp Terraform extension gives you syntax highlighting, auto-completion, and formatting

```bash
# Verify installations
terraform version    # Should show v1.5+
git --version        # Should show 2.x+
aws sts get-caller-identity  # Verify AWS access (if using AWS)
```

## Essential Terraform CLI Commands

### The Core Workflow

These four commands form the backbone of every Terraform workflow:

```bash
# 1. Initialize — downloads providers and sets up the backend
terraform init

# 2. Plan — preview what Terraform will do (READ EVERY LINE)
terraform plan

# 3. Apply — execute the planned changes
terraform apply

# 4. Destroy — tear down all managed infrastructure
terraform destroy
```

### Formatting and Validation

```bash
# Auto-format your HCL files to canonical style
terraform fmt -recursive

# Check syntax and internal consistency (no provider calls)
terraform validate
```

### Inspection Commands

```bash
# Show current state of managed resources
terraform show

# List resources in the current state
terraform state list

# Show detailed info about a specific resource
terraform state show aws_instance.web

# View all outputs
terraform output
```

### Advanced Operations

```bash
# Import an existing resource into Terraform state
terraform import aws_instance.web i-0123456789abcdef0

# Move a resource in state (rename without destroy/recreate)
terraform state mv aws_instance.old aws_instance.new

# Remove a resource from state (without destroying it)
terraform state rm aws_instance.web

# Create a plan file for later apply
terraform plan -out=tfplan
terraform apply tfplan
```

## Git Workflow for Terraform Projects

### Repository Structure

```
infrastructure/
├── .gitignore           # CRITICAL — exclude sensitive files
├── .terraform.lock.hcl  # Commit this — pins provider versions
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars     # Add to .gitignore if it contains secrets
├── modules/
│   └── vpc/
└── environments/
    ├── dev/
    └── prod/
```

### The `.gitignore` Every Terraform Repo Needs

```gitignore
# Local .terraform directories
**/.terraform/*

# .tfstate files (state should be remote, not in Git)
*.tfstate
*.tfstate.*

# Crash log files
crash.log
crash.*.log

# Sensitive variable files
*.tfvars
!example.tfvars

# Override files
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# CLI configuration files
.terraformrc
terraform.rc
```

### Branching Strategy

A clean Git workflow for infrastructure changes:

```
main (protected)
  │
  ├── feature/add-vpc
  │     └── PR → plan review → approve → merge → apply
  │
  ├── fix/security-group-rules
  │     └── PR → plan review → approve → merge → apply
  │
  └── refactor/split-state
        └── PR → plan review → approve → merge → apply
```

**Golden rules:**

- Never commit state files to Git
- Always commit `.terraform.lock.hcl`
- Use feature branches — never push directly to `main`
- Include `terraform plan` output in your PR description
- Review plans like you review application code — line by line

## Useful CLI Flags

| Flag | Command | Purpose |
|------|---------|---------|
| `-auto-approve` | `apply`, `destroy` | Skip confirmation (CI/CD only, never locally) |
| `-var="key=value"` | `plan`, `apply` | Pass a variable inline |
| `-var-file=prod.tfvars` | `plan`, `apply` | Use a specific variable file |
| `-target=resource` | `plan`, `apply` | Only apply changes to one resource |
| `-refresh=false` | `plan` | Skip state refresh (faster for large states) |
| `-compact-warnings` | `plan`, `apply` | Reduce warning verbosity |

---

## ✅ Checklist & Exercises

1. **Run the full workflow** — `init` → `fmt` → `validate` → `plan` → `apply` → `destroy` on a simple config. What does each step output?
2. **Set up a `.gitignore`** for a Terraform repo using the template above. Try committing a `.tfstate` file — does Git ignore it?
3. **Practice `terraform import`** — Create a resource manually in the cloud console, then write the HCL for it and import it into state. Run `plan` to confirm zero changes.
