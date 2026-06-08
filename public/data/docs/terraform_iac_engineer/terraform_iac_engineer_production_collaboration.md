# Production, Collaboration, and Operations

## Beyond Tutorials: Real-World IaC

Writing Terraform configs that work locally is one thing. Running them in production — where mistakes cost money, break services, and wake people up at 3 AM — is another level entirely. This section covers the practices that separate a learner from a professional.

## The Production Mindset

### 1. Reliability First

Production infrastructure must be **predictable** and **recoverable**:

- Every change goes through a pipeline with plan review and approval gates
- State is stored remotely with locking — never on someone's laptop
- Rollback strategies exist before you apply forward
- Drift detection runs on a schedule to catch manual changes

### 2. Security Is Not Optional

Infrastructure code often has more access than application code. A misconfigured S3 bucket policy or an overly permissive security group can expose the entire organization.

Key security practices:

```hcl
# ❌ Bad: Hardcoded credentials
provider "aws" {
  access_key = "AKIAIOSFODNN7EXAMPLE"
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}

# ✅ Good: Use environment variables or IAM roles
provider "aws" {
  region = var.aws_region
  # Credentials come from environment or instance profile
}
```

- **Never store secrets in code or state** — use Vault, AWS Secrets Manager, or Azure Key Vault
- **Apply least privilege** — Terraform's service account should only have permissions it needs
- **Scan configs before merging** — tfsec, Checkov, and Sentinel catch issues early

### 3. Collaboration at Scale

When multiple engineers work on the same infrastructure:

| Practice | Why |
|----------|-----|
| PR-based workflows | Every change is reviewed before apply |
| Module ownership | Clear teams own specific modules |
| Consistent naming conventions | Easier to read, search, and audit |
| Documentation in code | Comments and README files in every module |
| Terraform Cloud workspaces | Isolated state per environment/team |

## CI/CD for Infrastructure

A mature Terraform pipeline typically looks like this:

```
PR Created → Lint + Validate → Plan → Review → Merge → Apply → Verify
```

Key integration points:

- **GitHub Actions / GitLab CI** — Automate plan on PR, apply on merge
- **Atlantis** — GitOps tool that runs `terraform plan` and `apply` from PR comments
- **Terraform Cloud** — Managed runs with Sentinel policy checks and cost estimation

## Operational Responsibilities

As a Terraform/IaC Engineer in production, you own:

1. **Change management** — Coordinating infrastructure changes with application deployments
2. **Incident response** — Using Terraform to rapidly provision or rollback resources during outages
3. **Cost optimization** — Reviewing plans for resource sizing and identifying unused infrastructure
4. **Compliance** — Ensuring all provisioned resources meet organizational and regulatory policies
5. **Knowledge sharing** — Writing runbooks, maintaining module docs, and onboarding new team members

## Multi-Cloud Complexity

Many organizations use multiple cloud providers. This introduces challenges:

- Different provider APIs and resource models
- Cross-cloud networking and identity federation
- Module abstraction layers that work across providers
- Separate state backends per cloud or per team

## Communication Skills Matter

Senior IaC engineers spend significant time on non-coding tasks:

- **Explaining plans** to stakeholders who don't read HCL
- **Writing ADRs** (Architecture Decision Records) for infrastructure choices
- **Presenting cost impact** of proposed changes
- **Documenting runbooks** for common operations

---

## ✅ Checklist & Exercises

1. **Design a CI/CD pipeline** for Terraform on paper. What stages would you include? What triggers each stage?
2. **List three secrets** that a typical Terraform project might handle. For each, describe where you would store it and how Terraform would access it.
3. **Write a brief runbook** (10-15 lines) for "How to safely apply a breaking Terraform change in production."
