# Kubernetes Core Workloads Study Guide

Welcome to the Kubernetes Core Workloads study guide! This guide will walk you through the fundamental building blocks for deploying, managing, and scaling your applications within a Kubernetes cluster. Understanding these workload objects is crucial for any DevOps & Cloud Engineer.

## 1. Pods: The Smallest Deployable Units

A**Pod** is the smallest and most basic deployable unit in Kubernetes. It represents a single instance of a running process in your cluster.
*   **Encapsulation**: A Pod encapsulates one or more containers (e.g., Docker containers), along with shared storage (Volumes), network resources, and a specification for how to run the containers.
*   **Shared Context**: Containers within a Pod share the same network namespace, IP address, and port space. They can communicate with each other using `localhost`.
*   **Ephemeral**: Pods are designed to be relatively ephemeral. When a Pod dies (due to a node failure, resource exhaustion, or other issues), Kubernetes does not typically try to revive it; instead, it creates a new one. This is why Pods are often managed by higher-level controllers.

**Example: A simple Nginx Pod**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
```

## 2. ReplicaSets: Ensuring Application Availability

A**ReplicaSet** ensures that a specified number of identical Pod replicas are running at all times.
*   **Stability**: If a Pod fails, a ReplicaSet will automatically create a new one. If too many Pods are running, it will terminate extras.
*   **Scaling**: You can scale an application up or down by changing the `replicas` count in a ReplicaSet.
*   **Indirect Management**: While you can directly create ReplicaSets, they are most commonly managed by Deployments.

## 3. Deployments: Declarative Updates for Applications

**Deployments** provide declarative updates for Pods and ReplicaSets. They are the most common way to deploy stateless applications on Kubernetes.
*   **Management of ReplicaSets**: A Deployment manages ReplicaSets, which in turn manage Pods. This abstraction simplifies application lifecycle management.
*   **Rolling Updates**: Deployments enable zero-downtime rolling updates for your applications. When you update a Deployment, it gradually replaces old Pods with new ones.
*   **Rollbacks**: If an update introduces issues, Deployments allow you to easily roll back to a previous stable version.
*   **Scaling**: Just like ReplicaSets, Deployments can be scaled by modifying the `replicas` count.

**Example: A simple Nginx Deployment**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3 # Ensures 3 Nginx Pods are running
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

## 4. DaemonSets: Running on Every Node

A**DaemonSet** ensures that all (or some) nodes in a cluster run a copy of a specified Pod. As nodes are added to the cluster, new Pods are automatically added to them. As nodes are removed, those Pods are garbage collected.
*   **Node-Specific Tasks**: Ideal for deploying cluster-level applications that need to run on every node, such as:
    *   Logging agents (e.g., Fluentd, Logstash)
    *   Monitoring agents (e.g., Prometheus Node Exporter)
    *   Network plugins (e.g., Calico, Weave)

## 5. StatefulSets: Managing Stateful Applications

**StatefulSets** are workload API objects used to manage stateful applications. They provide guarantees about the ordering and uniqueness of Pods.
*   **Stable Network Identity**: Each Pod in a StatefulSet has a persistent, unique hostname and network ID.
*   **Stable Persistent Storage**: Each Pod is associated with a stable PersistentVolume, ensuring data persistence even if the Pod is rescheduled or replaced.
*   **Ordered Deployment & Scaling**: Pods are created, updated, and terminated in a specific, ordered sequence (e.g., `web-0`, `web-1`, `web-2`).
*   **Use Cases**: Databases (e.g., MySQL, PostgreSQL), message queues (e.g., Kafka, RabbitMQ), distributed key-value stores (e.g., etcd).

## 6. Jobs: Running to Completion

A**Job** creates one or more Pods and ensures that a specified number of them successfully terminate. Once the specified completions are met, the Job is considered complete.
*   **Batch Processing**: Useful for one-off tasks, batch computations, or short-lived processes that run to completion.
*   **Retries**: Jobs can be configured to retry failed Pods.

**Example: A simple Job**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-calculator
spec:
  template:
    metadata:
      name: pi-calculator
    spec:
      containers:
      - name: pi
        image: perl
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: OnFailure # Pod will be restarted on failure
```

## 7. CronJobs: Scheduled Tasks

A**CronJob** creates Jobs on a repeating schedule, similar to the `cron` utility in Unix-like systems.
*   **Scheduled Automation**: Ideal for automating recurring tasks like backups, report generation, or data synchronization.
*   **Cron Syntax**: Uses standard cron format to define the schedule (e.g., `0 0 * * *` for daily at midnight).

## 8. Resource Requests and Limits

Managing resources (CPU and Memory) is critical for cluster stability and efficient scheduling.
*   **Requests**:
    *   **CPU**: Measured in Kubernetes units (e.g., `100m` for 0.1 CPU core, `1` for 1 CPU core).
    *   **Memory**: Measured in bytes (e.g., `128Mi` for 128 mebibytes).
    *   **Purpose**: These are the guaranteed resources that Kubernetes will reserve for your container. Pods are only scheduled on nodes that can satisfy their resource requests.
*   **Limits**:
    *   **CPU**: Specifies the maximum CPU the container can use. If a container tries to use more, it will be throttled.
    *   **Memory**: Specifies the maximum memory the container can use. If a container exceeds this, it will be terminated by the kernel (Out-Of-Memory, OOMKilled).
    *   **Purpose**: Prevents a single Pod from consuming all available resources on a node, ensuring other Pods can run.

**Example: Resource Requests and Limits in a Container Spec**

```yaml
spec:
  containers:
  - name: my-app
    image: my-app:latest
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m" # 0.25 CPU core
      limits:
        memory: "128Mi"
        cpu: "500m" # 0.5 CPU core
```

---

## Quick Checklist/Exercise

1.  **Identify the right tool**: You need to deploy a logging agent that must run on every node in your Kubernetes cluster. Which core workload object would you use, and why?
2.  **Deployment updates**: You have an Nginx Deployment running `nginx:1.14.2` and want to update it to `nginx:1.16.1` with zero downtime. Describe the high-level steps Kubernetes performs during this process.
3.  **Resource management**: A Pod frequently gets `OOMKilled`. What specific resource configuration (request or limit, and for which resource type) would you adjust, and in what direction (increase/decrease), to mitigate this issue?