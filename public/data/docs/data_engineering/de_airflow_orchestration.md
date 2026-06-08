# Workflow Orchestration with Apache Airflow

Apache Airflow is an open-source platform used to programmatically author, schedule, and monitor workflows. It allows you to define workflows as Directed Acyclic Graphs (DAGs) of tasks, providing a robust solution for complex data pipelines, ETL processes, and automation scripts.

## 1. Core Concepts of Airflow

### Directed Acyclic Graphs (DAGs)
A DAG is a collection of all the tasks you want to run, organized in a way that reflects their relationships and dependencies.
*   **Directed:** Tasks flow in one direction, without loops.
*   **Acyclic:** No task can depend on itself, either directly or indirectly.
*   **Graph:** A visual representation of tasks and their dependencies.

### Tasks and Operators
*   **Task:** An instantiation of an operator. Each node in a DAG is a task.
*   **Operator:** A pre-defined template for a single unit of work. Airflow provides many built-in operators (e.g., `BashOperator`, `PythonOperator`, `KubernetesPodOperator`, `S3ToRedshiftOperator`). You can also create custom operators.
*   **Sensor:** A special type of operator that waits for a certain condition to be met (e.g., a file to appear in S3, a specific time of day) before allowing downstream tasks to execute. They are crucial for event-driven workflows.

### Airflow Components
*   **Scheduler:** Monitors all DAGs and tasks, triggers scheduled workflows, and submits tasks to the executor.
*   **Webserver:** Provides the Airflow UI, allowing users to inspect DAGs, monitor task progress, view logs, and manage connections/variables.
*   **Worker(s):** Processes tasks submitted by the scheduler via an executor (relevant for distributed executors).
*   **Executor:** The mechanism by which tasks are run. Common executors include `LocalExecutor` (runs tasks locally), `CeleryExecutor` (distributes tasks to a pool of workers), and `KubernetesExecutor` (runs each task in its own Kubernetes pod).
*   **Metadata Database:** Stores information about DAGs, task states, connections, variables, and more.

## 2. Designing and Implementing DAGs

DAGs are defined in Python scripts. Each script represents a single DAG.

### Basic DAG Structure
A minimal DAG involves importing necessary modules, instantiating a `DAG` object, and defining tasks with their dependencies.

```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

with DAG(
    dag_id='my_first_airflow_dag',
    start_date=datetime(2023, 1, 1),
    schedule_interval='@daily', # Can be a cron string or timedelta
    catchup=False, # Prevents backfilling past runs from start_date
    tags=['example', 'basic'],
    default_args={
        'depends_on_past': False,
        'email_on_failure': False,
        'email_on_retry': False,
        'retries': 1,
        'retry_delay': timedelta(minutes=5),
    }
) as dag:
    # Task 1: Print a greeting
    start_task = BashOperator(
        task_id='start_greeting',
        bash_command='echo "Hello from Airflow!"',
    )

    # Task 2: Sleep for a bit to simulate work
    sleep_task = BashOperator(
        task_id='simulate_work',
        bash_command='sleep 5',
    )

    # Task 3: Print completion message
    end_task = BashOperator(
        task_id='end_message',
        bash_command='echo "DAG finished successfully!"',
    )

    # Define task dependencies using bitshift operators
    start_task >> sleep_task >> end_task
```

### Managing Dependencies
Dependencies define the order of task execution. Airflow will only run a downstream task once all its upstream tasks have successfully completed.
*   **Bitshift operators (`>>`, `<<`):** The most common and readable way to define dependencies.
    *   `task_a >> task_b` means `task_b` runs after `task_a`.
    *   `task_c << task_d` means `task_c` runs before `task_d`.
*   **Complex Dependencies:**
    *   `[task_a, task_b] >> task_c`: `task_c` runs after both `task_a` and `task_b` complete.
    *   `task_a >> [task_b, task_c]`: `task_b` and `task_c` run in parallel after `task_a` completes.

## 3. Scheduling and Execution

### Scheduling Tasks
*   **`schedule_interval`:** Defines how often the DAG should run. Can be a cron expression (`'0 0 * * *'`), a `timedelta` object (`timedelta(days=1)`), or a preset string (`'@daily'`, `'@hourly'`, `'@once'`, `None` for unscheduled, manually triggered DAGs).
*   **`start_date`:** The date from which the DAG starts to be scheduled. Airflow typically backfills runs from the `start_date` up to the current time, unless `catchup=False` is set.

### Handling Retries
Tasks can fail due to transient issues (e.g., network glitches). Airflow offers mechanisms to handle this gracefully:
*   **`retries`:** Number of times a task should be retried before marking it as failed. Defined in `default_args` or per-task.
*   **`retry_delay`:** The delay between retries (e.g., `timedelta(minutes=5)`).
*   **`on_failure_callback`:** A Python callable that executes if a task fails. Useful for custom error handling or sending notifications.

## 4. Parameterizing Workflows

Workflows often need dynamic inputs based on the execution context or external triggers. Airflow supports parameterization using Jinja templating and `op_kwargs`.
*   **Jinja Templating:** Many operator fields (like `bash_command`, `sql`) are Jinja templated. This allows access to Airflow context variables like `{{ ds }}` (data interval start date), `{{ dag_run.conf }}` (DAG run configuration passed at trigger time), `{{ execution_date }}` (the logical run date).
    ```python
    from airflow.operators.python import PythonOperator

    def process_data(date, mode):
        print(f"Processing data for {date} in {mode} mode")

    process_data_task = PythonOperator(
        task_id='process_data_for_date',
        python_callable=process_data,
        op_kwargs={
            'date': '{{ ds }}',
            'mode': '{{ dag_run.conf.get("mode", "full") }}'
        }
    )
    ```
*   **`op_kwargs` / `op_args`:** Pass keyword arguments or positional arguments to the Python callable in a `PythonOperator`.

## 5. Monitoring Job Failures

Effective monitoring is critical for maintaining healthy data pipelines.
*   **Airflow UI:** The primary tool for monitoring. The Graph View, Tree View, and Task Instance details show task status (success, running, failed, skipped), logs, and execution times.
*   **Email Alerts:** Configure `email_on_failure` and `email_on_retry` in `default_args` or per-task to get notifications.
*   **Custom Callbacks:** Use `on_failure_callback` to integrate with external alerting systems (e.g., Slack, PagerDuty, Microsoft Teams).
*   **Logs:** Airflow captures detailed logs for each task instance, invaluable for debugging failures. These are accessible via the UI and on the worker's filesystem.
*   **XComs (Cross-communication):** While not strictly for monitoring, XComs allow tasks to exchange small amounts of data, which can be useful for passing status or results that subsequent monitoring tasks might check.

## 6. Advanced Concepts: Executors, Sensors, and Operators

### Executors
*   **LocalExecutor:** Suitable for testing and small-scale deployments. Runs tasks as subprocesses on the scheduler machine. Limited scalability.
*   **CeleryExecutor:** A scalable, distributed executor. Tasks are sent to a message queue (e.g., RabbitMQ, Redis) and picked up by a pool of Celery workers. Good for medium to large-scale deployments.
*   **KubernetesExecutor:** Runs each task in its own dedicated Kubernetes pod. Provides excellent isolation, resource management, and scalability, making it ideal for containerized environments and large-scale, dynamic workloads.

### Sensors
Sensors are critical for building event-driven or reactive data pipelines, introducing pauses in your DAG until an external condition is met.
*   `FileSensor`: Waits for a file or folder to appear in a specific path.
*   `SqlSensor`: Waits for a SQL query to return a non-empty result.
*   `ExternalTaskSensor`: Waits for a task in another DAG to complete.
*   `S3KeySensor`, `GoogleCloudStorageObjectSensor`: Wait for specific objects to exist in cloud storage.

### Operators
*   **Built-in Operators:** Airflow comes with a rich set of operators for common tasks (e.g., `PythonOperator`, `BashOperator`, `DockerOperator`, various database operators, cloud service operators).
*   **Custom Operators:** When built-in operators don't meet specific needs, you can extend `BaseOperator` or existing operators to create your own. This promotes reusability, simplifies DAG definitions, and encapsulates complex logic.

---

### Quick Airflow Checklist/Exercise:

1.  **Identify the problem:** You need to run a Python script daily at 3:00 AM that processes data from a specific S3 bucket. This script should only execute if a new file (with a specific prefix) has landed in the S3 bucket since the last run. If the Python script fails, it should retry once after 15 minutes, and on final failure, send an email notification.
2.  **Design the DAG structure:** Outline the `DAG` object definition including `dag_id`, `start_date`, `schedule_interval`, and relevant `default_args` to meet the retry and notification requirements.
3.  **Choose the right operators & dependencies:** Which operators would you use for checking the S3 file and running the Python script? How would you define the dependencies between these tasks to ensure the correct order and conditional execution?