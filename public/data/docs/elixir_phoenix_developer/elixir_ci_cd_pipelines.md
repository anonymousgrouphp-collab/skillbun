# CI/CD Pipelines for Elixir/Phoenix

## Introduction
Continuous Integration (CI) and Continuous Deployment (CD) pipelines are essential practices for modern software development. For Elixir/Phoenix applications, implementing CI/CD streamlines the development workflow, ensures code quality through automated testing, and provides reliable, repeatable deployments. This guide will cover the core concepts of CI/CD and how to set them up for your Elixir/Phoenix projects using popular tools like GitHub Actions or GitLab CI.

## Core Concepts

### Continuous Integration (CI)
CI is a development practice where developers regularly merge their code changes into a central repository. After each merge, automated builds and tests are run to detect integration errors early.
*   **Automated Builds**: Compiling Elixir code, building assets (with `esbuild` or `webpack`), and creating releases.
*   **Automated Testing**: Running unit tests, integration tests, and end-to-end tests using `mix test`.
*   **Static Analysis**: Tools like `Credo` for code quality and style checks.

### Continuous Deployment (CD)
CD is an extension of CI that automates the deployment of code changes to production or staging environments after successful CI steps.
*   **Continuous Delivery**: The application is always in a deployable state, with manual approval for production deployment.
*   **Continuous Deployment**: Every change that passes automated tests and meets quality gates is automatically deployed to production.

## Benefits for Elixir/Phoenix Projects
*   **Faster Feedback Loop**: Quickly identify and fix issues.
*   **Improved Code Quality**: Consistent testing and static analysis.
*   **Reliable Deployments**: Automated processes reduce human error.
*   **Reduced Manual Effort**: Free up developers to focus on new features.
*   **Consistent Environments**: Ensure development, staging, and production environments are similar.

## Popular CI/CD Tools
*   **GitHub Actions**: Integrated directly into GitHub repositories, highly configurable using YAML. Excellent for projects hosted on GitHub.
*   **GitLab CI/CD**: Built into GitLab, offering powerful pipelines for projects hosted on GitLab.
*   **CircleCI**: Cloud-based CI/CD service, widely used across various languages and platforms.
*   **Jenkins**: Open-source automation server, highly customizable but requires more setup and maintenance.

## Setting Up CI/CD with GitHub Actions for Elixir/Phoenix

GitHub Actions workflows are defined in YAML files (`.github/workflows/*.yml`) within your repository. A typical workflow for an Elixir/Phoenix application involves steps like setting up the environment, installing dependencies, running tests, and building a release artifact.

### Basic Workflow Structure

```yaml
name: Elixir CI/CD

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]

jobs:
  build_and_test:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Elixir
      uses: erlef/setup-beam@v1
      with:
        elixir-version: '1.16.0' # Specify your Elixir version
        otp-version: '26.2'    # Specify your OTP version

    - name: Restore mix dependencies cache
      uses: actions/cache@v4
      id: mix-cache
      with:
        path: deps
        key: ${{ runner.os }}-mix-${{ hashFiles('**/mix.lock') }}
        restore-keys: ${{ runner.os }}-mix-

    - name: Install mix dependencies
      if: steps.mix-cache.outputs.cache-hit != 'true'
      run: mix deps.get

    - name: Compile Elixir
      run: mix compile --warnings-as-errors

    - name: Run tests
      run: mix test

  # You can add a deployment job here, e.m., to build a release and push to a server
  # deploy:
  #   name: Deploy to Production
  #   needs: build_and_test # Ensures deployment only runs after tests pass
  #   runs-on: ubuntu-latest
  #   steps:
  #     - name: Checkout code
  #       uses: actions/checkout@v4
  #     - name: Setup Elixir and OTP (same as above)
  #       uses: erlef/setup-beam@v1
  #       with:
  #         elixir-version: '1.16.0'
  #         otp-version: '26.2'
  #     - name: Install mix dependencies
  #       run: mix deps.get
  #     - name: Build release
  #       run: mix release --env=prod
  #     - name: Deploy release (example for SCP/SSH)
  #       uses: appleboy/scp-action@master
  #       with:
  #         host: ${{ secrets.SSH_HOST }}
  #         username: ${{ secrets.SSH_USERNAME }}
  #         key: ${{ secrets.SSH_PRIVATE_KEY }}
  #         source: "_build/prod/rel/your_app/*"
  #         target: "/opt/your_app"
  #     - name: Restart application (example for SSH)
  #       uses: appleboy/ssh-action@master
  #       with:
  #         host: ${{ secrets.SSH_HOST }}
  #         username: ${{ secrets.SSH_USERNAME }}
  #         key: ${{ secrets.SSH_PRIVATE_KEY }}
  #         script: |
  #           sudo systemctl restart your_app
```
**Explanation of the Example Workflow:**
1.  **`name`**: Descriptive name for the workflow.
2.  **`on`**: Defines when the workflow runs (e.g., on push to `main` or `develop` branches, or on pull requests).
3.  **`jobs`**: A workflow can have multiple jobs that run in parallel or sequentially.
    *   **`build_and_test`**: Defines steps for continuous integration.
        *   `runs-on`: Specifies the operating system for the job.
        *   `steps`: A sequence of tasks.
            *   `actions/checkout@v4`: Checks out your repository code.
            *   `erlef/setup-beam@v1`: Sets up Erlang/OTP and Elixir versions.
            *   `actions/cache@v4`: Caches Mix dependencies to speed up subsequent runs.
            *   `mix deps.get`: Fetches project dependencies.
            *   `mix compile --warnings-as-errors`: Compiles the Elixir code, treating warnings as errors to enforce strictness.
            *   `mix test`: Runs all unit and integration tests.
    *   **`deploy` (Commented out example)**: Illustrates a potential deployment job.
        *   `needs: build_and_test`: Ensures this job only runs if `build_and_test` passes.
        *   Builds an Elixir release (`mix release`).
        *   Uses `appleboy/scp-action` and `appleboy/ssh-action` to copy the release and restart the application on a remote server. This typically relies on GitHub Secrets for sensitive information (host, username, private key).

## Checklist/Exercises
1.  **Differentiate CI vs. CD**: Explain the key differences between Continuous Integration and Continuous Deployment and why both are important for a modern Elixir/Phoenix application.
2.  **Modify a Workflow**: Take the provided GitHub Actions example and modify it to include a `mix credo --strict` step after `mix compile`. Explain why this step is beneficial.
3.  **Deployment Strategy**: Research and briefly describe two different strategies for deploying an Elixir/Phoenix release to a production server (e.g., using `mix release` with SSH/SCP vs. Docker/Kubernetes).