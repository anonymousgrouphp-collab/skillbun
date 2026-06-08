# Azure Policy & Azure Blueprints Study Guide

## Introduction
In the realm of cloud governance, ensuring compliance, enforcing organizational standards, and enabling repeatable, governed deployments are paramount. Azure Policy and Azure Blueprints are two fundamental services in Azure designed to help organizations achieve these goals effectively at scale. While both contribute to governance, they serve distinct yet complementary roles: Azure Policy continuously enforces rules, and Azure Blueprints orchestrates the deployment of governed environments.

## Azure Policy: Governance at Scale

### What is Azure Policy?
Azure Policy is a service in Azure that enables you to create, assign, and manage policies to enforce standards and assess compliance across your resources. It works by evaluating your resources against rules defined in policy definitions. When resources are not compliant with your policies, Azure Policy can prevent resource creation, modify resources before creation, or audit existing non-compliant resources.

### Core Concepts
*   **Policy Definition:** Expresses what to evaluate and what action to take. It consists of `if` (condition) and `then` (effect) blocks.
*   **Policy Rule:** The actual logic within a policy definition, specifying the conditions under which an effect is triggered.
*   **Parameters:** Allow for flexibility within policy definitions, enabling you to define a single policy that can be applied to different scopes with varying values (e.g., allowed locations, tag names).
*   **Initiatives (Policy Sets):** A collection of policy definitions grouped together to achieve a single, larger goal (e.g., a 