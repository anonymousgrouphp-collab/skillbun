# Terraform State Management

## Why State Matters

Terraform state is the **single source of truth** about your infrastructure. It maps your HCL resources to real cloud objects, tracks metadata, and enables Terraform to compute the diff between desired and actual state.

Without state, Terraform would have no idea what it already created. Every `apply` would try to create everything from scratch.

## How State Works

```
Your HCL Code  ──►  Terraform  ──►  Cloud Provider API
                       │
                       ▼
                  State File (.tfstate)
                  Maps resource IDs to
                  real infrastructure
```

The state file is a JSON document that contains:

- Resource IDs (e.g., `i-0abc123`, `subnet-456def`)
- Resource attributes (IP addresses, ARNs, tags)
- Dependency relationships between resources
- Provider metadata

## Local vs. Remote State

### Local State (Default)

```bash
# Created automatically after first apply
terraform.tfstate        # Current state
terraform.tfstate.backup # Previous state
```

**Problems with local state:**

- Lost if your laptop dies
- Can't be shared with teammates
- No locking — concurrent applies corrupt state
- Secrets stored in plaintext on disk

### Remote State (Production Standard)

```hcl
# S3 backend with DynamoDB locking (AWS)
terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "prod/networking/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

```hcl
# Azure Blob backend
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate12345"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

**Benefits of remote state:**

- Centralized — everyone reads the same state
- Encrypted at rest and in transit
- Locking prevents concurrent modifications
- Versioned — roll back to previous state snapshots

## State Locking

State locking prevents two engineers (or two pipeline runs) from modifying state simultaneously:

```
Engineer A: terraform apply  →  Acquires lock  →  Applies  →  Releases lock
Engineer B: terraform apply  →  Waits for lock  →  (blocked until A finishes)
```

If a lock gets stuck (e.g., a crashed process), you can manually release it:

```bash
terraform force-unlock LOCK_ID
```

⚠️ **Use `force-unlock` with extreme caution.** Only use it when you're certain no other process is running.

## Terraform Workspaces

Workspaces let you manage multiple state files from a single configuration:

```bash
# Create and switch to a new workspace
terraform workspace new staging
terraform workspace new prod

# List workspaces
terraform workspace list

# Switch between workspaces
terraform workspace select prod
```

Use `terraform.workspace` in your configs to vary behavior:

```hcl
locals {
  instance_type = terraform.workspace == "prod" ? "t3.large" : "t3.micro"
  name_prefix   = "myapp-${terraform.workspace}"
}
```

**Workspaces vs. separate directories:** Workspaces work well for simple environment differences. For significantly different environments, separate directory structures with their own backends are often cleaner.

## Advanced State Operations

### Import Existing Resources

```bash
# Bring an existing AWS instance under Terraform management
terraform import aws_instance.web i-0123456789abcdef0
```

After import, you must write the corresponding HCL. Run `terraform plan` — if it shows zero changes, your code matches reality.

### Move Resources

```bash
# Rename a resource without destroying it
terraform state mv aws_instance.old_name aws_instance.new_name

# Move a resource into a module
terraform state mv aws_instance.web module.compute.aws_instance.web
```

### Remove from State

```bash
# Stop managing a resource without destroying it
terraform state rm aws_instance.legacy
```

### Accessing Remote State from Another Project

```hcl
data "terraform_remote_state" "networking" {
  backend = "s3"
  config = {
    bucket = "my-company-terraform-state"
    key    = "prod/networking/terraform.tfstate"
    region = "us-east-1"
  }
}

# Use outputs from the networking state
resource "aws_instance" "web" {
  subnet_id = data.terraform_remote_state.networking.outputs.public_subnet_id
}
```

## State Drift

Drift happens when someone changes infrastructure outside of Terraform (e.g., via the console). Terraform detects drift during `plan`:

```bash
# Refresh state to detect drift
terraform plan -refresh-only

# Apply refresh to update state without changing infrastructure
terraform apply -refresh-only
```

---

## ✅ Checklist & Exercises

1. **Set up a remote backend** with S3 + DynamoDB (or Azure Blob). Migrate an existing local state using `terraform init -migrate-state`.
2. **Create two workspaces** (`dev` and `prod`) for the same configuration. Deploy with different instance sizes per workspace.
3. **Simulate drift** — manually change a resource tag in the cloud console, then run `terraform plan`. What does the output show?
