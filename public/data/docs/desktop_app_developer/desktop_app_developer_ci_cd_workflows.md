# CI/CD Workflows for Desktop Applications: Study Guide

Compiling cross-platform binaries requires configuring runners with Windows, macOS, and Linux hardware to automate tests and release artifacts.

## 1. Key Concepts

### Concept 1: Multi-OS GitHub Runners
Running build pipelines on windows-latest, macos-latest, and ubuntu-latest runner machines in parallel.

### Concept 2: Secure Code Signing in CI
Injecting code-signing credentials, certificates, and PFX files securely using CI secrets.

### Concept 3: Automated Release creation
Configuring CI to automatically compile binaries, sign them, draft a GitHub Release, and upload installer files.

## 2. Practical Example

### CI/CD Workflows for Desktop Applications Example Setup
```text
GitHub Actions workflow YAML configuration showing compilation matrix across three operating systems (Windows, macOS, Linux).
```

## 3. Quick Check-Up

1. Why is a multi-OS build matrix required in your desktop CI/CD configuration?
2. How do you securely handle Apple developer credentials inside GitHub Action secrets?
3. What is the difference between building on macOS x64 and macOS Apple Silicon (arm64) runners?
