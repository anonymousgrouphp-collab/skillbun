# Database Management & ORMs

Databases are the backbone of almost every backend application. This guide covers relational database fundamentals, Python ORMs, and the practical skills you need to build data-driven services.

---

## Relational Database Fundamentals

### SQL Essentials

```sql
-- Create a table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Common queries
SELECT * FROM users WHERE name ILIKE '%alice%';
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
UPDATE users SET name = 'Alice B.' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

### Key Concepts

| Concept | Why It Matters |
|---|---|
| **Normalisation** (1NF → 3NF) | Eliminate data redundancy |
| **Indexes** | Speed up reads on frequently queried columns |
| **Foreign keys** | Enforce referential integrity |
| **Transactions** | ACID guarantees — all-or-nothing operations |
| **Joins** | Combine data across related tables |

---

## PostgreSQL — The Go-To Choice

PostgreSQL is the most recommended database for Python backends:

- Advanced data types (JSONB, arrays, full-text search).
- Robust concurrency with MVCC.
- Excellent Python driver support (`psycopg`, `asyncpg`).

```bash
# Connect via psql
psql -U postgres -d mydb
```

---

## SQLAlchemy — The Python ORM

SQLAlchemy works with FastAPI, Flask, and standalone scripts.

### Defining Models

```python
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
```

### Querying

```python
from sqlalchemy import select

# Modern "2.0 style" query
stmt = select(User).where(User.email == "alice@example.com")
user = session.execute(stmt).scalar_one_or_none()

# Filtering, ordering, pagination
stmt = (
    select(User)
    .where(User.name.ilike("%ali%"))
    .order_by(User.created_at.desc())
    .limit(20)
    .offset(0)
)
```

### Migrations with Alembic

```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "add users table"
alembic upgrade head
```

Alembic tracks schema changes in version-controlled migration files — essential for team collaboration and production deployments.

---

## Django ORM

If you're using Django, the ORM is built in:

```python
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    views = models.IntegerField(default=0)

# Querying
Article.objects.filter(views__gte=100).order_by("-views")[:10]
```

---

## Connection Pooling

Opening a new database connection per request is expensive. Use connection pooling:

```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=10,          # maintain 10 connections
    max_overflow=20,       # allow up to 20 more under load
    pool_recycle=3600,     # recycle connections after 1 hour
)
```

---

## NoSQL & Caching Overview

| Technology | Type | Use Case |
|---|---|---|
| **MongoDB** | Document store | Flexible schemas, rapid prototyping |
| **Redis** | In-memory key-value | Caching, sessions, rate limiting |
| **Elasticsearch** | Search engine | Full-text search, analytics |

```python
import redis

r = redis.Redis(host="localhost", port=6379)
r.set("user:1:name", "Alice", ex=3600)  # expires in 1 hour
name = r.get("user:1:name")
```

---

## Query Optimisation Tips

1. **Use EXPLAIN ANALYZE** to understand query plans.
2. **Add indexes** on columns used in WHERE, JOIN, ORDER BY.
3. **Avoid N+1 queries** — use `joinedload()` (SQLAlchemy) or `select_related()` (Django).
4. **Paginate** — never fetch unbounded result sets.
5. **Use read replicas** for heavy read workloads.

---

## Checklist & Exercises

- [ ] Design a database schema for a blog (users, posts, comments, tags) normalised to 3NF, then implement it with SQLAlchemy models.
- [ ] Write an Alembic migration that adds a new column to an existing table and verify it applies cleanly.
- [ ] Set up Redis as a cache layer in front of a slow database query and measure the performance improvement.
