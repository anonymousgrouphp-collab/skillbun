# Load Balancing & Traffic Management in Azure

In the dynamic world of cloud computing, ensuring that your applications are highly available, performant, and resilient is paramount. Azure offers a comprehensive suite of load balancing and traffic management services designed to intelligently distribute network traffic across your resources. This study guide will delve into Azure Load Balancer (LB), Application Gateway (AGW), Azure Front Door (AFD), and Azure Traffic Manager (TM), explaining their core functionalities and ideal use cases.

## 1. Azure Load Balancer (LB)

Azure Load Balancer is a **Layer 4 (TCP/UDP)** network load balancer that distributes incoming traffic among healthy instances of services in a backend pool. It provides high availability and network performance for your applications.

### Key Concepts:

*   **Frontend IP Configuration:** The public or private IP address where the load balancer receives incoming traffic.
*   **Backend Pools:** A collection of virtual machines or virtual machine scale set instances that will receive the traffic.
*   **Health Probes:** Used to monitor the health of the backend instances. If an instance fails the probe, it's taken out of the backend pool until it recovers.
*   **Load Balancing Rules:** Define how incoming traffic on a specific frontend IP and port is distributed to a backend pool.
*   **High Availability Ports:** A specific type of rule for internal load balancers that allows balancing all TCP and UDP flows on all ports simultaneously.

### Use Cases:

*   Distributing traffic to internal LOB applications.
*   Ensuring high availability for VMs in a Virtual Machine Scale Set.
*   Port forwarding for specific services.

### Example (Conceptual Azure CLI):

To create a basic external load balancer rule for HTTP traffic:

```bash
az network lb rule create \
    --resource-group "myResourceGroup" \
    --lb-name "myLoadBalancer" \
    --name "myHTTPRule" \
    --protocol "Tcp" \
    --frontend-port 80 \
    --backend-port 80 \
    --frontend-ip-name "myFrontendIp" \
    --backend-pool-name "myBackendPool" \
    --probe-name "myHttpProbe" \
    --load-distribution "Default"
```

## 2. Azure Application Gateway (AGW)

Azure Application Gateway is a **Layer 7 (HTTP/HTTPS)** load balancer that provides application delivery services. It enables you to manage traffic to your web applications based on attributes like URL path, host headers, or other HTTP request properties.

### Key Concepts:

*   **Listeners:** Check for incoming requests on specified ports, protocols (HTTP/HTTPS), and host headers.
*   **Routing Rules:** Map a listener to a backend pool. They define how traffic is routed based on URL path or other properties.
*   **Backend Pools:** Similar to LB, but typically contains web servers, VMs, or Azure App Services.
*   **HTTP Settings:** Defines properties like port, protocol, cookie-based session affinity, and request timeout for communication with backend servers.
*   **Web Application Firewall (WAF):** Provides centralized protection of your web applications from common exploits and vulnerabilities.
*   **SSL Termination:** Offloads the CPU-intensive SSL decryption from your backend servers.
*   **URL-based Routing:** Routes requests to different backend pools based on the URL path in the request.

### Use Cases:

*   SSL/TLS termination for web applications.
*   Protecting web applications with WAF.
*   Routing traffic to different backend services based on URL paths or hostnames.
*   Cookie-based session affinity.

## 3. Azure Front Door (AFD)

Azure Front Door is a scalable, global, and instant point of presence (POP) network that provides fast, secure, and widely scalable web application delivery with **Layer 7 (HTTP/HTTPS)** capabilities. It combines capabilities of a CDN, WAF, and global load balancer.

### Key Concepts:

*   **Frontend Hosts (Domains):** The entry points for client traffic, typically custom domains.
*   **Backend Pools (Origin Groups):** A group of application backends that Front Door will route traffic to. Can span across regions and even outside Azure.
*   **Routing Rules:** Define how requests from frontend hosts are mapped to backend pools. Includes URL-based routing, caching, and WAF policies.
*   **Web Application Firewall (WAF):** Global protection at the edge.
*   **Global Load Balancing:** Routes traffic to the fastest available backend based on latency.
*   **SSL Offloading:** Similar to AGW, handles SSL termination at the edge.
*   **Caching:** Improves performance by serving content directly from edge locations.

### Use Cases:

*   Building highly available and scalable global web applications.
*   Accelerating content delivery for global users.
*   Global WAF protection.
*   Multi-region disaster recovery for HTTP/HTTPS applications.

### Differentiation from Application Gateway:

*   **Scope:** Front Door is global, AGW is regional.
*   **Optimization:** Front Door optimizes for global user traffic (Anycast, edge caching), AGW optimizes for regional application delivery.
*   **WAF:** Front Door WAF is at the edge, AGW WAF is regional.

## 4. Azure Traffic Manager (TM)

Azure Traffic Manager is a **DNS-based** traffic load balancer. It allows you to distribute traffic to your public-facing applications across global Azure regions or even external endpoints. It uses DNS responses to direct client requests to the most appropriate service endpoint.

### Key Concepts:

*   **Endpoints:** The public-facing IP addresses or DNS names of your application instances (can be Azure services or external).
*   **Routing Methods:** Define how Traffic Manager determines which endpoint to return in a DNS response.
    *   **Priority:** Primary/failover.
    *   **Weighted:** Distributes traffic based on assigned weights.
    *   **Performance:** Routes to the "closest" endpoint (lowest latency).
    *   **Geographic:** Routes based on the geographic location of the DNS query.
    *   **Multivalue:** Returns multiple healthy endpoints in a single DNS response.
    *   **Subnet:** Routes based on the client's IP address subnet.
*   **Endpoint Monitoring:** Monitors the health of your endpoints and takes unhealthy ones out of rotation.

### Use Cases:

*   Distributing traffic across applications in different regions for global availability.
*   Implementing failover strategies for disaster recovery.
*   Directing users to the closest or best performing application endpoint.
*   A/B testing with weighted routing.

### Differentiation from Front Door:

*   **Layer:** Traffic Manager operates at the DNS layer (Layer 3/4 concept from a client perspective for resolution), Front Door operates at Layer 7 (HTTP/HTTPS).
*   **Application Focus:** TM is for any public-facing service with a DNS entry, AFD is specifically for HTTP/HTTPS web applications.
*   **Features:** AFD offers WAF, SSL offloading, caching (CDN capabilities), which TM does not. TM is purely about DNS routing.

## Quick Understanding Checklist/Exercise:

1.  **Scenario:** You have a global web application with backends deployed in East US and West Europe. You want to route users to the closest backend for the best performance and also provide WAF protection at the edge. Which Azure service would be most suitable?
2.  **Scenario:** You need to distribute incoming TCP traffic (non-HTTP) to a set of internal VMs within a single Azure VNet. Which Azure service is the primary choice for this task?
3.  **Scenario:** Your web application needs to handle SSL termination and route requests to different backend services based on the URL path (`/api` to one backend, `/images` to another). The application is deployed within a single Azure region. Which service is best suited?