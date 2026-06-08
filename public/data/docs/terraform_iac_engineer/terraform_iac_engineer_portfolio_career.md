# Portfolio and Career Readiness

## Turning Learning Into Proof

Knowing Terraform is not enough — you need to **prove** it. Hiring managers and technical interviewers look for evidence that you can apply IaC skills to real problems, communicate your decisions, and deliver production-quality work.

## What Makes a Strong IaC Portfolio?

Your portfolio should demonstrate four things:

1. **Technical depth** — You understand HCL, state, modules, providers, and testing
2. **Production awareness** — You think about security, cost, reliability, and collaboration
3. **Communication** — You can explain what you built and why
4. **Growth mindset** — You document lessons learned and areas for improvement

## Portfolio Components

### 1. GitHub Repositories

Your repos are your resume. Each project should include:

```
my-terraform-project/
├── README.md              # Problem statement, architecture, usage
├── modules/               # Reusable modules with their own READMEs
│   ├── networking/
│   └── compute/
├── environments/          # Environment-specific configs
│   ├── dev/
│   └── prod/
├── tests/                 # Terratest or terraform test files
├── .github/workflows/     # CI/CD pipeline definitions
├── docs/                  # Architecture diagrams, ADRs
└── CHANGELOG.md           # Version history
```

### 2. Technical Case Studies

A case study is a structured narrative that shows your problem-solving process:

- **Problem**: What was the infrastructure challenge?
- **Constraints**: Budget, timeline, compliance requirements, team size
- **Approach**: Why you chose this architecture over alternatives
- **Implementation**: Key code patterns, module design, testing strategy
- **Results**: Measurable outcomes (deployment time reduced by X%, cost savings of $Y)
- **Reflections**: What you would do differently

### 3. Architecture Diagrams

Visual documentation matters. Use tools like:

- **draw.io** — Free, exports to PNG/SVG
- **Mermaid** — Markdown-based diagrams that render in GitHub
- **Lucidchart** — Professional diagrams for presentations

### 4. Blog Posts or READMEs

Write about specific challenges you solved:

- "How I Reduced Terraform Plan Time by 80% with State Splitting"
- "Designing a Multi-Cloud Module That Works on AWS and Azure"
- "Lessons Learned Migrating 200 Resources to Terraform"

## Interview Preparation

### Common Terraform Interview Topics

| Topic | What They'll Ask |
|-------|-----------------|
| State management | "What happens if two people apply at the same time?" |
| Modules | "How do you design a reusable module?" |
| CI/CD | "Walk me through your Terraform pipeline" |
| Security | "How do you handle secrets in Terraform?" |
| Troubleshooting | "How do you debug a failed apply?" |
| Drift | "How do you detect and resolve state drift?" |

### Tell the STAR Story

For behavioral questions, use the **STAR** framework:

- **Situation**: Context of the infrastructure problem
- **Task**: Your specific responsibility
- **Action**: What you did (tools, patterns, decisions)
- **Result**: Measurable outcome

### Certifications Worth Considering

- **HashiCorp Terraform Associate (003)** — Validates foundational knowledge
- **AWS/Azure/GCP cloud certifications** — Complement Terraform skills with cloud expertise
- **CKA/CKAD** — If your IaC work includes Kubernetes provisioning

## Career Positioning

Tailor your resume and LinkedIn to the specific role variant you're targeting:

- **Platform Engineer** → Emphasize modules, developer experience, self-service
- **DevOps Engineer** → Emphasize CI/CD, automation, monitoring integration
- **Cloud Engineer** → Emphasize provider-specific expertise, cost optimization
- **SRE** → Emphasize reliability, incident response, drift detection

---

## ✅ Checklist & Exercises

1. **Audit your GitHub profile.** Does each Terraform repo have a clear README with usage instructions and architecture context?
2. **Write a 1-page case study** for a project you've completed (even a tutorial project). Follow the Problem → Approach → Results → Reflections format.
3. **Practice answering:** "Walk me through how you would design a Terraform pipeline for a team of five engineers deploying to two AWS accounts."
