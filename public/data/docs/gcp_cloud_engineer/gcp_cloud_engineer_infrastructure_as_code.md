# Infrastructure as Code (IaC) with Terraform and Deployment Manager

## Introduction to Infrastructure as Code (IaC)

Infrastructure as Code (IaC) is the practice of managing and provisioning computing infrastructure (such as networks, virtual machines, load balancers, and databases) using machine-readable definition files, rather than physical hardware configuration or interactive configuration tools. It extends DevOps principles to the entire infrastructure lifecycle.

**Why IaC?**
*   **Consistency:** Eliminates configuration drift and ensures environments are identical across development, staging, and production.
*   **Repeatability:** Easily recreate environments quickly and reliably, enabling disaster recovery and rapid provisioning of new projects.
*   **Version Control:** Infrastructure definitions are stored in a version control system (like Git), allowing for tracking changes, rollbacks, and collaborative development.
*   **Efficiency & Speed:** Automates provisioning and updating, significantly reducing manual effort and potential human errors.
*   **Cost Savings:** By optimizing resource usage, automating scaling, and preventing forgotten resources.

## Declarative vs. Imperative IaC

*   **Declarative (Desired State):** You describe the *desired end-state* of your infrastructure. The IaC tool then figures out the steps to achieve that state. Terraform and Google Cloud Deployment Manager are primarily declarative.
    *   *Example:* "I want a virtual machine with 4 CPUs and 16GB RAM, connected to this network."
*   **Imperative (Step-by-Step):** You define the *exact commands or sequence of steps* required to reach a desired state.
    *   *Example:* "First, create a network. Then, create a subnet. Then, launch a VM and attach it to the subnet."

## Terraform

Terraform, by HashiCorp, is an open-source IaC tool that allows you to define both cloud and on-premises resources in human-readable configuration files (using HashiCorp Configuration Language - HCL) and manage their lifecycle. It is provider-agnostic, meaning it can manage infrastructure across multiple cloud providers (GCP, AWS, Azure, etc.) and other services (e.g., Kubernetes, Datadog).

### Key Concepts:

*   **Providers:** Plugins that Terraform uses to understand API interactions with a specific service (e.g., `google` provider for GCP, `aws` for AWS).
*   **Resources:** The most fundamental building block. A `resource` block describes one or more infrastructure objects (e.g., `google_storage_bucket` to create a GCS bucket, `aws_instance` for an EC2 instance).
*   **Data Sources:** Allow Terraform to fetch information about existing infrastructure resources managed outside of Terraform or by other Terraform configurations.
*   **Modules:** Encapsulate and reuse common infrastructure patterns. They promote modularity, consistency, and reusability, reducing configuration duplication.
*   **State File (`terraform.tfstate`):** A JSON file that Terraform uses to map real-world resources to your configuration, keep track of metadata, and improve performance. It should be stored securely and ideally remotely (e.g., in a GCS bucket or S3) for team collaboration and robustness.

### Terraform Workflow:

1.  **`terraform init`:** Initializes a working directory containing Terraform configuration files. This command downloads the necessary provider plugins and sets up the backend.
2.  **`terraform plan`:** Generates an execution plan. It shows what actions Terraform will take (create, update, delete) to achieve the configured desired state without actually making any changes to your infrastructure.
3.  **`terraform apply`:** Executes the actions proposed in a `terraform plan` to provision or update infrastructure. You typically confirm the plan before applying.
4.  **`terraform destroy`:** Destroys all resources managed by the current Terraform configuration. Use with extreme caution.

### Simple Terraform Example (GCP - GCS Bucket):

Let's create a Google Cloud Storage (GCS) bucket.

```hcl
# main.tf
# Configure the Google Cloud provider
provider "google" {
  project = "your-gcp-project-id" # Replace with your actual GCP project ID
  region  = "us-central1"
}

# Create a Google Cloud Storage bucket
resource "google_storage_bucket" "my_bucket" {
  name          = "my-unique-skillbun-bucket-12345" # Must be globally unique
  location      = "US"
  storage_class = "STANDARD"
  project       = "your-gcp-project-id" # Replace with your actual GCP project ID
  uniform_bucket_level_access = true # Recommended for security
  lifecycle {
    prevent_destroy = true # Prevent accidental deletion
  }
}

# Output the bucket's URL
output "bucket_url" {
  value       = "gs://${google_storage_bucket.my_bucket.name}"
  description = "The URL of the created GCS bucket."
}
```

**To run this example:**
1.  Save the code as `main.tf` in an empty directory.
2.  Replace all occurrences of `"your-gcp-project-id"` with your actual GCP project ID.
3.  Replace `"my-unique-skillbun-bucket-12345"` with a globally unique name for your bucket (e.g., add random numbers or your initials).
4.  Open your terminal or command prompt in the directory where `main.tf` is saved.
5.  Run `terraform init` to initialize the directory and download the Google provider.
6.  Run `terraform plan` to see what resources will be created.
7.  Run `terraform apply` (type `yes` to confirm) to create the GCS bucket.
8.  After verifying the bucket is created in your GCP console, you can run `terraform destroy` (type `yes` to confirm) to clean up the resources, keeping in mind the `prevent_destroy` lifecycle rule for the bucket.

## Google Cloud Deployment Manager

Google Cloud Deployment Manager is Google Cloud's native IaC service for provisioning and managing GCP resources. It uses configuration files written in YAML or templates written in Python or Jinja2 to define resources.

### Key Concepts:

*   **Configuration:** A YAML file that describes all the resources you want to create. It can include inline templates or reference external template files.
*   **Templates:** Reusable building blocks written in Python or Jinja2 that define a set of resources. Templates allow for complex logic, looping, and conditional resource creation, enhancing reusability and flexibility.
*   **Deployment:** An instance of your configuration that has been deployed to Google Cloud. Deployment Manager tracks the state of your deployed resources internally within GCP.

### Differences from Terraform:

*   **Scope:** Deployment Manager is GCP-specific, managing only Google Cloud resources, whereas Terraform is multi-cloud/multi-provider.
*   **Language:** Deployment Manager uses YAML for configurations and Jinja2/Python for templates. Terraform primarily uses HashiCorp Configuration Language (HCL).
*   **State Management:** Deployment Manager manages its state internally within Google Cloud. Terraform uses local or remote state files that you explicitly manage.
*   **Ecosystem:** Terraform has a larger, more mature ecosystem, community, and marketplace of providers and modules due to its broader adoption across various cloud platforms.

## When to use which?

*   **Terraform:**
    *   When you need to manage infrastructure across multiple cloud providers (e.g., GCP and AWS) or hybrid environments.
    *   When you want to leverage a rich ecosystem of modules and providers for various services beyond just cloud infrastructure.
    *   For complex, large-scale deployments that benefit from strong, externally managed state and a vibrant community.
*   **Google Cloud Deployment Manager:**
    *   If your infrastructure is exclusively on Google Cloud and you prefer a native Google solution.
    *   If you are already proficient in Python or Jinja2 and prefer using those languages for templating.
    *   For simpler, GCP-centric deployments where tight integration with GCP's console and APIs is a priority.

In many real-world scenarios, organizations might use both, leveraging Terraform for its multi-cloud capabilities and Deployment Manager for specific GCP-native tasks where it might offer a tighter integration or simpler approach for certain resource types within Google Cloud.

## Quick Checklist/Exercise:

1.  **Define IaC Benefits:** List three core benefits of adopting Infrastructure as Code in a cloud environment.
2.  **Tool Comparison:** Explain a key difference between Terraform and Google Cloud Deployment Manager regarding their scope of supported infrastructure.
3.  **Terraform Workflow:** Describe the primary purpose and benefit of the `terraform plan` command in the Terraform workflow.