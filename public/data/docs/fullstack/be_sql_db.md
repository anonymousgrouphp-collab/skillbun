## Relational Databases (PostgreSQL & ORMs)

Relational databases are fundamental to most modern applications, providing a structured and reliable way to store and manage data. This guide covers the core concepts, advanced SQL techniques, database design principles, and modern integration methods using Object-Relational Mappers (ORMs) like Prisma with Node.js.

### 1. Introduction to Relational Databases

Relational databases organize data into one or more tables (or "relations") of rows and columns. Each table stores data about a specific entity (e.g., `users`, `products`), and relationships between these entities are defined using foreign keys.

**Key Characteristics:**
*   **Structured Data**: Data is organized into predefined schemas.
*   **ACID Properties**: Ensures reliability of database transactions:
    *   **Atomicity**: All or nothing.
    *   **Consistency**: Transactions bring the database from one valid state to another.
    *   **Isolation**: Concurrent transactions yield the same results as if they were executed sequentially.
    *   **Durability**: Committed transactions persist even in case of system failure.
*   **Strong Schema**: Data types and constraints are strictly enforced, ensuring data integrity.

**PostgreSQL**: A powerful, open-source object-relational database system known for its robustness, feature set, and high performance. It's an excellent choice for full-stack applications due to its compliance with SQL standards and extensibility.

### 2. Advanced SQL Querying

SQL (Structured Query Language) is the standard language for interacting with relational databases. Beyond basic CRUD operations, advanced SQL allows for complex data retrieval and manipulation.

*   **CRUD Operations (Review)**:
    *   `INSERT`: Add new rows.
    *   `SELECT`: Retrieve data.
    *   `UPDATE`: Modify existing rows.
    *   `DELETE`: Remove rows.

    ```sql
    -- Create a table
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
    );

    -- Insert data
    INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

    -- Select data
    SELECT id, name FROM users WHERE email = 'alice@example.com';

    -- Update data
    UPDATE users SET name = 'Alicia' WHERE id = 1;

    -- Delete data
    DELETE FROM users WHERE id = 1;
    ```

*   **Joins**: Combine rows from two or more tables based on a related column between them.
    *   `INNER JOIN`: Returns rows when there is a match in both tables.
    *   `LEFT JOIN` (or `LEFT OUTER JOIN`): Returns all rows from the left table, and the matching rows from the right table. If no match, NULLs for right table columns.
    *   `RIGHT JOIN` (or `RIGHT OUTER JOIN`): Similar to LEFT JOIN, but returns all rows from the right table.
    *   `FULL JOIN` (or `FULL OUTER JOIN`): Returns all rows when there is a match in one of the tables.

    ```sql
    SELECT u.name, p.title
    FROM users u
    INNER JOIN posts p ON u.id = p.user_id;
    ```

*   **Aggregations & Grouping**: Functions like `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()` to perform calculations on sets of rows. `GROUP BY` groups rows that have the same values in specified columns into summary rows, and `HAVING` filters these groups.

    ```sql
    SELECT user_id, COUNT(id) AS post_count
    FROM posts
    GROUP BY user_id
    HAVING COUNT(id) > 2;
    ```

*   **Subqueries**: A query nested inside another SQL query. Used to return data that will be used in the main query as a condition.

    ```sql
    SELECT name FROM users
    WHERE id IN (SELECT user_id FROM posts WHERE published = TRUE);
    ```

*   **Views**: A virtual table based on the result-set of a SQL query. A view contains rows and columns, just like a real table, but its data is not physically stored; it's computed dynamically when the view is queried.

    ```sql
    CREATE VIEW active_users_view AS
    SELECT id, name, email FROM users WHERE status = 'active';

    SELECT * FROM active_users_view;
    ```

*   **Stored Procedures/Functions**: Pre-compiled SQL code that can be executed repeatedly. While powerful, modern applications often prefer to keep business logic in the application layer, reducing reliance on database-specific procedures.

### 3. Database Design Principles

Effective database design is crucial for data integrity, performance, and scalability.

*   **Normalization**: The process of organizing data in a database to reduce data redundancy and improve data integrity. It involves breaking down large tables into smaller, more manageable tables and defining relationships between them.
    *   **1NF (First Normal Form)**: Each column contains atomic (indivisible) values, and there are no repeating groups of columns.
    *   **2NF (Second Normal Form)**: Is in 1NF and all non-key attributes are fully functionally dependent on the primary key (no partial dependencies).
    *   **3NF (Third Normal Form)**: Is in 2NF and all non-key attributes are not transitively dependent on the primary key (no dependencies on other non-key attributes).

*   **Indexing**: A database index is a data structure that improves the speed of data retrieval operations on a database table. It acts like an index in a book, allowing the database to quickly locate data without scanning every row. Over-indexing can slow down write operations.

*   **Relationships**: Define how tables are connected.
    *   **One-to-One**: A row in `TableA` is linked to exactly one row in `TableB` (e.g., `users` and `user_profiles`). Implemented using a foreign key with a unique constraint.
    *   **One-to-Many**: A row in `TableA` can be linked to multiple rows in `TableB`, but a row in `TableB` is linked to only one row in `TableA` (e.g., `users` and `posts`). Implemented using a foreign key in `TableB` referencing `TableA`'s primary key.
    *   **Many-to-Many**: A row in `TableA` can be linked to multiple rows in `TableB`, and vice versa (e.g., `students` and `courses`). Implemented using a junction (or pivot) table that contains foreign keys from both `TableA` and `TableB`.

### 4. Object-Relational Mappers (ORMs)

ORMs provide a bridge between object-oriented programming languages (like JavaScript/TypeScript) and relational databases. They allow developers to interact with database tables using familiar object-oriented syntax, abstracting away raw SQL queries.

**Benefits of ORMs:**
*   **Reduced Boilerplate**: Less manual SQL writing.
*   **Type Safety**: Can leverage language type systems (e.g., TypeScript) for compile-time error checking.
*   **Easier Maintenance**: Code is often more readable and maintainable.
*   **Database Agnostic (to an extent)**: Can switch databases with minimal code changes.

**Prisma**: A modern, open-source ORM for Node.js and TypeScript. It uses a schema definition language to define models and relations, generates a type-safe client, and provides powerful migration tools.

**Integration with Node.js**: ORMs allow you to define your database schema using code, generate client libraries, and then perform CRUD and complex queries directly from your Node.js application using object methods, rather than raw SQL strings.

### 5. Advanced Database Concepts

*   **Database Migrations**: A system for managing incremental, reversible changes to your database schema. As your application evolves, you'll need to add new tables, columns, or modify existing ones. Migration tools (like Prisma Migrate or Sequelize Migrations) track these changes, allowing you to upgrade and downgrade your database schema reliably across different environments.

*   **Transactions**: A sequence of operations performed as a single logical unit of work. Transactions ensure data integrity by adhering to ACID properties. If any operation within a transaction fails, the entire transaction is rolled back, leaving the database in its original state.

### Code Example: Prisma with Node.js

Below is a simple `schema.prisma` file defining `User` and `Post` models, followed by a Node.js script using Prisma Client to interact with the database.

```prisma
// schema.prisma
// This file defines your Prisma schema,
// which specifies your database connection and data models.

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Load from environment variable
}

generator client {
  provider = "prisma-client-js" // Generate Prisma Client for Node.js
}

// Define your data models
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]  // One-to-many relation: a User can have many Posts
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id]) // Relation to User model
  authorId  Int      // Foreign key to User
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```javascript
// index.js (Node.js application code using Prisma Client)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(); // Instantiate Prisma Client

async function main() {
  // 1. Create a new user with some posts
  const newUser = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      posts: {
        create: [
          { title: 'My First Prisma Post', content: 'Learning about ORMs.' },
          { title: 'Database Migrations Explained', published: true },
        ],
      },
    },
  });
  console.log('Created new user and posts:', newUser);

  // 2. Fetch all users, including their posts
  const allUsersWithPosts = await prisma.user.findMany({
    include: { posts: true }, // Eager loading related posts
  });
  console.log('\nAll users with their posts:');
  console.log(JSON.stringify(allUsersWithPosts, null, 2));

  // 3. Update a post
  const updatedPost = await prisma.post.update({
    where: { id: allUsersWithPosts[0].posts[0].id },
    data: { published: true },
  });
  console.log('\nUpdated post:', updatedPost);

  // 4. Delete a user (and related posts due to cascade if defined in DB or Prisma)
  // In this Prisma schema, deleting a user will fail if there are related posts unless configured differently.
  // For demonstration, let's say we clean up posts first or have cascade delete enabled.
  // const deletedUser = await prisma.user.delete({
  //   where: { id: newUser.id },
  // });
  // console.log('\nDeleted user:', deletedUser);

} 

// Execute the main function and handle errors/disconnection
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Disconnect Prisma Client when done
  });
```

### Checklist/Exercise:

1.  Explain the purpose of database normalization and describe the difference between 2NF and 3NF, providing a simple example for each that violates the rule.
2.  Write a SQL query that retrieves the `name` and `email` of all users who have published at least one post with the word "Prisma" in its title, along with the count of such posts for each user. (Assume `users` and `posts` tables with `user_id` foreign key).
3.  Describe how an ORM like Prisma simplifies database interactions in a Node.js application compared to writing raw SQL, specifically highlighting benefits related to type safety and database migration management.