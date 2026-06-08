# Scripting, Task Management & Automation

Python's superpower is automating things that humans do manually. This guide covers CLI tools, web scraping, background jobs, and task scheduling — the bread and butter of a productive Python developer.

---

## Building CLI Tools

### Typer — Modern CLI Framework

Typer (by the FastAPI creator) uses type hints to generate CLIs with minimal boilerplate.

```python
import typer
from pathlib import Path

app = typer.Typer(help="File management toolkit")

@app.command()
def count(
    directory: Path = typer.Argument(..., help="Directory to scan"),
    extension: str = typer.Option(".py", "--ext", "-e", help="File extension"),
):
    """Count files with a given extension in a directory."""
    files = list(directory.rglob(f"*{extension}"))
    typer.echo(f"Found {len(files)} {extension} files in {directory}")

@app.command()
def rename(
    directory: Path,
    prefix: str = typer.Option("backup_", help="Prefix to add"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Preview changes"),
):
    """Add a prefix to all files in a directory."""
    for f in directory.iterdir():
        if f.is_file():
            new_name = f.parent / f"{prefix}{f.name}"
            if dry_run:
                typer.echo(f"  {f.name} → {new_name.name}")
            else:
                f.rename(new_name)

if __name__ == "__main__":
    app()
```

```bash
python cli.py count ./src --ext .py
python cli.py rename ./data --prefix processed_ --dry-run
```

---

## Web Scraping

### Beautiful Soup — For Simple Pages

```python
import httpx
from bs4 import BeautifulSoup

resp = httpx.get("https://news.ycombinator.com")
soup = BeautifulSoup(resp.text, "html.parser")

for link in soup.select(".titleline > a"):
    print(link.text, "→", link["href"])
```

### Scrapy — For Large-Scale Crawling

Scrapy handles pagination, retries, rate limiting, and data pipelines out of the box.

```python
import scrapy

class NewsSpider(scrapy.Spider):
    name = "news"
    start_urls = ["https://example.com/articles"]

    def parse(self, response):
        for article in response.css("article"):
            yield {
                "title": article.css("h2::text").get(),
                "url": article.css("a::attr(href)").get(),
            }
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

> **Ethics:** Always check `robots.txt`, respect rate limits, and don't scrape data you don't have permission to use.

---

## Background Jobs with Celery

Celery is the standard for distributed task queues in Python.

```python
# tasks.py
from celery import Celery

app = Celery("tasks", broker="redis://localhost:6379/0")

@app.task
def generate_report(user_id: int) -> str:
    # Heavy computation or I/O
    data = fetch_user_data(user_id)
    report = build_pdf(data)
    return upload_to_s3(report)
```

```python
# Enqueue the task
from tasks import generate_report
result = generate_report.delay(user_id=42)
print(result.id)       # task UUID
print(result.get())    # blocks until complete
```

### Running Celery

```bash
celery -A tasks worker --loglevel=info
```

### Alternatives

| Tool | Best For |
|---|---|
| **RQ (Redis Queue)** | Simple jobs, small teams |
| **Dramatiq** | Reliable, actor-based, good defaults |
| **Huey** | Lightweight, minimal setup |

---

## Task Scheduling

### APScheduler

```python
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job("interval", minutes=30)
def cleanup_temp_files():
    # runs every 30 minutes
    ...

@scheduler.scheduled_job("cron", hour=2, minute=0)
def nightly_backup():
    # runs at 2:00 AM daily
    ...

scheduler.start()
```

### Celery Beat

If you're already using Celery, Celery Beat handles periodic tasks:

```python
app.conf.beat_schedule = {
    "cleanup-every-hour": {
        "task": "tasks.cleanup",
        "schedule": 3600.0,
    },
}
```

---

## Data Serialisation

| Format | Use Case | Python Module |
|---|---|---|
| **JSON** | APIs, config files | `json` |
| **YAML** | Human-friendly config | `pyyaml` |
| **CSV** | Tabular data exchange | `csv`, `pandas` |
| **TOML** | Python project config | `tomllib` (3.11+) |

```python
import json
from pathlib import Path

data = {"users": [{"name": "Alice"}, {"name": "Bob"}]}
Path("data.json").write_text(json.dumps(data, indent=2))

loaded = json.loads(Path("data.json").read_text())
```

---

## System Automation

```python
import subprocess
import shutil
from pathlib import Path

# Run a shell command
result = subprocess.run(["git", "status"], capture_output=True, text=True)
print(result.stdout)

# File operations
shutil.copytree("src", "backup/src")
for log in Path("/var/log").glob("*.log"):
    if log.stat().st_size > 100_000_000:  # > 100 MB
        log.unlink()
```

---

## Checklist & Exercises

- [ ] Build a CLI tool with Typer that downloads a webpage, extracts all links, and saves them to a JSON file.
- [ ] Set up a Celery worker with Redis and create a task that resizes images in the background.
- [ ] Write a scheduled script that checks disk usage every hour and sends an alert if usage exceeds 80%.
