# NoSQL Databases Concepts

## Introduction to NoSQL Databases

NoSQL, standing for "Not Only SQL," refers to a class of non-relational database management systems that provide a mechanism for storage and retrieval of data that is modeled in means other than the tabular relations used in traditional relational databases. NoSQL databases are often used in big data and real-time web applications.

### Why NoSQL?

The rise of NoSQL databases was driven by the limitations of traditional RDBMS in handling modern application requirements:

*   **Scalability:** RDBMS typically scale vertically (more powerful server), while NoSQL databases often scale horizontally (more servers), which is more cost-effective and elastic for large datasets and high traffic.
*   **Flexibility:** NoSQL databases often have flexible schema designs, allowing for rapid development and iteration with evolving data structures, unlike the rigid schemas of RDBMS.
*   **Performance:** Optimized for specific data models and access patterns, NoSQL databases can offer superior performance for certain types of operations.
*   **Diverse Data Models:** They support a variety of data models beyond the tabular, catering to different application needs (e.g., key-value, document, graph, column-family).

## Comparison: RDBMS vs. NoSQL

| Feature           | Relational Databases (RDBMS)                           | NoSQL Databases                                    |
| :---------------- | :----------------------------------------------------- | :------------------------------------------------- |
| **Data Model**    | Tabular, structured via schemas, normalized            | Key-value, Document, Column-family, Graph, flexible|
| **Schema**        | Fixed, predefined, rigid                               | Dynamic, flexible, schema-less or fluid schema     |
| **Scalability**   | Primarily vertical scaling                             | Primarily horizontal scaling                       |
| **ACID Properties** | Strong ACID (Atomicity, Consistency, Isolation, Durability) | BASE (Basically Available, Soft state, Eventually consistent) for most|
| **Query Language**| SQL (Structured Query Language)                        | Varies (API-based, query languages specific to DB) |
| **Joins**         | Strong support for complex joins                       | Limited or no join support, denormalized data      |
| **Use Cases**     | Transactional applications, complex queries, financial systems | Big data, real-time apps, content management, user profiles, IoT, social networks |

## Types of NoSQL Databases

NoSQL databases are categorized by their fundamental data models:

### 1. Key-Value Stores

*   **Concept:** The simplest NoSQL data model. Data is stored as a collection of key-value pairs, where each key is unique and maps to a value. The value can be anything from a simple string to a complex object, but the database doesn't understand the structure of the value.
*   **Use Cases in Data Engineering:** Caching (e.g., session data, frequently accessed items), leaderboards, user preferences, real-time data ingestion.
*   **Examples:** Redis, Amazon DynamoDB (often used as key-value), Memcached.

#### Example: Redis (Key-Value)

Setting and retrieving a value:

```python
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

r.set('user:100:name', 'Alice')
r.set('product:500:price', '29.99')

print(r.get('user:100:name').decode('utf-8'))
# Output: Alice
```

### 2. Document Databases

*   **Concept:** Stores semi-structured data in document-like formats, typically JSON, BSON, or XML. Each document is self-contained and can have varying structures, making them highly flexible. Documents are often grouped into collections.
*   **Use Cases in Data Engineering:** Content management systems, catalogs, user profiles, e-commerce product data, logging and analytics.
*   **Examples:** MongoDB, Couchbase, Apache CouchDB.

#### Example: MongoDB (Document)

Inserting a document into a collection:

```javascript
// Using MongoDB Shell
db.users.insertOne({
  name: 