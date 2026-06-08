# Final Project: Production-Ready Backend Service

This is where everything comes together. You'll build a complete, deployable backend service that demonstrates mastery of Python web development, databases, security, testing, DevOps, and cloud deployment.

---

## Project Overview

Build a **Task Management API** — a real-world service that includes every skill from this roadmap.

### Core Features

| Feature | Skills Demonstrated |
|---|---|
| User registration & login | Auth (JWT), password hashing, input validation |
| CRUD for projects & tasks | REST API design, Pydantic models, routing |
| Role-based access | RBAC, middleware, authorisation |
| Task assignment & status tracking | Database relations, business logic |
| File attachments | Cloud storage (S3), file upload handling |
| Email notifications | Background tasks (Celery), SMTP integration |
| Search & filtering | Query optimisation, pagination |
| API documentation | OpenAPI / Swagger auto-generation |

---

## Recommended Tech Stack

```
FastAPI          → Web framework
PostgreSQL       → Primary database
Redis            → Caching + Celery broker
SQLAlchemy       → ORM
Alembic          → Database migrations
Celery           → Background tasks
pytest           → Testing
Docker Compose   → Local development
GitHub Actions   → CI/CD
Render / AWS     → Cloud deployment
```

---

## Project Structure

```
task-manager/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py             # Environment configuration
│   ├── database.py           # DB connection & session
│   ├── auth/
│   │   ├── router.py         # Login, register endpoints
│   │   ├── service.py        # Token creation, password hashing
│   │   └── dependencies.py   # get_current_user dependency
│   ├── projects/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py         # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   ├── tasks/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── workers/
│       └── email_tasks.py    # Celery tasks
├── tests/
│   ├── conftest.py           # Shared fixtures
│   ├── test_auth.py
│   ├── test_projects.py
│   └── test_tasks.py
├── alembic/                  # Migration files
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## Implementation Milestones

### Phase 1: Foundation (Days 1–2)

```python
# src/main.py
from fastapi import FastAPI
from src.auth.router import router as auth_router
from src.projects.router import router as projects_router
from src.tasks.router import router as tasks_router

app = FastAPI(title="Task Manager API", version="1.0.0")

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks_router, prefix="/api/v1/tasks", tags=["tasks"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

- Set up project structure, FastAPI app, database connection.
- Create SQLAlchemy models for users, projects, tasks.
- Run initial Alembic migration.

### Phase 2: Core API (Days 3–5)

- Implement CRUD for projects and tasks.
- Add JWT authentication with access + refresh tokens.
- Add RBAC (admin, manager, member roles).
- Add pagination, filtering, and sorting.

### Phase 3: Advanced Features (Days 6–7)

- Background email notifications via Celery.
- File upload to S3 / local storage.
- Redis caching for frequently accessed data.
- Rate limiting on auth endpoints.

### Phase 4: Testing & Quality (Days 8–9)

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    client.post("/api/v1/auth/register", json={...})
    resp = client.post("/api/v1/auth/login", json={...})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

- Write unit tests for services.
- Write integration tests for API endpoints.
- Achieve 80%+ code coverage.
- Add type checking with Mypy.

### Phase 5: DevOps & Deployment (Days 10–12)

- Write Dockerfile with multi-stage build.
- Create `docker-compose.yml` for local dev.
- Set up GitHub Actions CI pipeline.
- Add structured logging and Prometheus metrics.
- Deploy to Render/AWS with a managed database.

---

## API Documentation

FastAPI generates OpenAPI docs automatically. Enhance them:

```python
@app.post(
    "/api/v1/tasks",
    response_model=TaskResponse,
    status_code=201,
    summary="Create a new task",
    description="Create a task within a project. Requires authentication.",
)
async def create_task(task: TaskCreate, user=Depends(get_current_user)):
    ...
```

Visit `/docs` for interactive Swagger UI and `/redoc` for clean documentation.

---

## Performance Tuning

- **Profile slow endpoints** with `cProfile` or `py-spy`.
- **Optimise N+1 queries** with SQLAlchemy `joinedload()`.
- **Add database indexes** on frequently queried columns.
- **Use connection pooling** — configure SQLAlchemy pool settings.
- **Cache hot data** in Redis with appropriate TTLs.
- **Use async** for I/O-bound endpoints.

---

## Checklist & Exercises

- [ ] Complete all 5 phases and deploy a live, working Task Manager API with a public URL.
- [ ] Write a comprehensive README documenting setup, API endpoints, architecture decisions, and deployment instructions.
- [ ] Record a 5-minute demo video walking through the API, tests, CI pipeline, and live deployment — perfect for your portfolio.
