# Continuous Integration & Deployment (CI/CD)

CI/CD automates the build-test-deploy cycle so every code change is validated and shipped reliably. This guide focuses on practical pipeline setup for Python projects.

---

## What Is CI/CD?

| Stage | What Happens | Goal |
|---|---|---|
| **Continuous Integration** | Every push triggers automated tests + checks | Catch bugs early |
| **Continuous Delivery** | Passing builds are *ready* to deploy | Always shippable |
| **Continuous Deployment** | Passing builds are *automatically* deployed | Zero manual releases |

---

## GitHub Actions — The Most Popular CI for Python

### Basic Python CI Workflow

```yaml
# .github/workflows/ci.yml
name: Python CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint with Ruff
        run: ruff check src/

      - name: Type check with Mypy
        run: mypy src/ --strict

      - name: Run tests
        run: pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: coverage.xml
```

### Adding a Deploy Step

```yaml
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # ssh deploy, docker push, or cloud CLI
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

---

## Pipeline Best Practices

### 1. Fast Feedback

- Run linting first (fails in seconds).
- Parallelise test suites where possible.
- Cache pip dependencies to speed up installs.

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements*.txt') }}
```

### 2. Test Matrix

Test across multiple Python versions and operating systems to catch compatibility issues:

```yaml
strategy:
  matrix:
    python-version: ["3.11", "3.12", "3.13"]
    os: [ubuntu-latest, windows-latest]
```

### 3. Branch Protection

Configure GitHub to **require CI to pass** before merging PRs:

- Settings → Branches → Branch protection rules → Require status checks.

### 4. Secrets Management

- Store API keys, deploy tokens, and credentials in **GitHub Secrets**.
- Never hardcode secrets in workflow files.
- Use `${{ secrets.SECRET_NAME }}` to reference them.

---

## Other CI/CD Tools

| Tool | Strengths |
|---|---|
| **GitLab CI** | Built into GitLab, powerful pipelines-as-code |
| **Jenkins** | Self-hosted, highly extensible, huge plugin ecosystem |
| **CircleCI** | Fast, Docker-first, good caching |
| **AWS CodePipeline** | Native AWS integration |

### GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy

test:
  stage: test
  image: python:3.12
  script:
    - pip install -r requirements.txt
    - pytest --cov=src

deploy:
  stage: deploy
  only:
    - main
  script:
    - ./deploy.sh
```

---

## Release & Rollback Strategies

| Strategy | Description |
|---|---|
| **Blue-Green** | Run two identical environments; switch traffic |
| **Canary** | Route a small % of traffic to the new version first |
| **Rolling** | Gradually replace old instances with new ones |
| **Feature Flags** | Deploy code but toggle features on/off |

Always have a **rollback plan**: keep the previous Docker image tagged, database migrations reversible, and deploy scripts that can revert.

---

## Artefact Management

- **Docker images** → push to Docker Hub, GitHub Container Registry, or AWS ECR.
- **Python packages** → publish to PyPI or a private index.
- **Build outputs** → store as GitHub Actions artefacts for debugging.

---

## Checklist & Exercises

- [ ] Set up a GitHub Actions workflow for a Python project that runs linting, type checking, and tests on every PR.
- [ ] Add pip caching to your CI workflow and compare build times before and after.
- [ ] Configure branch protection rules that require CI to pass before merging to `main`.
