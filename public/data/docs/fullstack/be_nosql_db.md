## NoSQL Databases (MongoDB & Mongoose)

This guide covers NoSQL database concepts, with a deep dive into MongoDB and its interaction with Node.js using Mongoose. We'll explore flexible schema design, essential CRUD operations, advanced data modeling, indexing, aggregation, and basic performance tuning.

### 1. Understanding NoSQL Databases

NoSQL (Not Only SQL) databases provide mechanisms for storage and retrieval of data that are modeled in means other than the tabular relations used in relational databases. They are designed for specific data models and have flexible schemas, making them ideal for handling large volumes of unstructured, semi-structured, and structured data with high performance.

#### Key Characteristics:
*   **Flexible Schema:** Unlike SQL databases, NoSQL databases often do not enforce a fixed schema, allowing for easier evolution of data models.
*   **Scalability:** Typically designed for horizontal scaling, meaning you can distribute data across multiple servers.
*   **High Performance:** Optimized for specific data models and access patterns, leading to faster data operations for certain use cases.
*   **Diverse Data Models:** Different types for different needs (Document, Key-Value, Column-Family, Graph).

#### Use Cases:
*   Real-time web applications
*   Big data analytics
*   Content management systems
*   Mobile applications
*   IoT data

### 2. Introduction to MongoDB

MongoDB is a popular, open-source **document-oriented NoSQL database**. It stores data in flexible, JSON-like documents, which means fields can vary from document to document within a collection. This flexibility is a core advantage.

*   **Document:** A record in MongoDB, similar to a row in a relational database, but with a dynamic schema.
*   **Collection:** A group of MongoDB documents, similar to a table in a relational database.
*   **Database:** A container for collections.

### 3. MongoDB CRUD Operations

CRUD stands for Create, Read, Update, Delete – the four basic operations for persistent storage.

#### Basic MongoDB Shell Commands:

```javascript
// Connect to a database (creates it if it doesn't exist)
use myDatabase;

// 1. CREATE (Insert Documents)
db.users.insertOne({
  name: "Alice",
  age: 30,
  email: "alice@example.com"
});

db.products.insertMany([
  { name: "Laptop", price: 1200, category: "Electronics" },
  { name: "Mouse", price: 25, category: "Electronics" }
]);

// 2. READ (Query Documents)
db.users.find({}); // Find all users
db.users.find({ age: { $gt: 25 } }); // Find users older than 25
db.products.findOne({ name: "Laptop" }); // Find one product by name

// 3. UPDATE (Modify Documents)
db.users.updateOne(
  { name: "Alice" },
  { $set: { age: 31, status: "active" } }
);

db.products.updateMany(
  { category: "Electronics" },
  { $inc: { price: 5 } } // Increase price by 5 for all electronics
);

// 4. DELETE (Remove Documents)
db.users.deleteOne({ name: "Alice" });
db.products.deleteMany({ category: "Electronics" });
```

### 4. Advanced Data Modeling for Document Databases

MongoDB's flexible schema allows for two main approaches to relate data:

*   **Embedding (Denormalization):** Store related data in a single document. This is often preferred for data that is tightly coupled and accessed together, reducing the number of queries needed.
    ```javascript
    // User document with embedded address
    {
      _id: ObjectId("..."),
      name: "Bob",
      email: "bob@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
        zip: "12345"
      }
    }
    ```
*   **Referencing (Normalization):** Store references (IDs) to other documents. Used when data is less frequently accessed together, or when there's a many-to-many relationship, or if embedded data would become too large.
    ```javascript
    // Post document referencing a user
    {
      _id: ObjectId("..."),
      title: "My First Post",
      content: "...",
      author: ObjectId("user_id_here") // Reference to user document
    }
    ```

**Choosing between Embedding and Referencing:** Consider the relationship type, frequency of access, document size limits (16MB in MongoDB), and performance needs.

### 5. Mongoose ODM for Node.js Interaction

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward, schema-based solution to model your application data, enforcing structure and providing validation.

#### Key Features:
*   **Schema Enforcement:** Define the structure of your documents and the types of data they can hold.
*   **Validation:** Built-in and custom validators to ensure data integrity.
*   **Middleware:** Pre and post-hooks for schema operations.
*   **Query Builders:** A rich API for performing database operations.

#### Simple Mongoose Example:

```javascript
const mongoose = require('mongoose');

// 1. Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myAppDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// 2. Define a Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 3. Create a Model from the Schema
const User = mongoose.model('User', userSchema);

// 4. Perform CRUD Operations with Mongoose
async function createUser() {
  try {
    const newUser = new User({
      name: 'Charlie',
      email: 'charlie@example.com',
      age: 28
    });
    const savedUser = await newUser.save(); // Insert/Create
    console.log('User created:', savedUser);

    const users = await User.find({ age: { $gt: 25 } }); // Read
    console.log('Users over 25:', users);

    const updatedUser = await User.updateOne(
      { name: 'Charlie' },
      { $set: { age: 29 } }
    );
    console.log('User updated:', updatedUser);

    const deletedUser = await User.deleteOne({ name: 'Charlie' }); // Delete
    console.log('User deleted:', deletedUser);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createUser();
```

### 6. Indexing Strategies

Indexes are special data structures that store a small portion of the data set in an easy-to-traverse form. They significantly improve the efficiency of read operations (queries) by allowing the database to quickly locate data without scanning every document in a collection.

#### Types of Indexes:
*   **Single-Field Indexes:** Index on a single field (`db.collection.createIndex({ fieldName: 1 })` for ascending, `-1` for descending).
*   **Compound Indexes:** Index on multiple fields (`db.collection.createIndex({ field1: 1, field2: -1 })`).
*   **Unique Indexes:** Ensures that no two documents have the same value for the indexed field (`db.collection.createIndex({ email: 1 }, { unique: true })`).
*   **Text Indexes:** Supports text search queries on string content (`db.collection.createIndex({ description: "text" })`).

**Caution:** While indexes speed up reads, they add overhead to writes (inserts, updates, deletes) because the index must also be updated.

### 7. Aggregation Pipelines

Aggregation operations process data records and return computed results. An aggregation pipeline is a framework for performing multi-stage data processing. Documents pass through a sequence of stages, each of which transforms the documents as they flow through the pipeline.

#### Common Aggregation Stages:
*   `$match`: Filters documents to pass only those that match the specified condition(s).
*   `$group`: Groups documents by some specified expression and outputs a single document for each unique group.
*   `$project`: Reshapes each document in the stream, including or excluding fields, or adding new fields.
*   `$sort`: Reorders the document stream by a specified sort key.
*   `$limit`: Passes the first `N` documents unmodified to the pipeline.
*   `$lookup`: Performs a left outer join to an unsharded collection in the same database to filter in documents from the "joined" collection for processing.

#### Example (Conceptual):
```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$customerId", totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$amount" } } },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
]);
```
This pipeline finds completed orders, groups them by customer, calculates total orders and revenue for each, sorts by revenue, and then shows the top 10 customers.

### 8. Basic Database Administration & Performance Tuning

*   **Monitoring:** Use tools like `mongostat` or `db.serverStatus()` in the MongoDB shell to monitor database activity and resource usage.
*   **Explain Plan:** Use `db.collection.find(...).explain("executionStats")` to understand how MongoDB executes a query, identify bottlenecks, and verify index usage.
*   **Backup & Restore:** Regularly back up your data using `mongodump` and restore with `mongorestore`.
*   **Sharding:** For very large datasets, consider sharding to distribute data across multiple machines, enabling horizontal scaling.
*   **Replica Sets:** Implement replica sets for high availability and data redundancy.

### Checklist/Exercise:

1.  **Schema Design:** You are building a blog platform. Describe how you would model `Post` and `Comment` documents in MongoDB, considering both embedding and referencing. Justify your choice for each relationship.
2.  **Mongoose Query:** Write Mongoose code to find all users whose email domain is `@example.com` and update their status to `"premium"`.
3.  **Indexing Importance:** Explain why creating an index on the `username` field of a `users` collection would be beneficial if your application frequently performs login operations by username. What is a potential drawback?