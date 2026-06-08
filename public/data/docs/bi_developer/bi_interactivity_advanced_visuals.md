# Interactivity & Advanced Visuals in BI

Interactivity and advanced visuals are crucial components of modern Business Intelligence (BI) dashboards, transforming static reports into dynamic, user-driven data exploration tools. They empower users to slice, filter, drill down, and personalize their data view, leading to deeper insights and more informed decision-making.

## 1. Core Interactive Elements

These elements are fundamental for enabling dynamic data exploration:

### 1.1 Slicers & Filters
Slicers are on-report filtering components that allow users to visually select data points to filter the entire report. Filters, on the other hand, can be applied at report, page, or visual level and can be visible or hidden.
*   **Purpose:** To quickly narrow down data based on specific criteria (e.g., date range, product category, region).
*   **Types:** List, dropdown, range, date slicers.
*   **Configuration Sample (Power BI):**
    1.  Drag a field (e.g., 'Product Category') to the canvas.
    2.  Change its visual type to 'Slicer'.
    3.  Customize formatting (e.g., horizontal orientation, selection controls).

### 1.2 Drill-Throughs
Drill-through enables users to navigate from a summary report page to a detailed report page, passing the context of their selection.
*   **Purpose:** To explore granular details related to a specific data point without cluttering the main dashboard.
*   **Steps (Power BI):**
    1.  Create a detail page.
    2.  Add the relevant drill-through field(s) to the 'Drill through fields' well of the detail page.
    3.  On the source visual, right-click a data point to initiate the drill-through.

### 1.3 Bookmarks
Bookmarks capture the currently configured view of a report page, including filters, slicer states, applied sorting, and visual visibility.
*   **Purpose:** To save specific report states for quick access, storytelling, or creating guided analytical paths.
*   **Usage:** Create a bookmark, update it, and optionally assign it to a button.

### 1.4 Buttons
Buttons are clickable elements that can trigger various actions, such as navigating to a page, applying bookmarks, clearing filters, or running web URLs.
*   **Purpose:** To guide user interaction and streamline navigation.
*   **Actions:** Page navigation, Bookmark, Drill through (dynamic), Q&A, Web URL.

### 1.5 Tooltips
Tooltips are small pop-up windows that appear when a user hovers over a data point in a visual, providing additional context or detailed information.
*   **Purpose:** To display supplementary data without taking up permanent screen space.
*   **Types:** Default tooltips (showing fields in the visual's tooltip well), Report Page Tooltips (custom pages designed as tooltips).

### 1.6 Dynamic Actions
These involve creating conditional logic to alter visual behavior or data presentation based on user selections or data values.
*   **Examples:** Conditional formatting (colors, icons, data bars), dynamic titles/measures based on slicer selection (using DAX), dynamic visibility of visuals.

## 2. Advanced & Custom Visuals

While standard visuals are powerful, advanced and custom visuals extend the analytical capabilities of BI tools for specific use cases.

### 2.1 Why Use Them?
*   **Specialized Analysis:** For charts not available natively (e.g., Gantt charts, Network graphs, Sankey diagrams).
*   **Enhanced Storytelling:** To present data in unique, compelling ways.
*   **Industry-Specific Needs:** To meet particular requirements of certain domains.

### 2.2 Types & Sourcing
*   **Marketplace Visuals:** Many BI platforms (like Power BI) offer a marketplace or AppSource where certified custom visuals can be downloaded.
*   **R/Python Visuals:** Integrate R or Python scripts directly into your report to generate highly customized statistical or graphical outputs.
*   **Developer-Created Visuals:** Organizations can develop their own custom visuals using SDKs for specific branding or functionality.

### 2.3 Implementation (Conceptual)
1.  **Import:** From the marketplace or by importing a local file (e.g., `.pbiviz` for Power BI).
2.  **Configuration:** Drag relevant fields to the visual wells and customize settings in the format pane.

## Checklist/Exercise

1.  **Design Challenge:** Create a Power BI report page with a product category slicer, a sales by region bar chart, and a detailed table. Implement a drill-through from the bar chart to a separate page showing individual product sales for the selected region.
2.  **Bookmark Scenario:** On your report, create two bookmarks: one showing "Year-to-Date Sales" (filtered) and another showing "Previous Year Sales". Add buttons to switch between these views.
3.  **Custom Visual Exploration:** Research three different custom visuals available in your BI tool's marketplace (e.g., Power BI AppSource). Describe a scenario where each visual would be more effective than a standard visual.
