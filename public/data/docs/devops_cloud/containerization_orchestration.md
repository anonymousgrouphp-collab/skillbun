# Containerization and Orchestration: Study Guide

This guide will walk you through the essential concepts of containerization with Docker and container orchestration with Kubernetes, crucial technologies for modern DevOps and Cloud Engineering.

## 1. Introduction to Containerization

Containerization is a lightweight, portable, and efficient method of packaging applications and their dependencies into isolated units called containers. Unlike virtual machines (VMs), containers share the host OS kernel, making them significantly more lightweight and faster to start.

### Key Benefits:
- **Isolation:** Applications and their dependencies are isolated from each other and the host system, preventing conflicts.
- **Portability:** A containerized application can run consistently across any environment (development, staging, production) that has a container runtime.
- **Efficiency:** Containers are lightweight, consume fewer resources than VMs, and allow for higher density on a single host.
- **Reproducibility:** Ensures that the application behaves the same way regardless of where it's deployed.

## 2. Docker Fundamentals

Docker is the most popular platform for building, shipping, and running containerized applications.

### 2.1 Docker Images
A Docker image is a read-only template that contains an application, along with its dependencies, libraries, and configuration. Images are built from a `Dockerfile`.

**Dockerfile Example (Node.js Application):**
This `Dockerfile` builds an image for a simple Node.js application.

```dockerfile
# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "server.js" ]
```

### 2.2 Docker Containers
A Docker container is a runnable instance of a Docker image. You can start, stop, move, or delete a container.

**Basic Docker Commands:**
- `docker build -t my-node-app .`: Builds an image from a `Dockerfile` in the current directory, tagging it `my-node-app`.
- `docker run -p 80:3000 my-node-app`: Runs a container from `my-node-app` image, mapping host port 80 to container port 3000.
- `docker ps`: Lists all running containers.
- `docker stop [container_id]`: Stops a running container.
- `docker rm [container_id]`: Removes a stopped container.
- `docker exec -it [container_id] /bin/bash`: Executes a command inside a running container.

### 2.3 Docker Compose
Docker Compose is a tool for defining and running multi-container Docker applications. It uses a YAML file (`docker-compose.yml`) to configure the application's services, networks, and volumes.

**Docker Compose Example (Simple Web App with Redis):**
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:3000"
    depends_on:
      - redis
  redis:
    image: "redis:alpine"
    ports:
      - "6379:6379"
```
To run this: `docker-compose up -d` (builds images, creates networks, starts containers in detached mode).

## 3. Introduction to Container Orchestration

While Docker is excellent for managing individual containers, real-world applications often consist of many containers, potentially across multiple hosts. Container orchestration systems automate the deployment, scaling, management, networking, and availability of containerized applications.

### Why Orchestration?
- **Scaling:** Easily scale applications up or down based on demand.
- **High Availability:** Automatically restart failed containers or shift workloads to healthy nodes.
- **Load Balancing:** Distribute incoming traffic across multiple instances of an application.
- **Service Discovery:** Containers can find and communicate with each other automatically.
- **Automated Rollouts & Rollbacks:** Deploy new versions with minimal downtime and easily revert if issues arise.

## 4. Kubernetes Fundamentals

Kubernetes (K8s) is an open-source system for automating deployment, scaling, and management of containerized applications. It groups containers that make up an application into logical units for easy management and discovery.

### 4.1 Core Kubernetes Concepts

- **Pod:** The smallest deployable unit in Kubernetes. A Pod typically encapsulates one or more containers (e.g., an application container and a helper container), storage resources, and a unique network IP.
- **Deployment:** An object that manages a set of identical Pods. It ensures that a specified number of Pod replicas are running and handles rolling updates and rollbacks.
- **ReplicaSet:** A controller that maintains a stable set of replica Pods running at any given time. Deployments use ReplicaSets behind the scenes.
- **Service:** An abstract way to expose an application running on a set of Pods as a network service. Services provide stable IP addresses and load balancing for your applications.
    - **ClusterIP:** Internal-only service.
    - **NodePort:** Exposes a service on a static port on each Node's IP.
    - **LoadBalancer:** Exposes the service externally using a cloud provider's load balancer.
- **Namespace:** Provides a mechanism for isolating groups of resources within a single Kubernetes cluster.
- **kubectl:** The command-line tool for running commands against Kubernetes clusters.

### 4.2 Kubernetes Deployment Example
This YAML defines a Deployment and a Service to expose a simple Nginx web server.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3 # Ensure 3 Pods are running
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
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx # Selects Pods with label app: nginx
  ports:
    - protocol: TCP
      port: 80 # Service port
      targetPort: 80 # Container port
  type: LoadBalancer # Expose externally via a load balancer
```

**Basic `kubectl` Commands:**
- `kubectl apply -f [filename.yaml]`: Creates or updates resources defined in the YAML file.
- `kubectl get pods`: Lists all Pods.
- `kubectl get deployments`: Lists all Deployments.
- `kubectl get services`: Lists all Services.
- `kubectl logs [pod_name]`: View logs for a Pod.
- `kubectl describe pod [pod_name]`: Get detailed information about a Pod.

## 5. Quick Checklist/Exercises

1.  **Dockerize an Application:** Create a `Dockerfile` for a simple Python Flask application that says "Hello, World!" and build its Docker image. Run the container and access it via your browser.
2.  **Multi-Service with Docker Compose:** Extend the previous exercise by adding a Redis container and modify your Flask app to increment a counter stored in Redis on each visit. Use `docker-compose.yml` to define and run both services.
3.  **Deploy to Kubernetes (MiniKube/kind):** Take your Dockerized Flask application (without Redis for simplicity, or with if you're adventurous) and create Kubernetes `Deployment` and `Service` YAML files for it. Deploy it to a local Kubernetes cluster (like MiniKube or kind) and verify its accessibility.