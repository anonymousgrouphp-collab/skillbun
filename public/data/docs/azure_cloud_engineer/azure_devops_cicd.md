# Azure DevOps & CI/CD: Streamlining Development and Deployment

This study guide explores Azure DevOps and its role in implementing Continuous Integration and Continuous Delivery (CI/CD) pipelines to automate software development and infrastructure deployment on Microsoft Azure.

## 1. Introduction to Azure DevOps

Azure DevOps is a suite of development services that provides end-to-end support for application lifecycle management. It enables teams to collaborate, plan, develop, test, and deploy applications more efficiently.

**Key Services within Azure DevOps:**

*   **Azure Boards**: Agile planning tools (Scrum, Kanban) to track work, issues, and ideas.
*   **Azure Repos**: Git repositories for source control and version management.
*   **Azure Pipelines**: CI/CD services that automatically build, test, and deploy code to various targets.
*   **Azure Test Plans**: Manual and exploratory testing tools.
*   **Azure Artifacts**: Package management for hosting and sharing NuGet, npm, Maven, Python, and other packages.

## 2. Understanding CI/CD

**Continuous Integration (CI):**
CI is a development practice where developers integrate code into a shared repository frequently, typically several times a day. Each integration is verified by an automated build and automated tests to detect integration errors as quickly as possible.

**Key benefits of CI:**
*   Detects and fixes integration issues early.
*   Reduces merge conflicts.
*   Improves code quality through automated testing.

**Continuous Delivery (CD):**
CD is an extension of CI. It ensures that every change to the codebase is releasable at any time. After the build stage (CI), the application is automatically deployed to testing environments and is ready for manual release to production.

**Continuous Deployment (CD - second meaning):**
Continuous Deployment takes CD a step further by automatically deploying every change that passes all stages of the pipeline directly to production, without explicit human intervention.

## 3. Implementing CI/CD with Azure Pipelines

Azure Pipelines is a robust, cloud-hosted CI/CD service that allows you to build, test, and deploy to any cloud or on-premises environment. It supports various programming languages (Node.js, Python, Java, .NET, PHP, Ruby, C++, Go) and deployment targets (Azure services, AWS, GCP, Kubernetes, virtual machines, etc.).

**Core Concepts in Azure Pipelines:**

*   **Pipeline**: Defines the automated process, consisting of stages, jobs, and tasks.
*   **Stages**: A logical division in a pipeline, e.g., Build Stage, Test Stage, Deploy Stage.
*   **Jobs**: A series of tasks that run on an agent. Multiple jobs can run in parallel.
*   **Tasks**: The smallest building blocks in a pipeline, representing a single action (e.g., compiling code, running tests, publishing artifacts).
*   **Agents**: Computing infrastructure (Microsoft-hosted or self-hosted) that runs jobs.
*   **Artifacts**: Files or packages produced by a build (e.g., compiled binaries, web deployment packages) that can be consumed by later stages or release pipelines.

### Simple CI/CD Pipeline Example (YAML)

Azure Pipelines are often defined using YAML files (`azure-pipelines.yml`) stored directly in your repository, enabling "Pipeline as Code." This example demonstrates a basic CI pipeline to build a .NET Core application and publish its build artifacts.

```yaml
# azure-pipelines.yml
trigger:
- main # Trigger pipeline on changes to the 'main' branch

pool:
  vmImage: 'windows-latest' # Use a Microsoft-hosted agent running Windows

stages:
- stage: Build
  displayName: Build application
  jobs:
  - job: BuildJob
    displayName: Build and Publish
    steps:
    - task: DotNetCoreCLI@2
      displayName: 'Restore NuGet packages'
      inputs:
        command: 'restore'
        projects: '**/*.csproj'

    - task: DotNetCoreCLI@2
      displayName: 'Build project'
      inputs:
        command: 'build'
        projects: '**/*.csproj'
        arguments: '--configuration Release'

    - task: DotNetCoreCLI@2
      displayName: 'Publish project'
      inputs:
        command: 'publish'
        publishWebProjects: true # For web applications
        arguments: '--configuration Release --output $(Build.ArtifactStagingDirectory)'

    - publish: $(Build.ArtifactStagingDirectory)
      artifact: drop
      displayName: 'Publish Build Artifacts'
```
*Explanation:*
1.  `trigger: - main`: The pipeline will run automatically whenever changes are pushed to the `main` branch.
2.  `pool: vmImage: 'windows-latest'`: Specifies that a Microsoft-hosted Windows agent should be used to run the pipeline.
3.  `stages: - stage: Build`: Defines a single stage named 'Build'.
4.  `jobs: - job: BuildJob`: Defines a single job within the Build stage.
5.  `steps`: A sequence of tasks to be executed.
    *   `DotNetCoreCLI@2` tasks are used to `restore` NuGet packages, `build` the .NET Core project, and `publish` the application to a staging directory.
    *   `publish: $(Build.ArtifactStagingDirectory)`: Publishes the contents of the staging directory as a pipeline artifact named 'drop'. This artifact can then be consumed by subsequent stages (e.g., a deployment stage).

## 4. Quick Checklist/Exercise

1.  List three core services provided by Azure DevOps and briefly explain their primary function.
2.  Differentiate between Continuous Integration (CI) and Continuous Delivery (CD).
3.  Imagine you have a new web application. Outline the key stages you would include in an Azure Pipeline to automate its build, test, and deployment to an Azure App Service.
