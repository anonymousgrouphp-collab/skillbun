### Infrastructure as Code & Cloud DevOps Study Guide

#### 1. Introduction to Infrastructure as Code (IaC)
Infrastructure as Code (IaC) is the practice of managing and provisioning computing infrastructure (e.g., networks, virtual machines, load balancers, and connection topology) using machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.

**Key Benefits:**
*   **Consistency:** Eliminates configuration drift and ensures environments are identical.
*   **Speed:** Automates provisioning, reducing setup time.
*   **Version Control:** Infrastructure definitions are stored in version control systems (like Git), allowing tracking changes, rollbacks, and collaboration.
*   **Cost Efficiency:** Reduces manual effort and potential for human error.
*   **Repeatability:** Enables easy replication of environments (dev, test, prod).

#### 2. IaC Tools and Concepts
Different cloud providers and third-party vendors offer various IaC tools.

*   **Terraform (HashiCorp):**
    *   **Vendor-agnostic:** Supports multiple cloud providers (AWS, Azure, GCP, VMware, OpenStack, etc.) through "providers."
    *   **Declarative:** You define the desired end state, and Terraform figures out how to get there.
    *   **HCL (HashiCorp Configuration Language):** Its own configuration language, also supports JSON.
    *   **Workflow:** `terraform init` (initialize providers), `terraform plan` (show changes), `terraform apply` (apply changes).

*   **AWS CloudFormation:**
    *   **AWS-native:** Specifically for managing AWS resources.
    *   **Declarative:** Uses JSON or YAML templates to define a collection of AWS resources (a "stack").
    *   **Stacks:** A single unit of deployment for a collection of related resources.

*   **Azure Resource Manager (ARM Templates):**
    *   **Azure-native:** For provisioning Azure resources.
    *   **Declarative:** Uses JSON templates.
    *   **Resource Groups:** Resources are deployed into logical groups.

*   **Google Cloud Deployment Manager:**
    *   **GCP-native:** For managing Google Cloud resources.
    *   **Declarative:** Uses YAML to define resources, with support for Jinja2 or Python for template generation.

**Simple Terraform Code Example (AWS S3 Bucket):**
This example defines an S3 bucket in AWS.

```terraform
# main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "my_iac_bucket" {
  bucket = "skillbun-iac-example-bucket-unique-12345" # Must be globally unique
  acl    = "private"

  tags = {
    Environment = "Dev"
    Project     = "SkillBun IaC"
  }
}

output "bucket_name" {
  value       = aws_s3_bucket.my_iac_bucket.bucket
  description = "The name of the S3 bucket"
}
```

#### 3. Integrating IaC into CI/CD Pipelines & GitOps
IaC is fundamental for Continuous Integration/Continuous Delivery (CI/CD) in the cloud.

*   **CI/CD Integration:**
    *   **Commit:** Infrastructure code changes are committed to a version control system (e.g., Git).
    *   **Build/Lint:** CI pipeline validates the IaC (e.g., `terraform validate`).
    *   **Plan:** CI/CD pipeline executes `terraform plan` (or equivalent) to show proposed changes.
    *   **Approve/Apply:** After review, changes are approved, and the `terraform apply` (or equivalent) command is executed to provision/update infrastructure.
    *   **Tools:** Jenkins, GitLab CI/CD, GitHub Actions, Azure DevOps Pipelines.

*   **GitOps:**
    *   An operational framework that takes DevOps best practices like version control, collaboration, compliance, and CI/CD, and applies them to infrastructure automation.
    *   **Declarative:** The desired state of the infrastructure is described declaratively in Git.
    *   **Version-controlled:** All changes are committed to Git, providing a single source of truth and audit trail.
    *   **Automated:** Agents or operators continuously observe the actual state of the infrastructure and reconcile it with the desired state in Git.
    *   **Pull-based:** Instead of push deployments, a GitOps operator pulls changes from Git and applies them.

#### 4. Container Orchestration with Kubernetes
Kubernetes is an open-source system for automating deployment, scaling, and management of containerized applications.

*   **Core Concepts:**
    *   **Pods:** The smallest deployable units in Kubernetes, containing one or more containers.
    *   **Deployments:** Manages a set of identical pods, ensuring a desired number are running and handling updates.
    *   **Services:** An abstract way to expose an application running on a set of Pods as a network service.
    *   **Ingress:** Manages external access to the services in a cluster, typically HTTP/S.

*   **Managed Kubernetes Services:**
    *   **Amazon Elastic Kubernetes Service (EKS):** AWS's managed Kubernetes service.
    *   **Azure Kubernetes Service (AKS):** Azure's managed Kubernetes service.
    *   **Google Kubernetes Engine (GKE):** Google Cloud's managed Kubernetes service.

#### 5. Configuration Management Tools
While IaC provisions the infrastructure, configuration management tools configure the software and services *within* that infrastructure.

*   **Ansible:**
    *   **Agentless:** Connects via SSH (Linux) or WinRM (Windows).
    *   **YAML Playbooks:** Defines tasks to be executed on target machines.
    *   **Idempotent:** Running a playbook multiple times yields the same result.

*   **Chef:**
    *   **Master-Agent Model:** A Chef server manages configuration, and agents (Chef clients) run on target nodes.
    *   **Ruby DSL:** Uses Ruby for writing "cookbooks" and "recipes" that define desired configurations.

*   **Puppet:**
    *   **Master-Agent Model:** Similar to Chef, with a Puppet master and agents.
    *   **Ruby DSL:** Uses a declarative Ruby-based language to define desired states ("manifests").

#### 6. Policy as Code (PaC)
Policy as Code (PaC) is the practice of defining, managing, and automating policies using code. This ensures continuous compliance, security, and governance throughout the infrastructure lifecycle.

*   **Benefits:**
    *   **Automated Compliance:** Enforce organizational standards and regulatory requirements automatically.
    *   **Early Detection:** Catch policy violations early in the development cycle (shift left).
    *   **Version Control:** Policies are stored and managed like other code, enabling review, testing, and rollback.
    *   **Consistency:** Apply policies uniformly across all environments.

*   **Tools:**
    *   **Open Policy Agent (OPA):**
        *   **General-purpose policy engine:** Can be used to enforce policies across microservices, Kubernetes, CI/CD pipelines, APIs, and more.
        *   **Rego:** Its high-level declarative language for expressing policies.
        *   **Decision requests:** Applications query OPA for policy decisions (allow/deny, true/false, etc.).

    *   **Cloud-Native Guardrails:**
        *   **AWS Config:** Continuously monitors and records your AWS resource configurations and allows you to automate the evaluation of recorded configurations against desired configurations.
        *   **Azure Policy:** Helps enforce organizational standards and assess compliance at scale.
        *   **GCP Organization Policy Service:** Centralized programmatic control over your organization's cloud resources.

#### Quick Understanding Checklist/Exercise:
1.  **Differentiate IaC vs. Configuration Management:** Briefly explain the primary purpose and scope of Infrastructure as Code compared to Configuration Management.
2.  **IaC Tool Selection:** If you need to manage infrastructure across AWS, Azure, and Google Cloud simultaneously, which IaC tool would be your primary choice, and why?
3.  **GitOps Principle:** Describe what "pull-based deployments" mean in the context of GitOps and why it's considered a secure practice.