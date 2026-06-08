# Container Orchestration with Kubernetes (Basics)

Welcome to the foundational module on Kubernetes, the leading open-source system for automating deployment, scaling, and management of containerized applications. Kubernetes (often abbreviated as K8s) streamlines the operational complexity of managing microservices in a containerized environment, ensuring high availability, scalability, and efficient resource utilization.

## What is Kubernetes?

Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services, which facilitates both declarative configuration and automation. It allows you to run containerized applications across a cluster of machines, scaling them up or down based on demand, and ensuring they are always available. Think of it as an operating system for your cluster, abstracting away the underlying infrastructure.

## Core Kubernetes Concepts

Understanding these fundamental building blocks is crucial for grasping how Kubernetes operates:

### 1. Pods

A Pod is the smallest deployable unit in Kubernetes.
*   **Encapsulation**: A Pod encapsulates one or more application containers (e.g., Docker containers), storage resources, a unique network IP, and options that govern how the containers run.
*   **Shared Context**: Containers within a Pod share the same network namespace, IP address, and storage volumes, allowing them to communicate with each other easily via `localhost`.
*   **Ephemeral**: Pods are designed to be ephemeral. If a Pod fails or is terminated, Kubernetes automatically creates a new one to replace it.

### 2. Deployments

A Deployment is a higher-level abstraction that manages the deployment and scaling of a set of Pods.
*   **Declarative Updates**: Deployments allow you to describe the desired state of your application (e.g., "I want 3 replicas of this Nginx application running").
*   **Automated Management**: They ensure that the specified number of Pod replicas are running at all times. If a Pod dies, the Deployment controller automatically replaces it.
*   **Rollouts and Rollbacks**: Deployments handle updating applications (rolling out new versions) and rolling back to previous versions if issues arise, all with zero downtime.

### 3. Services

A Service is an abstract way to expose an application running on a set of Pods as a network service.
*   **Stable Network Endpoint**: Pods are ephemeral and can have different IPs when they restart. A Service provides a stable IP address and DNS name, allowing other applications to consistently find and communicate with your Pods.
*   **Load Balancing**: Services can automatically load-balance network traffic across all the Pods that match its selector.
*   **Service Types**: Common types include:
    *   `ClusterIP`: Exposes the Service on an internal IP in the cluster. Only reachable from within the cluster.
    *   `NodePort`: Exposes the Service on each Node's IP at a static port (the `NodePort`). Makes the service accessible from outside the cluster.
    *   `LoadBalancer`: Exposes the Service externally using a cloud provider's load balancer.

### 4. Namespaces

Namespaces are used to divide cluster resources among multiple users or teams.
*   **Resource Isolation**: They provide a mechanism to logically partition a single Kubernetes cluster into multiple virtual clusters.
*   **Resource Scoping**: Namespaces are useful for scoping resources. For example, resource names must be unique within a namespace but not across namespaces.
*   **Default Namespaces**: Every Kubernetes cluster starts with three initial namespaces: `default`, `kube-system`, and `kube-public`.

## Example: Deploying an Nginx Application

Let's create a simple Deployment and Service for an Nginx web server.

### 1. `nginx-deployment.yaml`

This manifest defines a Deployment named `nginx-deployment` that ensures 3 replicas of an Nginx Pod are running.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
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
        image: nginx:latest
        ports:
        - containerPort: 80
```

To apply this, you would use: `kubectl apply -f nginx-deployment.yaml`

### 2. `nginx-service.yaml`

This manifest defines a Service that exposes the `nginx-deployment` Pods within the cluster (ClusterIP) and also externally via a NodePort.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080 # Optional: Specify a NodePort between 30000-32767
  type: NodePort # This exposes the service on each node's IP at the NodePort
```

To apply this, you would use: `kubectl apply -f nginx-service.yaml`

After applying these, you could access your Nginx application via any node's IP address on port `30080`.

## Quick Understanding Checklist/Exercise

1.  What is the primary difference between a Kubernetes Pod and a container (e.g., Docker container)?
2.  Imagine you have an application with 5 replicas managed by a Deployment. If two of these replicas crash, what action does the Deployment take, and why?
3.  Explain how a Kubernetes Service provides a stable network endpoint for ephemeral Pods, and name two common `ServiceType` options.