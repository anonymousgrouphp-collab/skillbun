const fs = require('fs');
const path = require('path');

const ROADMAPS = {
  "database_admin": {
    path: "public/data/roadmaps/database_admin.json",
    docsDir: "public/data/docs/database_admin",
    topics: {
      "data_encryption_compliance": {
        title: "Data Encryption, Masking & Compliance",
        intro: "Security is a core pillar of database administration. DBA security strategies must protect data both at rest and in transit, while ensuring compliance with global regulatory standards like GDPR, HIPAA, and PCI-DSS.",
        concepts: [
          { name: "Transparent Data Encryption (TDE)", desc: "TDE encrypts the database files at the storage level, protecting data from offline access or physical disk theft without requiring application changes." },
          { name: "Dynamic Data Masking (DDM)", desc: "DDM limits sensitive data exposure by masking it on-the-fly for non-privileged database users (e.g., masking credit cards as XXXX-XXXX-XXXX-1234)." },
          { name: "Encryption in Transit", desc: "Forcing SSL/TLS connections between database hosts, clients, and replication nodes to protect packets from network sniffing." }
        ],
        example: "Enabling TDE in PostgreSQL using pgclean or pgcrypto extensions, or forcing TLS connections in postgresql.conf:\nssl = on\nssl_cert_file = 'server.crt'\nssl_key_file = 'server.key'",
        questions: [
          "Explain the difference between Symmetric and Asymmetric encryption in databases.",
          "What is database hashing and when should it be used instead of encryption?",
          "How does Dynamic Data Masking protect user privacy without altering the physical data?"
        ]
      },
      "auditing_vulnerability_management": {
        title: "Auditing, Vulnerability Management & Security Patching",
        intro: "Database systems are prime targets for attacks. DBAs must enforce strict audit logs to track user behavior, scan for vulnerabilities, and apply security patches without causing downtime.",
        concepts: [
          { name: "Database Auditing", desc: "Tracking DDL (Schema changes) and DML (Data changes) operations, especially by administrative users, to maintain accountability and detect unauthorized access." },
          { name: "SQL Injection Prevention", desc: "Auditing query logs to identify vulnerable code, enforcing parameterized queries, and applying least privilege access control." },
          { name: "Patch Management", desc: "Testing and rolling out database engine updates and security patches in staging, followed by zero-downtime rolling updates in production." }
        ],
        example: "Configuring audit logs in MySQL using the Audit Log Plugin:\nINSTALL PLUGIN audit_log SONAME 'audit_log.so';\nSET GLOBAL audit_log_policy = 'ALL';",
        questions: [
          "Why is database auditing critical for regulatory compliance?",
          "How do you implement least-privilege security roles for application services?",
          "Explain the steps to safely perform rolling updates on a multi-node database cluster."
        ]
      },
      "cloud_db_incident_response": {
        title: "Cloud Databases & Advanced Incident Management",
        intro: "DBAs operating in cloud environments must understand how cloud infrastructures handle database state, scaling, backups, and failovers during outages.",
        concepts: [
          { name: "Multi-Region Failover", desc: "Designing active-passive or active-active multi-region databases to ensure high availability during complete cloud provider region outages." },
          { name: "Database Service Level Objectives (SLOs)", desc: "Defining and monitoring metrics like RTO (Recovery Time Objective) and RPO (Recovery Point Objective) for critical database systems." },
          { name: "Infrastructure Alerts", desc: "Setting up telemetry alerts for storage exhaustion, connection spikes, CPU throttling, and high replication lag." }
        ],
        example: "AWS RDS Multi-AZ Failover mechanism diagram / setup where primary replica syncs to standby, triggering automatic DNS failover if primary fails.",
        questions: [
          "What is the difference between RTO and RPO in database disaster recovery?",
          "How does a multi-AZ failover affect client connection timeout configurations?",
          "Explain how you would handle storage autoscaling under sudden write-heavy workloads."
        ]
      },
      "managed_db_services_deep_dive": {
        title: "Managed Database Services Deep Dive",
        intro: "Modern organizations lean heavily on managed database services (e.g., AWS RDS, Cloud SQL, Azure SQL). A DBA's role shifts from OS management to database engine optimization, schema design, and scaling.",
        concepts: [
          { name: "Shared Responsibility Model", desc: "Understanding what the cloud vendor manages (OS, physical hardware, backups) vs. what the customer manages (indexing, schemas, query tuning)." },
          { name: "Performance Insights", desc: "Using built-in monitoring tools (like AWS Performance Insights) to profile locks, CPU load, and long-running queries." },
          { name: "Read Replicas & Scaling", desc: "Creating read replicas to offload read traffic from the primary write database, managing replication lag constraints." }
        ],
        example: "Adding read replicas and configuring connection pooling (e.g., PgBouncer) in managed environments to handle spikes in traffic.",
        questions: [
          "Under what conditions does read replica replication lag become a business logic issue?",
          "What are the limitations of managed database services compared to self-hosted engines?",
          "How do you perform database parameter tuning on a managed instance?"
        ]
      },
      "cloud_db_operations_cost_iac": {
        title: "Cloud Database Operations, Cost Optimization & IaC",
        intro: "DBAs are increasingly responsible for cloud costs and deploying database infrastructure using Infrastructure as Code (IaC) like Terraform.",
        concepts: [
          { name: "Infrastructure as Code (IaC)", desc: "Defining database infrastructure (instances, parameters, subnet groups) in declarative code (Terraform/CloudFormation) for reproducibility." },
          { name: "Database Cost Optimization", desc: "Right-sizing instances, selecting correct storage classes (e.g., GP3 vs IO1), cleaning up unconsumed backups, and scheduling dev database shutdowns." },
          { name: "Configuration Management", desc: "Managing DB parameter groups and options in a centralized, version-controlled manner." }
        ],
        example: "Terraform configuration snippet to deploy a PostgreSQL database instance with AWS RDS:\nresource \"aws_db_instance\" \"postgres\" {\n  allocated_storage = 20\n  engine            = \"postgres\"\n  instance_class    = \"db.t4g.micro\"\n}",
        questions: [
          "How does declarative IaC prevent configuration drift in staging and production databases?",
          "What strategies can you use to reduce AWS RDS storage and IOPS costs?",
          "Explain the difference between db.t3 (burstable) and db.m5 (general purpose) instances for databases."
        ]
      },
      "db_migration_strategies_cloud": {
        title: "Database Migration Strategies to/from Cloud",
        intro: "Migrating databases between on-premise servers and the cloud (or between cloud providers) is a complex operation that must minimize data loss and downtime.",
        concepts: [
          { name: "Homogeneous vs Heterogeneous Migration", desc: "Homogeneous (e.g., Postgres to Postgres) vs Heterogeneous (e.g., Oracle to PostgreSQL) migrations, requiring schema conversion tools." },
          { name: "Change Data Capture (CDC)", desc: "Streaming real-time transaction updates from source to destination during migration to maintain data parity before final cutover." },
          { name: "Migration Cutover Planning", desc: "Creating detailed step-by-step checklists, dry runs, and fallback procedures for the final migration cutover window." }
        ],
        example: "AWS Database Migration Service (DMS) configuration concept where source engine logs are streamed to target database using logical replication.",
        questions: [
          "What is Schema Conversion and why is it required for heterogeneous migrations?",
          "How does Change Data Capture (CDC) help in achieving near-zero downtime migrations?",
          "Describe a database rollback/fallback plan in case a migration cutover fails."
        ]
      },
      "incident_management_postmortems": {
        title: "Incident Management, Runbooks & Post-Mortems",
        intro: "When database incidents occur, DBAs must respond quickly using predefined runbooks, diagnose root causes, and write post-mortems to prevent recurrence.",
        concepts: [
          { name: "Runbooks & Automation", desc: "Step-by-step guides for diagnosing and resolving common failures, such as high CPU, deadlocks, connection spikes, or storage exhaustion." },
          { name: "Blameless Post-Mortems", desc: "Investigating outages by focusing on system weaknesses rather than human error, documenting timelines, root causes, and action items." },
          { name: "On-Call Operations", desc: "Integrating database monitoring alerts with incident response tools like PagerDuty or Opsgenie." }
        ],
        example: "Structure of a DBA Post-Mortem:\n1. Incident Summary & Impact\n2. Detailed Timeline (UTC)\n3. Root Cause Analysis (5 Whys)\n4. Immediate Remediation\n5. Long-term Action Items",
        questions: [
          "Why is focus on 'system failure' preferred over 'human error' in post-mortems?",
          "Describe a runbook for resolving high replication lag in a SQL cluster.",
          "How do you determine the difference between database deadlocks and slow queries during an outage?"
        ]
      },
      "advanced_db_ops_project_lab": {
        title: "Project: Advanced Cloud Database Operations Lab",
        intro: "This project project-based lab guides you through configuring high availability, replication, alerts, and performing a failover test on a cloud database.",
        concepts: [
          { name: "High Availability Setup", desc: "Setting up a primary database instance with a hot standby using physical stream replication." },
          { name: "Chaos Engineering (Failover Testing)", desc: "Simulating a hard database failure (killing database process or network isolation) and verifying automatic failover and client recovery." },
          { name: "Monitoring and Alarm Integration", desc: "Deploying prometheus/grafana dashboards or cloud-native monitors to alert on replica health." }
        ],
        example: "Bash script to simulate failover testing by gracefully stopping primary server to trigger standby promotion:\n# Simulate failure\npg_ctl -D /var/lib/postgresql/data stop -m immediate\n# Verify replica becomes primary\npg_controldata /var/lib/postgresql/replica_data | grep \"Database cluster state\"",
        questions: [
          "What is split-brain scenario in database clustering and how do you prevent it?",
          "How do client application connection pools handle database failovers?",
          "Why is failover testing critical to perform periodically in staging environments?"
        ]
      },
      "dba_specialized_topics": {
        title: "Specialized & Emerging Database Technologies",
        intro: "Beyond relational databases, modern DBAs must manage specialized data stores tailored for specific workloads like search, graph models, real-time metrics, and global scale.",
        concepts: [
          { name: "NoSQL Architectures", desc: "Key-value, document, wide-column, and graph databases, optimized for horizontal scaling and flexible schemas." },
          { name: "Search & Analytical Engines", desc: "Databases specialized in full-text indexing, vector search, or aggregation-heavy workloads (e.g., Elasticsearch, ClickHouse)." },
          { name: "Distributed SQL", desc: "Databases that offer global scalability and partition tolerance while maintaining ACID guarantees (e.g., CockroachDB, Spanner)." }
        ],
        example: "Comparative strategy matrix for database selection based on query latency, transaction throughput, and data relationship complexity.",
        questions: [
          "Compare Distributed SQL databases with traditional Master-Slave relational architectures.",
          "What is Polyglot Persistence and why do modern system designs implement it?",
          "Under what scenarios is a graph database (e.g., Neo4j) more efficient than SQL joins?"
        ]
      },
      "nosql_databases_deep_dive": {
        title: "NoSQL Databases Deep Dive",
        intro: "NoSQL databases address constraints of traditional relational systems by trading off certain SQL features (like joins or immediate consistency) for high write speeds and horizontal scalability.",
        concepts: [
          { name: "Document Stores (MongoDB)", desc: "Storing data in JSON/BSON document formats, enabling nested schemas, dynamic attributes, and distributed sharding." },
          { name: "Key-Value Stores (Redis)", desc: "In-memory database engines optimized for microsecond read/write access, primarily used for session caching and pub/sub messaging." },
          { name: "Wide-Column Stores (Cassandra)", desc: "Highly distributed masterless architectures optimized for massive write throughput across multiple commodity nodes." }
        ],
        example: "MongoDB sharding architecture outline where queries go through mongos router, routed to config servers and shards.",
        questions: [
          "Explain the CAP theorem and how it applies to choosing between MongoDB and Cassandra.",
          "What is sharding and how does it enable horizontal scalability?",
          "Why is indexing critical in document databases if they don't support SQL schemas?"
        ]
      },
      "data_warehousing_etl_elt": {
        title: "Data Warehousing, Data Lakes & ETL/ELT",
        intro: "Transactional DBAs must understand analytical pipelines. Data Warehouses (OLAP) are optimized for aggregation queries, fed by Extract, Transform, Load (ETL/ELT) jobs.",
        concepts: [
          { name: "Data Warehouses vs Data Lakes", desc: "Data Warehouses store highly structured, schema-on-write analytical data (Snowflake, BigQuery). Data Lakes store raw, unstructured data (S3, HDFS)." },
          { name: "Columnar Storage", desc: "Analytical databases store data by columns rather than rows, minimizing IO operations for aggregate queries (e.g., SUM, AVG)." },
          { name: "ETL vs ELT", desc: "Extract-Transform-Load (transforms data in transit) vs Extract-Load-Transform (loads raw data first, transforms using target engine power)." }
        ],
        example: "Example of columnar storage scanning compared to row-oriented storage for an aggregation query (visualizing columns stored in contiguous blocks).",
        questions: [
          "Why are row-oriented databases poor choices for analytical aggregation queries?",
          "What is schema-on-read in data lakes, and how does it compare to data warehousing?",
          "Under what conditions is ELT preferred over ETL?"
        ]
      },
      "search_graph_time_series_dbs": {
        title: "Search, Graph & Time-Series Databases",
        intro: "Specialized data stores handle niche access patterns like inverted indexes, network relationships, and sequential timestamp data.",
        concepts: [
          { name: "Search Engines (Elasticsearch)", desc: "Utilizing inverted indexes for rapid full-text search, tokenization, stemming, and fuzzy string matching." },
          { name: "Graph Databases (Neo4j)", desc: "Treating nodes and relationships as first-class citizens, enabling instant traversal of complex networks without deep joins." },
          { name: "Time-Series Databases (InfluxDB)", desc: "Optimized for high-velocity write loops of timestamped metrics, supporting data retention policies and downsampling." }
        ],
        example: "Elasticsearch inverted index structure mapping tokens to document IDs for high-speed text searches.",
        questions: [
          "How does an inverted index speed up full-text search queries?",
          "Why are relational databases slow at querying deep parent-child-friend relationship graphs?",
          "Explain the purpose of data downsampling in time-series database management."
        ]
      },
      "distributed_sql_databases": {
        title: "Distributed SQL Databases",
        intro: "Distributed SQL databases (e.g., CockroachDB, Google Spanner) combine the horizontal scalability of NoSQL with the strict ACID transactions of traditional relational databases.",
        concepts: [
          { name: "Consensus Protocols (Raft/Paxos)", desc: "Distributed engines use consensus algorithms to agree on data updates across multiple replicas to avoid split-brain." },
          { name: "Distributed Transactions", desc: "Executing transactions across multiple geographically separated nodes while maintaining serializability and isolation." },
          { name: "Geographic Partitioning", desc: "Pinning data to specific geographical regions to respect local data residency laws and minimize network latency." }
        ],
        example: "Raft consensus diagram indicating Leader election and Log replication across follower nodes to confirm commit.",
        questions: [
          "How do distributed SQL databases achieve global consensus without a single master bottleneck?",
          "What is data pinning and how does it optimize latency for multi-continent deployments?",
          "Compare two-phase commit (2PC) with Raft consensus log replication."
        ]
      },
      "polyglot_persistence_data_strategy": {
        title: "Polyglot Persistence & Data Strategy",
        intro: "Enterprise data architectures rarely rely on a single database. DBAs must design data strategies that combine relational, cache, NoSQL, and analytical engines to meet modern application demands.",
        concepts: [
          { name: "Polyglot Persistence", desc: "Using different database engines for different microservices based on data access patterns (e.g., PostgreSQL for orders, Redis for cache, Elasticsearch for catalog)." },
          { name: "Data Synchronization (Outbox Pattern)", desc: "Synchronizing data across multiple databases reliably using transactional outbox patterns and message brokers (e.g., Kafka)." },
          { name: "Master Data Management (MDM)", desc: "Maintaining a single source of truth for core business entities across multiple distributed database instances." }
        ],
        example: "Outbox pattern design flow where application writes to DB and Outbox table in a single transaction, and an exporter relays it to Kafka / consumers.",
        questions: [
          "What is the Transactional Outbox pattern and how does it prevent dual-write failures?",
          "Describe how you would design a data sync strategy between an OLTP database and an Elasticsearch cluster.",
          "What are the operational overheads of managing a polyglot persistence architecture?"
        ]
      }
    }
  },
  "desktop_app_developer": {
    path: "public/data/roadmaps/desktop_app_developer.json",
    docsDir: "public/data/docs/desktop_app_developer",
    topics: {
      "desktop_app_developer_dev_environment_tooling": {
        title: "Development Environment Setup and Tooling",
        intro: "Setting up a desktop application development environment requires installing target SDKs, compiler toolchains, package managers, and editors configured for cross-compiling.",
        concepts: [
          { name: "Compiler Toolchains", desc: "Installing MSVC (Windows), Clang/Xcode (macOS), or GCC (Linux) toolchains necessary for building native bin outputs." },
          { name: "Node and Rust Runtimes", desc: "Configuring runtime environments for frameworks like Electron (requires Node.js) or Tauri (requires Rust compiler cargo)." },
          { name: "Cross-Compilation toolchain", desc: "Setting up SDKs (like Windows SDK, macOS Xcode command line tools) to compile binaries for other target architectures (x86_64, arm64)." }
        ],
        example: "Verifying the local compilation environment for Rust (Tauri) and Node (Electron):\nrustc --version\ncargo --version\nnode --version",
        questions: [
          "What is cross-compilation and why is it complex in desktop development?",
          "Explain the role of C++ compiler toolchains in compiling hybrid desktop frameworks.",
          "How do package managers like npm and cargo differ in managing native dependencies?"
        ]
      },
      "desktop_app_developer_core_skills": {
        title: "Core Cross-Platform Development Skills",
        intro: "Developing cross-platform desktop applications requires a deep understanding of native APIs, OS constraints, memory management, and code portability.",
        concepts: [
          { name: "Code Portability", desc: "Writing application logic that abstracts OS differences (file systems, registry, process structures) using platform-agnostic APIs." },
          { name: "Native Code Bridges", desc: "Using FFI (Foreign Function Interface), Node Addons, or Rust commands to execute native system calls from JS." },
          { name: "OS-Specific UI Guidelines", desc: "Adapting UI behaviors (title bars, context menus, drag-and-drop) to conform to Windows, macOS, and Linux conventions." }
        ],
        example: "Writing simple platform-aware branches in JavaScript:\nconst os = require('os');\nconst isMac = os.platform() === 'darwin';\nconst isWindows = os.platform() === 'win32';",
        questions: [
          "What are the performance implications of bridging JavaScript and native OS APIs?",
          "How do you handle path separators dynamically across Windows (\\) and Unix (/) systems?",
          "What is Foreign Function Interface (FFI) and when is it used?"
        ]
      },
      "desktop_app_developer_electron_deep_dive": {
        title: "Framework Deep Dive: Electron",
        intro: "Electron is the most popular framework for building desktop apps with web technologies, powering VS Code, Discord, and Slack. It combines Chromium and Node.js.",
        concepts: [
          { name: "Multi-Process Architecture", desc: "Electron separates operations into a Main process (handles native OS integration, windows) and Renderer processes (handles UI, Chromium)." },
          { name: "IPC Bridge (Inter-Process Communication)", desc: "Communicating securely between the Main and Renderer processes using ipcMain and ipcRenderer channels." },
          { name: "Context Isolation & Security", desc: "Enforcing security configurations like contextIsolation, nodeIntegration: false, and using preload scripts to expose specific APIs." }
        ],
        example: "Enforcing security context isolation in Electron main.js:\nconst win = new BrowserWindow({\n  webPreferences: {\n    preload: path.join(__dirname, 'preload.js'),\n    contextIsolation: true,\n    nodeIntegration: false\n  }\n});",
        questions: [
          "Why does Electron run Chromium and Node.js in separate processes?",
          "What is a preload script and why is it crucial for security in Electron?",
          "How do you configure Content Security Policy (CSP) in an Electron app?"
        ]
      },
      "desktop_app_developer_tauri_deep_dive": {
        title: "Framework Deep Dive: Tauri",
        intro: "Tauri is a modern, lightweight alternative to Electron. It replaces Chromium with the OS's native WebView engine and uses Rust for backend operations, leading to tiny binary sizes.",
        concepts: [
          { name: "Native Webview Integration", desc: "Tauri apps render UI using system WebViews (WebView2 on Windows, WebKit on macOS/Linux), keeping the final app bundle extremely small." },
          { name: "Rust Commands & State", desc: "Exposing fast Rust backend functions to the frontend WebView using Tauri's command decorator system." },
          { name: "Tauri Configuration (tauri.conf.json)", desc: "Managing application permissions, window parameters, bundle settings, and building targets." }
        ],
        example: "Defining a Rust command in Tauri main.rs and calling it from frontend JS:\n#[tauri::command]\nfn greet(name: &str) -> String {\n    format!(\"Hello, {}! from Rust\", name)\n}\n\n// Frontend Call:\nimport { invoke } from '@tauri-apps/api/tauri';\ninvoke('greet', { name: 'Harsh' }).then(console.log);",
        questions: [
          "Compare Tauri and Electron in terms of memory usage and bundle sizes.",
          "How does Tauri ensure application security through scope permissions?",
          "What is the role of Webview2 in Windows deployments of Tauri applications?"
        ]
      },
      "desktop_app_developer_ui_frameworks_styling": {
        title: "User Interface Frameworks and Styling",
        intro: "Designing UIs for desktop apps requires considerations for mouse/keyboard inputs, resizable windows, system styling sync, and multiple resolutions.",
        concepts: [
          { name: "Responsive Layouts", desc: "Designing fluid layouts that scale gracefully from small window sizes to fullscreen monitors." },
          { name: "Theme Synchronization", desc: "Detecting and subscribing to OS dark/light theme changes to adjust application themes automatically." },
          { name: "Custom Titlebars & Window Dragging", desc: "Disabling default OS title bars and creating custom HTML title bars that support window dragging." }
        ],
        example: "Creating a draggable custom window titlebar using CSS:\n.titlebar {\n  -webkit-app-region: drag;\n  height: 30px;\n  background: var(--bg-color);\n}\n.titlebar-button {\n  -webkit-app-region: no-drag; /* buttons must remain clickable */\n}",
        questions: [
          "How do you implement window dragging without blocking button clicks in a custom titlebar?",
          "Explain how you listen to system theme changes in React/CSS using media queries.",
          "What is layout jank and how do you prevent it when resizing a desktop window?"
        ]
      },
      "desktop_app_developer_data_persistence_management": {
        title: "Local Data Storage and Persistence Management",
        intro: "Unlike web apps that rely on cloud databases, desktop apps store data locally on the user's hard drive using SQLite, Key-Value stores, or simple JSON files.",
        concepts: [
          { name: "Local JSON/Settings Files", desc: "Storing configuration preferences in simple files (e.g., config.json) in the user's appData directory." },
          { name: "SQLite Database", desc: "Integrating lightweight, transactional SQL database files directly inside the application folder for complex relational data." },
          { name: "Key-Value Stores (LevelDB / NeDB)", desc: "Using local document-based or key-value libraries for fast local storage without complex SQL setups." }
        ],
        example: "Reading/Writing settings file in Electron main.js:\nconst fs = require('fs');\nconst path = require('path');\nconst configPath = path.join(app.getPath('userData'), 'settings.json');\nfs.writeFileSync(configPath, JSON.stringify({ theme: 'dark' }));",
        questions: [
          "Where should local application settings be stored on Windows, macOS, and Linux?",
          "Explain the advantages of SQLite over simple file storage for desktop apps.",
          "How do you manage local database version migrations during application updates?"
        ]
      },
      "desktop_app_developer_ipc_native_integrations": {
        title: "Inter-Process Communication (IPC) & Native OS Integrations",
        intro: "IPC allows the sandboxed UI layer to securely request action execution from the native OS process, enabling interactions with the system tray, menus, and file systems.",
        concepts: [
          { name: "File System access", desc: "Using native OS save/open dialog boxes to read and write files locally." },
          { name: "System Tray and Menus", desc: "Adding application icons to the OS system tray/notification area and creating context menus." },
          { name: "Global Shortcuts", desc: "Registering global keyboard shortcuts that trigger app actions even when the window is blurred." }
        ],
        example: "Opening a native file dialog in Electron main process:\nconst { dialog } = require('electron');\ndialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });",
        questions: [
          "How does context isolation affect how IPC is exposed to frontend JavaScript?",
          "Why are global shortcuts dangerous to register without proper bounds?",
          "How do you implement system tray alerts and notifications?"
        ]
      },
      "desktop_app_developer_state_management_patterns": {
        title: "Application State Management Patterns",
        intro: "Desktop apps require state synchronization across the UI thread and the native backend process to ensure views and background tasks are aligned.",
        concepts: [
          { name: "Bidirectional State Sync", desc: "Synchronizing state variables (e.g., download progress, settings) across processes using IPC messages." },
          { name: "Reactive Store Bindings", desc: "Binding local application state stores (Redux, Zustand, Pinia) to system events." },
          { name: "State Persistence", desc: "Automatically saving local state configurations to disk on window close or state mutation." }
        ],
        example: "Broadcasting state updates from main process to all renderer windows in Electron:\nmainWindow.webContents.send('state-update', { progress: 85 });",
        questions: [
          "How do you prevent UI thread blocking when saving massive state matrices to disk?",
          "What pattern is used to handle multi-window state synchronization?",
          "Explain how you would implement auto-save functionality for application configurations."
        ]
      },
      "desktop_app_developer_networking_api_integration": {
        title: "Networking and External API Integration",
        intro: "Desktop applications communicate with cloud databases, authentication endpoints, and external servers using secure network protocols.",
        concepts: [
          { name: "Secure HTTP Calls", desc: "Performing REST API or GraphQL queries from the desktop runtime, handling certificate authentication." },
          { name: "Websockets & Real-time Integration", desc: "Maintaining persistent connection tunnels for real-time messaging, notifications, and synchronizations." },
          { name: "Offline Resiliency", desc: "Handling network dropouts by queuing request operations locally and executing them when connection is restored." }
        ],
        example: "Listening to online/offline state changes in frontend JS:\nwindow.addEventListener('online', () => console.log('Connected!'));\nwindow.addEventListener('offline', () => console.log('Connection Lost!'));",
        questions: [
          "How do you secure API secrets/tokens inside compiled desktop applications?",
          "What is an offline synchronization queue and how do you implement it?",
          "Explain how you handle CORS constraints inside WebViews compared to standard web browsers."
        ]
      },
      "desktop_app_developer_asynchronous_programming": {
        title: "Asynchronous Programming and Concurrency",
        intro: "Desktop apps must remain responsive. Heavy operations like database writes, compiling, or image processing must run asynchronously in worker threads.",
        concepts: [
          { name: "Main Loop Block Avoidance", desc: "Ensuring the UI render process is never blocked by executing computational loads in child processes or workers." },
          { name: "Worker Threads & Child Processes", desc: "Spawning separate system threads (Node Worker Threads, Rust threads) to execute long-running tasks." },
          { name: "Promises & Async/Await", desc: "Using non-blocking async operations for file reads, database transactions, and network calls." }
        ],
        example: "Spawning a child process in Node.js to execute a shell command without blocking the Main process:\nconst { exec } = require('child_process');\nexec('npm run build', (error, stdout, stderr) => {\n  console.log(stdout);\n});",
        questions: [
          "Why is blocking the main/UI thread unacceptable in desktop app development?",
          "What is the difference between spawning a child process and spawning a worker thread?",
          "How does Rust handle safe concurrency and memory access in Tauri backend commands?"
        ]
      },
      "desktop_app_developer_error_handling_logging_debugging": {
        title: "Robust Error Handling, Logging, and Debugging",
        intro: "Debugging compiled binaries on client machines requires robust logging strategies, crash reporting, and remote debugging diagnostics.",
        concepts: [
          { name: "Local Application Logs", desc: "Writing logs to local diagnostic files in the appData folder, rotating logs to avoid storage bloat." },
          { name: "Global Exception Catching", desc: "Catching uncaught exceptions (e.g., uncaughtException in Node, panic hooks in Rust) to avoid unexpected app crashes." },
          { name: "Developer Tools Integration", desc: "Exposing debugging ports and using Chromium dev tools to inspect and trace running render states." }
        ],
        example: "Catching global uncaught exceptions in Electron main.js:\nprocess.on('uncaughtException', (error) => {\n  console.error('Unhandled System Exception:', error.message);\n  // Save to file or report to telemetry\n});",
        questions: [
          "How do you implement log rotation to prevent application logs from taking up gigabytes of storage?",
          "Explain the difference between debugging Renderer process scripts and Main process scripts.",
          "What is a stack trace and how do you parse it from client crash reports?"
        ]
      },
      "desktop_app_developer_quality_assurance": {
        title: "Quality Assurance and Testing",
        intro: "Testing desktop apps requires verifying cross-platform installation packages, testing native bridge commands, and performing GUI automation across different operating systems.",
        concepts: [
          { name: "Cross-Platform GUI Automation", desc: "Automating click events, typing, and page navigation on actual Windows, macOS, and Linux UI windows." },
          { name: "Native Bridge Test coverage", desc: "Writing tests for native OS commands and bridge methods using mock environments." },
          { name: "Installer Validation", desc: "Testing installation flows, permission prompts, and desktop shortcut creations across operating systems." }
        ],
        example: "Basic configuration of standard GUI automated testing tool (like Spectron or Playwright) that launches the desktop app binary and inspects the DOM.",
        questions: [
          "Why is automated GUI testing more complex for desktop apps than web applications?",
          "What are the challenges of setting up cross-platform automated test suites on CI?",
          "Explain how you would write unit tests for code that depends on native OS APIs (e.g., checking disk space)."
        ]
      },
      "desktop_app_developer_unit_integration_testing_basics": {
        title: "Unit and Integration Testing Fundamentals",
        intro: "Writing unit and integration tests ensures the internal business logic of your desktop application behaves predictably before it is compiled into installer binaries.",
        concepts: [
          { name: "Mocking Native Modules", desc: "Replacing native OS module calls (like fs, child_process, or Tauri APIs) with mock functions during tests." },
          { name: "UI Component Isolation", desc: "Testing UI layouts in isolation using libraries like Testing Library to assert correct click and state responses." },
          { name: "Backend Command Testing", desc: "Testing Rust/C++ backend methods directly using standard test assertion frameworks." }
        ],
        example: "Mocking the filesystem 'fs' module in a Jest unit test:\nconst fs = require('fs');\njest.mock('fs');\nfs.readFileSync.mockReturnValue('{\"theme\":\"dark\"}');",
        questions: [
          "Why must you mock native modules during unit tests?",
          "Explain how you structure your code to separate business logic from native OS dependencies for easier testing.",
          "What is regression testing and why is it important before releasing a new app version?"
        ]
      },
      "desktop_app_developer_e2e_cross_platform_testing": {
        title: "End-to-End and Cross-Platform Testing",
        intro: "E2E testing launches compiled desktop applications on real environments to ensure OS permissions, file access, and network integration function correctly.",
        concepts: [
          { name: "Playwright / Spectron Automation", desc: "Automating application workflows (e.g., login, file save, settings configuration) on actual binary builds." },
          { name: "OS Isolation Testing", desc: "Testing application execution in clean, isolated sandbox environments (VMs, Docker containers) to ensure no dependency leakage." },
          { name: "Keyboard & Focus Traversal Testing", desc: "Ensuring applications are fully usable without a mouse, verifying correct tab order and accessibility focus rings." }
        ],
        example: "Sample Playwright script to launch an Electron application and assert window title:\nconst { _electron: electron } = require('playwright');\n(async () => {\n  const app = await electron.launch({ args: ['main.js'] });\n  const window = await app.firstWindow();\n  console.log(await window.title());\n  await app.close();\n})();",
        questions: [
          "How does Playwright interface with the Chromium instance running inside Electron?",
          "Explain how you simulate right-click context menu selections in automated tests.",
          "Describe how you test desktop app behaviors when network latency is high."
        ]
      },
      "desktop_app_developer_performance_profiling_optimization": {
        title: "Performance Profiling and Optimization",
        intro: "Desktop apps are often criticized for high RAM and CPU usage. Optimizing the runtime environment, memory footprint, and CPU execution is critical.",
        concepts: [
          { name: "Memory Footprint Profiling", desc: "Tracking memory leaks, closures, and unmanaged native memory allocations using DevTools and OS monitors." },
          { name: "Chromium Process Optimization", desc: "Disabling unnecessary GPU processes, optimizing CSS animations, and lazy-loading scripts." },
          { name: "Rust/Native Profiling", desc: "Analyzing Rust/C++ execution times using CPU flamegraphs and performance monitors to identify bottlenecks." }
        ],
        example: "Analyzing and debugging memory usage using Chrome DevTools Heap Snapshots to identify detached DOM elements or unclosed event listeners.",
        questions: [
          "Why does Electron consume more memory than native desktop apps, and how can you minimize it?",
          "What is tree-shaking and how does it optimize desktop bundle size?",
          "Explain the difference between a memory leak in JavaScript and one in Rust/C++."
        ]
      },
      "desktop_app_developer_accessibility_security_audits": {
        title: "Accessibility and Security Audits & Best Practices",
        intro: "Security and accessibility are crucial. DBAs/Developers must prevent SQL injections, secure local databases, and ensure compatibility with screen readers.",
        concepts: [
          { name: "Screen Reader Support", desc: "Providing descriptive alt tags, clean DOM hierarchies, and explicit ARIA properties for accessibility compatibility." },
          { name: "Local Data Encryption", desc: "Encrypting local database files (SQLCipher) and sensitive user keys using OS keychains (Credential Manager, Keychain Access)." },
          { name: "Secure IPC Audits", desc: "Verifying that IPC listeners validate input parameters to prevent command injections or unauthorized local executions." }
        ],
        example: "Storing passwords securely using native OS keychain access via Node node-keytar or Tauri plugin-keychain.",
        questions: [
          "How do you secure local files and prevent users from tampering with local application databases?",
          "Why is the eval() function prohibited in desktop renderers, and what are its security risks?",
          "How does contextIsolation protect Electron apps from remote site scripting attacks?"
        ]
      },
      "desktop_app_developer_user_acceptance_testing": {
        title: "User Acceptance Testing (UAT)",
        intro: "UAT gathers feedback from actual users testing preview/beta builds under real conditions to identify user experience gaps and platform bugs.",
        concepts: [
          { name: "Beta Release channels", desc: "Releasing preview builds to early testers using dedicated channels (e.g., TestFlight, beta updates)." },
          { name: "In-App Feedback tools", desc: "Providing simple mechanisms for users to capture screenshots and submit reports directly from the app interface." },
          { name: "UAT Metrics collection", desc: "Analyzing app metrics and feedback comments to prioritize bug fixes and feature adjustments before production release." }
        ],
        example: "Providing a diagnostic modal showing system information (OS version, RAM, CPU) that users can easily copy-paste when reporting bugs.",
        questions: [
          "How do you organize a structured beta test phase for a cross-platform desktop application?",
          "What system details should be attached to user bug reports for diagnostic purposes?",
          "How do you resolve conflict when beta testers disagree on UI usability patterns?"
        ]
      },
      "desktop_app_developer_deployment_maintenance": {
        title: "Deployment, Distribution, and Maintenance",
        intro: "Publishing desktop apps requires compiling, packaging, code signing, and distributing installers through stores or auto-update networks.",
        concepts: [
          { name: "Code Signing & Certificates", desc: "Signing application binaries using Apple Developer Certificates and Windows Authenticode to avoid OS security alerts (SmartScreen)." },
          { name: "App Store Publishing", desc: "Meeting sandbox guidelines and submission requirements for the Microsoft Store and Mac App Store." },
          { name: "Cross-Platform Packaging", desc: "Building packages for various systems: MSI/EXE (Windows), DMG/PKG (macOS), DEB/RPM/AppImage (Linux)." }
        ],
        example: "Configuring electron-builder.json for automatic packaging and code signing configurations.",
        questions: [
          "Why is code signing mandatory for modern desktop applications?",
          "What is macOS App Notarization and how does it fit into the release workflow?",
          "Explain the differences between standard installers (MSI) and portable binaries (AppImage)."
        ]
      },
      "desktop_app_developer_packaging_cross_platform": {
        title: "Cross-Platform Packaging and Distribution",
        intro: "Packaging packages compile raw source scripts and binaries into standard formats ready to be installed on customer OS environments.",
        concepts: [
          { name: "Wix Toolset & NSIS", desc: "Using advanced installer scripting frameworks to build customizable Windows installation flows (MSI/EXE)." },
          { name: "macOS DMG creation", desc: "Creating standard DMG drag-to-Applications folder packages, configuring background graphics." },
          { name: "Linux Packaging Standards", desc: "Building portable AppImage files, snap packages, or native deb packages for distribution across Linux distros." }
        ],
        example: "Configuration code sample of electron-builder showing output formats configuration for Windows (nsis), mac (dmg), and linux (AppImage).",
        questions: [
          "How does NSIS allow you to build custom installations on Windows systems?",
          "What is the Applications link shortcut pattern in macOS DMG files?",
          "Explain how Flatpak packages differ from Snap packages on Linux."
        ]
      },
      "desktop_app_developer_auto_update_implementation": {
        title: "Robust Auto-Updating Mechanisms",
        intro: "Unlike web apps, desktop apps must update themselves automatically. DBAs/Developers must deploy update servers that push delta changes to clients.",
        concepts: [
          { name: "Auto-Update Frameworks (electron-updater / tauri-updater)", desc: "Using built-in updating utilities that ping update JSON APIs and download update payloads in the background." },
          { name: "Code Sign Verification during updates", desc: "Ensuring downloaded update packages are signed with the same developer key before executing installation to prevent hijackings." },
          { name: "Delta/Incremental Updates", desc: "Downloading only modified application chunks instead of the entire binary, conserving bandwidth." }
        ],
        example: "Checking for updates programmatically in Electron main.js:\nconst { autoUpdater } = require('electron-updater');\nautoUpdater.checkForUpdatesAndNotify();",
        questions: [
          "Describe the security risks of downloading auto-updates over unencrypted HTTP channels.",
          "How does the update check cycle function using a remote update server and a local update client?",
          "Explain how you handle migrations of local configurations when updating to major versions."
        ]
      },
      "desktop_app_developer_ci_cd_workflows": {
        title: "CI/CD Workflows for Desktop Applications",
        intro: "Compiling cross-platform binaries requires configuring runners with Windows, macOS, and Linux hardware to automate tests and release artifacts.",
        concepts: [
          { name: "Multi-OS GitHub Runners", desc: "Running build pipelines on windows-latest, macos-latest, and ubuntu-latest runner machines in parallel." },
          { name: "Secure Code Signing in CI", desc: "Injecting code-signing credentials, certificates, and PFX files securely using CI secrets." },
          { name: "Automated Release creation", desc: "Configuring CI to automatically compile binaries, sign them, draft a GitHub Release, and upload installer files." }
        ],
        example: "GitHub Actions workflow YAML configuration showing compilation matrix across three operating systems (Windows, macOS, Linux).",
        questions: [
          "Why is a multi-OS build matrix required in your desktop CI/CD configuration?",
          "How do you securely handle Apple developer credentials inside GitHub Action secrets?",
          "What is the difference between building on macOS x64 and macOS Apple Silicon (arm64) runners?"
        ]
      },
      "desktop_app_developer_crash_reporting_analytics": {
        title: "Crash Reporting and Application Analytics",
        intro: "Monitoring client usage patterns and debugging crashes in production requires integrating secure diagnostic analytics and crash dump reporters.",
        concepts: [
          { name: "Crash Reporters (Sentry / Crashpad)", desc: "Catching runtime panics and sending diagnostic reports, including call stacks and thread states, to central dashboards." },
          { name: "Privacy-Compliant Analytics", desc: "Implementing anonymized analytics tracking click patterns and feature adoption metrics without collecting PII." },
          { name: "Local Minidump collection", desc: "Saving local system logs and minidump configurations to file for offline diagnostics." }
        ],
        example: "Configuring Sentry SDK to catch unhandled renderer and main exceptions in desktop runtimes.",
        questions: [
          "What is a minidump and how does it help you debug a binary crash?",
          "How do you ensure user privacy compliance (GDPR) when capturing database exception logs?",
          "Describe how you track active session time and feature usage analytics."
        ]
      },
      "desktop_app_developer_internationalization_localization": {
        title: "Internationalization and Localization (i18n & l10n)",
        intro: "Making desktop applications globally compliant requires managing local language translations, date/time layouts, and RTL (Right-to-Left) designs.",
        concepts: [
          { name: "i18next / Native Translations", desc: "Using local JSON files containing key-value language translations, dynamically switching language contexts." },
          { name: "OS Language detection", desc: "Reading OS environment settings to automatically launch the application in the user's local language." },
          { name: "RTL layout styling", desc: "Ensuring flex and grid structures mirror alignment automatically when switching to languages like Arabic or Hebrew." }
        ],
        example: "Configuring locale matching in electron preload to read window.navigator.language and apply translation variables.",
        questions: [
          "How do you detect local system language settings in Electron or Tauri?",
          "Explain how you handle layout mirroring for RTL text inputs.",
          "What is the importance of dynamic currency and number formatting in localized applications?"
        ]
      },
      "desktop_app_developer_collaboration_operations": {
        title: "Collaboration, Handoff, and Lifecycle Management",
        intro: "Desktop app projects require seamless collaboration between UI/UX designers, backend developers, QA engineers, and operation managers.",
        concepts: [
          { name: "Figma Handoff optimization", desc: "Importing design specifications, screen dimensions, fonts, and assets directly to component assets." },
          { name: "Feature Flag Management", desc: "Using remote configuration settings to toggle feature availability on the client side without releasing a new installer." },
          { name: "Version Deprecation strategy", desc: "Notifying users running outdated binaries and enforcing updates for deprecated client versions." }
        ],
        example: "Configuring client-side validation to fetch a remote configuration JSON file showing current supported client versions.",
        questions: [
          "How do you implement feature flags safely in offline-first desktop applications?",
          "Describe a version deprecation workflow for notifying users of critical security updates.",
          "Explain the challenges of designer-to-developer handoff for complex desktop menus."
        ]
      },
      "desktop_app_developer_agile_development_practices": {
        title: "Agile Development and Team Practices",
        intro: "Applying agile methodologies to desktop application projects keeps cross-functional teams aligned during short-cycle release windows.",
        concepts: [
          { name: "Sprints and Releases", desc: "Aligning sprint targets with compiler build cycles, testing phases, and store publication timelines." },
          { name: "Daily Standups & Board Management", desc: "Using boards (Jira, Trello) to track development issues, design changes, and QA validation flows." },
          { name: "Cross-Functional Syncs", desc: "Conducting regular syncs between design teams (variables) and development teams (tokens) to prevent design drift." }
        ],
        example: "Outline of a standard 2-week Sprint cycle customized for cross-platform app compiling, signing, testing, and beta release.",
        questions: [
          "How do store review times affect desktop release planning in Agile sprints?",
          "What role does feedback loop analytics play in sprint prioritization?",
          "How do you handle urgent hotfixes outside regular release sprints?"
        ]
      },
      "desktop_app_developer_documentation_communication": {
        title: "Technical Documentation and Stakeholder Communication",
        intro: "Maintaining comprehensive documentation simplifies onboarding and aligns business stakeholders on application features and architecture.",
        concepts: [
          { name: "API & Dev Documentation", desc: "Writing comprehensive developer guides explaining the native IPC bridge, local database schema, and monorepo configurations." },
          { name: "User Manuals & Release notes", desc: "Publishing accessible updates, changelogs, and user guides showing new application features." },
          { name: "Technical Architecture Specs", desc: "Documenting systems topology, data flow routes, security sandboxing, and backup architectures." }
        ],
        example: "Standard structure of a dev API readme showing IPC channel namespaces, parameters, return types, and exceptions.",
        questions: [
          "Why is keeping local database schemas documented critical for team collaboration?",
          "How do you compile clean, user-friendly changelogs from Git commit messages?",
          "What is the difference between internal developer docs and external user manuals?"
        ]
      },
      "desktop_app_developer_legacy_code_maintenance_upgrades": {
        title: "Long-Term Maintenance, Upgrades, and Legacy Code",
        intro: "Desktop apps require long-term maintenance to update dependencies, address deprecations, and ensure compatibility with new operating system releases.",
        concepts: [
          { name: "Dependency Audit & Upgrades", desc: "Scanning local packages for security vulnerabilities (npm audit, cargo audit) and applying patch updates." },
          { name: "OS API Deprecations", desc: "Refactoring code to replace deprecated OS methods or Chromium flags with modern equivalents." },
          { name: "Legacy Refactoring", desc: "Transitioning monolithic components or native bridging modules into clean modular structures." }
        ],
        example: "Using security audit commands to identify vulnerabilities in desktop packages:\nnpm audit --audit-level=high\ncargo audit",
        questions: [
          "How do you handle compatibility issues when Apple or Microsoft releases new OS updates?",
          "What strategies can you use to refactor a large legacy desktop code base safely?",
          "Why are security audits critical for apps containing native system integrations?"
        ]
      },
      "desktop_app_developer_portfolio_career": {
        title: "Portfolio and Career Readiness",
        intro: "As a Desktop App Developer, your portfolio must showcase actual compiled applications, demonstrating your native integration and packaging expertise.",
        concepts: [
          { name: "Showcasing Compiled Apps", desc: "Providing downloadable links (DMG/MSI) for your projects, rather than just web links, so users can install them." },
          { name: "Architecture Explanation", desc: "Writing comprehensive case studies detailing your IPC strategies, performance benchmarks, and local database designs." },
          { name: "Resume Optimization", desc: "Structuring your resume to highlight cross-platform development (Electron, Tauri), packaging, and code signing certifications." }
        ],
        example: "Structuring a portfolio project description to show performance optimizations, binary size reductions, and native API integrations.",
        questions: [
          "Why is providing downloadable binaries critical for a Desktop Developer's portfolio?",
          "What technical details should your portfolio projects' README files highlight?",
          "How do you demonstrate cross-platform capability to prospective employers?"
        ]
      },
      "desktop_app_developer_capstone_project": {
        title: "Capstone Project: End-to-End Desktop Application",
        intro: "The capstone project requires building, signing, packaging, and publishing a cross-platform desktop application from scratch.",
        concepts: [
          { name: "Complex Native App Idea", desc: "Building an application that utilizes local file systems, native menus, offline database persistence, and external APIs." },
          { name: "Full Packaging Pipeline", desc: "Configuring packaging script setups to generate signed installer binaries for both Windows and macOS." },
          { name: "Auto-Update Server deploy", desc: "Deploying a remote update channel server and verifying that the compiled client automatically downloads updates." }
        ],
        example: "Example architecture diagram of capstone app: UI React WebView communicating via IPC to Main Node.js process with SQLite database and auto-updater.",
        questions: [
          "What system interactions make a desktop app a strong capstone candidate?",
          "Explain the testing plan required to validate your capstone app across Windows and macOS.",
          "Describe how your capstone app handles credential storage securely."
        ]
      },
      "desktop_app_developer_portfolio_case_studies": {
        title: "Creating a Professional Developer Portfolio and Case Studies",
        intro: "Structuring technical case studies effectively demonstrates your problem-solving capabilities, architectural patterns, and execution rigor.",
        concepts: [
          { name: "Problem-Solution Narrative", desc: "Explaining the concrete challenges (e.g., poor CPU utilization, large package size) and how you optimized them." },
          { name: "Technical Architecture Detail", desc: "Providing clean data flow diagrams, thread allocations, and local database schemas." },
          { name: "Measurable Impact Metrics", desc: "Showcasing performance increases: RAM reduction, faster startup speeds, or smaller app update sizes." }
        ],
        example: "Sample impact metrics formatting for a desktop case study showing RAM and startup optimizations.",
        questions: [
          "How do you explain technical database schema optimizations in a developer case study?",
          "What diagrams should you include to explain desktop app process communication?",
          "How do you showcase performance optimizations (like RAM usage reduction) in writing?"
        ]
      },
      "desktop_app_developer_interview_career_strategies": {
        title: "Interview Preparation and Career Strategies for Desktop Developers",
        intro: "Interviewing for Desktop Developer positions requires demonstrating deep knowledge of native operating system integrations, process architectures, and UI responsiveness.",
        concepts: [
          { name: "System and IPC Architecture", desc: "Answering questions on context isolation, browser WebView engines, and multi-process communication safety." },
          { name: "Native Bridging & Compilers", desc: "Explaining how native bridge compilers package C++ or Rust methods to execute inside sandboxed JS environments." },
          { name: "Responsive UI live coding", desc: "Building common window widgets, custom title bars, global shortcuts, and file upload lists under constraints." }
        ],
        example: "Overview of common interview questions regarding IPC communication patterns, security settings, and local cache cleaning.",
        questions: [
          "Explain how you would prevent remote code execution (RCE) in an Electron app load.",
          "What questions should you ask the interviewer about their desktop app release pipeline?",
          "How do you showcase system-level debugging capability in a coding interview?"
        ]
      }
    }
  }
};

// Generate Markdown Files and Update JSONs
Object.keys(ROADMAPS).forEach(slug => {
  const cfg = ROADMAPS[slug];
  const roadmapPath = cfg.path;
  const docsDir = cfg.docsDir;

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. Generate Markdown Files
  Object.keys(cfg.topics).forEach(id => {
    const item = cfg.topics[id];
    const markdown = `# ${item.title}: Study Guide

${item.intro}

## 1. Key Concepts

${item.concepts.map((c, idx) => `### Concept ${idx + 1}: ${c.name}
${c.desc}`).join('\n\n')}

## 2. Practical Example

### ${item.title} Example Setup
\`\`\`${id.includes('workflow') || id.includes('structure') || id.includes('workflow') ? 'text' : 'javascript'}
${item.example}
\`\`\`

## 3. Quick Check-Up

${item.questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}\n`;

    const docPath = path.join(docsDir, `${id}.md`);
    fs.writeFileSync(docPath, markdown, 'utf8');
    console.log(`Generated study guide for: ${slug}/${id}`);
  });

  // 2. Update JSON files
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

  function updateNode(node) {
    if (node.id && cfg.topics[node.id]) {
      const nonDocResources = Array.isArray(node.resources)
        ? node.resources.filter(r => r.type !== 'doc')
        : [];
      node.resources = [
        ...nonDocResources,
        {
          title: 'Study Guide & Notes',
          url: `/data/docs/${slug}/${node.id}.md`,
          type: 'doc'
        }
      ];
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(updateNode);
    }
  }

  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    roadmap.tree.forEach(updateNode);
  } else if (Array.isArray(roadmap.stages)) {
    roadmap.stages.forEach(stage => {
      if (Array.isArray(stage.topics)) {
        stage.topics.forEach(updateNode);
      }
    });
  }

  fs.writeFileSync(roadmapPath, JSON.stringify(roadmap, null, 2), 'utf8');
  console.log(`Updated ${slug}.json with study guide links.`);
});

console.log('All partial roadmaps completed successfully!');
