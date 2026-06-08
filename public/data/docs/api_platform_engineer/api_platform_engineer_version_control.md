# Version Control Systems (Git & CI/CD Basics)

## Introduction
As an API Platform Engineer, mastering version control is foundational. Git provides the robust framework for managing every change to API specifications, codebase, and infrastructure configurations. Complementing this, Continuous Integration and Continuous Delivery (CI/CD) pipelines automate the crucial steps from code commit to deployment, ensuring rapid, reliable, and high-quality delivery of APIs and the platform itself.

## 1. Git: The Cornerstone of Collaborative Development

Git is a distributed version control system (DVCS) designed for speed, data integrity, and support for distributed, non-linear workflows.

### 1.1 Core Git Concepts
*   **Repository (Repo):** A project's history, files, and metadata.
*   **Commit:** A snapshot of your project at a specific time, with a unique ID and message.
*   **Branch:** A parallel line of development. Allows developers to work on features or fixes independently.
*   **Merge:** Combining changes from different branches.
*   **Remote:** A version of your repository hosted on the internet (e.g., GitHub, GitLab, Bitbucket).
*   **Clone:** Creating a local copy of a remote repository.

### 1.2 Essential Git Commands
Here are some fundamental commands:

| Command                   | Description                                                               |
| :------------------------ | :------------------------------------------------------------------------ |
| `git init`                | Initializes a new Git repository.                                         |
| `git clone [url]`         | Clones an existing repository from a URL.                                 |
| `git add [file]`          | Stages changes for the next commit. `git add .` for all changes.          |
| `git commit -m "msg"`   | Records staged changes to the repository with a message.                  |
| `git status`              | Shows the working tree status.                                            |
| `git log`                 | Shows commit history.                                                     |
| `git branch`              | Lists, creates, or deletes branches.                                      |
| `git checkout [branch]`   | Switches to a specified branch or restores files.                         |
| `git merge [branch]`      | Merges the specified branch into the current branch.                      |
| `git pull`                | Fetches from and integrates with another repository or a local branch.    |
| `git push`                | Updates remote refs along with associated objects.                        |

### 1.3 Git Workflow for API Engineers
API Platform Engineers typically use Git to:
*   Manage API Specification files (e.g., OpenAPI/Swagger YAML/JSON).
*   Version control service code and configurations.
*   Collaborate on infrastructure-as-code (IaC) files (e.g., Terraform, CloudFormation).
*   Maintain documentation.

Common workflows include Feature Branch Workflow where each new feature or fix is developed in its own branch, then merged back into a `main` or `develop` branch after review.

## 2. CI/CD Basics: Automating the Delivery Pipeline

CI/CD is a methodology that introduces continuous automation and continuous monitoring throughout the lifecycle of applications, from integration and testing phases to delivery and deployment.

### 2.1 Continuous Integration (CI)
CI is the practice of frequently merging code changes into a central repository. Automated builds and tests are then run.
*   **Goal:** Detect integration issues early, reduce merge conflicts, and ensure the codebase is always in a working state.
*   **Typical CI steps:** Code commit -> Run unit tests -> Build artifacts -> Run integration tests.

### 2.2 Continuous Delivery (CD) & Continuous Deployment (CD)
*   **Continuous Delivery:** Ensures that code changes are automatically built, tested, and prepared for release to production. It guarantees that you can release new changes to your customers rapidly and sustainably at any time. *Manual approval* is often required for production deployment.
*   **Continuous Deployment:** An extension of Continuous Delivery where *every* change that passes all stages of the production pipeline is automatically released to production, without explicit human intervention.

### 2.3 Benefits for API Development
*   **Faster Release Cycles:** Ship new API features and updates more frequently.
*   **Improved Quality:** Automated testing catches bugs early, ensuring robust APIs.
*   **Reduced Risk:** Smaller, more frequent changes are easier to debug and roll back.
*   **Consistency:** Standardized build and deployment processes.
*   **Efficiency:** Automates repetitive tasks, freeing engineers for more complex work.

## 3. Git and CI/CD Integration

Git serves as the trigger for CI/CD pipelines. When code is pushed to a Git repository (especially to specific branches), a webhook or polling mechanism can trigger a CI/CD pipeline.

### Conceptual CI/CD Pipeline Example (YAML)

Consider a simple pipeline for an API service using a tool like GitLab CI or GitHub Actions:

```yaml
on:
  push:
    branches:
      - main
      - develop

jobs:
  build_and_test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Node.js (or any language runtime)
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm test

    - name: Build API service
      run: npm run build

  deploy_to_staging:
    needs: build_and_test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' # Deploy to staging on 'develop' branch push
    steps:
    - name: Deploy to Staging Environment
      run: |
        echo "Deploying API to staging..."
        # Add your deployment commands here (e.g., kubectl apply, serverless deploy)
        echo "Deployment to staging complete."

  deploy_to_production:
    needs: build_and_test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' # Deploy to production on 'main' branch push
    environment: Production # Example of environment protection
    steps:
    - name: Deploy to Production Environment
      run: |
        echo "Deploying API to production..."
        # Add your production deployment commands here
        echo "Deployment to production complete."
```

This example illustrates how a push to `develop` might trigger a build, test, and then deploy to a staging environment, while a push to `main` might trigger the same build/test sequence followed by a deployment to production.

## Quick Check / Exercise

1.  Explain the difference between `git merge` and `git rebase` in the context of maintaining a clean commit history.
2.  Describe two distinct benefits of implementing Continuous Integration (CI) for an API development team.
3.  You've just completed a new API feature on a branch called `feature/new-api`. Outline the Git commands you would use to integrate this feature into the `main` branch, assuming a standard pull request and merge workflow.
