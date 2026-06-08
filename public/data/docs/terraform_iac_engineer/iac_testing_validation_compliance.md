# IaC Testing, Validation & Compliance

## Why Test Infrastructure Code?

A misconfigured Terraform resource can expose data, rack up costs, or take down production. Unlike application bugs that might show a wrong button color, infrastructure bugs can be catastrophic — an open security group, an unencrypted database, or a missing backup policy.

Testing IaC catches these issues **before** they reach production.

## The Testing Pyramid for Terraform

```
          ┌─────────────┐
          │  Policy &    │  ← Sentinel / OPA
          │  Compliance  │
          ├─────────────┤
          │ Integration  │  ← Terratest
          │   Tests      │
          ├─────────────┤
          │  Security    │  ← tfsec / Checkov
          │  Scanning    │
          ├─────────────┤
          │   Linting    │  ← tflint
          ├─────────────┤
          │  Validation  │  ← terraform validate
          │  & Format    │  ← terraform fmt
          └─────────────┘
```

## Level 1: Format and Validate

The cheapest checks — run them on every save and every PR:

```bash
# Check formatting (returns non-zero if files aren't formatted)
terraform fmt -check -recursive

# Validate syntax and internal consistency
terraform validate
```

## Level 2: Linting with tflint

tflint catches errors that `validate` misses — like invalid instance types, deprecated arguments, and naming violations:

```bash
# Install tflint
brew install tflint  # macOS
# or download from github.com/terraform-linters/tflint

# Run with AWS plugin
tflint --init
tflint
```

Example `.tflint.hcl` configuration:

```hcl
plugin "aws" {
  enabled = true
  version = "0.27.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "terraform_naming_convention" {
  enabled = true
  format  = "snake_case"
}
```

## Level 3: Security Scanning

### tfsec

```bash
# Scan current directory
tfsec .

# Example output:
# CRITICAL: S3 bucket does not have encryption enabled
#   resource "aws_s3_bucket" "data" {
#     bucket = "my-data-bucket"
#   }
# Resolution: Add server_side_encryption_configuration block
```

### Checkov

```bash
# Install
pip install checkov

# Scan Terraform files
checkov -d . --framework terraform

# Scan with specific checks
checkov -d . --check CKV_AWS_18,CKV_AWS_19
```

## Level 4: Integration Testing with Terratest

Terratest (written in Go) provisions **real infrastructure**, validates it, and tears it down:

```go
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestVpcModule(t *testing.T) {
    t.Parallel()

    opts := &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "vpc_cidr":    "10.0.0.0/16",
            "environment": "test",
        },
    }

    // Clean up after test
    defer terraform.Destroy(t, opts)

    // Deploy
    terraform.InitAndApply(t, opts)

    // Validate
    vpcId := terraform.Output(t, opts, "vpc_id")
    assert.NotEmpty(t, vpcId)
}
```

## Level 5: Native Terraform Tests

Terraform 1.6+ includes a built-in test framework using `.tftest.hcl` files:

```hcl
# tests/vpc.tftest.hcl
run "create_vpc" {
  command = apply

  variables {
    vpc_cidr    = "10.0.0.0/16"
    environment = "test"
  }

  assert {
    condition     = aws_vpc.main.cidr_block == "10.0.0.0/16"
    error_message = "VPC CIDR block did not match expected value"
  }

  assert {
    condition     = aws_vpc.main.tags["Environment"] == "test"
    error_message = "VPC environment tag was not set correctly"
  }
}
```

```bash
terraform test
```

## Level 6: Policy as Code

### Sentinel (Terraform Cloud/Enterprise)

```python
# Sentinel policy: require tags on all resources
import "tfplan/v2" as tfplan

main = rule {
    all tfplan.resource_changes as _, rc {
        rc.change.after.tags contains "Environment" and
        rc.change.after.tags contains "ManagedBy"
    }
}
```

### Open Policy Agent (OPA)

```rego
# Rego policy: deny public S3 buckets
package terraform.s3

deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    resource.change.after.acl == "public-read"
    msg := sprintf("S3 bucket %v must not be public", [resource.name])
}
```

## Putting It All Together in CI

```yaml
# .github/workflows/terraform-checks.yml
jobs:
  validate:
    steps:
      - run: terraform fmt -check
      - run: terraform validate
      - run: tflint
      - run: tfsec .
      - run: checkov -d .
      - run: terraform plan -out=tfplan
```

---

## ✅ Checklist & Exercises

1. **Run tfsec** on one of your Terraform projects. How many findings does it report? Fix at least two critical ones.
2. **Write a `.tftest.hcl` file** for a module you've built. Include at least two assertions that validate resource attributes.
3. **Create a Sentinel or OPA policy** that enforces a tagging standard (e.g., all resources must have `Environment` and `Owner` tags).
