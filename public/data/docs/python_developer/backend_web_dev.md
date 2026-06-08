# Backend Web Development with Python

Python is one of the most popular languages for building backend services — from simple REST APIs to complex, database-driven web applications. This guide maps out the territory.

---

## The Backend Landscape

A backend service typically handles:

- **API endpoints** — receive requests, process business logic, return responses.
- **Database operations** — persist and retrieve data reliably.
- **Authentication & authorisation** — verify who users are and what they can do.
- **Background tasks** — email sending, report generation, data processing.
- **Security** — protect against injection, CSRF, data leaks, and abuse.

```
Client  ──▶  API Layer  ──▶  Business Logic  ──▶  Database
  ▲                                │
  └──────── JSON Response ◀────────┘
```

---

## Choosing a Framework

| Framework | Strengths | Best For |
|---|---|---|
| **FastAPI** | Async-native, auto OpenAPI docs, Pydantic validation | High-perf APIs, microservices |
| **Django** | Batteries-included (ORM, admin, auth, templating) | Full-stack apps, rapid prototyping |
| **Flask** | Minimal, flexible, huge ecosystem | Small services, learning |
| **Django REST Framework** | Powerful serialisation, browsable API | REST APIs on top of Django |

### Quick FastAPI Example

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"id": user_id, "name": "Alice"}
```

### Quick Django View

```python
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok"})
```

---

## REST API Design Principles

1. **Use nouns, not verbs** — `GET /users` not `GET /getUsers`.
2. **HTTP methods matter** — `GET` reads, `POST` creates, `PUT/PATCH` updates, `DELETE` removes.
3. **Status codes are communication** — `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`.
4. **Version your API** — `/api/v1/users`.
5. **Paginate large collections** — `?page=2&limit=20`.
6. **Return consistent error shapes** — `{ "detail": "Not found" }`.

---

## Database Integration

Most Python web apps use an **ORM** (Object-Relational Mapper) to interact with the database in Python objects rather than raw SQL.

| ORM | Framework |
|---|---|
| SQLAlchemy | Framework-agnostic (works great with FastAPI, Flask) |
| Django ORM | Built into Django |
| Tortoise ORM | Async-first, inspired by Django ORM |

Key database topics to master:

- **SQL fundamentals** — SELECT, JOIN, GROUP BY, subqueries.
- **Migrations** — Alembic (SQLAlchemy) or Django migrations.
- **Indexing** — speed up frequent queries.
- **Connection pooling** — avoid exhausting database connections under load.
- **Transactions** — ensure data consistency.

---

## Security Essentials

- **Authentication** — JWT tokens, OAuth 2.0, session-based auth.
- **Authorisation** — role-based access control (RBAC), permissions.
- **Input validation** — Pydantic models (FastAPI) or Django forms.
- **CORS** — control which domains can call your API.
- **Rate limiting** — prevent abuse (e.g., `slowapi` for FastAPI).
- **HTTPS** — always encrypt data in transit.

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token=Depends(security)):
    user = decode_token(token.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user
```

---

## Learning Path

1. **Start with one framework** — FastAPI is great for modern API-first work; Django if you want a full-stack solution.
2. **Build a CRUD API** — users, posts, or products with a real database.
3. **Add authentication** — JWT or session-based.
4. **Deploy it** — even a free-tier cloud deployment teaches you a lot.
5. **Read the OWASP Top 10** — understand real-world attack vectors.

---

## Checklist & Exercises

- [ ] Build a REST API with at least 4 CRUD endpoints using FastAPI or Django, backed by a PostgreSQL database.
- [ ] Implement JWT-based authentication on your API and test it with `httpx` or Postman.
- [ ] Write a middleware that logs every request's method, path, and response time.
