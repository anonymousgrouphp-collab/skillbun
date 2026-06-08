# CI/CD Pipelines with Cloud Build and Artifact Registry

Continuous Integration (CI) and Continuous Delivery (CD) are fundamental practices in modern software development, enabling teams to deliver changes to users faster and more reliably. On Google Cloud Platform (GCP), Cloud Build and Artifact Registry are key services for implementing robust CI/CD pipelines.

## What is CI/CD?

*   **Continuous Integration (CI):** Developers frequently merge their code changes into a central repository. Automated builds and tests are run to detect integration errors early and quickly, ensuring the codebase is always in a releasable state.
*   **Continuous Delivery (CD):** An extension of CI, ensuring that all code changes are automatically built, tested, and prepared for release to production. This makes deployments predictable and repeatable, often with a manual approval step before actual production deployment.

## GCP Services for CI/CD

### 1. Cloud Build

Cloud Build is a serverless CI/CD platform that executes your builds on GCP. It can import source code from Cloud Source Repositories, GitHub, Bitbucket, or a local directory, execute a series of build steps, and produce artifacts.

*   **Build Steps:** Defined in a `cloudbuild.yaml` file, these are a sequence of actions that Cloud Build executes. Each step runs in a Docker container (a "builder") with a specific tool or environment.
*   **Builders:** Pre-built or custom Docker images that perform specific tasks (e.g., `gcr.io/cloud-builders/docker` for Docker commands, `gcr.io/cloud-builders/go` for Go builds, `gcr.io/cloud-builders/gcloud` for `gcloud` CLI commands).
*   **Triggers:** Automatically start builds in response to events, such as commits to a repository, pull requests, or scheduled times.
*   **Substitutions:** Allow parameterizing your `cloudbuild.yaml` with variables like branch names, commit SHAs, environment variables, etc.

### 2. Cloud Source Repositories

While not directly a build service, Cloud Source Repositories provide fully featured, scalable, private Git repositories hosted on GCP. It's the ideal place to store your application's source code and integrate directly with Cloud Build triggers for automated workflows.

### 3. Artifact Registry

Artifact Registry is a universal package manager that provides a centralized repository for storing, managing, and securing your build artifacts. It supports various artifact formats, including:

*   **Docker Images:** Container images for deployment to services like Cloud Run, GKE, or Compute Engine.
*   **Maven and npm Packages:** Dependencies for Java and Node.js applications.
*   **Python Packages:** Wheels and source distributions.
*   **OS Packages:** Debian and RPM packages.

Artifact Registry ensures a secure and high-performance repository for all your artifacts, integrating seamlessly with Cloud Build and other GCP services.

## CI/CD Pipeline Workflow Example

Let's consider a common scenario: building a Docker image for a simple application and pushing it to Artifact Registry.

1.  **Developer commits code** to a Cloud Source Repository (or other integrated Git repository).
2.  **Cloud Build Trigger** detects the commit event on the specified branch.
3.  **Cloud Build** starts a new build execution.
    *   It fetches the latest source code from the repository.
    *   It executes the build steps defined in the `cloudbuild.yaml` file to build a Docker image.
    *   It tags the Docker image with relevant information (e.g., commit SHA or version).
    *   It pushes the tagged Docker image to Artifact Registry.
4.  **Artifact Registry** securely stores the new Docker image, making it available for subsequent deployment steps (e.g., to Cloud Run, GKE, or other environments).

## Practical Example: Building and Pushing a Docker Image

Imagine you have a simple Go application and its `Dockerfile`.

**`main.go` (Example Go application)**

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Cloud Build CI/CD on port %s!\n", os.Getenv("PORT"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
```

**`Dockerfile`**

```dockerfile
# Use the official Golang image to create a build artifact
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /hello-app .

# Use a minimal base image for the final stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /hello-app .

EXPOSE 8080
CMD ["./hello-app"]
```

**`cloudbuild.yaml`**

This file defines the steps Cloud Build will take to build and push the Docker image.

```yaml
steps:
  # Step 1: Build the Docker image
  # Uses the official Docker builder to build the image from the Dockerfile.
  # The image is tagged with the Artifact Registry host, project ID, repository name, app name, and commit SHA.
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/my-docker-repo/my-go-app:$COMMIT_SHA', '.']
  # Note: 'us-central1-docker.pkg.dev' is the region-specific host for Docker images in Artifact Registry.
  #       '$PROJECT_ID' and '$COMMIT_SHA' are Cloud Build substitution variables.
  #       'my-docker-repo' is the name of your Artifact Registry Docker repository.

  # Step 2: Push the Docker image to Artifact Registry
  # Uses the Docker builder again to push the tagged image to the specified registry location.
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/my-docker-repo/my-go-app:$COMMIT_SHA']

images:
  # This section registers the built image as an artifact produced by the build.
  # Cloud Build automatically handles the pushing of images listed here if the build completes successfully.
- 'us-central1-docker.pkg.dev/$PROJECT_ID/my-docker-repo/my-go-app:$COMMIT_SHA'
```

**Before running this, ensure you have:**
1.  Enabled the Cloud Build and Artifact Registry APIs for your GCP project.
2.  Created a Docker repository in Artifact Registry, for example, named `my-docker-repo` in the `us-central1` region:
    ```bash
    gcloud artifacts repositories create my-docker-repo \
        --repository-format=docker \
        --location=us-central1 \
        --description="Docker repository for my Go application"
    ```
3.  Set up a Cloud Build trigger that points to your source code repository (e.g., Cloud Source Repositories, GitHub) and specifies `cloudbuild.yaml` as the build configuration file.

## Key Concepts and Best Practices

*   **Service Accounts:** Cloud Build uses a default service account (`PROJECT_NUMBER@cloudbuild.gserviceaccount.com`). Ensure this service account has the necessary IAM permissions (e.g., `Artifact Registry Writer` role) to push images or packages to Artifact Registry.
*   **Security:** Avoid embedding sensitive information (like API keys or secrets) directly in your `cloudbuild.yaml`. Use Cloud Key Management Service (KMS) or Secret Manager with Cloud Build for secure access to credentials during builds.
*   **Testing in CI:** Integrate unit tests and integration tests as separate, explicit steps in your `cloudbuild.yaml` *before* building and pushing artifacts. This ensures that only tested code makes it into your artifact repository.
*   **Immutable Artifacts:** Leverage Git commit SHAs, semantic versioning, or unique build IDs for tagging artifacts to ensure traceability, immutability, and easy rollback capabilities.
*   **Regionality:** Place your Artifact Registry repositories in the same region as your deployment targets (e.g., GKE clusters, Cloud Run services) to minimize latency and egress costs.

## Quick Check / Exercise

1.  Explain the primary difference in purpose between Cloud Build and Artifact Registry within the context of a CI/CD pipeline.
2.  What is a `cloudbuild.yaml` file used for, and what role do "builders" play in executing its steps?
3.  You're developing a Node.js application and want to store its private `npm` packages as artifacts. Which GCP service would you use for this, and how would you typically integrate it into a Cloud Build CI/CD flow?