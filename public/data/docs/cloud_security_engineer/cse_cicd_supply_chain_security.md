# CI/CD Pipeline & Supply Chain Security

## 1. Introduction to CI/CD and Supply Chain Security
Modern software development relies heavily on Continuous Integration/Continuous Delivery (CI/CD) pipelines to automate the build, test, and deployment processes. While this automation accelerates delivery, it also introduces new security challenges and attack surfaces. Integrating security throughout the CI/CD pipeline, often termed **DevSecOps**, is crucial to identify and remediate vulnerabilities early, reducing the risk of security incidents.

The concept of **Software Supply Chain Security** extends beyond the direct code an organization writes. It encompasses every component, tool, and process involved in delivering software, from third-party libraries and open-source packages to build servers, development environments, and deployment mechanisms. Recent high-profile attacks have highlighted the critical need to secure this entire chain.

## 2. Embedding Security into the CI/CD Pipeline (DevSecOps)
Implementing DevSecOps means shifting security "left" – integrating security practices from the earliest stages of development, rather than treating it as a post-development afterthought.

### 2.1 Dependency Scanning & Software Composition Analysis (SCA)
*   **What it is**: SCA tools automatically identify open-source components used in a project and scan them for known vulnerabilities (CVEs), license compliance issues, and outdated versions.
*   **Why it's crucial**: Most modern applications are composed of 80-90% open-source components. A single vulnerable library can expose the entire application.
*   **Integration**: Typically run early in the pipeline (e.g., during build or package installation) to alert developers immediately.
*   **Examples**: OWASP Dependency-Check, Snyk, WhiteSource, Trivy.

### 2.2 Static Application Security Testing (SAST)
*   **What it is**: SAST tools analyze an application's source code, bytecode, or binary code without executing it, looking for coding errors and security vulnerabilities (e.g., SQL injection, cross-site scripting, buffer overflows).
*   **Benefits**: Finds vulnerabilities early in the development cycle, provides detailed insights into the exact line of code causing the issue, and covers custom-written code.
*   **Limitations**: Can produce false positives, may not detect configuration issues or runtime flaws.
*   **Integration**: Run during the `build` or `test` stage, ideally on every code commit or pull request.
*   **Examples**: SonarQube, Checkmarx, Bandit (Python), ESLint (JavaScript).

### 2.3 Dynamic Application Security Testing (DAST)
*   **What it is**: DAST tools test a running application from the outside, simulating an attacker's perspective, to identify vulnerabilities that manifest during execution (e.g., authentication flaws, improper session management, misconfigurations).
*   **Benefits**: Catches runtime issues, configuration errors, and vulnerabilities that SAST might miss. Effective for web applications and APIs.
*   **Limitations**: Requires a deployed, running application, typically later in the CI/CD pipeline. Cannot directly pinpoint the exact line of code causing the issue.
*   **Integration**: Run against a deployed staging or test environment after the build and initial testing phases.
*   **Examples**: OWASP ZAP, Burp Suite, Acunetix.

### 2.4 Artifact Signing
*   **Purpose**: Digitally signing build artifacts (e.g., container images, executables, packages) ensures their integrity and authenticity. It proves that the artifact originated from a trusted source and has not been tampered with since it was signed.
*   **How it works**: A cryptographic signature is attached to the artifact using a private key, and this signature can be verified later using a corresponding public key.
*   **Importance**: Critical for preventing supply chain attacks where malicious code could be injected into an artifact during transfer or storage.
*   **Tools/Standards**: Notary, Sigstore (Cosign), Docker Content Trust, GPG.

## 3. Mitigating Software Supply Chain Risks
Software supply chain risks involve vulnerabilities or malicious activity at any point in the lifecycle of software, from design and development to distribution and consumption.

### 3.1 Common Attack Vectors
*   **Dependency Confusion**: An attacker publishes a malicious package to a public registry with the same name as an internal package used by an organization. If the build system prioritizes public registries, it might fetch the malicious package.
*   **Typosquatting**: Similar to dependency confusion, but attackers publish packages with names very similar to popular legitimate ones (e.g., `requests` vs. `requessts`).
*   **Compromised Build Tools/Infrastructure**: Attackers gain access to build servers, CI/CD agents, or version control systems and inject malicious code or alter build processes.
*   **Insider Threats**: Malicious actors within an organization intentionally introduce vulnerabilities or backdoors.
*   **Vulnerable Open-Source Components**: Exploiting known or zero-day vulnerabilities in third-party libraries used by an application.
*   **Stolen Credentials**: Compromised API keys, tokens, or user credentials that grant access to repositories, registries, or CI/CD pipelines.

### 3.2 Managing Software Bill of Materials (SBOMs)
*   **What is an SBOM**: A Software Bill of Materials is a formal, machine-readable inventory of all the components that make up a piece of software. This includes open-source and commercial software components, their versions, dependencies, and licensing information.
*   **Why it's important**: SBOMs provide transparency into the software's composition, enabling better vulnerability management, license compliance, and risk assessment. If a new vulnerability (CVE) is discovered in a common library, an SBOM allows organizations to quickly identify all applications using that library.
*   **Standards**: SPDX (Software Package Data Exchange) and CycloneDX are widely used open standards for creating SBOMs.

## 4. Example: Integrating Security Scans in a CI/CD Pipeline (GitLab CI)
This example demonstrates how to integrate basic SAST and Dependency Scanning steps into a GitLab CI pipeline. In a real-world scenario, you would replace the placeholder `script` commands with actual security scanner invocations.

```yaml
# .gitlab-ci.yml

stages:
  - build
  - test
  - security_scan
  - deploy

variables:
  GIT_STRATEGY: clone

build_job:
  stage: build
  script:
    - echo "Building application... (e.g., mvn clean install or npm install)"
  artifacts:
    paths:
      - build/

sast_job:
  stage: security_scan
  image: docker:latest # Use a dedicated SAST scanner image for actual tools
  allow_failure: true # Set to 'false' in production after tuning
  script:
    - echo "Running SAST scan on source code..."
    # Replace with your actual SAST tool command, e.g.:
    # - /opt/sast-tool/scan --project-dir . --output-format json --output-file sast_report.json
    - ls -la # Placeholder command
  artifacts:
    reports:
      sast: sast_report.json # GitLab SAST report format
    when: always
    expire_in: 1 week

dependency_scan_job:
  stage: security_scan
  image: docker:latest # Use a dedicated SCA scanner image
  allow_failure: true # Set to 'false' in production after tuning
  script:
    - echo "Running dependency scan..."
    # Replace with your actual SCA tool command, e.g.:
    # - snyk test --json > snyk_report.json
    - cat package.json || true # Placeholder command for a Node.js project
  artifacts:
    reports:
      dependency_scanning: dependency_scan_report.json # GitLab DS report format
    when: always
    expire_in: 1 week

deploy_job:
  stage: deploy
  script:
    - echo "Deploying application to environment..."
  dependencies:
    - build_job
    - sast_job
    - dependency_scan_job
  only:
    - main
```

## 5. Quick Checklist/Exercises
1.  **Vulnerability Detection Strategy**: You are developing a new microservice. Describe how you would integrate both SAST and DAST into its CI/CD pipeline, explaining when each would run and the primary types of vulnerabilities each is designed to detect in this context.
2.  **Mitigating New Dependency Risks**: Your team plans to introduce a new, relatively unknown open-source library. Outline three concrete actions you would take *before* integrating it into your main codebase to mitigate potential software supply chain risks.
3.  **SBOM for Compliance**: Explain how generating and maintaining an SBOM for your containerized application helps you respond quickly to a newly announced critical vulnerability (CVE) in a common base image or library, even after the application has been deployed for months. Name a standard format for an SBOM.