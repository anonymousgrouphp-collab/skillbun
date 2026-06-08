# Observability: Logging, Monitoring & Tracing

When your app is running in production, you can't attach a debugger. Observability — the combination of logging, metrics, and tracing — is how you understand what's happening inside your system.

---

## The Three Pillars of Observability

| Pillar | What It Captures | Example Question |
|---|---|---|
| **Logs** | Discrete events with context | "What error did user #42 get?" |
| **Metrics** | Numerical measurements over time | "How many requests/sec are we handling?" |
| **Traces** | End-to-end request journey | "Why did this API call take 3 seconds?" |

---

## Logging in Python

### Basic Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

logger.info("Server started on port %d", 8000)
logger.warning("Slow query detected: %dms", 1500)
logger.error("Failed to connect to database", exc_info=True)
```

### Structured Logging with structlog

Plain text logs are hard to search. Structured logging outputs JSON, which tools like Elasticsearch can index and query.

```python
import structlog

logger = structlog.get_logger()

logger.info("user_login", user_id=42, ip="192.168.1.1")
# Output: {"event": "user_login", "user_id": 42, "ip": "192.168.1.1", "timestamp": "..."}
```

### Logging Best Practices

- Use **log levels** correctly: DEBUG for dev, INFO for normal ops, WARNING for recoverable issues, ERROR for failures.
- Include **context**: user ID, request ID, operation name.
- **Never log sensitive data**: passwords, tokens, PII.
- Use **correlation IDs** — attach a unique request ID to every log line so you can trace a single request across services.

```python
import uuid

@app.middleware("http")
async def add_request_id(request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
```

---

## Metrics with Prometheus

Prometheus scrapes metrics from your application at a `/metrics` endpoint.

### Instrumenting a FastAPI App

```python
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import FastAPI, Response

app = FastAPI()

REQUEST_COUNT = Counter(
    "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds", "Request latency", ["endpoint"]
)

@app.middleware("http")
async def metrics_middleware(request, call_next):
    with REQUEST_LATENCY.labels(endpoint=request.url.path).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(
        method=request.method, endpoint=request.url.path, status=response.status_code
    ).inc()
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Grafana Dashboards

Grafana connects to Prometheus and lets you build visual dashboards showing:

- Request rate and error rate over time.
- Latency percentiles (p50, p95, p99).
- CPU/memory usage.
- Custom business metrics.

---

## Distributed Tracing with OpenTelemetry

In microservices, a single user request may span multiple services. Tracing shows the full journey.

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter()))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

async def process_order(order_id: int):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        await validate_payment(order_id)
        await update_inventory(order_id)
        await send_confirmation(order_id)
```

Traces are visualised in tools like **Jaeger** or **Grafana Tempo** as waterfall diagrams showing timing for each step.

---

## Alerting

Metrics without alerts are just pretty graphs. Set up alerts for:

- Error rate > 1% for 5 minutes.
- p99 latency > 2 seconds.
- Disk usage > 85%.
- Zero healthy instances.

Use Grafana alerting, PagerDuty, or Opsgenie to route alerts to the right team.

---

## Checklist & Exercises

- [ ] Add structured logging with `structlog` to a FastAPI app, including request IDs on every log line.
- [ ] Instrument your app with `prometheus_client`, expose a `/metrics` endpoint, and visualise request rates in Grafana.
- [ ] Set up OpenTelemetry tracing for a multi-step endpoint and view the trace in Jaeger's UI.
