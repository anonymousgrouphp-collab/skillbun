# Secure & Reliable IaC with Secrets Management

## The Secrets Problem in Terraform

Terraform needs credentials to provision infrastructure, and the resources it creates often require secrets (database passwords, API keys, TLS certificates). If you handle secrets carelessly, they end up in:

- **HCL files** — committed to Git for everyone to see
- **State files** — stored in plaintext JSON
- **Plan output** — printed in CI logs
- **Variable files** — `.tfvars` accidentally committed

Every one of these is a security incident waiting to happen.

## Rule #1: Never Hardcode Secrets

```hcl
# ❌ NEVER do this
resource "aws_db_instance" "main" {
  username = "admin"
  password = "SuperSecret123!"  # This ends up in state AND Git
}

# ✅ Use a variable marked as sensitive
variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_db_instance" "main" {
  username = "admin"
  password = var.db_password
}
```

The `sensitive = true` flag prevents Terraform from displaying the value in plan/apply output, but it **still exists in state**. State encryption is essential.

## Secrets Management Solutions

### HashiCorp Vault

Vault is the gold standard for secrets management in the Terraform ecosystem:

```hcl
# Read a secret from Vault
data "vault_generic_secret" "db_creds" {
  path = "secret/data/production/database"
}

resource "aws_db_instance" "main" {
  username = data.vault_generic_secret.db_creds.data["username"]
  password = data.vault_generic_secret.db_creds.data["password"]
}
```

### AWS Secrets Manager

```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/database/password"
}

resource "aws_db_instance" "main" {
  username = "admin"
  password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

### Azure Key Vault

```hcl
data "azurerm_key_vault_secret" "db_password" {
  name         = "database-password"
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_mssql_server" "main" {
  administrator_login_password = data.azurerm_key_vault_secret.db_password.value
}
```

## Credential Management for Terraform Itself

Terraform needs credentials to talk to cloud APIs. Here's the hierarchy from worst to best:

| Method | Security Level | Use Case |
|--------|---------------|----------|
| Hardcoded in provider block | 🔴 Terrible | Never |
| Environment variables | 🟡 Acceptable | Local dev |
| Shared credentials file | 🟡 Acceptable | Local dev |
| IAM Instance Profile | 🟢 Good | EC2-based CI runners |
| OIDC Federation | 🟢 Best | GitHub Actions, GitLab CI |
| Vault dynamic credentials | 🟢 Best | Enterprise environments |

### OIDC Federation Example (GitHub Actions → AWS)

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/terraform-github
      aws-region: us-east-1
```

No long-lived credentials stored anywhere. The CI runner gets temporary credentials that expire after the job.

## Least Privilege Principle

Terraform's service account should only have permissions it needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "s3:*",
        "rds:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    }
  ]
}
```

Even better — scope permissions to specific resource ARNs rather than using wildcards.

## Drift Detection and Reliability

### Detecting Drift

```bash
# Check for drift without making changes
terraform plan -refresh-only -detailed-exitcode
# Exit code 0 = no drift, 2 = drift detected
```

Schedule drift detection in CI to catch manual changes:

```yaml
# Run drift detection daily
on:
  schedule:
    - cron: '0 6 * * *'

jobs:
  drift-check:
    steps:
      - run: terraform plan -refresh-only -detailed-exitcode
```

### Ensuring Idempotency

Terraform is designed to be idempotent — applying the same config twice should produce no changes. But some patterns break idempotency:

- Using `timestamp()` or `uuid()` functions in resource attributes
- Resources with auto-generated names that change on each apply
- External data sources that return different values over time

---

## ✅ Checklist & Exercises

1. **Replace hardcoded secrets** in a Terraform project with references to AWS Secrets Manager or Azure Key Vault. Verify the secret is not visible in `terraform plan` output.
2. **Set up OIDC federation** between GitHub Actions and your cloud provider. Run a Terraform pipeline that uses no long-lived credentials.
3. **Implement a drift detection job** that runs on a schedule and sends a Slack notification when drift is detected.
