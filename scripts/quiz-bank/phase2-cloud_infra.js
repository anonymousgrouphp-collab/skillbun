/**
 * Phase 2: Cloud & Infrastructure Pillar Questions
 * Differentiates between DevOps, SRE, Cloud Architect (AWS/Azure/GCP), Kubernetes, Infrastructure-as-Code (Terraform), Platform Engineering, Observability, FinOps, etc.
 */

module.exports = [
  {
    id: 401,
    phase: 2,
    pillar: "cloud_infra",
    q: "Within cloud computing and infrastructure engineering, which path aligns best with your career ambitions?",
    options: [
      { l: "A", t: "DevOps & CI/CD Pipelines: Automating build triggers, Docker containers, automated testing, and deployments.", tags: ["devops_cloud", "release_engineer"], i: "DevOps Specialist, {name}! Streamlined deployment pipelines and container automation are your specialty." },
      { l: "B", t: "Cloud Architecture (AWS / Azure / GCP): Designing multi-tier cloud topology, VPCs, IAM policies, and serverless architectures.", tags: ["cloud_architect", "aws_cloud_engineer", "azure_cloud_engineer", "gcp_cloud_engineer"], i: "Cloud Architect, {name}! Structuring enterprise cloud infrastructure topologies is your long-term target." },
      { l: "C", t: "Site Reliability Engineering (SRE): Managing uptime SLAs, incident response, error budgets, and chaos engineering.", tags: ["site_reliability_engineer", "observability_engineer"], i: "SRE Specialist, {name}! Keeping mission-critical high-traffic infrastructure online with 99.999% reliability is your calling." },
      { l: "D", t: "Infrastructure as Code (Terraform) & Kubernetes: Writing declarative HCL infrastructure and managing K8s clusters.", tags: ["terraform_iac_engineer", "kubernetes_engineer"], i: "IaC & Kubernetes Expert, {name}! Declarative infrastructure scripts and container orchestration are your superpower." }
    ]
  },
  {
    id: 402,
    phase: 2,
    pillar: "cloud_infra",
    q: "How do you prefer approaching server management and developer infrastructure?",
    options: [
      { l: "A", t: "Internal Developer Platforms (IDP): Building self-service portals (like Backstage) for developer teams.", tags: ["platform_engineer", "api_platform_engineer"], i: "Platform Engineer, {name}! Building golden paths and self-service portals empowers developer velocity." },
      { l: "B", t: "Cloud Cost Optimization (FinOps): Analyzing AWS bills, right-sizing EC2/K8s instances, and managing cloud budgets.", tags: ["finops_engineer", "cloud_architect"], i: "FinOps Engineer, {name}! Optimizing massive cloud expenditure saves tech companies millions." },
      { l: "C", t: "Linux System Administration & Networking: Deep CLI bash scripting, systemd, SSH hardening, and subnet routing.", tags: ["linux_system_admin", "network_engineer", "database_admin"], i: "System Administrator, {name}! Deep Linux shell scripting and core networking are timeless skills." },
      { l: "D", t: "Observability & Telemetry: Setting up OpenTelemetry, Prometheus metrics, Grafana dashboards, and distributed tracing.", tags: ["observability_engineer", "site_reliability_engineer"], i: "Observability Engineer, {name}! Full-stack visibility with metrics, logs, and distributed traces makes you invaluable." }
    ]
  }
];
