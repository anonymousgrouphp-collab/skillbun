# ETL/ELT Error Handling & Logging Study Guide

## 1. Introduction to Error Handling & Logging in ETL/ELT
Robust error handling and comprehensive logging are fundamental pillars for building reliable and maintainable Extract, Transform, Load (ETL) and Extract, Load, Transform (ELT) data pipelines. These mechanisms ensure data integrity, facilitate troubleshooting, and maintain the continuous operation of data workflows.

*   **Importance:** Guarantees data quality, improves pipeline reliability, speeds up troubleshooting, and aids in compliance and auditing.
*   **Goal:** To manage data loading failures, transformation errors, and connectivity issues gracefully, preventing pipeline crashes, data corruption, and enabling quick recovery.

## 2. Common Types of ETL/ELT Errors
Understanding the potential failure points is the first step toward effective error management.

*   **Data Quality Errors:** Occur during extraction or transformation due to invalid data formats, missing critical values, duplicate records, or data failing business validation rules.
    *   *Example:* An expected numeric column containing text, a required field being null.
*   **System Errors:** External factors impacting the pipeline's execution.
    *   *Example:* Database connection failures, API rate limits, network outages, insufficient disk space, memory exhaustion.
*   **Transformation Logic Errors:** Bugs or flaws in the business logic applied during transformation.
    *   *Example:* Incorrect calculations, lookup failures where reference data is missing, data type mismatches during conversion.
*   **Loading Errors:** Issues encountered when writing data to the target system.
    *   *Example:* Primary key violations, foreign key constraint failures, unique index violations, target table schema changes, target system being offline or at capacity.
*   **Orchestration/Workflow Errors:** Problems with the overall pipeline execution flow.
    *   *Example:* Dependent tasks failing to start, scheduling conflicts, timeout errors.

## 3. Strategies for Error Handling
Different error types require tailored handling strategies.

*   **Redirecting Error Rows (Quarantine):**
    *   **Mechanism:** Instead of failing the entire process, direct erroneous records to a dedicated "error table" or "quarantine file."
    *   **Benefit:** Allows the main data flow to continue processing valid records, isolating the problematic ones for later review, correction, and reprocessing.
    *   *Use Case:* Data quality errors, individual record loading failures.
*   **Failing the Process:**
    *   **Mechanism:** Immediately stop the pipeline upon encountering a critical error.
    *   **Benefit:** Prevents further data inconsistency or corruption when the error's impact is too severe to ignore.
    *   *Use Case:* Schema mismatches at the source, critical system connectivity failures, transactional integrity breaches.
*   **Retries:**
    *   **Mechanism:** For transient errors (e.g., temporary network glitches, database deadlocks), configure the system to attempt the operation again after a short delay.
    *   **Benefit:** Improves resilience against intermittent issues without human intervention.
    *   *Considerations:* Implement with exponential back-off and a maximum number of retries.
*   **Default Values/Imputation:**
    *   **Mechanism:** For minor, non-critical data quality issues, replace invalid or missing values with predefined defaults or imputed values (e.g., average, median).
    *   **Benefit:** Prevents pipeline failure for minor data flaws, but requires careful consideration of data impact.
    *   *Logging:* Always log when imputation or default values are applied.
*   **Skipping Bad Records:**
    *   **Mechanism:** Log the skipped record and continue processing for non-critical data where a few lost records are acceptable.
    *   **Benefit:** Maintains pipeline flow for large datasets with minimal critical impact from individual bad records.
*   **Transaction Management:**
    *   **Mechanism:** Group loading operations into atomic units. If any part of the unit fails, all changes within that unit are rolled back.
    *   **Benefit:** Ensures that data is either fully loaded or not loaded at all, maintaining database consistency.

## 4. Implementing Effective Logging
Logging provides visibility into pipeline execution, performance, and failures.

*   **What to Log:**
    *   **Timestamp:** Crucial for chronological analysis of events.
    *   **Component/Step Name:** Identifies the exact part of the pipeline (e.g., 'Extract_Customers', 'Transform_Orders').
    *   **Error Message/Code:** A detailed, human-readable description of the error, often including system-generated error codes.
    *   **Severity Level:** Categorizes the importance of the log entry (e.g., `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`/`FATAL`).
    *   **Affected Data:** Key identifiers of the record(s) involved (e.g., `CustomerID`, `OrderID`, row number), or the entire erroneous record for detailed inspection.
    *   **Process ID/Job ID:** Links log entries to a specific execution run of the ETL/ELT job.
    *   **User/System:** Indicates who or what initiated the process.
*   **Where to Log:**
    *   **Database Tables:** Ideal for structured, queryable logs, enabling easy reporting and trend analysis.
    *   **Flat Files:** Simple for basic logging, but harder to query, aggregate, and manage centrally across multiple pipelines.
    *   **Centralized Logging Systems:** (e.g., ELK Stack - Elasticsearch, Logstash, Kibana; Splunk; cloud-native services like AWS CloudWatch, Azure Monitor). Offer scalability, advanced search, visualization, and alerting capabilities.
*   **Logging Best Practices:**
    *   **Consistency:** Use a consistent logging format across all pipelines and components.
    *   **Granularity:** Log enough detail for troubleshooting but avoid excessive verbosity that could overwhelm storage or obscure critical information.
    *   **Rotation:** Implement log rotation policies to manage disk space and archive old logs.
    *   **Security:** Ensure sensitive data is not logged or is properly masked.

## 5. Alerting Mechanisms
Alerting ensures proactive notification of critical issues, allowing for timely intervention.

*   **Purpose:** To inform relevant stakeholders immediately when specific, predefined conditions are met.
*   **When to Alert:**
    *   **Process Failure:** Any `CRITICAL` or `ERROR` level log entry indicating a job failure.
    *   **Data Quality Thresholds:** When the number of quarantined records exceeds an acceptable limit.
    *   **Performance Degradation:** If a pipeline step takes unusually long or fails to meet SLAs.
    *   **Data Volume Anomalies:** Sudden, unexpected drops or spikes in processed record counts.
    *   **Source System Unavailability:** Prolonged connection failures to source systems.
*   **How to Alert:**
    *   **Email/SMS:** Common for immediate, human-readable alerts to on-call teams.
    *   **Dashboard Notifications:** Visual indicators in monitoring tools like Grafana or Kibana.
    *   **Ticketing Systems:** Integration with tools like JIRA, ServiceNow, or PagerDuty to create incidents automatically.
    *   **Webhooks/APIs:** Programmatic alerts to other systems (e.g., Slack, Microsoft Teams).

## 6. Practical Example (Conceptual Python with `try-except` and Logging)
This example demonstrates basic error handling and logging in a Python script, mimicking an ETL process.

```python
import logging
import datetime

# Configure logging to write to a file and console
logging.basicConfig(level=logging.INFO, # Set overall logging level
                    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s',
                    handlers=[
                        logging.FileHandler("etl_process.log"), # Log to a file
                        logging.StreamHandler() # Log to console
                    ])

# Get a logger for this module
logger = logging.getLogger(__name__)

def extract_data(source_path: str) -> list:
    """Simulates data extraction from a file."""
    data_rows = []
    try:
        with open(source_path, 'r') as f:
            for i, line in enumerate(f):
                data_rows.append(line.strip().split(','))
        logger.info(f"Extracted {len(data_rows)} records from {source_path}")
        return data_rows
    except FileNotFoundError:
        logger.error(f"Extraction Error: Source file '{source_path}' not found.")
        raise # Re-raise to stop the pipeline for critical errors
    except Exception as e:
        logger.critical(f"Extraction Error: An unexpected error occurred: {e}")
        raise

def transform_record(record_row: list, row_num: int) -> dict or None:
    """Simulates data transformation for a single record."""
    try:
        # Expects: [product_name, quantity_str, price_str]
        product_name = record_row[0]
        quantity = int(record_row[1]) # Potential ValueError
        price = float(record_row[2]) # Potential ValueError
        total = quantity * price
        logger.debug(f"Transformed row {row_num}: {product_name}, {quantity}, {price}")
        return {"product": product_name, "quantity": quantity, "price": price, "total": total}
    except (ValueError, IndexError) as ve:
        # Log and quarantine / skip bad records
        logger.warning(f"Transformation Error (Row {row_num}): Invalid data for record '{record_row}'. Error: {ve}")
        # In a real system, you'd write this to an error table/file
        return None # Indicate this record failed transformation
    except Exception as e:
        logger.error(f"Transformation Error (Row {row_num}): Unexpected error for record '{record_row}'. Error: {e}")
        return None

def load_data(transformed_records: list) -> tuple:
    """Simulates loading data into a target system."""
    successful_loads = 0
    error_records_for_retry = []
    for i, record in enumerate(transformed_records):
        if record is None:
            continue # This record was already handled (quarantined) in transformation
        try:
            # Simulate database insert operation
            # For demonstration, we'll simulate a failure for 'ProductC'
            if record["product"] == "ProductC":
                raise ConnectionError("Simulated DB connection issue for ProductC")
            
            logger.info(f"Loaded record: {record['product']} with total {record['total']}")
            successful_loads += 1
        except ConnectionError as ce:
            logger.error(f"Loading Error: Transient issue for {record['product']}. Error: {ce}")
            error_records_for_retry.append(record) # Add to a list for potential retry
        except Exception as e:
            logger.critical(f"Loading Error: Fatal issue for {record['product']}. Error: {e}")
            # In a real scenario, this might trigger an immediate alert or pipeline halt.
    
    if error_records_for_retry:
        logger.warning(f"Finished loading with {len(error_records_for_retry)} records requiring retry/review.")
    return successful_loads, error_records_for_retry

def main_etl_process(source_file: str):
    logger.info("--- ETL Process Started ---")
    extracted_rows = []
    transformed_outputs = []
    
    try:
        extracted_rows = extract_data(source_file)
    except Exception:
        logger.critical("ETL Process aborted due to extraction failure.")
        return

    for i, row in enumerate(extracted_rows):
        transformed_outputs.append(transform_record(row, i + 1))
    
    # Filter out None values (failed transformations) if we're not sending them to a separate error stream
    # In a real scenario, 'None' would signify records written to an error table.
    valid_transformed_records = [rec for rec in transformed_outputs if rec is not None]

    successful_loads, load_errors = load_data(valid_transformed_records)

    if load_errors:
        logger.info(f"ETL Process Completed with {len(load_errors)} loading errors.")
        # Trigger an alert if this threshold is exceeded
    else:
        logger.info("ETL Process Completed Successfully.")
    
    logger.info(f"Total records processed from source: {len(extracted_rows)}")
    logger.info(f"Successfully transformed and loaded: {successful_loads}")
    logger.info(f"--- ETL Process Finished ---")

# --- Example Usage ---
# Create a dummy data file for testing
with open("sample_data.csv", "w") as f:
    f.write("ProductA,10,1.99\n")
    f.write("ProductB,5,2.50\n")
    f.write("ProductC,abc,3.00\n") # This will cause a ValueError during transformation
    f.write("ProductD,20,4.99\n")
    f.write("ProductE,10.5,5.00\n") # This will cause a ValueError during transformation

main_etl_process("sample_data.csv")

# Example of calling with a non-existent file
# main_etl_process("non_existent_data.csv")
```

## 7. Checklist/Exercise

1.  **Identify Error Types:** List three distinct types of errors that could occur during the "Transformation" phase of an ETL/ELT process and suggest a suitable handling strategy for each. (Hint: Think data content, logic, and external dependencies.)
2.  **Logging Components:** What essential information should always be included in a log entry for a failed ETL/ELT job, and why is each piece important for troubleshooting and auditing?
3.  **Alerting Scenario:** Describe a critical scenario where automated alerting is absolutely crucial for an ETL/ELT process to prevent major data issues. Specify the trigger condition for the alert and the preferred notification method(s).
