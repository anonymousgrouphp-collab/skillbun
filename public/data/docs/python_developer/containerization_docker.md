# Containerization with Docker

Docker packages your Python application and all its dependencies into a single, portable container that runs the same way everywhere — on your laptop, in CI, and in production.

---

## Why Docker?

| Problem | Docker Solution |
|---|---|
| "Works on my machine" | Identical environment everywhere |
| Dependency conflicts | Isolated containers, separate from host |
| Complex setup docs | Single `Dockerfile` + `docker-compose.yml` |
| Inconsistent deploys | Same image in dev, staging, and production |

---

## Dockerfile Basics

```dockerfile
# Use an official Python slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies first (leverage layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Expose the port your app listens on
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build & Run

```bash
docker build -t my-api:latest .
docker run -d -p 8000:8000 --name my-api my-api:latest
curl http://localhost:8000/health
```

---

## Multi-Stage Builds

Reduce image size by separating build and runtime stages.

```dockerfile
# Stage 1: Build
FROM python:3.12 AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ ./src/
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

This can cut your image size from ~1 GB to under 200 MB.

---

## Docker Compose

Orchestrate multi-container setups for local development.

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

```bash
docker compose up -d        # start all services
docker compose logs -f api  # follow API logs
docker compose down         # stop everything
```

---

## Essential Docker Commands

```bash
docker ps                      # list running containers
docker images                  # list local images
docker exec -it my-api bash    # shell into a container
docker logs my-api --tail 50   # view recent logs
docker stop my-api             # stop a container
docker system prune            # clean up unused resources
```

---

## Best Practices

1. **Use `.dockerignore`** — exclude `.venv`, `__pycache__`, `.git`, `.env`.
2. **Pin base image versions** — `python:3.12-slim`, not `python:latest`.
3. **Copy requirements first** — leverage Docker's layer cache so dependency installs don't re-run on every code change.
4. **Run as non-root** — add `RUN useradd appuser && USER appuser`.
5. **Use health checks** — `HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1`.
6. **Keep images small** — use `-slim` or `-alpine` base images, multi-stage builds.

### .dockerignore

```
.venv/
__pycache__/
.git/
.env
*.pyc
.mypy_cache/
.pytest_cache/
```

---

## Security Considerations

- **Don't store secrets in images** — use environment variables or Docker secrets.
- **Scan images for vulnerabilities** — use `docker scout` or Trivy.
- **Update base images regularly** — patch known CVEs.
- **Limit container capabilities** — use `--cap-drop ALL` and add only what's needed.

---

## Pushing to a Registry

```bash
# Docker Hub
docker tag my-api:latest yourusername/my-api:1.0.0
docker push yourusername/my-api:1.0.0

# GitHub Container Registry
docker tag my-api:latest ghcr.io/yourusername/my-api:1.0.0
docker push ghcr.io/yourusername/my-api:1.0.0
```

---

## Checklist & Exercises

- [ ] Write a Dockerfile for a FastAPI app with multi-stage build, achieving an image under 200 MB.
- [ ] Create a `docker-compose.yml` that runs your API, PostgreSQL, and Redis together, and verify the API can connect to both services.
- [ ] Add a health check to your Dockerfile and verify Docker reports the container as "healthy".
