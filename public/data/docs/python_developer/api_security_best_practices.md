# API Security & Best Practices

Security is not a feature you bolt on at the end — it's woven into every layer of your API. This guide covers the essential patterns for protecting Python web services.

---

## Authentication vs Authorisation

| Concept | Question It Answers | Example |
|---|---|---|
| **Authentication** | *Who are you?* | Login with username + password |
| **Authorisation** | *What can you do?* | Admin can delete users; viewer cannot |

---

## JWT (JSON Web Tokens)

JWTs are the most common token format for stateless API authentication.

```python
import jwt
from datetime import datetime, timedelta, timezone

SECRET = "your-secret-key"

def create_token(user_id: int) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=["HS256"])
```

### JWT Best Practices

- Keep tokens **short-lived** (15 min–1 hour).
- Use **refresh tokens** for long sessions (stored in HTTP-only cookies).
- Never store JWTs in `localStorage` — use `httpOnly` cookies to prevent XSS theft.
- Always **validate the `exp` claim** server-side.

---

## OAuth 2.0

OAuth lets users authenticate via third-party providers (Google, GitHub) without sharing passwords.

```
User  ──▶  Your App  ──▶  Google Auth Server
                               │
                          Access Token
                               │
User  ◀──  Your App  ◀────────┘
```

Use libraries like `authlib` or `python-social-auth` instead of implementing OAuth from scratch.

---

## Role-Based Access Control (RBAC)

```python
from enum import Enum
from fastapi import Depends, HTTPException

class Role(str, Enum):
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"

def require_role(*roles: Role):
    def checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return current_user
    return checker

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, user=Depends(require_role(Role.ADMIN))):
    ...
```

---

## Input Validation

**Never trust client input.** Use Pydantic (FastAPI) or Django forms to validate everything.

```python
from pydantic import BaseModel, Field, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    age: int = Field(ge=13, le=120)
```

This prevents type confusion, injection attacks, and malformed data from reaching your business logic.

---

## Common Attack Vectors & Defences

| Attack | Defence |
|---|---|
| **SQL Injection** | Use ORMs or parameterised queries — never string-format SQL |
| **XSS** | Escape output, use Content-Security-Policy headers |
| **CSRF** | Use CSRF tokens (Django has built-in support) |
| **Brute Force** | Rate limiting + account lockout |
| **Data Exposure** | Never return sensitive fields (passwords, internal IDs) |

---

## Rate Limiting

```python
# FastAPI with slowapi
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/search")
@limiter.limit("10/minute")
async def search(request: Request, q: str):
    ...
```

---

## CORS (Cross-Origin Resource Sharing)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # NOT "*" in production
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Secret Management

- **Never hardcode secrets** in source code.
- Use environment variables: `os.environ["DATABASE_URL"]`.
- Use `.env` files with `python-dotenv` for local dev (add `.env` to `.gitignore`).
- In production, use a secrets manager (AWS Secrets Manager, HashiCorp Vault).

---

## HTTPS

Always enforce HTTPS in production. Your API should:

1. Redirect HTTP → HTTPS.
2. Set `Strict-Transport-Security` header.
3. Use TLS 1.2+ with strong cipher suites.

---

## Checklist & Exercises

- [ ] Implement JWT auth with access + refresh token flow in a FastAPI app, storing refresh tokens in HTTP-only cookies.
- [ ] Add RBAC middleware that restricts `DELETE` endpoints to admin users only.
- [ ] Run your API through the OWASP Top 10 checklist and fix any issues you find.
