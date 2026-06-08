# Azure DDoS Protection: Study Guide

## 1. Introduction to DDoS Attacks

Distributed Denial-of-Service (DDoS) attacks are malicious attempts to disrupt the normal traffic of a targeted server, service, or network by overwhelming the target or its surrounding infrastructure with a flood of Internet traffic. DDoS attacks achieve effectiveness by utilizing multiple compromised computer systems as sources of attack traffic. The impact can range from temporary slowdowns to complete service outages, leading to significant financial losses, reputational damage, and operational disruptions.

## 2. Understanding Azure DDoS Protection

Azure DDoS Protection provides enhanced mitigation capabilities for your Azure resources. It is designed to protect your applications and services from volumetric, protocol, and resource (application) layer DDoS attacks. Azure offers two tiers of DDoS protection:

*   **Basic:** This tier is automatically enabled, always-on traffic monitoring and real-time mitigation of common network-layer attacks. It protects Azure's infrastructure and is available to all Azure customers without charge. It provides protection at the network level.
*   **Standard:** This tier provides more comprehensive protection tailored to your specific Azure resources. It offers enhanced mitigation capabilities, adaptive tuning based on your application's traffic patterns, and telemetry for monitoring and alerting. It is a paid service and protects resources within specific Virtual Networks (VNets).

### Key Features of Azure DDoS Protection Standard:

*   **Always-on monitoring:** Continuous traffic monitoring and automated mitigation against common DDoS attacks.
*   **Adaptive tuning:** Intelligent traffic profiling learns your application's legitimate traffic patterns and automatically adjusts mitigation policies to block malicious traffic without impacting valid users.
*   **Attack analytics and telemetry:** Provides detailed reports in Azure Monitor, allowing you to visualize attacks and understand their impact.
*   **DDoS rapid response support:** Access to a dedicated DDoS rapid response team for critical attacks.
*   **Cost protection:** Guarantees protection for resource scale-out costs incurred during a DDoS attack (e.g., increased VM instances, firewall rules).
*   **Integration with WAF:** Works seamlessly with Web Application Firewalls (WAFs) like Azure Application Gateway WAF for Layer 7 (application layer) protection.

## 3. How Azure DDoS Protection Works

Azure DDoS Protection Standard operates by continuously monitoring public IP addresses assigned to resources within a protected VNet. When an attack is detected, the service automatically:

1.  **Detects:** Identifies traffic anomalies that deviate from the normal traffic profile of your application.
2.  **Mitigates:** Diverts the attack traffic to scrubbing centers, where malicious packets are dropped, and legitimate traffic is forwarded to your application.
3.  **Learns:** Through adaptive tuning, it learns your application's legitimate traffic patterns over time, improving the accuracy of future mitigations and reducing false positives.

Protected resources include public IP addresses associated with Azure Virtual Machines, Load Balancers, Application Gateways, Azure Firewall, and more.

## 4. Configuring Azure DDoS Protection Standard

Azure DDoS Protection Standard is enabled on a Virtual Network. Once enabled on a VNet, all public IP addresses within that VNet are protected.

### Example: Enabling DDoS Protection using Azure CLI

First, create a DDoS Protection Plan:

```bash
az network ddos-protection create \
  --resource-group MyResourceGroup \
  --name MyDdosProtectionPlan \
  --location eastus
```

Next, enable the DDoS Protection Plan on your Virtual Network:

```bash
az network vnet update \
  --resource-group MyResourceGroup \
  --name MyVNet \
  --ddos-protection true \
  --ddos-protection-plan MyDdosProtectionPlan
```

Replace `MyResourceGroup`, `MyDdosProtectionPlan`, `eastus`, and `MyVNet` with your desired names and location.

## 5. Best Practices

*   **Combine with WAF:** For comprehensive protection, deploy a Web Application Firewall (WAF) such as Azure Application Gateway WAF or a third-party WAF solution in front of your web applications to mitigate Layer 7 attacks.
*   **Implement proper network segmentation:** Use Network Security Groups (NSGs) and Azure Firewall to segment your network and restrict traffic flow, limiting the blast radius of an attack.
*   **Design for resilience:** Implement highly available and scalable architectures that can automatically scale out to handle increased legitimate traffic during an attack.

## 6. Quick Check / Exercise

1.  What is the fundamental difference in scope between Azure DDoS Protection Basic and Standard?
2.  List three key features that distinguish Azure DDoS Protection Standard from the Basic tier.
3.  Explain the concept of "adaptive tuning" in Azure DDoS Protection Standard and why it's crucial for effective mitigation.