# Content Delivery Network: CloudFront Study Guide

Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally with low latency, high transfer speeds, and developer-friendly tools. It integrates seamlessly with other AWS services to accelerate your web content delivery.

## 1. Core Concepts of CloudFront

### a. Edge Locations (Points of Presence - POPs)
CloudFront uses a global network of data centers called edge locations. When a user requests content, it's routed to the nearest edge location. If the content is cached there, CloudFront delivers it instantly. If not, CloudFront retrieves it from the origin and caches it for future requests.

### b. Distributions
A CloudFront distribution is the CDN itself. It's the configuration that tells CloudFront where to get content (origins), how to cache it (cache behaviors), and who can access it.

### c. Origins
An origin is the source of your content. This can be:
*   **Amazon S3 bucket:** For static website hosting, images, videos, etc.
*   **Custom Origin:** Any HTTP server, such as an EC2 instance, Elastic Load Balancer (ELB), or an on-premises web server.

### d. Cache Behaviors
Cache behaviors define how CloudFront handles requests for different URL paths or file types. You can specify:
*   **Path Pattern:** e.g., `images/*`, `*.css`, `/*` (default).
*   **Origin:** Which origin to forward requests to.
*   **Viewer Protocol Policy:** How CloudFront communicates with the viewer (e.g., HTTP and HTTPS, Redirect HTTP to HTTPS, HTTPS Only).
*   **Allowed HTTP Methods:** e.g., GET, HEAD, OPTIONS.
*   **Caching Settings:** Time-to-Live (TTL), forwarding query strings, headers, cookies to the origin.

### e. Viewer Protocol Policy
Controls the protocol (HTTP/HTTPS) that CloudFront uses to serve content to viewers:
*   `HTTP and HTTPS`
*   `Redirect HTTP to HTTPS`
*   `HTTPS Only`

### f. Origin Protocol Policy
Controls the protocol that CloudFront uses when fetching content from your origin:
*   `HTTP Only`
*   `HTTPS Only`
*   `Match Viewer` (uses the same protocol as the viewer request)

### g. Security Features
*   **Signed URLs and Cookies:** Restrict access to private content to authorized users.
*   **AWS WAF Integration:** Protect your web applications from common web exploits that could affect application availability, compromise security, or consume excessive resources.
*   **Field-Level Encryption:** Adds an additional layer of security for specific data fields (e.g., credit card numbers).

## 2. How CloudFront Works (Simplified Flow)
1.  **User Request:** A user requests a file (e.g., `image.jpg`) from your website or application.
2.  **DNS Resolution:** The DNS query for your domain (e.g., `example.com`) is resolved to a CloudFront edge location IP address, usually the one geographically closest to the user.
3.  **Edge Cache Check:** The request goes to the nearest edge location. CloudFront checks if the `image.jpg` is in its cache.
4.  **Cache Hit/Miss:**
    *   **Cache Hit:** If found, CloudFront immediately delivers the content to the user, providing low latency.
    *   **Cache Miss:** If not found, CloudFront forwards the request to the origin server (e.g., an S3 bucket or EC2 instance).
5.  **Origin Fetch:** The origin server sends the file back to the CloudFront edge location.
6.  **Edge Cache & Delivery:** The edge location caches the file (based on your cache behavior settings) and simultaneously delivers it to the user.

## 3. Basic CloudFront Distribution Configuration Example

Let's consider setting up a basic CloudFront distribution for a static website hosted on an S3 bucket.

```json
{
  "DistributionConfig": {
    "CallerReference": "my-website-distribution-2023-11-20",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "my-s3-website-origin",
          "DomainName": "my-static-website-bucket.s3-website-us-east-1.amazonaws.com",
          "CustomHeaders": {
            "Quantity": 0
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "my-s3-website-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      },
      "SmoothStreaming": false,
      "Compress": true,
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 86400, 
      "MaxTTL": 31536000
    },
    "Enabled": true,
    "Comment": "CloudFront distribution for my static S3 website"
  }
}
```

**Explanation of key parameters:**
*   `DomainName`: The S3 website endpoint (e.g., `your-bucket-name.s3-website-REGION.amazonaws.com`).
*   `ViewerProtocolPolicy`: `redirect-to-https` ensures all HTTP requests are redirected to HTTPS, enhancing security.
*   `AllowedMethods`: `GET` and `HEAD` are typically sufficient for static content.
*   `Compress`: Set to `true` to enable automatic compression of content.
*   `ForwardedValues`: For static content, you usually don't need to forward query strings or cookies to the origin, so set `QueryString` to `false` and `Cookies.Forward` to `none` for better caching.
*   `DefaultTTL`, `MinTTL`, `MaxTTL`: Control how long objects are cached at edge locations. Here, content is cached for 24 hours by default.

## 4. Quick Checklist/Exercise

1.  **Define Edge Location:** What is an AWS CloudFront Edge Location, and what is its primary role in content delivery?
2.  **Origin Configuration:** You have a dynamic web application running on an EC2 instance. Which type of CloudFront origin would you configure for this application, and why?
3.  **Caching Policy:** Describe a scenario where you would want to `ForwardedValues` for `QueryString` to be set to `true` in a CloudFront cache behavior, and explain the potential impact on caching effectiveness.
