# Azure NoSQL Databases & Caching (Cosmos DB, Redis Cache)

This study guide explores two cornerstone services in Azure for managing data outside traditional relational models: Azure Cosmos DB for globally distributed NoSQL databases and Azure Cache for Redis for high-performance data caching.

## 1. Introduction to NoSQL Databases and Caching

**NoSQL databases** (Not Only SQL) are designed for specific data models and have flexible schemas, making them ideal for modern applications requiring high availability, massive scalability, and low latency. They are often categorized by their data model: document, column-family, key-value, and graph.

**Caching** involves storing frequently accessed data in a temporary, fast-access layer to reduce the load on primary data stores and improve application response times.

## 2. Azure Cosmos DB: Globally Distributed, Multi-model NoSQL Database

Azure Cosmos DB is Microsoft's fully managed, globally distributed, and multi-model database service. It offers guaranteed low latency, high availability, and automatic scalability, making it suitable for modern, mission-critical applications.

### Key Features:

*   **Globally Distributed:** Easily distribute your data across any Azure region with a click of a button, ensuring low latency access for users worldwide.
*   **Multi-Model and Multi-API:** Supports various NoSQL APIs including:
    *   **Core (SQL) API:** Document database, JSON-based.
    *   **MongoDB API:** Compatible with MongoDB drivers.
    *   **Cassandra API:** Compatible with Apache Cassandra.
    *   **Gremlin API:** Graph database.
    *   **Table API:** Key-value database, compatible with Azure Table Storage.
*   **Guaranteed Performance:** Offers single-digit millisecond latencies at the 99th percentile, backed by SLAs.
*   **Elastic Scalability:** Automatically scales throughput and storage independently and elastically.
*   **High Availability:** Backed by industry-leading SLAs for uptime.
*   **Serverless Option:** Pay only for the throughput and storage you consume, ideal for unpredictable workloads.
*   **Request Units (RUs):** A performance currency that abstracts system resources like CPU, IOPS, and memory required to perform database operations.

### Use Cases:

*   **IoT:** Ingesting and processing device telemetry data.
*   **Gaming:** Storing user profiles, game states, and leaderboards.
*   **Retail & Marketing:** Catalog management, personalized recommendations.
*   **Web & Mobile Applications:** User profiles, session management, product catalogs.

### Core Concepts:

*   **Account:** The highest-level resource, containing databases.
*   **Database:** A logical container for containers.
*   **Container:** The unit of scalability for throughput and storage (e.g., collections in MongoDB, tables in Cassandra, graphs in Gremlin). It holds items (documents, rows, nodes, edges).
*   **Item:** A single entity within a container (e.g., a JSON document, a row, a node).
*   **Partition Key:** A property within your items that Cosmos DB uses to distribute data across logical and physical partitions, crucial for performance and scalability.

### Simple Code Example (Python - Core (SQL) API):

```python
from azure.cosmos import CosmosClient

# Configuration
URL = "YOUR_COSMOS_DB_ENDPOINT"
KEY = "YOUR_COSMOS_DB_PRIMARY_KEY"
DATABASE_NAME = "productsdb"
CONTAINER_NAME = "products"

# Initialize the Cosmos client
client = CosmosClient(URL, credential={'masterKey': KEY})
database = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)

# Create a new item
new_product = {
    "id": "1",
    "name": "Laptop Pro",
    "category": "Electronics",
    "price": 1200.00,
    "inStock": True,
    "reviews": [
        {"rating": 5, "comment": "Excellent performance!"}
    ]
}

created_item = container.create_item(body=new_product, partition_key=new_product["category"])
print(f"Created item with id: {created_item['id']}")

# Read an item
read_item = container.read_item(item="1", partition_key="Electronics")
print(f"Read item: {read_item['name']}")

# Query items
query = "SELECT * FROM c WHERE c.category = 'Electronics'"
items = list(container.query_items(query=query, enable_cross_partition_query=True))
print(f"Found {len(items)} electronic products.")
```

## 3. Azure Cache for Redis: High-Performance Data Caching

Azure Cache for Redis is a fully managed, in-memory data store service based on the popular open-source Redis. It significantly boosts the performance and scalability of applications that rely on back-end data stores by temporarily holding frequently accessed data in memory.

### Key Features:

*   **Open-Source Redis Compatibility:** Fully compatible with Redis data structures, APIs, and clients.
*   **High Performance:** Provides incredibly fast read/write operations (sub-millisecond latency).
*   **Various Tiers:**
    *   **Basic:** Single node, for dev/test.
    *   **Standard:** Replicated primary/secondary nodes, automatic failover, for production.
    *   **Premium:** Supports clustering, VNET integration, data persistence, geo-replication, higher throughput.
*   **Security:** Network isolation, data encryption.
*   **Scalability:** Easily scale up or down to meet demand.
*   **Flexible Data Structures:** Supports strings, hashes, lists, sets, sorted sets.

### Use Cases:

*   **Session Store:** Storing user session data for web applications.
*   **Page Caching:** Caching HTML pages or fragments.
*   **Data Cache:** Storing frequently accessed database query results or static content.
*   **Message Broker:** Implementing publish/subscribe messaging patterns.
*   **Leaderboards:** Real-time updates for gaming leaderboards.

### Core Concepts:

*   **Cache Instance:** The deployed Redis server in Azure.
*   **Keys:** How data is stored and retrieved in Redis, like a dictionary.
*   **Data Structures:** Redis supports various data types beyond simple key-value pairs.
*   **Client Libraries:** Libraries available in various programming languages (e.g., StackExchange.Redis for .NET, redis-py for Python) to interact with the Redis cache.

### Simple Code Example (Python - using `redis-py`):

```python
import redis

# Configuration (get these from your Azure Cache for Redis instance)
REDIS_HOST = "YOUR_REDIS_CACHE_NAME.redis.cache.windows.net"
REDIS_PORT = 6380 # SSL port
REDIS_PASSWORD = "YOUR_REDIS_PRIMARY_KEY"

# Connect to Azure Cache for Redis
# Use ssl_enable=True for SSL connections (default for Azure Redis)
try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, ssl=True)
    print("Connected to Azure Cache for Redis!")

    # Set a value
    r.set("user:123:name", "Alice")
    r.set("user:123:email", "alice@example.com")
    print("Set 'user:123:name' and 'user:123:email'")

    # Get a value
    username = r.get("user:123:name").decode('utf-8')
    print(f"Retrieved 'user:123:name': {username}")

    # Set with expiry (e.g., for a session)
    r.setex("session:abc", 3600, "user_id_xyz") # Expires in 1 hour
    print("Set 'session:abc' with an expiry.")

    # Check if a key exists
    if r.exists("user:123:name"):
        print("'user:123:name' exists.")

except Exception as e:
    print(f"Error connecting to Redis: {e}")
```

## 4. Integration and Best Practices

Cosmos DB and Azure Cache for Redis complement each other. Cosmos DB provides persistent, globally distributed NoSQL storage, while Redis Cache acts as a lightning-fast front-end for frequently accessed Cosmos DB data, reducing latency and throughput costs on Cosmos DB.

**Best Practices:**
*   **For Cosmos DB:** Choose an effective partition key, index judiciously, and monitor Request Units (RUs).
*   **For Redis Cache:** Cache data that changes infrequently, use appropriate data structures, and implement proper cache invalidation strategies.

## 5. Checklist/Exercise

1.  **Distinguish Use Cases:** When would you choose Azure Cosmos DB over a traditional relational database like Azure SQL Database, and for what types of data would you use Azure Cache for Redis?
2.  **Cosmos DB API Selection:** If you have an existing application built on MongoDB, which Azure Cosmos DB API would you choose, and why is this beneficial?
3.  **Redis Cache Tiers:** Your application requires VNET integration and data persistence for its caching layer. Which tier of Azure Cache for Redis would you select, and what makes it suitable for these requirements?
