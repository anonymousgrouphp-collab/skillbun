# Kubernetes Architecture & Core Components Study Guide

Kubernetes, often abbreviated as K8s, is an open-source container orchestration platform designed to automate the deployment, scaling, and management of containerized applications. It abstracts away the underlying infrastructure, allowing developers to focus on applications while Kubernetes handles resource allocation, scheduling, and health monitoring.

Understanding Kubernetes begins with its architecture, which is typically split into a **Control Plane** (formerly Master Node) and **Worker Nodes**.

## I. Overall Architecture: Control Plane & Worker Nodes

1.  **Control Plane (Master Node):**
    *   The brain of the Kubernetes cluster.
    *   Manages the worker nodes and the pods running on them.
    *   Responsible for maintaining the desired state of the cluster.
    *   Components run on one or more dedicated machines for high availability.

2.  **Worker Nodes:**
    *   The workhorses of the cluster.
    *   Run the actual containerized applications (pods).
    *   Each worker node has components that allow it to communicate with the Control Plane and manage containers.

## II. Control Plane Components

The Control Plane consists of several key components that work together to manage the cluster state and operations:

### 1. Kube-API Server
*   The front-end for the Kubernetes control plane.
*   Exposes the Kubernetes API, which is used by users, external components, and other control plane components.
*   Processes REST requests, validates them, and updates the state of API objects in `etcd`.
*   Acts as the central communication hub.

### 2. etcd
*   A consistent and highly available key-value store.
*   Stores all cluster data, including cluster configuration, state, and metadata.
*   Essential for the cluster's health and operation; if `etcd` fails, Kubernetes cannot function.

### 3. Kube-Scheduler
*   Watches for newly created Pods with no assigned node.
*   Selects an optimal node for each Pod to run on, based on resource requirements, policy constraints, affinity/anti-affinity rules, and other factors.

### 4. Kube-Controller Manager
*   Runs controller processes that regulate the state of the cluster.
*   Each controller is a control loop that watches the shared state of the cluster through the API server and makes changes attempting to move the current state towards the desired state.
*   **Key Controllers:**
    *   **Node Controller:** Notices when nodes go down.
    **Replication Controller:** Maintains the correct number of Pods for every replication controller object.
    *   **Endpoints Controller:** Populates the Endpoints object (which joins Services & Pods).
    *   **Service Account & Token Controllers:** Create default accounts and API access tokens for new namespaces.

### 5. Cloud Controller Manager (Optional)
*   Integrates Kubernetes with underlying cloud provider APIs (e.g., AWS, GCP, Azure).
*   Runs controllers specific to the cloud provider, such as:
    *   **Node Controller:** Checks cloud provider to see if a node has been deleted.
    *   **Route Controller:** Sets up network routes for containers.
    *   **Service Controller:** Creates, updates, and deletes cloud provider load balancers.

## III. Worker Node Components

Each Worker Node runs the following components:

### 1. Kubelet
*   An agent that runs on each node in the cluster.
*   Ensures that containers are running in a Pod.
*   Receives Pod specifications from the API Server and ensures the containers described in those Pods are running and healthy.
*   Reports the status of the node and its Pods to the Control Plane.

### 2. Kube-Proxy
*   A network proxy that runs on each node.
*   Maintains network rules on nodes, allowing network communication to your Pods from inside or outside the cluster.
*   Handles service discovery and load balancing for Pods.
*   Can operate in `iptables`, `ipvs`, or `userspace` proxy modes.

### 3. Container Runtime
*   The software that is responsible for running containers.
*   Kubernetes supports several container runtimes, such as Docker, containerd, and CRI-O, through the Container Runtime Interface (CRI).

## IV. How Components Interact (Simplified Flow)

When you deploy an application using `kubectl apply -f my-app.yaml`:

1.  The `kubectl` command sends the `my-app.yaml` manifest to the **Kube-API Server**.
2.  The **Kube-API Server** validates the request and stores the desired state (e.g., a new Pod) in **etcd**.
3.  The **Kube-Scheduler** notices the new Pod (which has no node assigned) by watching the API Server. It selects a suitable Worker Node based on various factors.
4.  The **Kube-API Server** updates **etcd** with the Pod's assigned node.
5.  The **Kubelet** on the selected Worker Node watches the API Server for Pods assigned to it. It detects the new Pod.
6.  The **Kubelet** instructs the **Container Runtime** (e.g., containerd) to pull the necessary container image and run the containers specified in the Pod.
7.  The **Kube-proxy** on the Worker Node ensures network rules are in place so the Pod can communicate.
8.  The **Kubelet** continuously reports the Pod's status back to the **Kube-API Server**, which updates **etcd**.
9.  **Kube-Controller Manager** ensures the desired state (e.g., number of replicas) is maintained.

## V. Simple Pod Configuration Example

This YAML defines a basic NGINX Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80
```

When you apply this (`kubectl apply -f nginx-pod.yaml`), the interaction described above occurs to deploy this NGINX container onto a Worker Node.

## VI. Quick Check / Exercises

1.  **Identify the Brain:** Which Kubernetes Control Plane component is responsible for storing all cluster data and state?
2.  **Worker Node Agent:** What is the name of the agent that runs on each Worker Node and ensures containers are running in Pods?
3.  **Deployment Flow:** Describe the role of the Kube-API Server and Kube-Scheduler when a new Pod is created.
