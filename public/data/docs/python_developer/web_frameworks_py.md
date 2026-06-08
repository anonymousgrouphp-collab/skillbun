# Web Frameworks & API Design (FastAPI / Django)

Choosing and mastering a web framework is the core skill for any Python backend developer. This guide covers FastAPI and Django — the two dominant choices — with practical patterns you'll use daily.

---

## FastAPI — Modern, Async, Auto-Documented

### Project Setup

```bash
pip install "fastapi[standard]"
uvicorn main:app --reload
```

### Request Validation with Pydantic

FastAPI uses Pydantic models for **automatic request validation and serialisation**.

```python
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI, HTTPException

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: int

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    if user.age < 13:
        raise HTTPException(400, "Must be 13 or older")
    return {"id": 1, **user.model_dump()}
```

Invalid requests automatically return a `422 Unprocessable Entity` with detailed errors — no manual validation code needed.

### Dependency Injection

```python
from fastapi import Depends

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items")
async def list_items(db=Depends(get_db)):
    return db.query(Item).all()
```

### Background Tasks

```python
from fastapi import BackgroundTasks

def send_email(to: str, body: str):
    # slow I/O operation
    ...

@app.post("/signup")
async def signup(user: UserCreate, bg: BackgroundTasks):
    bg.add_task(send_email, user.email, "Welcome!")
    return {"status": "created"}
```

### Auto-Generated Docs

Visit `/docs` (Swagger UI) or `/redoc` — FastAPI generates interactive API documentation from your type hints automatically.

---

## Django — The Batteries-Included Framework

### Project Setup

```bash
pip install django djangorestframework
django-admin startproject mysite
python manage.py startapp api
```

### Models → Migrations → Admin

```python
# api/models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    published = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Django REST Framework (DRF)

```python
# api/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"

# api/views.py
from rest_framework import viewsets
from .models import Article
from .serializers import ArticleSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
```

DRF gives you a full CRUD API in ~15 lines, including a browsable API interface.

---

## API Design Best Practices

| Practice | Example |
|---|---|
| Use plural resource names | `/api/v1/users` |
| Return appropriate status codes | `201` for created, `204` for deleted |
| Support filtering & pagination | `?status=active&page=2` |
| Use consistent error format | `{"detail": "...", "code": "..."}` |
| Version your API | `/api/v1/`, `/api/v2/` |
| Document everything | OpenAPI / Swagger |

### Middleware

Both frameworks support middleware for cross-cutting concerns:

```python
# FastAPI middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## When to Choose Which?

| Scenario | Recommendation |
|---|---|
| Pure API / microservice | FastAPI |
| Full-stack with admin panel | Django |
| Real-time / WebSocket heavy | FastAPI |
| Rapid MVP with auth & ORM | Django |
| High-concurrency async service | FastAPI |

---

## Checklist & Exercises

- [ ] Build a complete CRUD API in FastAPI with Pydantic models, dependency injection for DB sessions, and auto-generated Swagger docs.
- [ ] Build the same API in Django REST Framework and compare the development experience.
- [ ] Add pagination, filtering by query parameter, and proper error responses to your API.
