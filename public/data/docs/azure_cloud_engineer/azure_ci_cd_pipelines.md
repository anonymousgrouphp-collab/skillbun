## Building & Managing CI/CD Pipelines (Azure Pipelines)

Continuous Integration (CI) and Continuous Delivery/Deployment (CD) are fundamental practices in modern software development, enabling teams to deliver high-quality software faster and more reliably. Azure Pipelines, a service within Azure DevOps, provides a robust, cloud-hosted solution for building, testing, and deploying applications to any platform or cloud, including Azure resources.

### 1. Introduction to CI/CD and Azure Pipelines

*   **Continuous Integration (CI):** The practice of regularly merging all developers' working copies to a shared mainline. Its main goal is to detect integration errors as early as possible. In Azure Pipelines, this involves automating builds and running tests on every code change.
*   **Continuous Delivery (CD):** An extension of CI that ensures software can be released reliably at any time. It automates the entire release process, from compilation to deployment into various environments (e.g., staging, production).
*   **Continuous Deployment:** A further automation of CD, where every change that passes all tests is automatically deployed to production without human intervention.
*   **Azure Pipelines:** A service that automates the entire software delivery process, supporting CI/CD for any language, platform, and cloud. It offers YAML-based pipelines for version-controlled and template-driven configurations, as well as a classic visual designer.

### 2. Core Concepts of Azure Pipelines

*   **Pipelines:** The complete workflow definition, from code commit to deployment. A pipeline consists of one or more stages.
*   **Stages:** A logical division within a pipeline, representing a major phase like Build, Test, or Deploy. Stages run sequentially by default.
*   **Jobs:** A series of steps that run together on an agent. A stage can have one or more jobs, which can run in parallel or sequentially.
*   **Steps:** The smallest building block in a pipeline, representing a single action. Steps can be tasks or scripts.
*   **Tasks:** Pre-built scripts or operations provided by Azure DevOps or the marketplace (e.g., `DotNetCoreCLI@2`, `AzureWebApp@1`).
*   **Agents:** The installed software that runs jobs. Azure Pipelines provides **Microsoft-hosted agents** (pre-configured virtual machines for various platforms) or you can set up **self-hosted agents** for custom environments or private networks.
*   **Artifacts:** Files or packages produced by a build (e.g., compiled binaries, web deployment packages) that are consumed by later stages or jobs.
*   **Environments:** A collection of resources (e.g., Kubernetes clusters, Azure Web Apps, virtual machines) targeted by a deployment. Environments enable security checks and approvals.
*   **Service Connections:** Secure credentials and settings for connecting to external services (e.g., Azure subscription, GitHub, Docker Hub).

### 3. Continuous Integration (CI) with Azure Pipelines

CI pipelines typically involve:

1.  **Code Checkout:** Retrieving the source code from a version control system (e.g., Git).
2.  **Build:** Compiling the code into executables or deployable packages.
3.  **Test:** Running unit, integration, and other automated tests to ensure code quality.
4.  **Publish Artifacts:** Making the build output available for subsequent CD stages.

**Triggers:** CI pipelines are often triggered automatically by code changes (e.g., `push` to `main` branch, `pull request` creation).

### 4. Continuous Delivery/Deployment (CD) with Azure Pipelines

CD pipelines take the artifacts from CI and deploy them to various environments.

*   **Multi-stage Pipelines:** Modern Azure Pipelines often use multi-stage YAML pipelines where CI and CD are defined in a single `azure-pipelines.yml` file. This provides a single source of truth and allows for better versioning and consistency.
*   **Deployment to Azure Resources:** Using tasks like `AzureWebApp@1` for App Services, `AzureRmWebAppDeployment@4` for various Azure deployments, or `AzureFunctionApp@1` for Functions.
*   **Approvals and Gates:** Critical for production deployments, ensuring human review or automated health checks before proceeding to the next stage.

### 5. Example: A Simple Multi-Stage CI/CD Pipeline (YAML)

This example demonstrates a basic multi-stage pipeline for a .NET Core web application, building it and then deploying it to an Azure Web App in a 'Development' environment. Replace placeholders like `<Your-Azure-Service-Connection-Name>` and `<Your-Dev-Web-App-Name>` with your actual values.

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  vmImageName: 'ubuntu-latest'
  buildConfiguration: 'Release'

stages:
- stage: Build
  displayName: Build Stage
  jobs:
  - job: BuildJob
    displayName: Build Application
    pool:
      vmImage: $(vmImageName)
    steps:
    - checkout: self
      clean: true
    - task: DotNetCoreCLI@2
      displayName: 'Restore .NET packages'
      inputs:
        command: 'restore'
        projects: '**/*.csproj'
    - task: DotNetCoreCLI@2
      displayName: 'Build .NET application'
      inputs:
        command: 'build'
        projects: '**/*.csproj'
        arguments: '--configuration $(buildConfiguration)'
    - task: DotNetCoreCLI@2
      displayName: 'Run Unit Tests'
      inputs:
        command: 'test'
        projects: '**/*Tests.csproj'
        arguments: '--configuration $(buildConfiguration)'
    - task: DotNetCoreCLI@2
      displayName: 'Publish .NET application'
      inputs:
        command: 'publish'
        publishWebProjects: true
        arguments: '--configuration $(buildConfiguration) --output $(Build.ArtifactStagingDirectory)'
        zipAfterPublish: true
    - publish: $(Build.ArtifactStagingDirectory)
      artifact: drop
      displayName: 'Publish Build Artifact'

- stage: DeployDev
  displayName: Deploy to Development
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployWebApp
    displayName: Deploy Web App to Azure
    environment: 'Development' # Ensure this environment is configured in Azure DevOps
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Azure Web App Deploy'
            inputs:
              azureSubscription: '<Your-Azure-Service-Connection-Name>'
              appType: 'webApp'
              appName: '<Your-Dev-Web-App-Name>'
              package: '$(Pipeline.Workspace)/drop/**/*.zip'
```

### Checklist / Exercise

1.  **Create a Multi-Stage Pipeline:** Modify the provided YAML example to add a new `DeployProd` stage that depends on `DeployDev` and includes an approval gate for manual intervention before deploying to a production Azure Web App.
2.  **Integrate Testing:** Add a task to the `Build` stage that publishes test results to Azure DevOps, ensuring that test failures block subsequent stages.
3.  **Explore Service Connections:** Set up an Azure Resource Manager service connection in your Azure DevOps project and use it in your pipeline to deploy to an Azure Web App, verifying that the deployment works successfully.