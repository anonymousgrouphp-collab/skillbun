# SRE: Incident Response & Postmortems: A Study Guide

Site Reliability Engineering (SRE) bridges the gap between development and operations, ensuring the reliability, performance, and availability of large-scale systems. A crucial aspect of SRE is the systematic approach to managing incidents and learning from failures through blameless postmortems.

## 1. Core SRE Principles: SLAs, SLOs, SLIs, & Error Budgets

Before diving into incident response, it's vital to understand the foundational metrics that drive SRE practices:

*   **Service Level Indicators (SLIs):** These are quantitative measures of some aspect of the service provided. They answer the question: "What aspect of service are we measuring?" Examples include latency, throughput, error rate, and availability.
    *   _Example: The percentage of successful HTTP requests, or the latency of API calls._
*   **Service Level Objectives (SLOs):** These are target values or ranges for an SLI. They define: "What is our target for this measured aspect?" SLOs are internal targets that a team commits to meet.
    *   _Example: 99.9% of requests must succeed, or 95% of API calls must complete in under 300ms._
*   **Service Level Agreements (SLAs):** These are explicit or implicit agreements with your users that describe the level of service they can expect from you. If an SLA is breached, there are often contractual consequences (e.g., service credits).
    *   _Example: A cloud provider guaranteeing 99.95% uptime for a given service, or face financial penalties._
*   **Error Budgets:** Derived from SLOs, the error budget is the maximum amount of time a system can fail or be unavailable without violating the SLO. It quantifies acceptable unreliability. If your SLO is 99.9% availability, your error budget is 0.1% downtime (per period). This budget can be 