# GitOps and Declarative Deployments Study Guide

## Introduction to GitOps

GitOps is an operational framework that takes DevOps best practices used for application development, like version control, collaboration, compliance, and CI/CD, and applies them to infrastructure automation. It uses Git as the single source of truth for defining the desired state of infrastructure and applications.

## Core Principles of GitOps

GitOps operates on four fundamental principles:

1.  **Declarative:** The desired state of the system (infrastructure and applications) is expressed declaratively, typically using YAML manifest files, which are stored in Git.
2.  **Versioned and Immutable:** The desired state is stored in Git, meaning every change is versioned, auditable, and immutable. You can easily roll back to previous states.
3.  **Pulled Automatically:** Instead of a CI pipeline "pushing" changes to the cluster, an agent (GitOps operator) running inside the cluster "pulls" the desired state from Git and applies it. This enhances security as the cluster does not require external inbound access.
4.  **Continuously Reconciled:** The GitOps operator continuously monitors the cluster's actual state and compares it with the desired state in Git. If any deviation is detected, the operator automatically synchronizes the cluster to match the Git repository's definition.

## Declarative vs. Imperative Deployments

Understanding the difference is crucial:

*   **Imperative Deployments:** You tell the system *how* to achieve a state, step-by-step. For example, `kubectl create deployment my-app --image=my-image:v1`, then `kubectl scale deployment my-app --replicas=3`. Each command is an instruction.
*   **Declarative Deployments:** You tell the system *what* the desired end state should be, and the system figures out *how* to get there. For example, a YAML file defines a deployment with 3 replicas and image `my-image:v1`. The GitOps operator then ensures this state is maintained.

Declarative approaches are inherently more robust and easier to manage at scale, especially in dynamic environments like Kubernetes.

## How GitOps Works with Kubernetes

In a Kubernetes-centric GitOps workflow:

1.  **Git Repository (Source of Truth):** All Kubernetes manifests (Deployments, Services, Ingresses, etc.) and application configurations are stored in one or more Git repositories.
2.  **Developer Pushes Changes:** Developers commit and push changes to these Git repos.
3.  **CI Pipeline (Optional but Recommended):** A CI pipeline might run tests, build container images, and update image tags in the Git manifests.
4.  **GitOps Operator:** An agent (e.g., Argo CD or Flux) continuously monitors the Git repository for changes.
5.  **Reconciliation:** When a change is detected, the operator pulls the new desired state and applies it to the Kubernetes cluster, reconciling any differences between the cluster's current state and the Git repo's desired state.

## Key GitOps Tools for Kubernetes

### Argo CD

Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes. It is implemented as a Kubernetes controller that continuously monitors running applications and compares the live state with the desired state specified in a Git repository. It provides a rich UI for visualizing synchronization status, health, and logs.

### Flux

Flux is a set of tools for keeping Kubernetes clusters in sync with sources of configuration (like Git repositories) and automating updates to configuration when there is new code to deploy. It pioneered many GitOps concepts and is also a Kubernetes controller that enables declarative cluster management.

## Simple Kubernetes Manifest Example

This YAML snippet demonstrates a declarative definition for a simple Nginx deployment in Kubernetes. In a GitOps flow, this file would live in your Git repository.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

If you modify `replicas: 3` to `replicas: 5` in Git and commit, the GitOps operator will detect this change and automatically scale your Nginx deployment in the Kubernetes cluster to 5 replicas.

## Quick Understanding Checklist/Exercise

1.  **Differentiate:** Briefly explain the core difference between imperative and declarative deployments in your own words.
2.  **Identify Principles:** Name at least two core principles of GitOps and provide a one-sentence explanation for each.
3.  **Tool Choice:** If you needed to implement GitOps for a Kubernetes cluster, which tool would you consider first (Argo CD or Flux) and why? (There's no single right answer, focus on your reasoning).