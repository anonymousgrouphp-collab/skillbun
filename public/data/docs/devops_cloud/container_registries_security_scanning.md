# Container Registries & Security Scanning

This study guide explores the critical components of container management: registries for storing and distributing images, best practices for tagging and versioning, and integrating robust security scanning into your CI/CD workflows to ensure the integrity of your containerized applications.

## 1. Understanding Container Registries

A container registry is a centralized repository for storing and managing Docker images. It acts as a crucial component in the containerization ecosystem, allowing developers to share, retrieve, and deploy container images efficiently.

### 1.1 Public Registries
These are accessible to everyone and often host a vast collection of official and community-contributed images.
*   **Docker Hub:** The most popular public registry, maintained by Docker. It's the default registry for Docker commands (e.g., `docker pull nginx`). It allows for both public and private repositories.

### 1.2 Private Registries
Designed for organizational use, private registries offer enhanced security, access control, and often integrate deeply with cloud provider ecosystems.
*   **Amazon Elastic Container Registry (ECR):** AWS's fully managed Docker container registry. Integrates seamlessly with other AWS services like ECS, EKS, and Lambda.
*   **Google Container Registry (GCR) / Artifact Registry:** Google Cloud's private registry. GCR has largely been superseded by Artifact Registry, which supports various artifact types, including Docker images.
*   **Azure Container Registry (ACR):** Microsoft Azure's managed Docker container registry, offering geo-replication, content trust, and integration with Azure services.

## 2. Image Tagging and Versioning

Image tags are textual labels applied to Docker images to distinguish different versions or variants. Proper tagging is essential for managing image lifecycle and ensuring reproducibility.

*   **Format:** `repository:tag` (e.g., `my-app:v1.0.0`, `ubuntu:latest`).
*   **Best Practices:**
    *   **Semantic Versioning (SemVer):** Use `MAJOR.MINOR.PATCH` (e.g., `my-app:1.2.3`) for application images.
    *   **Immutable Tags:** Avoid overwriting existing tags if possible, especially for production deployments. Use unique tags like commit SHAs (`my-app:feature-branch-abcd123`).
    *   **`latest` Tag:** Often points to the most recently built image. Use with caution in production as it can lead to non-reproducible builds.
    *   **Specific Base Image Tags:** Always specify a version for your base images (e.g., `FROM node:18-alpine` instead of `FROM node:latest`).

## 3. Integrating Container Image Security Scanning

Container images can harbor vulnerabilities from their base layers, libraries, and application dependencies. Integrating security scanning into your CI/CD pipeline is crucial for identifying and mitigating these risks early. This concept is often called "shift left" security.

### 3.1 Why Scan?
*   **Prevent Known Vulnerabilities:** Identify CVEs in operating system packages and language-specific dependencies.
*   **Compliance:** Meet security and regulatory requirements.
*   **Supply Chain Security:** Ensure that the images you use and produce are free from malicious components.

### 3.2 Popular Scanning Tools
*   **Trivy:** An open-source, comprehensive, and easy-to-use vulnerability scanner for container images, file systems, and Git repositories. It detects OS packages, application dependencies, and IaC misconfigurations.
*   **Clair:** An open-source project that performs static analysis of vulnerabilities in application containers. It provides an API for querying vulnerabilities.
*   **Docker Scout / Docker Desktop Scan:** Built-in capabilities that leverage vulnerability databases to scan images.

### 3.3 Integration into CI/CD Workflows

Security scanning should be an automated step in your CI/CD pipeline, ideally after an image is built but before it's pushed to a registry or deployed.

**Example: Basic Trivy Scan in a CI/CD Pipeline (GitHub Actions)**

```yaml
name: Image Build and Scan

on:
  push:
    branches:
      - main

jobs:
  build-and-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t my-app:latest .

      - name: Run Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'my-app:latest'
          format: 'table'
          exit-code: '1' # Fail the build if any vulnerability is found
          severity: 'HIGH,CRITICAL' # Only report High or Critical vulnerabilities
          ignore-unfixed: true # Don't report vulnerabilities without a fix
```

In this example:
1.  The `docker build` command creates the image.
2.  The `aquasecurity/trivy-action` GitHub Action then scans the `my-app:latest` image.
3.  The `exit-code: '1'` parameter ensures that the CI/CD pipeline will fail if any `HIGH` or `CRITICAL` vulnerabilities are found, preventing the deployment of insecure images.

## 4. Checklist / Exercise

1.  **Registry Comparison:** Describe the key differences and typical use cases for Docker Hub, AWS ECR, and Azure Container Registry.
2.  **Tagging Scenario:** Your team is deploying a new feature for `my-service`. How would you tag its Docker image to ensure both semantic versioning and immutability for potential rollbacks? Provide an example.
3.  **CI/CD Integration:** Outline the steps you would take to integrate Trivy into a GitLab CI/CD pipeline for a project that builds a Docker image. What would be a critical configuration setting to prevent highly vulnerable images from being deployed?