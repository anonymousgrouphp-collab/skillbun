## Kubernetes Services, Ingress & Networking

Welcome to the crucial topic of Kubernetes networking! Understanding how applications communicate within and outside your cluster is fundamental to deploying and managing robust, scalable services. This guide will cover Kubernetes Services, Ingress, fundamental CNI concepts, and Network Policies.

### 1. Kubernetes Services: Connecting Applications

Kubernetes Services are an abstract way to expose an application running on a set of Pods as a network service. Services enable communication between different parts of your application (e.g., frontend to backend) and provide a stable IP address and DNS name for Pods, even if the underlying Pods crash or are rescheduled.

#### Core Concepts:

*   **Selectors**: Services use label selectors to find the Pods they target. Any Pods with matching labels will be part of the Service's endpoint list.
*   **Endpoints**: The actual list of Pod IP addresses and ports that a Service routes traffic to.

#### Service Types:

1.  **ClusterIP**: The default Service type. It exposes the Service on an internal IP address within the cluster. This Service is only reachable from within the cluster. Ideal for internal-only services (e.g., database, backend APIs).

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: my-backend-service
    spec:
      selector:
        app: my-backend
      ports:
        - protocol: TCP
          port: 80
          targetPort: 8080
      type: ClusterIP
    ```

2.  **NodePort**: Exposes the Service on each Node's IP at a static port (the `NodePort`). Kubernetes will allocate a port from a configurable range (default: 30000-32767). This makes the Service accessible from outside the cluster using `<NodeIP>:<NodePort>`. Useful for development or when an external load balancer isn't available.

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: my-frontend-service
    spec:
      selector:
        app: my-frontend
      ports:
        - protocol: TCP
          port: 80
          targetPort: 80
          nodePort: 30080 # Optional, K8s will assign if omitted
      type: NodePort
    ```

3.  **LoadBalancer**: Exposes the Service externally using a cloud provider's load balancer. This type provisions an external IP address that acts as the entry point to your Service. It builds on NodePort; the cloud load balancer routes external traffic to the NodePorts. This is the standard way to expose public-facing applications in a cloud environment.

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: my-public-app
    spec:
      selector:
        app: my-web-app
      ports:
        - protocol: TCP
          port: 80
          targetPort: 80
      type: LoadBalancer
    ```

4.  **ExternalName**: Maps a Service to an arbitrary DNS name (e.g., `api.external-service.com`), rather than to a set of Pods. It does not use a proxy. Useful for connecting to external services outside your cluster without changing your application code.

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: my-db-external
    spec:
      type: ExternalName
      externalName: my-external-database.example.com
    ```

### 2. Ingress: HTTP/HTTPS Routing for External Access

While LoadBalancer Services provide a basic entry point, `Ingress` offers more sophisticated HTTP/HTTPS routing. Ingress manages external access to the services in a cluster, typically HTTP. It can provide load balancing, SSL termination, and name-based virtual hosting.

#### Core Concepts:

*   **Ingress Resource**: A Kubernetes object that defines rules for routing external HTTP/HTTPS traffic to Services.
*   **Ingress Controller**: A component that runs in the cluster and implements the Ingress rules. It's often a specialized load balancer like NGINX, HAProxy, or Traefik.

#### Why use Ingress?

*   **Single Entry Point**: Allows multiple services to be exposed through a single external IP address, saving costs compared to multiple `LoadBalancer` Services.
*   **Path-Based Routing**: Route requests to different services based on URL paths (e.g., `/api` to backend, `/` to frontend).
*   **Host-Based Routing**: Route requests to different services based on hostnames (e.g., `app.example.com` to one service, `admin.example.com` to another).
*   **SSL/TLS Termination**: Handle HTTPS traffic and offload encryption/decryption from your application pods.

#### Ingress Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 3. Container Network Interface (CNI): Pod Networking Foundations

CNI is a Cloud Native Computing Foundation (CNCF) project that consists of a specification and libraries for writing plugins to configure network interfaces in Linux containers. In Kubernetes, the CNI plugin is responsible for:

*   **Assigning IP addresses** to Pods.
*   **Connecting Pods** to the cluster network, enabling Pod-to-Pod communication across different nodes.
*   **Implementing network policies** (if the CNI plugin supports it).

Popular CNI plugins include **Calico**, **Flannel**, **Cilium**, and **Weave Net**. Each has different features, performance characteristics, and network policy capabilities.

### 4. Network Policies: Securing Pod Communications

Kubernetes Network Policies are a security feature that allows you to define how groups of Pods are allowed to communicate with each other and with external network endpoints. They act as a firewall at the Pod level, enhancing the security posture of your applications.

#### Core Concepts:

*   **Pod Selector**: Defines the group of Pods that the policy applies to.
*   **Ingress Rules**: Define allowed incoming connections to the selected Pods.
*   **Egress Rules**: Define allowed outgoing connections from the selected Pods.
*   **Policy Types**: Specify whether the policy applies to `Ingress`, `Egress`, or both.

#### Why use Network Policies?

*   **Isolation**: Isolate sensitive applications or namespaces from others.
*   **Security**: Restrict traffic to only necessary connections, reducing the attack surface.
*   **Compliance**: Meet regulatory requirements by enforcing strict network segmentation.

#### Network Policy Example Concept:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all-ingress
  namespace: my-app-namespace
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```
(This policy would deny all ingress traffic to all pods in `my-app-namespace` by default. You would then add specific `allow` policies.)

### Quick Checklist / Exercise:

1.  **Identify Use Cases**: When would you choose a `NodePort` Service over a `ClusterIP` Service, and when would an `Ingress` be more suitable than a `LoadBalancer` Service?
2.  **CNI's Role**: Explain in your own words how a CNI plugin facilitates communication between two Pods residing on different Kubernetes Nodes.
3.  **Network Policy Scenario**: You have a `frontend` deployment and a `backend` deployment in the same namespace. Design a conceptual Network Policy that only allows traffic from `frontend` Pods to `backend` Pods on port 8080, denying all other ingress traffic to the `backend`.
