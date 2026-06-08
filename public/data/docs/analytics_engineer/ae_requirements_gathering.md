# Requirements Gathering & Stakeholder Communication: Study Guide for Analytics Engineers

As an Analytics Engineer, your ability to effectively bridge the gap between business needs and technical data solutions is paramount. This guide focuses on the critical skills of understanding business questions, translating them into actionable data requirements, and communicating effectively with stakeholders throughout the analytics lifecycle.

## 1. The Role of Requirements Gathering

Requirements gathering is the process of defining what a data product (e.g., a dashboard, a data model, an analytical report) should achieve. For Analytics Engineers, this involves understanding the 'why' behind a business question and translating it into specific 'what' and 'how' technical specifications.

### Core Concepts:
*   **Business Question:** The high-level problem or inquiry from stakeholders (e.g., "How is our marketing campaign performing?").
*   **Key Performance Indicators (KPIs):** Measurable values that demonstrate how effectively a company is achieving key business objectives.
*   **Data Requirements:** Specific, measurable, achievable, relevant, and time-bound (SMART) technical specifications derived from business questions. These define the data needed, its structure, transformations, and output format.

### Techniques for Eliciting Requirements:
1.  **Interviews:** One-on-one discussions with stakeholders to understand their needs, pain points, and objectives.
2.  **Workshops:** Collaborative sessions with multiple stakeholders to brainstorm, define, and prioritize requirements.
3.  **Document Analysis:** Reviewing existing reports, data dictionaries, and business process documents to understand the current state.
4.  **Observation:** Watching users perform tasks to identify their true needs, rather than just what they say they need.
5.  **Prototyping/Mock-ups:** Creating early versions or visualizations of the proposed solution to gather feedback and refine requirements.

## 2. Translating Business Questions into Technical Data Models

This is the core skill of an Analytics Engineer – converting abstract business needs into concrete data model specifications.

### Steps:
1.  **Deconstruct the Business Question:** Break down the high-level question into its fundamental components (metrics, dimensions, filters, timeframes).
2.  **Identify Data Sources:** Determine which existing data tables or external sources contain the necessary information.
3.  **Define Metrics:** Specify how each KPI will be calculated, including aggregation logic (SUM, COUNT DISTINCT, AVG), filters, and any specific business rules.
4.  **Define Dimensions:** Identify all attributes needed for analysis (e.g., `customer_id`, `product_category`, `transaction_date`).
5.  **Specify Granularity:** Determine the lowest level of detail required in the data model.
6.  **Outline Transformations:** Document any necessary data cleaning, enrichment, or aggregation logic.
7.  **Data Quality Expectations:** Establish standards for data accuracy, completeness, and timeliness.

### Example: Business Question to Data Requirement Mapping

**Business Question:** "What are our top 5 selling product categories by revenue in the last quarter?"

**Derived Data Requirements:**

1.  **Metric:** Total Revenue
    *   **Definition:** Sum of `price` multiplied by `quantity` from the `sales` table.
    *   **Aggregation:** `SUM(price * quantity)`
    *   **Filters:** Exclude returns, adjust for discounts (if applicable).
    *   **Time Frame:** `last_quarter` (e.g., `transaction_date` between `start_of_last_quarter` and `end_of_last_quarter`).
    *   **Data Source:** `sales` table.

2.  **Dimension:** Product Category
    *   **Definition:** The category to which a sold product belongs.
    *   **Source:** `category_name` column from the `products` table.
    *   **Required Join:** `sales` JOIN `products` on `product_id`.

3.  **Sorting & Limiting:** Order results by `Total Revenue` descending, then take the top 5.

**Illustrative Data Model Specification (YAML/Pseudo-Code):**

```yaml
model_name: top_selling_categories
description: 