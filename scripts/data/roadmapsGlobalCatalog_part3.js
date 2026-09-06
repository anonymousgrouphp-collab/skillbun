/**
 * SkillBun 100 Roadmaps Global Standard Catalog - Part 3
 * Cloud, DevOps, SRE, Infrastructure & Cybersecurity
 */

const PART3_CATALOG = {
  cloud_architect: {
    title: 'Cloud Architect',
    description: 'Design resilient, cost-effective, multi-region cloud architectures, disaster recovery plans, and enterprise multi-cloud migrations.',
    goal: {
      objective: 'Define the architectural vision and governance for enterprise cloud platforms, ensuring high availability, zero trust security, and operational excellence.',
      salary: '$110,000 - $190,000 / yr (₹12 - ₹35 LPA)',
      salary_range: { usd: { min: 110000, max: 190000, period: 'yr' }, inr_lpa: { min: 12, max: 35, period: 'lpa' } },
      experience_level: 'Senior to Principal (5 - 10+ Years)',
      target_roles: ['Cloud Architect', 'Enterprise Solutions Architect', 'Cloud Infrastructure Strategist'],
      career_pillars: ['Well-Architected Framework Pillars', 'Multi-Cloud & Hybrid Networking', 'Disaster Recovery & High Availability']
    },
    learn: {
      summary: 'Master the AWS/Azure/GCP Well-Architected Frameworks, global networking (Transit Gateways, ExpressRoute), distributed storage, container orchestration, and finops governance.',
      key_competencies: ['Cloud Architecture Patterns (CQRS, Event-Driven, Saga)', 'Global Networking & Hybrid Cloud Connectivity', 'Cloud Security Posture & Identity Governance', 'Disaster Recovery (RTO/RPO) Strategies', 'Enterprise Multi-Account Cloud Governance'],
      prerequisites: ['Broad background in software engineering or systems administration', 'Deep networking understanding', 'Hands-on experience with at least one major cloud provider']
    },
    boost: {
      capstone_projects: [
        { title: 'Global Multi-Region Active-Active Cloud Architecture', tech_stack: ['AWS/Azure', 'Terraform', 'Global Accelerator', 'DynamoDB Global Tables'], description: 'Architect a global active-active infrastructure with sub-100ms user latency, automated regional failover, and zero data loss.' }
      ],
      certifications: ['AWS Certified Solutions Architect - Professional', 'Google Cloud Certified Professional Cloud Architect', 'Microsoft Certified: Azure Solutions Architect Expert'],
      interview_focus: ['Designing for Failure (Chaos Engineering, RTO vs RPO)', 'Data Consistency across Distributed Cloud Regions (CAP Theorem)', 'Cloud Cost Optimization Strategies at Scale', 'Migrating Legacy Monoliths to Cloud-Native Architecture']
    }
  },

  aws_cloud_engineer: {
    title: 'AWS Cloud Engineer',
    description: 'Deploy, automate, and manage scalable cloud infrastructure across core Amazon Web Services including EC2, ECS, EKS, Lambda, S3, and RDS.',
    goal: {
      objective: 'Provision and maintain secure, highly available, and scalable cloud solutions across Amazon Web Services infrastructure.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['AWS Cloud Engineer', 'Cloud Infrastructure Engineer', 'AWS DevOps Specialist'],
      career_pillars: ['AWS Core Compute & Networking (VPC, IAM, EC2)', 'Serverless & Containers (Lambda, ECS, EKS)', 'Infrastructure as Code (CloudFormation / Terraform)']
    },
    learn: {
      summary: 'Master AWS networking (VPCs, Subnets, Route Tables, NAT Gateways), IAM least-privilege security, compute services, S3, RDS, CloudWatch telemetry, and automation.',
      key_competencies: ['AWS VPC Networking & Security Groups', 'IAM Policies, Roles & Multi-Factor Auth', 'EC2, Auto Scaling & Application Load Balancers', 'Serverless Compute (AWS Lambda & API Gateway)', 'CloudWatch Monitoring, Alarms & CloudTrail Auditing'],
      prerequisites: ['Linux operating system fundamentals', 'Basic TCP/IP networking', 'Understanding of virtualization and storage']
    },
    boost: {
      capstone_projects: [
        { title: 'Production 3-Tier Web Application on AWS with Terraform', tech_stack: ['AWS (VPC, EC2, RDS, ALB)', 'Terraform', 'CloudWatch'], description: 'Provision an automated multi-AZ 3-tier architecture with public/private subnets, auto-scaling web workers, and encrypted database replicas.' }
      ],
      certifications: ['AWS Certified Solutions Architect - Associate', 'AWS Certified SysOps Administrator - Associate'],
      interview_focus: ['VPC Peering vs Transit Gateway', 'IAM Evaluation Logic (Explicit Deny vs Allow)', 'S3 Storage Classes & Lifecycle Policies', 'Troubleshooting High CPU / Unhealthy ALB Targets']
    }
  },

  azure_cloud_engineer: {
    title: 'Azure Cloud Engineer',
    description: 'Build and manage enterprise cloud infrastructure using Microsoft Azure, Azure Resource Manager (ARM/Bicep), Entra ID, and Azure Kubernetes Service.',
    goal: {
      objective: 'Engineer reliable, secure, and compliance-driven cloud solutions on the Microsoft Azure ecosystem for enterprise clients.',
      salary: '$85,000 - $145,000 / yr (₹6.5 - ₹22 LPA)',
      salary_range: { usd: { min: 85000, max: 145000, period: 'yr' }, inr_lpa: { min: 6.5, max: 22, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Azure Cloud Engineer', 'Azure Administrator', 'Cloud Systems Specialist'],
      career_pillars: ['Azure Virtual Networks & Entra ID Security', 'Azure Compute & Storage Services', 'Infrastructure Automation with Bicep / ARM']
    },
    learn: {
      summary: 'Master Azure Virtual Networks, Microsoft Entra ID (Azure AD), Azure VMs, App Services, Azure SQL, Blob Storage, Azure Monitor, and IaC with Bicep.',
      key_competencies: ['Azure Virtual Networks, NSGs & Azure Firewall', 'Microsoft Entra ID (RBAC, PIM, Conditional Access)', 'Azure App Service & Azure Functions', 'Azure Kubernetes Service (AKS) Basics', 'Infrastructure as Code with Bicep & Azure CLI'],
      prerequisites: ['Windows/Linux system administration', 'Core networking concepts', 'Basic PowerShell or Bash scripting']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Secure Hub-and-Spoke VNet Topology on Azure', tech_stack: ['Azure VNet', 'Azure Firewall', 'Bicep', 'Azure Monitor'], description: 'Deploy a compliant enterprise hub-spoke network with centralized firewall inspection, private endpoints, and Bastion host access.' }
      ],
      certifications: ['Microsoft Certified: Azure Administrator Associate (AZ-104)', 'Microsoft Certified: Azure Solutions Architect Expert (AZ-305)'],
      interview_focus: ['Azure Hub-Spoke Network Architecture', 'Entra ID Conditional Access & PIM (Privileged Identity Management)', 'Azure Storage Redundancy Options (LRS, ZRS, GRS)', 'Azure App Service Scaling Rules']
    }
  },

  gcp_cloud_engineer: {
    title: 'GCP Cloud Engineer',
    description: 'Design and deploy data-intensive and containerized solutions on Google Cloud Platform using Compute Engine, Cloud Run, GKE, and BigQuery.',
    goal: {
      objective: 'Deploy and scale modern cloud-native applications on Google Cloud Platform, leveraging Google’s advanced networking and data analytics capabilities.',
      salary: '$90,000 - $155,000 / yr (₹7.5 - ₹24 LPA)',
      salary_range: { usd: { min: 90000, max: 155000, period: 'yr' }, inr_lpa: { min: 7.5, max: 24, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['GCP Cloud Engineer', 'Google Cloud Architect', 'Cloud Platform Engineer'],
      career_pillars: ['GCP Global VPC & IAM', 'Google Kubernetes Engine (GKE) & Cloud Run', 'BigQuery & Google Cloud Data Services']
    },
    learn: {
      summary: 'Master GCP global VPC networking, IAM permissions and service accounts, Google Kubernetes Engine (GKE), Cloud Run serverless containers, Cloud Storage, and BigQuery.',
      key_competencies: ['GCP Global VPC Networks & Cloud Load Balancing', 'Cloud IAM Roles, Service Accounts & Workload Identity', 'Google Kubernetes Engine (GKE) Orchestration', 'Serverless Containers with Cloud Run', 'Cloud Operations (Stackdriver Logging & Monitoring)'],
      prerequisites: ['Linux command line fundamentals', 'Understanding of containerization (Docker)', 'Basic networking principles']
    },
    boost: {
      capstone_projects: [
        { title: 'Production Microservice Fleet on Cloud Run & GKE', tech_stack: ['Google Cloud', 'Cloud Run', 'GKE', 'Terraform', 'Cloud Build'], description: 'Deploy an automated microservices pipeline using Cloud Build, Cloud Run autoscaling, and Cloud SQL with Private Service Access.' }
      ],
      certifications: ['Google Cloud Associate Cloud Engineer', 'Google Cloud Professional Cloud Architect'],
      interview_focus: ['Google Cloud Global VPC Subnets vs Regional AWS VPCs', 'Service Account Impersonation & Workload Identity', 'Cloud Run vs GKE Selection Criteria', 'Cloud Load Balancing (HTTP(S) Proxy vs Network LB)']
    }
  },

  devops_cloud: {
    title: 'DevOps & Cloud Engineer',
    description: 'Automate build pipelines, containerized deployments, infrastructure as code, cloud resources, and operational monitoring across hybrid environments.',
    goal: {
      objective: 'Bridge development and operations to eliminate deployment bottlenecks, accelerate release velocity, and guarantee 99.99% system availability.',
      salary: '$85,000 - $155,000 / yr (₹7 - ₹26 LPA)',
      salary_range: { usd: { min: 85000, max: 155000, period: 'yr' }, inr_lpa: { min: 7, max: 26, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 6+ Years)',
      target_roles: ['DevOps Engineer', 'Cloud Operations Engineer', 'Build & Release Engineer', 'Infrastructure Automation Engineer'],
      career_pillars: ['CI/CD Pipelines & GitOps', 'Containerization & Kubernetes', 'Infrastructure as Code & Observability']
    },
    learn: {
      summary: 'Master Linux administration, Docker containerization, Kubernetes orchestration, CI/CD automation (GitHub Actions, GitLab CI), Terraform IaC, and Prometheus/Grafana monitoring.',
      key_competencies: ['Linux System Administration & Bash Scripting', 'Docker Multi-Stage Builds & Optimization', 'Kubernetes Deployments, Services & Ingress', 'CI/CD Automation (GitHub Actions, GitLab)', 'Terraform Infrastructure as Code'],
      prerequisites: ['Basic programming or scripting skills', 'Understanding of web servers and databases', 'Familiarity with Git version control']
    },
    boost: {
      capstone_projects: [
        { title: 'Zero-Downtime GitOps Deployment Pipeline', tech_stack: ['Kubernetes', 'ArgoCD', 'GitHub Actions', 'Terraform', 'Prometheus'], description: 'Build an automated GitOps release pipeline deploying staging and production clusters with blue-green traffic switching.' }
      ],
      certifications: ['Linux Foundation Certified Kubernetes Administrator (CKA)', 'AWS Certified DevOps Engineer - Professional', 'HashiCorp Certified: Terraform Associate'],
      interview_focus: ['Docker Layer Caching & Image Size Minimization', 'Kubernetes Pod Scheduling, Probes & Eviction Lifecycle', 'Zero-Downtime Deployment Strategies (Canary vs Blue-Green)', 'Secret Management in CI/CD Pipelines']
    }
  },

  kubernetes_engineer: {
    title: 'Kubernetes Engineer',
    description: 'Master container orchestration at scale: cluster administration, service mesh, networking, security policies, storage, and GitOps workflows.',
    goal: {
      objective: 'Operate, secure, and scale production-grade Kubernetes clusters hosting mission-critical distributed workloads.',
      salary: '$95,000 - $165,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 95000, max: 165000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Staff (1 - 6+ Years)',
      target_roles: ['Kubernetes Administrator', 'Container Platform Engineer', 'Cloud-Native Infrastructure Specialist'],
      career_pillars: ['Control Plane & Etcd Architecture', 'CNI Networking & Service Mesh (Istio)', 'Cluster Hardening & GitOps (ArgoCD)']
    },
    learn: {
      summary: 'Master Kubernetes control plane internals, etcd backup/restore, CNI networking (Calico/Cilium), CSI persistent storage, Helm charts, RBAC security, and cluster upgrades.',
      key_competencies: ['Control Plane Architecture (Kube-API, Scheduler, Etcd)', 'CNI Networking, Network Policies & CoreDNS', 'CSI Storage, PersistentVolumes & StatefulSets', 'Helm Packaging & Kustomize Templating', 'Kubernetes Security (RBAC, Pod Security Standards)'],
      prerequisites: ['Docker container proficiency', 'Linux networking & system administration', 'YAML syntax and Git workflows']
    },
    boost: {
      capstone_projects: [
        { title: 'Production Multi-Tenant Kubernetes Cluster with GitOps', tech_stack: ['Kubernetes', 'Cilium CNI', 'ArgoCD', 'Helm', 'Prometheus'], description: 'Deploy a production-ready Kubernetes cluster featuring Cilium network policies, mutual TLS via service mesh, and automated GitOps sync.' }
      ],
      certifications: ['Certified Kubernetes Administrator (CKA)', 'Certified Kubernetes Security Specialist (CKS)'],
      interview_focus: ['Etcd Quorum, Raft Consensus & Backup Restoration', 'Kubernetes Service Types (ClusterIP vs NodePort vs LoadBalancer)', 'Pod Eviction, QoS Classes & OOMKiller Behavior', 'Debugging CrashLoopBackOff & Pending Pod States']
    }
  },

  terraform_iac_engineer: {
    title: 'Terraform/IaC Engineer',
    description: 'Automate multi-cloud infrastructure provisioning safely and deterministically using Terraform, OpenTofu, Terragrunt, and Policy as Code.',
    goal: {
      objective: 'Manage enterprise infrastructure as declarative, version-controlled code, ensuring repeatable, auditable, and automated cloud deployments.',
      salary: '$90,000 - $160,000 / yr (₹8 - ₹25 LPA)',
      salary_range: { usd: { min: 90000, max: 160000, period: 'yr' }, inr_lpa: { min: 8, max: 25, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['Terraform Specialist', 'Infrastructure as Code Engineer', 'Cloud Automation Architect'],
      career_pillars: ['HCL Module Engineering & Design', 'State Management & Concurrency Locking', 'Policy as Code (OPA / Sentinel) & CI/CD']
    },
    learn: {
      summary: 'Master HashiCorp Configuration Language (HCL), remote state management, state locking, reusable modules, Terragrunt DRY architecture, and drift detection.',
      key_competencies: ['HCL Syntax, Loops, Dynamic Blocks & Functions', 'Remote State Backends & State Locking (S3/DynamoDB)', 'Reusable Module Architecture & Versioning', 'Terragrunt Multi-Environment DRY Code', 'Policy as Code with Open Policy Agent (OPA)'],
      prerequisites: ['Basic understanding of at least one cloud provider (AWS/Azure/GCP)', 'Command line proficiency', 'Git version control basics']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Multi-Environment Multi-Cloud Module Suite', tech_stack: ['Terraform', 'OpenTofu', 'Terragrunt', 'AWS', 'GitHub Actions'], description: 'Build an enterprise module library provisioning VPCs, EKS clusters, and databases across dev/staging/prod with zero code duplication.' }
      ],
      certifications: ['HashiCorp Certified: Terraform Associate (003)'],
      interview_focus: ['Terraform State File Corruption Recovery & State Migration', 'Managing Drift between Real Infrastructure and Code', 'Dynamic Blocks vs Count vs For_Each', 'Preventing Resource Destruction with Lifecycle Rules']
    }
  },

  site_reliability_engineer: {
    title: 'Site Reliability Engineer',
    description: 'Apply software engineering practices to infrastructure operations: establish SLOs/SLAs, error budgets, incident automation, and resilience engineering.',
    goal: {
      objective: 'Engineer automated systems that maximize platform reliability, maintain rigorous SLOs, and systematically eliminate manual operational toil.',
      salary: '$95,000 - $170,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 95000, max: 170000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Staff (1 - 6+ Years)',
      target_roles: ['Site Reliability Engineer', 'Production Reliability Engineer', 'Systems Reliability Architect'],
      career_pillars: ['SLOs, SLIs & Error Budget Management', 'Incident Response & Blameless Post-Mortems', 'Chaos Engineering & Operational Toil Automation']
    },
    learn: {
      summary: 'Master Google SRE principles, Service Level Objectives (SLOs), error budgets, incident command systems, chaos engineering (Chaos Mesh), and automated remediation scripting.',
      key_competencies: ['Service Level Indicators (SLIs) & Error Budgets', 'Prometheus Alerting Rules & Burn Rate Alerts', 'Automated Incident Remediation (Python / Go)', 'Chaos Engineering & Fault Injection Testing', 'Blameless Post-Mortems & Root Cause Analysis'],
      prerequisites: ['Linux operating system depth', 'Proficiency in Python or Go', 'Experience troubleshooting production web services']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Chaos Testing & SLO Dashboard Suite', tech_stack: ['Prometheus', 'Grafana', 'Chaos Mesh', 'Kubernetes', 'Go'], description: 'Build an automated chaos testing pipeline that injects network latency and pod crashes to validate multi-region failover and error budget tracking.' }
      ],
      certifications: ['Linux Foundation Certified Kubernetes Administrator (CKA)', 'AWS Certified DevOps Engineer - Professional'],
      interview_focus: ['How to Calculate Multi-Window Multi-Burn-Rate Alerts', 'Defining Actionable SLIs for Microservices', 'Automating Toil: Python vs Bash vs Custom Operator', 'Conducting a Real-World Blameless Post-Mortem']
    }
  },

  platform_engineer: {
    title: 'Platform Engineer',
    description: 'Build Internal Developer Platforms (IDPs), self-service developer portals, standardized infrastructure APIs, and automated golden paths.',
    goal: {
      objective: 'Empower product engineering teams with seamless self-service internal developer platforms (IDPs) that accelerate development velocity safely.',
      salary: '$100,000 - $175,000 / yr (₹9 - ₹30 LPA)',
      salary_range: { usd: { min: 100000, max: 175000, period: 'yr' }, inr_lpa: { min: 9, max: 30, period: 'lpa' } },
      experience_level: 'Mid to Staff (2 - 7+ Years)',
      target_roles: ['Platform Engineer', 'Developer Experience Engineer', 'Internal Platform Architect'],
      career_pillars: ['Internal Developer Platform (IDP) Architecture', 'Spotify Backstage & Developer Portals', 'Crossplane & Cloud Infrastructure APIs']
    },
    learn: {
      summary: 'Master Spotify Backstage developer portal, Crossplane Kubernetes-native infrastructure provisioning, Score specification, service catalog governance, and developer experience metrics.',
      key_competencies: ['Internal Developer Platforms (IDPs) & Golden Paths', 'Spotify Backstage Plugins & Service Catalogs', 'Crossplane Infrastructure as Kubernetes CRDs', 'Developer Experience (DevEx) & DORA Metrics', 'Automated Ephemeral Preview Environments'],
      prerequisites: ['Solid Kubernetes administration', 'Infrastructure as code experience (Terraform)', 'Software development skills (TypeScript/Go)']
    },
    boost: {
      capstone_projects: [
        { title: 'Self-Service Developer Portal with Spotify Backstage', tech_stack: ['Backstage', 'Kubernetes', 'Crossplane', 'GitHub Actions', 'PostgreSQL'], description: 'Build an internal developer portal where engineers can scaffold a new microservice with automated CI/CD, database, and DNS in 2 minutes.' }
      ],
      interview_focus: ['Platform as a Product Philosophy', 'Crossplane vs Traditional Terraform Tradeoffs', 'Defining and Measuring DevEx (Developer Friction)', 'Designing Self-Service Golden Paths without Shadow IT']
    }
  },

  observability_engineer: {
    title: 'Observability Engineer',
    description: 'Instrument, collect, and analyze the three pillars of telemetry — metrics, logs, and distributed traces — using OpenTelemetry, Prometheus, and Grafana.',
    goal: {
      objective: 'Provide engineering teams with deep real-time visibility into complex distributed systems through standardized OpenTelemetry collection.',
      salary: '$90,000 - $160,000 / yr (₹7.5 - ₹25 LPA)',
      salary_range: { usd: { min: 90000, max: 160000, period: 'yr' }, inr_lpa: { min: 7.5, max: 25, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['Observability Engineer', 'Telemetry Platform Developer', 'Monitoring Systems Architect'],
      career_pillars: ['OpenTelemetry (OTel) Standardization', 'Prometheus & PromQL Time-Series Metrics', 'Distributed Tracing (Jaeger/Tempo) & Log Aggregation']
    },
    learn: {
      summary: 'Master OpenTelemetry SDKs and Collectors, PromQL query language, Grafana dashboard creation, distributed tracing correlation (Trace IDs), and Loki/Elasticsearch logging.',
      key_competencies: ['OpenTelemetry Collector Architecture & Pipelines', 'Prometheus Time-Series Storage & PromQL', 'Distributed Tracing & Context Propagation (W3C TraceContext)', 'Grafana Enterprise Dashboards & Alerting', 'High-Cardinality Metric Optimization (M3DB/Cortex/Thanos)'],
      prerequisites: ['Linux & networking fundamentals', 'Basic software instrumentation knowledge', 'Docker container familiarity']
    },
    boost: {
      capstone_projects: [
        { title: 'Unified OpenTelemetry & Distributed Tracing Cluster', tech_stack: ['OpenTelemetry', 'Jaeger', 'Prometheus', 'Grafana Loki', 'Kubernetes'], description: 'Instrument a multi-service microservice application with OpenTelemetry auto-instrumentation, correlating logs, metrics, and traces under a unified TraceID.' }
      ],
      interview_focus: ['The Three Pillars of Observability vs True Observability', 'PromQL Rate vs Irate Mechanics', 'Managing High-Cardinality Metrics without Exploding Storage', 'Trace Context Propagation over HTTP and Message Queues']
    }
  },

  finops_engineer: {
    title: 'FinOps Engineer',
    description: 'Optimize cloud expenditure, establish unit economics, automate rightsizing, and build cross-functional cloud financial governance.',
    goal: {
      objective: 'Establish financial accountability and operational cost-efficiency across multi-cloud infrastructure, maximizing return on cloud investments.',
      salary: '$90,000 - $155,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 90000, max: 155000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['FinOps Practitioner', 'Cloud Cost Optimization Engineer', 'Cloud Financial Analyst'],
      career_pillars: ['FinOps Framework (Inform, Optimize, Operate)', 'Commitment-Based Discounts (Savings Plans & RIs)', 'Kubernetes Cost Allocation (Kubecost) & Tagging']
    },
    learn: {
      summary: 'Master the FinOps Foundation lifecycle, cloud billing data exports, automated rightsizing, spot instance orchestration, commitment discounts (Savings Plans), and Kubecost.',
      key_competencies: ['FinOps Framework & Cost Allocation Tagging', 'Cloud Billing Datasets & BigQuery/Athena Analysis', 'Commitment Discounts (Savings Plans, Reserved Instances)', 'Kubernetes Cost Monitoring with Kubecost', 'Automated Anomaly Detection & Rightsizing Scripting'],
      prerequisites: ['Basic cloud concepts (AWS/Azure/GCP)', 'SQL querying and spreadsheet analysis', 'Understanding of compute and storage pricing models']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Multi-Cloud Cost Anomaly & Rightsizing Engine', tech_stack: ['Python', 'AWS Cost Explorer API', 'Athena', 'Slack Bot', 'Kubecost'], description: 'Build an automated monitoring tool that analyzes hourly cloud billing data, detects anomalous spending spikes, and generates Slack alerts.' }
      ],
      certifications: ['FinOps Certified Practitioner (FOCP)'],
      interview_focus: ['Savings Plans vs Reserved Instances Tradeoffs', 'Showback vs Chargeback Implementation Strategies', 'Measuring Unit Economics in Cloud SaaS (Cost per User)', 'Managing Waste in Idle EBS Volumes and Unattached EIPs']
    }
  },

  release_engineer: {
    title: 'Release Engineer',
    description: 'Coordinate reliable production deployments, semantic versioning, artifact management, feature flag rollouts, and disaster recovery rollback plans.',
    goal: {
      objective: 'Ensure seamless, zero-downtime, and compliant software releases across diverse production environments with instant rollback capabilities.',
      salary: '$80,000 - $140,000 / yr (₹6 - ₹20 LPA)',
      salary_range: { usd: { min: 80000, max: 140000, period: 'yr' }, inr_lpa: { min: 6, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Release Engineer', 'Deployment Coordinator', 'Build & Release Specialist'],
      career_pillars: ['Artifact Management & Provenance', 'Feature Flag Governance (LaunchDarkly)', 'Automated Release Trains & Rollback Playbooks']
    },
    learn: {
      summary: 'Master binary artifact repositories (Artifactory, Nexus), Semantic Versioning (SemVer), feature flagging architectures, progressive delivery, and automated release trains.',
      key_competencies: ['Semantic Versioning & Conventional Commits', 'Binary Artifact Management & Provenance (SLSA)', 'Feature Flagging Engines & Gradual Rollouts', 'Release Train Scheduling & Change Management', 'Automated Rollback & Canary Validation'],
      prerequisites: ['Git version control mastery', 'CI/CD pipeline basics', 'Familiarity with deployment environments']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Progressive Delivery & Rollback Controller', tech_stack: ['GitHub Actions', 'Flagger', 'Kubernetes', 'Prometheus', 'Slack Webhooks'], description: 'Build an automated release train that releases versions to 5% of users, monitors error rates, and automatically rolls back if errors increase.' }
      ],
      interview_focus: ['Canary vs Blue-Green vs Dark Launching', 'Semantic Versioning in Microservices vs Monoliths', 'SLSA Framework for Software Supply Chain Integrity', 'Mitigating Database Migration Rollback Complications']
    }
  },

  serverless_developer: {
    title: 'Serverless Developer',
    description: 'Design event-driven, auto-scaling architectures without managing servers using AWS Lambda, EventBridge, DynamoDB, and Serverless Framework.',
    goal: {
      objective: 'Build hyper-scalable, cost-efficient, event-driven applications with zero infrastructure management overhead using serverless cloud primitives.',
      salary: '$85,000 - $145,000 / yr (₹6.5 - ₹22 LPA)',
      salary_range: { usd: { min: 85000, max: 145000, period: 'yr' }, inr_lpa: { min: 6.5, max: 22, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['Serverless Engineer', 'Cloud Application Developer', 'Event-Driven Architect'],
      career_pillars: ['Event-Driven Design with EventBridge/SQS', 'FaaS Cold Start & Memory Tuning (Lambda)', 'NoSQL Single-Table Design (DynamoDB)']
    },
    learn: {
      summary: 'Master AWS Lambda execution lifecycles, API Gateway, DynamoDB single-table design, EventBridge choreography, Step Functions state machines, and SST/Serverless Framework.',
      key_competencies: ['AWS Lambda Concurrency, Memory & Cold Starts', 'DynamoDB Modeling & Single-Table Design', 'EventBridge Bus, Rules & Asynchronous Architecture', 'Step Functions Orchestration Workflows', 'SST / Serverless Framework IaC'],
      prerequisites: ['Node.js or Python backend skills', 'Basic cloud fundamentals (AWS IAM, S3)', 'REST API concepts']
    },
    boost: {
      capstone_projects: [
        { title: 'Serverless Video Transcoding & Notification Pipeline', tech_stack: ['AWS Lambda', 'EventBridge', 'Step Functions', 'DynamoDB', 'S3'], description: 'Build an event-driven media processing workflow that ingests video uploads, runs Step Functions state machines, and notifies users via WebSockets.' }
      ],
      certifications: ['AWS Certified Developer - Associate'],
      interview_focus: ['Lambda Cold Start Mitigation Techniques', 'DynamoDB Single-Table Design (Partition & Sort Keys)', 'Step Functions vs EventBridge Choreography', 'Handling Database Connection Pools in Serverless Functions']
    }
  },

  database_admin: {
    title: 'Database Administrator (DBA)',
    description: 'Ensure high availability, replication, backup recovery, query performance tuning, and data security across enterprise database systems.',
    goal: {
      objective: 'Guarantee the 24/7 availability, transaction integrity, disaster recovery, and query performance of critical enterprise databases.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 6+ Years)',
      target_roles: ['Database Administrator', 'Database Reliability Engineer', 'PostgreSQL DBA', 'Data Infrastructure Specialist'],
      career_pillars: ['High Availability & Replication Topologies', 'Query Execution Plan Analysis & Indexing', 'Backup Strategies & Disaster Recovery']
    },
    learn: {
      summary: 'Master PostgreSQL / MySQL internals, WAL logging, B-Tree and GIN indexes, streaming replication, connection poolers (PgBouncer), vacuuming, and point-in-time recovery (PITR).',
      key_competencies: ['PostgreSQL / MySQL Core Architecture & Storage Engines', 'EXPLAIN ANALYZE Execution Plan Optimization', 'Streaming Replication, Failover & Patroni', 'Point-In-Time Recovery (PITR) & Automated Backups', 'PgBouncer Connection Pooling & Security Hardening'],
      prerequisites: ['Strong SQL knowledge', 'Linux operating system basics', 'Relational database theory (ACID, Normalization)']
    },
    boost: {
      capstone_projects: [
        { title: 'High-Availability PostgreSQL Cluster with Automated Failover', tech_stack: ['PostgreSQL', 'Patroni', 'Etcd', 'PgBouncer', 'HAProxy'], description: 'Deploy an enterprise HA PostgreSQL cluster with synchronous replication, automated raft-based failover via Patroni, and connection pooling.' }
      ],
      certifications: ['PostgreSQL Certified Associate', 'Oracle Certified Professional'],
      interview_focus: ['PostgreSQL VACUUM Mechanics & Transaction ID Wraparound', 'B-Tree Index Internals vs Hash vs GIN/GiST', 'Write-Ahead Logging (WAL) & Crash Recovery', 'Handling Long-Running Queries and Deadlocks in Production']
    }
  },

  linux_system_admin: {
    title: 'Linux System Administrator',
    description: 'Master enterprise Linux operating systems, user management, file systems, systemd, process scheduling, shell automation, and security hardening.',
    goal: {
      objective: 'Administer, automate, and harden Linux enterprise servers that form the foundational backbone of modern global computing.',
      salary: '$70,000 - $125,000 / yr (₹5 - ₹18 LPA)',
      salary_range: { usd: { min: 70000, max: 125000, period: 'yr' }, inr_lpa: { min: 5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Linux System Administrator', 'Systems Engineer', 'Infrastructure Operations Specialist'],
      career_pillars: ['Kernel, Boot Process & Systemd Services', 'Storage Management (LVM, RAID, File Systems)', 'Security Hardening (SELinux, Firewalld, SSH)']
    },
    learn: {
      summary: 'Master Linux kernel architecture, the boot sequence, systemd service units, LVM disk storage, package managers, network troubleshooting, and shell scripting.',
      key_competencies: ['Linux Kernel, Boot Process & Systemd Management', 'LVM (Logical Volume Management) & Filesystems (ext4/xfs)', 'User, Group, Permissions & ACL Management', 'Network Configuration, IP Routing & Firewalld/Iptables', 'Bash Shell Scripting & Cron Automation'],
      prerequisites: ['Basic command line familiarity', 'General computer hardware concepts', 'Desire to work without GUIs']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Hardened Linux Server Deployment Suite', tech_stack: ['Bash', 'Systemd', 'SELinux', 'Ansible', 'RHEL/Ubuntu'], description: 'Create an automated provisioning script applying CIS Benchmark security hardening, auditd logging, and custom systemd watchdogs.' }
      ],
      certifications: ['Red Hat Certified System Administrator (RHCSA)', 'CompTIA Linux+', 'Linux Foundation Certified System Administrator (LFCS)'],
      interview_focus: ['Systemd Unit Files & Dependency Ordering', 'Troubleshooting Linux High Load Average (CPU vs I/O Wait)', 'LVM Volume Resizing without Downtime', 'SELinux Contexts & Permissive vs Enforcing Modes']
    }
  },

  network_engineer: {
    title: 'Network Engineer',
    description: 'Design, configure, and secure enterprise computer networks: TCP/IP routing, switching, BGP, OSPF, VLANs, firewalls, and SD-WAN.',
    goal: {
      objective: 'Architect, optimize, and secure high-speed local and wide area network infrastructure connecting enterprise data centers and global offices.',
      salary: '$75,000 - $135,000 / yr (₹5.5 - ₹20 LPA)',
      salary_range: { usd: { min: 75000, max: 135000, period: 'yr' }, inr_lpa: { min: 5.5, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Network Engineer', 'Network Administrator', 'Network Security Specialist'],
      career_pillars: ['TCP/IP Protocol Stack & Subnetting', 'Dynamic Routing Protocols (BGP, OSPF)', 'Network Security (Firewalls, VPNs, Zero Trust)']
    },
    learn: {
      summary: 'Master the OSI model, IPv4/IPv6 subnetting, routing protocols (OSPF, BGP), switching (VLANs, STP), packet inspection with Wireshark, and VPN configuration.',
      key_competencies: ['OSI Model & Deep TCP/IP Packet Analysis', 'IPv4/IPv6 CIDR Subnetting & Addressing', 'Routing Protocols (BGP, OSPF, Static Routes)', 'Switching Fundamentals (VLANs, Trunking, STP)', 'Wireshark Packet Capture & Network Troubleshooting'],
      prerequisites: ['Basic understanding of internet connectivity', 'Elementary computer hardware concepts', 'Logical problem-solving skills']
    },
    boost: {
      capstone_projects: [
        { title: 'Simulated Enterprise Multi-Site WAN Topology', tech_stack: ['GNS3/Cisco Packet Tracer', 'BGP', 'OSPF', 'IPsec VPN', 'Wireshark'], description: 'Design an enterprise campus and branch network featuring redundant BGP uplinks, OSPF area segregation, and encrypted IPsec site-to-site tunnels.' }
      ],
      certifications: ['Cisco Certified Network Associate (CCNA 200-301)', 'CompTIA Network+'],
      interview_focus: ['TCP 3-Way Handshake & 4-Way Termination Details', 'Subnetting Calculation Questions (CIDR /26, /27, /28)', 'BGP Path Selection Attributes', 'Spanning Tree Protocol (STP) Root Bridge Election']
    }
  },

  cybersecurity: {
    title: 'Cybersecurity Specialist',
    description: 'Safeguard enterprise networks, cloud workloads, and sensitive data against cyber threats through threat analysis, defense hardening, and incident response.',
    goal: {
      objective: 'Protect corporate assets, digital identities, and customer data from sophisticated cyber adversaries across the modern attack surface.',
      salary: '$80,000 - $145,000 / yr (₹6 - ₹22 LPA)',
      salary_range: { usd: { min: 80000, max: 145000, period: 'yr' }, inr_lpa: { min: 6, max: 22, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Cybersecurity Specialist', 'Security Analyst', 'Information Security Officer'],
      career_pillars: ['Network & Endpoint Defense', 'Threat Modeling & Vulnerability Management', 'Incident Handling & Security Governance']
    },
    learn: {
      summary: 'Master security fundamentals, cryptographic algorithms (symmetric/asymmetric), network defense, vulnerability scanners, incident handling, and compliance frameworks.',
      key_competencies: ['Network Security, Firewalls & IDS/IPS', 'Cryptography (AES, RSA, Hashing, TLS)', 'Vulnerability Assessment & Patch Management', 'Incident Response Lifecycle (NIST / SANS)', 'Identity & Access Management Fundamentals'],
      prerequisites: ['Understanding of computer networking (TCP/IP)', 'Familiarity with Linux and Windows systems', 'Curiosity about security flaws and protection']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Vulnerability Scanner & Remediation Pipeline', tech_stack: ['Python', 'Nmap', 'OpenVAS/Nessus', 'Bash', 'Docker'], description: 'Deploy an automated network vulnerability scanner that maps corporate subnets, flags outdated software, and generates remediation tickets.' }
      ],
      certifications: ['CompTIA Security+', 'Certified Information Systems Security Professional (CISSP - Associate)', 'GIAC Security Essentials (GSEC)'],
      interview_focus: ['CIA Triad & Defense in Depth Principles', 'Symmetric vs Asymmetric Encryption & TLS Handshake', 'Vulnerability vs Exploit vs Threat Definitions', 'Phishing and Social Engineering Attack Vectors']
    }
  },

  soc_analyst: {
    title: 'SOC Analyst',
    description: 'Monitor, detect, and triage security incidents in 24/7 Security Operations Centers using SIEM platforms, EDR telemetry, and MITRE ATT&CK.',
    goal: {
      objective: 'Serve on the frontlines of cyber defense, analyzing security telemetry, triaging real-time alerts, and neutralizing adversary attacks.',
      salary: '$75,000 - $130,000 / yr (₹5.5 - ₹18 LPA)',
      salary_range: { usd: { min: 75000, max: 130000, period: 'yr' }, inr_lpa: { min: 5.5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 4+ Years)',
      target_roles: ['SOC Analyst (Tier 1/2)', 'Security Operations Specialist', 'Incident Triage Analyst'],
      career_pillars: ['SIEM Alert Triage & Querying (Splunk/Sentinel)', 'EDR Telemetry & Process Trees', 'MITRE ATT&CK Mapping & Threat Hunting']
    },
    learn: {
      summary: 'Master SIEM tools (Splunk, Microsoft Sentinel), writing search queries, analyzing Windows event logs, EDR tools (CrowdStrike, Defender), and alert triage playbooks.',
      key_competencies: ['SIEM Log Analysis (Splunk SPL / KQL)', 'Windows Security Event Logs & Sysmon Telemetry', 'EDR Process Lineage & File Integrity Monitoring', 'MITRE ATT&CK Matrix Navigation', 'Incident Triage, Scoping & Containment Playbooks'],
      prerequisites: ['TCP/IP networking basics', 'Familiarity with Windows and Linux logs', 'CompTIA Security+ level understanding']
    },
    boost: {
      capstone_projects: [
        { title: 'Home Lab Detection Engineering & Threat Hunting Setup', tech_stack: ['Splunk/ELK', 'Sysmon', 'Atomic Red Team', 'VirtualBox/Proxmox'], description: 'Build a home detection lab, simulate adversary credential dumping with Atomic Red Team, and author custom detection rules.' }
      ],
      certifications: ['CompTIA CySA+ (Cybersecurity Analyst)', 'Cisco Certified CyberOps Associate', 'BTL1 (Blue Team Level 1)'],
      interview_focus: ['Investigating a Suspicious PowerShell Execution Alert', 'Windows Event IDs (4624, 4625, 4688, 7045)', 'True Positive vs False Positive Triage Process', 'Differentiating Brute Force vs Password Spraying Attacks']
    }
  },

  penetration_tester: {
    title: 'Penetration Tester',
    description: 'Perform ethical hacking, exploit vulnerabilities, conduct simulated cyberattacks, and deliver actionable remediation reports to secure enterprise systems.',
    goal: {
      objective: 'Safely emulate real-world cyberattacks against web apps, APIs, and enterprise networks to discover and patch security flaws before malicious hackers exploit them.',
      salary: '$85,000 - $155,000 / yr (₹7 - ₹25 LPA)',
      salary_range: { usd: { min: 85000, max: 155000, period: 'yr' }, inr_lpa: { min: 7, max: 25, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['Penetration Tester', 'Ethical Hacker', 'Vulnerability Assessment Specialist', 'Offensive Security Consultant'],
      career_pillars: ['Web Application Security (OWASP Top 10)', 'Network Reconnaissance & Vulnerability Exploitation', 'Post-Exploitation & Professional Remediation Reporting']
    },
    learn: {
      summary: 'Master Burp Suite, Kali Linux tools, OWASP Top 10 (SQLi, XSS, SSRF, IDOR), network enumeration (Nmap), Metasploit, privilege escalation, and executive reporting.',
      key_competencies: ['Web App Pentesting with Burp Suite Professional', 'OWASP Top 10 Vulnerabilities & Exploitation Mechanics', 'Network Reconnaissance & Port Scanning (Nmap)', 'Linux & Windows Privilege Escalation Techniques', 'Technical & Executive Remediation Report Writing'],
      prerequisites: ['Deep web architecture knowledge (HTTP, Cookies, Sessions)', 'Linux and networking fundamentals', 'Basic Python or Bash scripting']
    },
    boost: {
      capstone_projects: [
        { title: 'Comprehensive Web & API Penetration Testing Portfolio', tech_stack: ['Burp Suite', 'Kali Linux', 'Python', 'OWASP Juice Shop'], description: 'Complete a full black-box and grey-box security assessment of a vulnerable application, documenting reproduction steps and remediation advice.' }
      ],
      certifications: ['Offensive Security Certified Professional (OSCP)', 'eLearnSecurity Certified Professional Penetration Tester (eCPPT)', 'CompTIA PenTest+'],
      interview_focus: ['How to Exploit and Prevent SSRF (Server-Side Request Forgery)', 'SQL Injection (In-Band vs Blind vs Time-Based)', 'Privilege Escalation Techniques in Linux (SUID, Sudo Misconfigurations)', 'Explaining Technical Vulnerabilities to Non-Technical Executives']
    }
  },

  application_security_engineer: {
    title: 'Application Security Engineer',
    description: 'Embed security into every stage of the software development lifecycle (DevSecOps), conduct secure code reviews, and automate SAST/DAST/SCA tooling.',
    goal: {
      objective: 'Empower software developers to write secure code by default, embedding automated security gates and threat modeling into modern CI/CD pipelines.',
      salary: '$95,000 - $165,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 95000, max: 165000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Staff (1 - 6+ Years)',
      target_roles: ['AppSec Engineer', 'DevSecOps Specialist', 'Product Security Architect'],
      career_pillars: ['Secure Software Development Lifecycle (SSDLC)', 'Threat Modeling (STRIDE)', 'Automated Code Scanners (SAST/DAST/SCA)']
    },
    learn: {
      summary: 'Master STRIDE threat modeling, manual secure code review, SAST (Semgrep, SonarQube), DAST (ZAP), Software Composition Analysis (Snyk/Trivy), and DevSecOps pipelines.',
      key_competencies: ['Secure Code Review (TypeScript, Python, Java, Go)', 'STRIDE Threat Modeling Architecture', 'SAST (Semgrep) & Secret Detection in CI/CD', 'Software Supply Chain Security & SBOM Generation', 'Security Champions Program Leadership'],
      prerequisites: ['Strong software development background', 'Deep understanding of web vulnerabilities (OWASP)', 'Familiarity with CI/CD pipelines']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated DevSecOps Pipeline with Semgrep & Trivy', tech_stack: ['GitHub Actions', 'Semgrep', 'Trivy', 'OWASP ZAP', 'Docker'], description: 'Build an automated pull-request security gate scanning for hardcoded secrets, software dependencies with CVEs, and code flaws.' }
      ],
      certifications: ['Certified Information Systems Security Professional (CISSP)', 'GIAC Certified Web Application Defender (GWEB)'],
      interview_focus: ['Conducting a Threat Model on a Modern Cloud Architecture', 'Triaging and Tuning SAST False Positives', 'Defending Against Dependency Confusion and Malicious Packages', 'Establishing a Security Champions Program']
    }
  },

  cloud_security_engineer: {
    title: 'Cloud Security Engineer',
    description: 'Secure enterprise public cloud environments, automate Cloud Security Posture Management (CSPM), enforce IAM least-privilege, and secure Kubernetes.',
    goal: {
      objective: 'Architect, automate, and enforce zero trust security guardrails, data encryption, and identity protections across cloud infrastructure.',
      salary: '$95,000 - $170,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 95000, max: 170000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Cloud Security Engineer', 'Cloud SecOps Specialist', 'Infrastructure Security Architect'],
      career_pillars: ['Cloud Security Posture Management (CSPM)', 'IAM Least Privilege & Identity Federation', 'Cloud-Native Threat Detection (GuardDuty/Defender)']
    },
    learn: {
      summary: 'Master cloud IAM security policies, KMS encryption keys, Cloud Security Posture Management (CSPM), container security, Kubernetes hardening, and cloud audit logging.',
      key_competencies: ['Cloud IAM Security, Permission Boundaries & SCPs', 'KMS Encryption (At-Rest & In-Transit) Management', 'Cloud Security Posture Management (CSPM/Trivy/Prowler)', 'Kubernetes Cluster Hardening & Pod Security', 'Cloud Threat Detection (AWS GuardDuty, CloudTrail)'],
      prerequisites: ['Cloud engineer fundamentals (AWS, Azure, or GCP)', 'Linux & Docker container knowledge', 'Basic cybersecurity principles']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Cloud Security Audit & Auto-Remediation Engine', tech_stack: ['AWS Lambda', 'Python', 'Prowler', 'Security Hub', 'Terraform'], description: 'Deploy an automated cloud scanner that detects publicly open S3 buckets or unencrypted databases and automatically remediates them.' }
      ],
      certifications: ['AWS Certified Security - Specialty', 'Microsoft Certified: Azure Security Engineer Associate (AZ-500)', 'Certified Kubernetes Security Specialist (CKS)'],
      interview_focus: ['Preventing Privilege Escalation in Cloud IAM', 'Securing Secrets in Cloud Applications (Vault, AWS Secrets Manager)', 'Auditing Container Images in Private Registries', 'Responding to Compromised Cloud Access Keys']
    }
  },

  red_team_operator: {
    title: 'Red Team Operator',
    description: 'Execute realistic adversary simulations against enterprise defenses: active directory attacks, lateral movement, payload evasion, and command & control.',
    goal: {
      objective: 'Test enterprise security teams and detection capabilities by ethically emulating advanced persistent threats (APTs) and sophisticated attack techniques.',
      salary: '$105,000 - $185,000 / yr (₹10 - ₹35 LPA)',
      salary_range: { usd: { min: 105000, max: 185000, period: 'yr' }, inr_lpa: { min: 10, max: 35, period: 'lpa' } },
      experience_level: 'Mid to Principal (2 - 7+ Years)',
      target_roles: ['Red Team Operator', 'Adversary Emulation Specialist', 'Offensive Security Consultant'],
      career_pillars: ['Active Directory Attack Paths (BloodHound)', 'Command & Control (C2) Infrastructure (Sliver/Havoc)', 'EDR Evasion & Lateral Movement Techniques']
    },
    learn: {
      summary: 'Master Active Directory architecture, Kerberos attacks (Kerberoasting, AS-REP roasting), BloodHound graph analysis, C2 frameworks (Sliver, Cobalt Strike), and evasion.',
      key_competencies: ['Active Directory Domain Architecture & Exploitation', 'Kerberos Authentication Attacks (Golden/Silver Tickets)', 'BloodHound Attack Path Mapping & Privilege Paths', 'Command & Control (C2) Infrastructure Setup', 'EDR Detection Evasion & Memory Injection Basics'],
      prerequisites: ['Prior penetration testing experience', 'Deep Windows enterprise networking understanding', 'Proficiency in PowerShell, C# or Go']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Active Directory Attack & Detection Lab', tech_stack: ['Windows Server', 'Active Directory', 'BloodHound', 'Sliver C2', 'Sysmon'], description: 'Set up an enterprise domain lab, simulate credential harvesting, perform BloodHound analysis, and author detection rules.' }
      ],
      certifications: ['Offensive Security Certified Expert (OSCE / CRTO)', 'Certified Red Team Professional (CRTP)'],
      interview_focus: ['Explaining Kerberoasting & AS-REP Roasting Mechanics', 'Active Directory Delegation (Constrained vs Unconstrained)', 'Bypassing AMSI (Antimalware Scan Interface)', 'Coordinating Purple Team Exercises with Blue Teams']
    }
  },

  dfir_analyst: {
    title: 'DFIR Analyst',
    description: 'Investigate complex security breaches, perform digital forensics, analyze memory artifacts, preserve chain of custody, and remediate incidents.',
    goal: {
      objective: 'Uncover the root cause of security incidents, extract forensic evidence from endpoints and memory, and guide organizations through emergency containment.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['DFIR Analyst', 'Digital Forensics Investigator', 'Incident Response Consultant'],
      career_pillars: ['Memory Forensics & Volatility Analysis', 'Disk & File System Artifact Analysis (Autopsy)', 'Forensic Timeline Reconstruction & Evidence Preservation']
    },
    learn: {
      summary: 'Master volatile memory extraction and analysis with Volatility, Windows forensic artifacts (MFT, Registry, Prefetch, Event Logs), disk imaging, and timeline analysis with Plaso.',
      key_competencies: ['Memory Forensics with Volatility 3', 'Windows Forensic Artifacts ($MFT, Shimcache, Amcache)', 'Evidence Handling & Legal Chain of Custody', 'Timeline Reconstruction with Plaso / Timesketch', 'Live Incident Containment & Eradication'],
      prerequisites: ['Solid operating system knowledge (Windows & Linux)', 'Understanding of file systems (NTFS, ext4)', 'Basic cybersecurity fundamentals']
    },
    boost: {
      capstone_projects: [
        { title: 'End-to-End Ransomware Breach Investigation Case Study', tech_stack: ['Volatility 3', 'Autopsy', 'Timesketch', 'YARA'], description: 'Analyze a memory dump and disk image of an infected machine, reconstruct the adversary timeline, identify the entry point, and write a forensic report.' }
      ],
      certifications: ['GIAC Certified Incident Handler (GCIH)', 'GIAC Certified Forensic Analyst (GCFA)'],
      interview_focus: ['Investigating Process Injection using Volatility (malfind)', 'Prefetch Files vs Shimcache Evidence Value', 'Preserving Volatile RAM without Contaminating Evidence', 'Order of Volatility in Digital Forensics']
    }
  },

  threat_intelligence_analyst: {
    title: 'Threat Intelligence Analyst',
    description: 'Track cyber adversaries, analyze indicators of compromise (IoCs), leverage open-source intelligence (OSINT), and author strategic intelligence briefings.',
    goal: {
      objective: 'Produce actionable tactical, operational, and strategic intelligence on adversary tactics to proactively defend organizational infrastructure.',
      salary: '$85,000 - $145,000 / yr (₹6.5 - ₹22 LPA)',
      salary_range: { usd: { min: 85000, max: 145000, period: 'yr' }, inr_lpa: { min: 6.5, max: 22, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Threat Intelligence Analyst', 'Cyber Threat Analyst', 'OSINT Security Specialist'],
      career_pillars: ['Adversary Tracking & MITRE ATT&CK', 'Threat Intelligence Platforms (MISP/OpenCTI)', 'OSINT Investigation & Intelligence Reporting']
    },
    learn: {
      summary: 'Master intelligence lifecycles, STIX/TAXII standards, Threat Intelligence Platforms (MISP, OpenCTI), adversary attribution, Diamond Model of Intrusion, and OSINT tools.',
      key_competencies: ['Cyber Threat Intelligence (CTI) Lifecycle', 'STIX 2.1 & TAXII Information Sharing Formats', 'Diamond Model of Intrusion Analysis & MITRE ATT&CK', 'Threat Intelligence Platforms (MISP, OpenCTI)', 'Adversary Infrastructure OSINT (Shodan, Maltego)'],
      prerequisites: ['Cybersecurity fundamentals', 'Strong research and analytical writing skills', 'Basic networking understanding']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Threat Intelligence Feed Aggregator & Enricher', tech_stack: ['Python', 'MISP API', 'Shodan API', 'AlienVault OTX', 'Elasticsearch'], description: 'Build an automated CTI pipeline that ingests indicators from open threat feeds, deduplicates them, and scores them for SOC alerting.' }
      ],
      certifications: ['GIAC Cyber Threat Intelligence (GCTI)', 'Certified Threat Intelligence Analyst (CTIA)'],
      interview_focus: ['Tactical vs Operational vs Strategic Threat Intelligence', 'The Diamond Model of Intrusion Analysis', 'Traffic Light Protocol (TLP) Information Sharing Standards', 'Pyramid of Pain: Why TTPs Hurt Adversaries More than Hashes']
    }
  },

  malware_analyst: {
    title: 'Malware Analyst',
    description: 'Dissect malicious binaries, analyze assembly instructions, unpack obfuscated code, and create YARA detection signatures using Ghidra and IDA Pro.',
    goal: {
      objective: 'Deconstruct malicious software binaries to understand capabilities, communication protocols, persistence mechanisms, and craft resilient detection rules.',
      salary: '$95,000 - $165,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 95000, max: 165000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Malware Analyst', 'Reverse Engineer', 'Security Researcher'],
      career_pillars: ['Static & Dynamic Binary Analysis', 'Disassembly & Decompilation (Ghidra/IDA Pro)', 'YARA Rule Authoring & Unpacking Obfuscation']
    },
    learn: {
      summary: 'Master x86/x64 assembly, PE file format, safe sandbox dynamic analysis, reverse engineering with Ghidra/x64dbg, unpacking malicious code, and YARA rule authoring.',
      key_competencies: ['x86/x64 Assembly Language & Calling Conventions', 'Portable Executable (PE) File Headers & Sections', 'Dynamic Analysis in Sandboxes (Procmon, Wireshark)', 'Static Analysis & Reverse Engineering with Ghidra', 'Writing Robust YARA Detection Rules'],
      prerequisites: ['C or C++ programming knowledge', 'Understanding of operating system internals', 'Basic computer architecture knowledge']
    },
    boost: {
      capstone_projects: [
        { title: 'Reverse Engineering Analysis & YARA Signature Pack', tech_stack: ['Ghidra', 'x64dbg', 'YARA', 'Python', 'Cuckoo Sandbox'], description: 'Reverse engineer a real-world trojan sample, uncover its C2 communication protocol, document unpacking stages, and write YARA detection rules.' }
      ],
      certifications: ['GIAC Reverse Engineering Malware (GREM)'],
      interview_focus: ['PE File Format (Import Address Table, Relocations)', 'Techniques Used by Malware to Detect Virtual Machines/Sandboxes', 'Process Hollowing vs Process Injection Mechanics', 'Writing False-Positive-Free YARA Rules']
    }
  },

  iam_engineer: {
    title: 'IAM Engineer',
    description: 'Design and manage enterprise identity and access management solutions, Zero Trust principles, Single Sign-On (SSO), SAML, OAuth 2.0, and Okta.',
    goal: {
      objective: 'Secure organizational identities, implement frictionless single sign-on, and enforce least-privilege role-based access across enterprise applications.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['IAM Engineer', 'Identity Architect', 'Access Management Specialist'],
      career_pillars: ['Authentication Protocols (SAML 2.0, OIDC, OAuth 2.0)', 'Cloud Identity Providers (Okta, Entra ID, Ping)', 'Privileged Access Management (PAM) & Zero Trust']
    },
    learn: {
      summary: 'Master authentication protocols (SAML 2.0, OAuth 2.0, OpenID Connect), Okta/Entra ID directory architecture, Privileged Access Management (CyberArk), and SCIM provisioning.',
      key_competencies: ['OAuth 2.0 Grant Flows & OpenID Connect (OIDC)', 'SAML 2.0 Federation & Assertions', 'Okta & Microsoft Entra ID Administration', 'SCIM (System for Cross-domain Identity Management)', 'Role-Based (RBAC) & Attribute-Based (ABAC) Access Control'],
      prerequisites: ['Basic web protocols (HTTP, cookies, tokens)', 'Familiarity with corporate IT and directories', 'Understanding of basic security concepts']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise SSO & Automated SCIM Provisioning Gateway', tech_stack: ['Node.js/Python', 'OAuth 2.0', 'OIDC', 'Okta API', 'PostgreSQL'], description: 'Build an enterprise single sign-on bridge with Okta that supports multi-factor authentication and automated user provisioning via SCIM.' }
      ],
      certifications: ['Okta Certified Professional / Administrator', 'Microsoft Certified: Identity and Access Administrator Associate (SC-300)'],
      interview_focus: ['OAuth 2.0 Authorization Code Flow with PKCE', 'SAML vs OpenID Connect Architecture Comparison', 'Implementing Attribute-Based Access Control (ABAC)', 'Mitigating Session Hijacking and Token Replay Attacks']
    }
  },

  grc_analyst: {
    title: 'GRC Analyst',
    description: 'Guide enterprise governance, manage cybersecurity risk frameworks, ensure audit compliance (ISO 27001, SOC 2, NIST CSF), and craft security policies.',
    goal: {
      objective: 'Align cybersecurity programs with business risk tolerance, legal requirements, and global regulatory compliance standards.',
      salary: '$80,000 - $140,000 / yr (₹6 - ₹20 LPA)',
      salary_range: { usd: { min: 80000, max: 140000, period: 'yr' }, inr_lpa: { min: 6, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['GRC Analyst', 'IT Compliance Specialist', 'Information Security Risk Officer'],
      career_pillars: ['Security Frameworks (ISO 27001, SOC 2, NIST CSF)', 'Third-Party Vendor Risk Assessment', 'Enterprise Risk Registers & Audit Remediation']
    },
    learn: {
      summary: 'Master industry compliance standards (ISO 27001, SOC 2 Type II, NIST CSF, PCI-DSS), enterprise risk assessment methodologies, vendor evaluations, and audit evidence collection.',
      key_competencies: ['ISO/IEC 27001 ISMS & SOC 2 Trust Criteria', 'NIST Cybersecurity Framework (CSF 2.0)', 'Quantitative & Qualitative Risk Assessment', 'Third-Party Vendor Security Reviews', 'Audit Readiness & Evidence Management'],
      prerequisites: ['Strong analytical, policy writing and communication skills', 'Basic cybersecurity terminology understanding', 'Interest in governance and compliance']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise SOC 2 Type II Readiness & Risk Register Package', tech_stack: ['Excel/Notion', 'Risk Assessment Matrix', 'Security Policy Templates'], description: 'Construct a complete audit-ready SOC 2 compliance package including Information Security Policy, Vendor Risk Assessment, and Risk Register.' }
      ],
      certifications: ['ISACA Certified Information Security Manager (CISM)', 'CRISC (Certified in Risk and Information Systems Control)'],
      interview_focus: ['SOC 2 Type I vs Type II Key Differences', 'Qualitative vs Quantitative Risk Assessment Methods', 'Handling Non-Compliant Business Stakeholders', 'NIST CSF Core Functions (Identify, Protect, Detect, Respond, Recover)']
    }
  }
};

module.exports = { PART3_CATALOG };
