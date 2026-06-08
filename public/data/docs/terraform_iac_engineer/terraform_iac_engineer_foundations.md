# Foundations and Role Context

## What Does a Terraform/IaC Engineer Actually Do?

A Terraform/IaC Engineer owns the automation layer between cloud services and the teams that consume them. Instead of clicking through cloud consoles to spin up servers, databases, or networks, you **write code** that declares what your infrastructure should look like — and let Terraform make it real.

Your day-to-day work involves writing HCL configurations, reviewing pull requests for infrastructure changes, debugging state drift, and collaborating with security and platform teams to keep cloud environments consistent and auditable.

## Why Infrastructure as Code Matters

Before IaC, teams provisioned infrastructure manually. This created several painful problems:

| Problem | Without IaC | With IaC |
|---------|------------|----------|
| Reproducibility | "Works on my account" | Identical environments from code |
| Audit trail | Who changed what? No idea | Git history shows every change |
| Speed | Hours of clicking through consoles | Minutes with `terraform apply` |
| Drift | Environments diverge silently | Detect and fix drift automatically |
| Collaboration | Tribal knowledge in one person's head | Shared, reviewed codebase |

## The Terraform Ecosystem at a Glance

Terraform sits at the center of a broader ecosystem:

```
┌─────────────────────────────────────────────────┐
│                  Your Team                       │
│   writes HCL → reviews PRs → merges to main     │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Terraform CLI  │
              │  init/plan/apply│
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌───────────┐  ┌──────────┐
   │   AWS   │  │   Azure   │  │   GCP    │
   │Provider │  │ Provider  │  │ Provider │
   └─────────┘  └───────────┘  └──────────┘
```

- **Providers** connect Terraform to cloud APIs (AWS, Azure, GCP, Kubernetes, GitHub, etc.)
- **State** tracks what Terraform has created so it knows what to update or destroy
- **Modules** let you package and reuse infrastructure patterns
- **Terraform Cloud/Enterprise** adds team workflows, policy checks, and a private registry

## Key Concepts to Internalize Early

1. **Declarative thinking** — You describe the *desired end state*, not the steps to get there. Terraform figures out the diff.
2. **Idempotency** — Running `terraform apply` twice with the same config changes nothing the second time.
3. **Plan before apply** — Always inspect the execution plan. Never blindly apply changes.
4. **State is sacred** — The state file is Terraform's source of truth. Treat it with the same care you'd give a production database.

## Role Variants You'll Encounter

The "Terraform/IaC Engineer" title covers several related roles in the industry:

- **Platform Engineer** — Builds internal developer platforms with Terraform modules as building blocks
- **DevOps Engineer** — Manages CI/CD pipelines that include Terraform automation
- **Cloud Infrastructure Engineer** — Focuses on a single cloud provider's resources via Terraform
- **Site Reliability Engineer (SRE)** — Uses Terraform for reliable, repeatable infrastructure deployments

Understanding these variants helps you tailor your learning and target the right job postings.

## What You'll Build in This Roadmap

By the end of this roadmap, you will have:

- Written production-quality HCL configurations
- Managed remote state with locking and workspaces
- Built reusable Terraform modules
- Implemented CI/CD pipelines for infrastructure changes
- Secured secrets and enforced compliance policies
- Designed multi-cloud architectures
- Created a portfolio-ready capstone project

---

## ✅ Checklist & Exercises

1. **Explain in your own words** why manual infrastructure provisioning breaks down at scale. What are three specific risks?
2. **Research two job postings** for "Terraform Engineer" or "Infrastructure Engineer" — list the common skills and tools they mention.
3. **Install Terraform** on your machine and run `terraform version` to confirm it works. What version are you running?
