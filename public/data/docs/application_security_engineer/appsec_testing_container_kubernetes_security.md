# Container & Kubernetes Application Security Study Guide

This guide explores the critical aspects of securing containerized applications (Docker, OCI) and their orchestration within Kubernetes environments. We'll focus on an application-centric security perspective, covering key areas from image integrity to runtime protection and network isolation.

## 1. Image Scanning and Supply Chain Security

Container images are the building blocks of modern applications. Securing them is the first step in protecting your application. Image scanning involves analyzing container images for known vulnerabilities, misconfigurations, sensitive information, and compliance issues *before* deployment.

**Core Concepts:**
*   **Vulnerability Scanning:** Identifying CVEs (Common Vulnerabilities and Exposures) within the operating system packages and application dependencies. Tools like Trivy, Clair, and Anchore integrate into CI/CD pipelines.
*   **Malware Detection:** Scanning for malicious code or backdoors injected into images.
*   **License Compliance:** Ensuring all included software components adhere to required licensing terms.
*   **Software Bill of Materials (SBOM):** Generating a comprehensive list of all components (libraries, packages, files) within an image, crucial for understanding its attack surface.

**Why it Matters:** Prevents known vulnerabilities from reaching production, enforces security best practices from the start, and helps maintain compliance.

## 2. Runtime Protection

Even with secure images, vulnerabilities can emerge, or malicious actors might exploit misconfigurations. Runtime protection focuses on safeguarding containers and pods while they are actively running.

**Core Concepts:**
*   **Behavioral Monitoring:** Observing container behavior (file access, process execution, network connections) to detect anomalies that might indicate a breach or attack.
*   **System Call Filtering (seccomp):** Limiting the system calls a container can make to the kernel, reducing its attack surface. Kubernetes allows applying seccomp profiles to pods.
*   **File Integrity Monitoring:** Detecting unauthorized changes to critical files within a running container.
*   **Process Whitelisting/Blacklisting:** Defining which processes are allowed or forbidden to run within a container.

**Why it Matters:** Provides an essential layer of defense by detecting and responding to threats that bypass static analysis or arise during execution.

## 3. Kubernetes Network Policies

Kubernetes Network Policies are specifications that define how groups of pods are allowed to communicate with each other and with other network endpoints. They are crucial for implementing the Principle of Least Privilege in your cluster's network.

**Core Concepts:**
*   **Ingress Rules:** Define which incoming connections are allowed to a pod.
*   **Egress Rules:** Define which outgoing connections a pod is allowed to make.
*   **Pod Selectors:** Network Policies use label selectors to target specific pods.
*   **Namespace Selectors:** Policies can also target pods across different namespaces.

**Example: Limiting Ingress to a Backend Service**
This policy ensures that only pods labeled `app: frontend` can communicate with pods labeled `app: backend` on port `8080` within the `default` namespace.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

**Why it Matters:** Prevents unauthorized lateral movement within the cluster, isolates services, and minimizes the impact of a compromised pod.

## 4. Secrets Management

Applications often require sensitive information like API keys, database credentials, and certificates. Securely managing and injecting these 