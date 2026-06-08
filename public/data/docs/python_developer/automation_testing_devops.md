# Automation, Testing & DevOps Fundamentals

Building software is only half the job — the other half is ensuring it works reliably, ships continuously, and runs smoothly in production. This guide introduces the testing, automation, and DevOps practices that separate hobbyist code from professional-grade systems.

---

## The Three Pillars

### 1. Testing — Does it work?

Automated tests catch bugs before users do. A well-tested codebase gives you the confidence to refactor, add features, and deploy without fear.

### 2. Automation — Is the workflow repeatable?

Manual steps invite human error. Automate builds, tests, deployments, and routine operations.

### 3. Observability — Can you see what's happening?

Logs, metrics, and traces let you understand production behaviour and diagnose issues fast.

```
Code ──▶ Test ──▶ Build ──▶ Deploy ──▶ Monitor ──▶ Feedback
  ▲                                                    │
  └────────────────────────────────────────────────────┘
```

---

## Testing Pyramid

| Layer | Speed | Scope | Tools |
|---|---|---|---|
| **Unit tests** | ⚡ Fast | Single function/class | `pytest`, `unittest` |
| **Integration tests** | 🔄 Medium | Multiple components + DB | `pytest` + test DB |
| **End-to-end tests** | 🐢 Slow | Full API/UI flow | `httpx`, Playwright |

> **Rule:** lots of unit tests, fewer integration tests, minimal E2E tests.

---

## CI/CD — The Automation Pipeline

Continuous Integration (CI) runs your tests automatically on every push. Continuous Deployment (CD) ships passing code to production.

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest --cov=src
```

---

## Scripting & Task Automation

Python excels at automating repetitive tasks:

- **CLI tools** — build with `typer` or `click`.
- **Web scraping** — extract data with `BeautifulSoup` or `Scrapy`.
- **File operations** — batch rename, parse logs, transform CSVs.
- **Background jobs** — process queues with Celery or RQ.
- **Scheduled tasks** — cron jobs, APScheduler.

```python
import typer

app = typer.Typer()

@app.command()
def deploy(env: str = "staging", dry_run: bool = False):
    """Deploy the application to the target environment."""
    if dry_run:
        typer.echo(f"[DRY RUN] Would deploy to {env}")
    else:
        typer.echo(f"Deploying to {env}...")
        # actual deploy logic

if __name__ == "__main__":
    app()
```

---

## Observability Basics

| Pillar | What It Captures | Tool Examples |
|---|---|---|
| **Logging** | Discrete events | Python `logging`, structlog |
| **Metrics** | Numerical measurements over time | Prometheus, Grafana |
| **Tracing** | Request flow across services | OpenTelemetry, Jaeger |

Good observability means you can answer: *"Why is this endpoint slow?"* and *"What changed at 3 AM?"* without guessing.

---

## DevOps Culture

DevOps is not just tools — it's a mindset:

- **You build it, you run it** — developers own production reliability.
- **Automate everything repeatable** — manual steps are bugs waiting to happen.
- **Fail fast, recover fast** — small deploys, quick rollbacks.
- **Blameless post-mortems** — learn from incidents, don't punish.

---

## Learning Path

1. Write unit tests with `pytest` for code you already have.
2. Set up a GitHub Actions CI pipeline that runs on every push.
3. Build a CLI tool that automates a task you do manually.
4. Add structured logging to a web app and read the logs.
5. Read *The Phoenix Project* for DevOps culture and philosophy.

---

## Checklist & Exercises

- [ ] Set up a GitHub Actions workflow that runs `pytest`, `mypy`, and `ruff` on every pull request.
- [ ] Build a CLI tool with `typer` that accepts subcommands and flags, then write tests for it.
- [ ] Add structured logging to a FastAPI app and verify that logs include request IDs for traceability.
