# Azure Kubernetes Service (AKS) Fundamentals

## Introduction to Azure Kubernetes Service (AKS)

Azure Kubernetes Service (AKS) is a managed container orchestration service that simplifies the deployment, management, and scaling of containerized applications using Kubernetes in Azure. Kubernetes, an open-source system, automates the processes of deploying, scaling, and managing containerized workloads and services. With AKS, Azure takes responsibility for the complex operational overhead of managing the Kubernetes control plane, including patching, upgrades, and health monitoring, allowing you to focus on developing and deploying your applications.

**Key Benefits of AKS:**
*   **Managed Control Plane:** Azure handles the Kubernetes master nodes, ensuring high availability and removing the burden of maintenance.
*   **Scalability:** Effortlessly scale your applications and the underlying cluster infrastructure to meet demand.
*   **Integration with Azure Services:** Seamlessly integrates with other Azure services such as Azure Active Directory, Azure Monitor, Azure Networking, and Azure Storage.
*   **Cost-Efficiency:** You only pay for the virtual machines (worker nodes) that run your applications, not for the managed control plane.

## Core Kubernetes Concepts

Understanding these foundational Kubernetes concepts is crucial for working with AKS:

*   **Cluster:** A collection of worker machines, called nodes, that run containerized applications. Each cluster has at least one worker node.
*   **Node:** A worker machine in Kubernetes, which can be a virtual or physical machine, where pods are launched. AKS nodes are Azure Virtual Machines.
*   **Pod:** The smallest and most basic deployable unit in Kubernetes. A Pod encapsulates one or more containers (e.g., Docker containers), storage resources, a unique network IP, and options that govern how the containers run.
*   **Deployment:** A Kubernetes object that manages a set of identical pods. It describes the desired state for your application, ensuring that a specified number of replicas of a pod are running at any given time and handles updates.
*   **Service:** An abstract way to expose an application running on a set of Pods as a network service. Services enable communication between different components within your application and can expose your application to the outside world.
    *   **ClusterIP:** Exposes the Service on an internal IP within the cluster. Only reachable from within the cluster.
    *   **NodePort:** Exposes the Service on each Node's IP at a static port. Avoid in production for external access.
    *   **LoadBalancer:** Exposes the Service externally using a cloud provider's load balancer. In AKS, this creates an Azure Load Balancer.
*   **Namespace:** Provides a mechanism for isolating groups of resources within a single cluster. Useful for organizing resources for different teams or projects.

## Deploying an AKS Cluster

You can deploy an AKS cluster using the Azure Portal, Azure CLI, or infrastructure-as-code tools like ARM templates or Terraform.

**Example using Azure CLI:**

1.  **Create an Azure Resource Group:**
    ```bash
    az group create --name myAksRg --location eastus
    ```
2.  **Create an AKS Cluster:**
    ```bash
    az aks create \
        --resource-group myAksRg \
        --name myAksCluster \
        --node-count 1 \
        --enable-addons monitoring \
        --generate-ssh-keys
    ```
    *   `--node-count 1`: Specifies the initial number of worker nodes.
    *   `--enable-addons monitoring`: Enables Azure Monitor for containers.
    *   `--generate-ssh-keys`: Generates SSH keys for secure node access.
3.  **Configure `kubectl` to connect to your cluster:**
    ```bash
    az aks get-credentials --resource-group myAksRg --name myAksCluster
    ```
    This command downloads the cluster credentials and merges them into your `kubectl` configuration file.

## Deploying Applications to AKS

After your cluster is provisioned and `kubectl` is configured, you can deploy applications using Kubernetes manifest files (YAML).

**Example: Deploying a simple NGINX web server**

Create a file named `nginx-app.yaml`:

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
---
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
  type: LoadBalancer # Exposes the service using an Azure Load Balancer
```

Apply the manifest to your cluster:
```bash
kubectl apply -f nginx-app.yaml
```

Verify the deployment and service:
```bash
kubectl get deployments
kubectl get pods
kubectl get services
```
After a few moments, `kubectl get services` will display an external IP address for `nginx-service`. You can then access your NGINX application via this IP address in a web browser.

## Networking Basics

AKS provides robust networking capabilities, integrating with Azure's virtual network infrastructure. Two primary networking models exist:

*   **Kubenet (Basic):** Pods receive an IP address from a logically different address space than the Azure Virtual Network subnet. Kubernetes handles Network Address Translation (NAT) to allow pods to reach resources in the Azure VNet.
*   **Azure CNI (Advanced):** Each pod receives its own IP address directly from the subnet in the Azure VNet. This enables direct communication between pods and other VNet resources, and supports advanced network policies.

The `Service` resource is fundamental for exposing your applications:
*   `ClusterIP`: For internal cluster communication.
*   `NodePort`: Exposes a service on a static port of each node, typically for testing or custom load balancing.
*   `LoadBalancer`: Creates an Azure Load Balancer to provide external access to your application.
*   **Ingress:** Manages external access to services in a cluster, typically HTTP/S. Ingress can provide load balancing, SSL termination, and name-based virtual hosting. Often implemented using NGINX Ingress Controller or Azure Application Gateway Ingress Controller (AGIC).

## Storage Integration

AKS seamlessly integrates with Azure storage services to provide persistent storage for stateful applications.

*   **PersistentVolume (PV):** A piece of storage in the cluster that has been provisioned by an administrator or dynamically provisioned.
*   **PersistentVolumeClaim (PVC):** A request for storage by a user (a pod).
*   **StorageClass:** Defines different classes of storage (e.g., standard SSD, premium SSD) and how they are provisioned.

Common storage options in AKS:
*   **Azure Disk:** Used for single-node access (ReadWriteOnce). Ideal for databases or other stateful applications where a single pod requires dedicated block storage.
*   **Azure Files:** Provides shared file storage (ReadWriteMany) that can be accessed by multiple pods simultaneously. Suitable for content management systems or shared configurations.

## Scaling

AKS offers powerful scaling features to ensure your applications can handle varying loads:

*   **Horizontal Pod Autoscaler (HPA):** Automatically scales the number of pod replicas in a Deployment or ReplicaSet based on observed CPU utilization or other custom metrics.
*   **Cluster Autoscaler:** Automatically scales the number of nodes in your AKS cluster. If pods are pending due to insufficient resources, it adds more nodes. If nodes are underutilized, it removes them.

## Monitoring

AKS integrates with Azure Monitor for Containers, which provides comprehensive performance visibility. It collects memory and processor metrics from controllers, nodes, and containers running on your AKS clusters, helping you identify performance bottlenecks and optimize resource usage.

---

## Quick Understanding Checklist/Exercise

1.  **Scenario:** You have a critical microservice deployed in AKS, and you want to ensure it has dedicated and highly available storage that can be dynamically expanded. Which Azure storage option and Kubernetes storage concept (PV, PVC, StorageClass) would you leverage?
2.  **Task:** Modify the `nginx-app.yaml` deployment to scale the NGINX application to 5 replicas instead of 3. How would you apply this change to your running cluster?
3.  **Concept:** Explain the primary difference between a Kubernetes `Deployment` and a Kubernetes `Service` in the context of application management and exposure within AKS. Which one handles ensuring the desired number of running application instances, and which one handles network access to those instances?