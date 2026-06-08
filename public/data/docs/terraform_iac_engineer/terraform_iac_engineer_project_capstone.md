# Project: Terraform/IaC Engineer Portfolio Capstone

## Capstone Overview

This capstone project ties together everything you've learned — HCL, modules, state management, testing, CI/CD, secrets, and multi-cloud patterns — into a single, portfolio-grade deliverable that demonstrates your readiness for a professional Terraform/IaC Engineer role.

## Project Requirements

Your capstone must include the following components:

### 1. A Realistic Infrastructure Problem

Choose a scenario that mirrors real-world challenges:

- **Option A**: Multi-environment web application (VPC, ALB, ECS/EC2, RDS, S3) with dev/staging/prod parity
- **Option B**: Kubernetes cluster provisioning (EKS/AKS/GKE) with networking, IAM, and add-ons
- **Option C**: Multi-cloud deployment with primary workload on AWS and DR failover on Azure/GCP
- **Option D**: Internal developer platform with self-service Terraform modules and a private registry

### 2. Repository Structure

```
capstone-terraform-project/
├── README.md                    # Project overview, architecture, usage
├── CHANGELOG.md                 # Version history
├── docs/
│   ├── architecture.md          # Architecture decisions
│   ├── diagrams/                # Architecture diagrams (draw.io, Mermaid)
│   └── runbooks/                # Operational runbooks
├── modules/                     # Reusable modules
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── compute/
│   └── database/
├── environments/                # Environment configs
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   └── prod/
├── tests/                       # Test files
│   ├── networking.tftest.hcl
│   └── compute_test.go          # Terratest (optional)
├── policies/                    # Policy as code
│   └── require-tags.sentinel
├── .github/workflows/           # CI/CD pipelines
│   ├── terraform-plan.yml
│   └── terraform-apply.yml
├── .tflint.hcl                  # Linting config
├── .gitignore
└── .terraform.lock.hcl
```

### 3. Technical Requirements Checklist

Your capstone should demonstrate proficiency in each roadmap area:

| Area | Requirement |
|------|-------------|
| **HCL** | Variables with validation, locals, outputs, `for_each`, dynamic blocks |
| **Modules** | At least 2 custom modules with README and versioning |
| **State** | Remote backend with locking, workspace or directory-based env separation |
| **Testing** | `terraform validate`, tflint, tfsec, and at least one `.tftest.hcl` file |
| **CI/CD** | GitHub Actions (or GitLab CI) with plan-on-PR and apply-on-merge |
| **Secrets** | No hardcoded credentials; use Vault, Secrets Manager, or OIDC |
| **Documentation** | Architecture diagram, design decisions, usage instructions |

### 4. README Template

Your README is the first thing reviewers see. It should answer these questions:

```markdown
# [Project Name]

## Problem Statement
What infrastructure challenge does this solve? (2-3 sentences)

## Architecture
![Architecture Diagram](docs/diagrams/architecture.png)

Brief description of the architecture and key design decisions.

## Prerequisites
- Terraform >= 1.5.0
- AWS CLI configured with appropriate credentials
- [Any other tools]

## Quick Start
```bash
cd environments/dev
terraform init
terraform plan
terraform apply
```

## Module Documentation
| Module | Description | Inputs | Outputs |
|--------|-------------|--------|---------|
| networking | VPC, subnets, NAT | [link] | [link] |
| compute | EC2/ECS instances | [link] | [link] |

## Testing
```bash
terraform validate
tflint
tfsec .
terraform test
```

## CI/CD Pipeline
Description of the pipeline stages and approval process.

## Design Decisions
Link to docs/architecture.md for detailed ADRs.

## Lessons Learned
What worked, what didn't, what you'd do differently.

## Future Improvements
What you would add with more time.
```

### 5. Presentation Readiness

Prepare to demo your capstone in a 10-15 minute presentation:

1. **Problem framing** (2 min) — What and why
2. **Architecture walkthrough** (3 min) — Diagram + key decisions
3. **Code walkthrough** (4 min) — Show module design, testing, CI/CD
4. **Live demo** (3 min) — Run `terraform plan`, show pipeline, show state
5. **Reflections** (2 min) — Lessons learned, future work

## Grading Yourself

| Criteria | Needs Work | Competent | Excellent |
|----------|-----------|-----------|-----------|
| **Code quality** | Flat config, no modules | Modules with variables | Validated, tested, linted modules |
| **State mgmt** | Local state | Remote state | Remote + locking + workspaces |
| **Security** | Hardcoded creds | Env vars | OIDC/Vault + tfsec clean |
| **CI/CD** | Manual applies | Plan in CI | Full plan → approve → apply pipeline |
| **Documentation** | No README | Basic README | Architecture docs, ADRs, runbooks |
| **Testing** | No tests | validate + fmt | validate + tflint + tfsec + tftest |

---

## ✅ Checklist & Exercises

1. **Choose your capstone scenario** from the options above (or define your own). Write a 1-paragraph problem statement.
2. **Set up the repository structure** following the template. Create skeleton files for each module, environment, and CI/CD workflow.
3. **Complete the capstone end-to-end.** Deploy to a real cloud account, run all tests, trigger the CI/CD pipeline, and write the full README with architecture diagrams and design decisions.
