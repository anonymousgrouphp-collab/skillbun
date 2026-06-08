# Container & Kubernetes Security Study Guide

## Introduction

Containerization, led by Docker, and orchestration, primarily by Kubernetes, have revolutionized application deployment and management. While offering unprecedented agility and scalability, they also introduce a new attack surface and unique security challenges. A robust security posture for containerized workloads and Kubernetes clusters is paramount to protect sensitive data and maintain operational integrity. This guide will delve into the essential practices and tools required to secure your container and Kubernetes environments.

## Core Concepts in Container & Kubernetes Security

Securing containers and Kubernetes involves a multi-layered approach, addressing security at various stages of the application lifecycle and across different components of the infrastructure.

### Container Security Fundamentals

*   **Minimal Base Images:** Use small, purpose-built base images (e.g., Alpine Linux, scratch) to reduce the attack surface by minimizing unnecessary packages and dependencies.
*   **Least Privilege:** Run containers with the minimum necessary privileges. Avoid running as `root` inside the container.
*   **Immutable Containers:** Treat containers as immutable artifacts. Any changes should trigger a new image build and deployment.
*   **Vulnerability Scanning:** Regularly scan container images for known vulnerabilities throughout the CI/CD pipeline.
*   **Runtime Protection:** Monitor and protect containers during execution from unauthorized access or malicious activity.

### Kubernetes Security Layers

Kubernetes security extends beyond individual containers to encompass the entire cluster infrastructure:

*   **API Server Security:** The brain of Kubernetes; secure access (RBAC), TLS encryption, audit logging.
*   **etcd Security:** The cluster's distributed key-value store; secure access, encryption at rest, backups.
*   **Node Security:** Secure the underlying host machines (hardening, patching, restricting access).
*   **Pod Security:** Define security contexts, resource limits, and network policies for pods.
*   **Network Security:** Control ingress and egress traffic between pods and to external services.
*   **Secrets Management:** Securely store and distribute sensitive information (passwords, API keys).
*   **Role-Based Access Control (RBAC):** Restrict who can do what within the Kubernetes cluster.
*   **Admission Controllers:** Enforce security policies before objects are persisted in the API server.

## Key Security Practices

### 1. Image Scanning in CI/CD

Integrating image scanning into your Continuous Integration/Continuous Deployment (CI/CD) pipeline is crucial to identify and mitigate vulnerabilities *before* deployment. Scanners analyze container images for known vulnerabilities (CVEs), misconfigurations, and compliance issues.

*   **When to scan:** During build (early detection), before pushing to registry, before deployment (to catch new CVEs).
*   **Popular Tools:** Trivy, Clair, Docker Scan, Anchore.

**Example: Scanning an image with Trivy**

```bash
# Scan a local Docker image
docker pull nginx:latest
trivy image nginx:latest

# Scan a remote image without pulling locally
trivy image ghcr.io/aquasecurity/trivy-demo/alpine-with-vuln:0.1.0
```

### 2. Runtime Security Policies

Runtime security focuses on detecting and preventing malicious behavior *after* containers are running. This includes monitoring process execution, file access, network activity, and system calls to ensure they conform to expected behavior.

*   **Core Concepts:**
    *   **Seccomp (Secure Computing Mode):** Linux kernel feature that allows filtering system calls a process can make. Kubernetes can apply seccomp profiles to pods.
    *   **AppArmor:** Linux security module that allows administrators to restrict program capabilities with per-program profiles.
*   **Tools:** Falco (runtime security monitoring), OPA Gatekeeper (policy enforcement, can cover runtime aspects via admission control).

### 3. Kubernetes Network Policies (e.g., Calico)

Network Policies are Kubernetes resources that define how groups of pods are allowed to communicate with each other and with external endpoints. They are implemented by the Container Network Interface (CNI) plugin (e.g., Calico, Cilium, Weave Net).

**Example: Deny all ingress traffic to a specific app, allow egress to DNS and specific CIDR**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-deny-ingress
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
    - Egress
  ingress: [] # Deny all ingress
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.0.0/24 # Allow egress to a specific internal network
    - ports:
        - port: 53 # Allow egress to DNS (port 53 UDP and TCP)
          protocol: UDP
        - port: 53
          protocol: TCP
```

### 4. Secure Secrets Management

Kubernetes `Secret` objects store sensitive data like passwords, OAuth tokens, and SSH keys. While better than plaintext in YAML, Kubernetes Secrets are base64 encoded, not encrypted by default at rest in `etcd` (though it can be configured).

*   **Best Practices:**
    *   **Enable etcd encryption-at-rest:** Configure Kubernetes to encrypt secrets stored in `etcd`.
    *   **Use external Secrets Managers:** Integrate with dedicated solutions like HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, or Google Secret Manager for stronger encryption, auditing, and rotation capabilities. Tools like External Secrets Operator can sync external secrets into Kubernetes.
    *   **Restrict access:** Use RBAC to limit who can read Secret objects.
    *   **Avoid committing secrets:** Never commit secrets to version control.

### 5. Admission Controllers

Admission Controllers are plugins that intercept requests to the Kubernetes API server *after* authentication and authorization but *before* the object is persisted in `etcd`. They can validate, mutate, or reject requests based on defined policies.

*   **Types:**
    *   **Validating Admission Controllers:** Check if a request meets certain criteria (e.g., "all images must come from a trusted registry").
    *   **Mutating Admission Controllers:** Modify requests (e.g., "automatically inject a sidecar proxy").
*   **Popular Use Cases:** Enforcing security policies (e.g., disallowing privileged containers), injecting sidecars, enforcing resource quotas.
*   **Tools:** OPA Gatekeeper (Open Policy Agent), Kyverno.

### 6. Service Mesh Security (e.g., Istio)

A service mesh (like Istio, Linkerd) provides a dedicated infrastructure layer for managing service-to-service communication. It significantly enhances security by offering:

*   **Mutual TLS (mTLS):** Automatically encrypts and authenticates all service-to-service communication within the mesh. Each service gets a strong identity.
*   **Authorization Policies:** Fine-grained access control based on service identity, source, destination, HTTP methods, etc.
*   **Traffic Encryption:** Encrypts data in transit between services.
*   **Auditing:** Provides comprehensive logs of service interactions.

## Quick Checklist/Exercises

1.  **Vulnerability Hunt:** Using Trivy, scan a Docker image like `wordpress:latest`. Identify and list 3 critical or high-severity vulnerabilities found.
2.  **Network Policy Design:** Draft a Kubernetes `NetworkPolicy` YAML that allows ingress traffic only from pods with the label `app: frontend` to pods with the label `app: backend` within the same namespace.
3.  **Admission Control Scenario:** Explain why an Admission Controller would be beneficial for enforcing a policy that prevents the deployment of any container image without a specified resource limit (CPU/Memory). Which type of Admission Controller (Validating/Mutating) would be primarily used for this?
