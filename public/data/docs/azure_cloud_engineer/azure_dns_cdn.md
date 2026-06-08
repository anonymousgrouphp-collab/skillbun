# Azure DNS & Content Delivery Network (CDN)

This study guide covers Azure DNS for managing domain names and DNS resolution, and Azure CDN for accelerating content delivery globally.

## 1. Azure DNS

Azure DNS is a hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure. It allows you to host your domains and manage your DNS records using the same credentials, APIs, tools, and billing as your other Azure services. It's built on a global network of DNS servers, offering high availability and performance.

### Core Concepts

*   **DNS Zone**: A container for all the DNS records for a specific domain name (e.g., `example.com`). When you create a domain in Azure DNS, you're creating a DNS zone.
*   **Record Set**: A collection of records with the same name and type within a DNS zone. For instance, `www.example.com` could have multiple `A` records if it points to multiple IP addresses for load balancing.
*   **Record Types**: Azure DNS supports various record types, including `A` (IPv4 address), `AAAA` (IPv6 address), `CNAME` (canonical name), `MX` (mail exchange), `PTR` (pointer), `SOA` (start of authority), `SRV` (service location), and `TXT` (text).

### How Azure DNS Works

When a user types a domain name into their browser, the DNS resolver queries the DNS servers. If your domain is hosted in Azure DNS, the query will eventually reach Azure's global DNS infrastructure, which then returns the appropriate IP address or other record data to the user's browser, allowing it to connect to the correct server.

### Configuration Example (Azure CLI)

Here's how you might create a DNS zone and an `A` record using the Azure CLI:

```bash
# Create a resource group (if you don't have one already)
az group create --name myDnsResourceGroup --location eastus

# Create a DNS zone for your domain (e.g., mycompany.com)
az network dns zone create --resource-group myDnsResourceGroup --name mycompany.com

# Add an A record set for 'www' pointing to an IP address
az network dns record-set a add-record --resource-group myDnsResourceGroup --zone-name mycompany.com --record-set-name www --ipv4-address 20.10.30.40

# To verify the DNS zone
az network dns zone show --resource-group myDnsResourceGroup --name mycompany.com --output table
```

## 2. Azure Content Delivery Network (CDN)

Azure CDN is a distributed network of servers (Points of Presence or PoPs) that delivers web content to users based on their geographic location. It caches content at edge locations closer to the user, reducing latency and improving content delivery speed and user experience.

### Core Concepts

*   **CDN Profile**: A collection of CDN endpoints. It's the highest-level resource in Azure CDN and determines the pricing tier and capabilities.
*   **CDN Endpoint**: A specific configuration within a profile that links to an origin server and defines caching rules. This is the public URL (e.g., `myendpoint.azureedge.net`) through which content is served.
*   **Origin**: The source location where the original content is stored. This could be an Azure Storage account, an Azure Web App, an Azure Cloud Service, or any publicly accessible web server.
*   **PoP (Point of Presence)**: Physical locations around the globe where CDN edge servers are situated. When a user requests content, it's served from the nearest PoP.

### How Azure CDN Works

When a user requests content (e.g., an image, video, or JavaScript file) that is configured with Azure CDN, the request is routed to the nearest PoP. If the content is cached at that PoP, it's delivered directly to the user. If not, the PoP retrieves the content from the origin server, caches it, and then delivers it to the user. Subsequent requests for the same content from users near that PoP will be served from the cache, significantly reducing latency and origin server load.

### Configuration Example (Azure CLI - Conceptual Steps)

Setting up an Azure CDN involves creating a profile and then an endpoint linked to an origin. Here's a conceptual flow:

```bash
# Create a CDN profile
az cdn profile create --resource-group myCdnResourceGroup --name myCdnProfile --sku Standard_Microsoft --location Global

# Create an Azure Storage account (as an example origin)
az storage account create --name mystaticcontentsa --resource-group myCdnResourceGroup --location eastus --sku Standard_LRS

# Create a CDN endpoint pointing to the storage account's blob service primary endpoint
az cdn endpoint create \
  --resource-group myCdnResourceGroup \
  --profile-name myCdnProfile \
  --name myStaticContentEndpoint \
  --origin mystaticcontentsa.blob.core.windows.net
```

### Integration of Azure DNS and CDN

Azure DNS and Azure CDN often work hand-in-hand. You can configure a custom domain (e.g., `cdn.mycompany.com`) in Azure DNS to point to your Azure CDN endpoint. This allows users to access your CDN-cached content using your custom domain, providing a consistent brand experience and leveraging the global reach and performance of CDN.

## Exercises to Test Your Understanding

1.  **Distinguish Core Functions**: Explain the primary difference in function between Azure DNS and Azure CDN. When would you use one over the other, or both together?
2.  **Content Acceleration Scenario**: You have a global e-commerce website hosted in Azure, and you want to ensure that product images and JavaScript files load quickly for users worldwide. Which Azure service would you primarily use for this purpose, and what key feature makes it suitable?
3.  **Domain Management Task**: You've just registered a new domain name, `example.org`, and you want to manage its DNS records within Azure. What's the very first resource you would create in Azure to host this domain's DNS information?