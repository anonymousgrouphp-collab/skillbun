## CI/CD Pipeline Fundamentals & Tooling

### Introduction to CI/CD
CI/CD, an acronym for **Continuous Integration, Continuous Delivery, and Continuous Deployment**, represents a methodology that brings agility and reliability to software development. It's a set of principles and practices that enable development teams to deliver code changes more frequently and reliably by automating the stages of software delivery.

### 1. Continuous Integration (CI)
**Goal**: To merge developers' code changes frequently into a central repository and automatically build and test the software.

**Key Principles:**
*   **Automated Builds**: Every code commit triggers an automated build process.
*   **Automated Testing**: Unit tests, integration tests, and sometimes basic end-to-end tests run automatically after each build.
*   **Frequent Commits**: Developers commit code changes multiple times a day.
*   **Fast Feedback**: Developers receive immediate feedback on the health of their code changes (build success/failure, test results).

**Benefits**: Reduces integration issues, identifies bugs early, improves code quality.

### 2. Continuous Delivery (CD)
**Goal**: To ensure that code changes are always ready for deployment to a production environment at any time.

**Key Principles:**
*   **Automated Release Process**: Builds that pass all CI tests are automatically prepared for release.
*   **Deployable Artifacts**: The output is a production-ready artifact (e.g., Docker image, JAR file, compiled binary).
*   **Staging Environments**: Artifacts are often deployed to staging or pre-production environments for further testing and validation.
*   **Manual Approval**: Deployment to production typically requires a manual approval step.

**Benefits**: Reduces risk of deployment, faster time to market, consistent releases.

### 3. Continuous Deployment (CD)
**Goal**: To automate the entire software release process, from code commit to production deployment, without manual intervention.

**Key Principles:**
*   **Full Automation**: Every change that passes automated tests is automatically released to production.
*   **No Manual Approval**: There are no human gates for production deployment.
*   **High Confidence**: Requires robust automated testing, monitoring, and rollback capabilities.

**Benefits**: Fastest time to market, minimal human error, truly agile delivery.

### Core Pipeline Stages
A typical CI/CD pipeline consists of several stages that execute sequentially:
1.  **Source**: Code is pulled from the version control system (e.g., Git).
2.  **Build**: Compiles source code into an executable artifact, generates binaries, packages dependencies.
3.  **Test**: Runs various automated tests (unit, integration, end-to-end, performance, security).
4.  **Security Scan**: Analyzes code for vulnerabilities (SAST, DAST, SCA).
5.  **Package/Containerize**: Creates deployable artifacts, often Docker images.
6.  **Deploy**: Pushes the artifact to a target environment (dev, staging, production).
7.  **Monitor**: Post-deployment monitoring for errors and performance.

### Pipeline Triggers
Pipelines can be initiated by various events:
*   **Code Push**: Most common, triggered by commits to specific branches.
*   **Pull Request**: Triggers checks before merging code.
*   **Scheduled Jobs**: Runs at predefined intervals (e.g., nightly builds).
*   **Manual Trigger**: Initiated by a user.
*   **API Calls/Webhooks**: Triggered by external systems.

### Pipeline Variables
Variables are used to make pipelines dynamic and adaptable:
*   **Environment Variables**: Key-value pairs used to configure jobs (e.g., `NODE_ENV=production`).
*   **Secrets**: Sensitive information (API keys, passwords) stored securely and injected as environment variables at runtime.
*   **Parameters**: User-defined inputs when manually triggering a pipeline.

### Popular CI/CD Tools
*   **GitHub Actions**: Integrated directly into GitHub repositories, YAML-based workflows.
*   **GitLab CI/CD**: Native to GitLab, `.gitlab-ci.yml` for pipeline definition.
*   **Jenkins**: Open-source automation server, highly extensible with plugins.
*   **Azure DevOps Pipelines**: Part of Microsoft Azure DevOps, supports multiple languages and platforms.
*   **CircleCI**: Cloud-based CI/CD service, uses YAML configuration.

### Simple GitHub Actions Workflow Example
This example demonstrates a basic CI workflow for a Node.js project. It checks out the code, installs dependencies, and runs tests.

```yaml
name: Node.js CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
```

### Checklist/Exercise
1.  **Differentiate CI vs. CD (Delivery vs. Deployment)**: Explain the key difference between Continuous Delivery and Continuous Deployment.
2.  **Identify Core Stages**: List at least three essential stages found in most CI/CD pipelines and describe their purpose.
3.  **Tool Selection**: If you were to set up a CI/CD pipeline for a project hosted on GitHub, which tool would be your primary choice and why?
