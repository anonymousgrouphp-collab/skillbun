# Automated CI/CD for Terraform Pipelines

## Why Automate Terraform?

Running `terraform apply` from your laptop is fine for learning. In production, it's a liability:

- No audit trail of who ran what
- No approval gate before changes hit production
- No consistent environment (different Terraform versions, different credentials)
- Risk of partial applies if someone's connection drops

CI/CD pipelines solve all of these problems.

## The Standard Terraform Pipeline

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  PR      │──►│  Lint &  │──►│  Plan    │──►│  Review  │──►│  Apply   │
│  Created │   │  Validate│   │  (saved) │   │  & Merge │   │  (main)  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

**Key stages:**

1. **Lint & Validate** — `terraform fmt -check`, `terraform validate`, `tflint`, `tfsec`
2. **Plan** — Generate and save a plan file; post it as a PR comment
3. **Review** — Engineers review the plan output in the PR
4. **Apply** — After merge to `main`, apply the saved plan (or re-plan and apply)
5. **Verify** — Optionally run post-apply smoke tests

## GitHub Actions Pipeline

```yaml
name: Terraform CI/CD

on:
  pull_request:
    paths: ['infra/**']
  push:
    branches: [main]
    paths: ['infra/**']

env:
  TF_VERSION: "1.7.0"
  WORKING_DIR: "infra/prod"

jobs:
  plan:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init -input=false
        working-directory: ${{ env.WORKING_DIR }}

      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        working-directory: ${{ env.WORKING_DIR }}

      - name: Terraform Validate
        run: terraform validate
        working-directory: ${{ env.WORKING_DIR }}

      - name: Terraform Plan
        run: terraform plan -no-color -out=tfplan
        working-directory: ${{ env.WORKING_DIR }}

      - name: Post Plan to PR
        uses: actions/github-script@v7
        with:
          script: |
            const plan = require('fs').readFileSync('${{ env.WORKING_DIR }}/tfplan.txt');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '```\n' + plan + '\n```'
            });

  apply:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init -input=false
        working-directory: ${{ env.WORKING_DIR }}

      - name: Terraform Apply
        run: terraform apply -auto-approve -input=false
        working-directory: ${{ env.WORKING_DIR }}
```

## GitLab CI Pipeline

```yaml
stages:
  - validate
  - plan
  - apply

validate:
  stage: validate
  script:
    - terraform init -backend=false
    - terraform fmt -check
    - terraform validate
    - tflint

plan:
  stage: plan
  script:
    - terraform init
    - terraform plan -out=tfplan
  artifacts:
    paths:
      - tfplan

apply:
  stage: apply
  script:
    - terraform init
    - terraform apply tfplan
  when: manual  # Manual approval gate
  only:
    - main
```

## Atlantis: GitOps for Terraform

Atlantis is a self-hosted application that listens for PR webhooks and runs Terraform commands:

```yaml
# atlantis.yaml
version: 3
projects:
  - dir: infra/prod
    workspace: default
    autoplan:
      when_modified: ["*.tf", "*.tfvars"]
      enabled: true
    apply_requirements: [approved, mergeable]
```

**Workflow:**

1. Engineer opens PR with Terraform changes
2. Atlantis automatically runs `terraform plan` and posts output as a comment
3. Reviewer approves the PR
4. Engineer comments `atlantis apply` to trigger the apply
5. Atlantis runs `terraform apply` and posts the result

## Pipeline Best Practices

| Practice | Why |
|----------|-----|
| Pin Terraform version | Prevents version-skew bugs |
| Use saved plan files | Ensures what you reviewed is what gets applied |
| Require PR approval before apply | Human gate for production changes |
| Use GitHub environments | Built-in approval workflows and secret scoping |
| Separate plan and apply jobs | Clear audit trail |
| Post plan output to PR | Reviewers see exactly what will change |
| Use OIDC for cloud auth | No long-lived credentials in CI |

## Credential Management in CI

Never store cloud credentials as plain CI variables. Use OIDC federation:

```yaml
# GitHub Actions OIDC with AWS
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/github-terraform
    aws-region: us-east-1
```

---

## ✅ Checklist & Exercises

1. **Build a GitHub Actions pipeline** for a Terraform project that runs `fmt`, `validate`, and `plan` on PRs. Test it with a real PR.
2. **Add a manual approval gate** using GitHub Environments. Verify that `apply` only runs after approval.
3. **Compare Atlantis vs. GitHub Actions** for Terraform CI/CD. What are the trade-offs of each approach?
