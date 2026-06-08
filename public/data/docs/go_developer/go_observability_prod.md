# Observability in Production for Go Developers

Observability is crucial for understanding the internal state of a system based on its external outputs. For Go services in production, this means effectively monitoring their health, performance, and behavior to quickly detect, diagnose, and resolve issues.

## The Three Pillars of Observability

1.  **Logs:** Detailed, time-stamped records of events within the application. Essential for understanding *what happened*.
2.  **Metrics:** Numerical measurements representing the system's behavior over time. Vital for understanding *system health and performance trends*.
3.  **Traces:** End-to-end representations of requests as they flow through distributed systems. Key for understanding *why something is slow or failing*.

## 1. Structured Logging

**Concept:** Instead of plain text logs, structured logging outputs logs in a machine-readable format (e.g., JSON). This makes logs easier to parse, query, and analyze with tools like Elasticsearch, Splunk, or Loki.

**Implementation in Go:** Libraries like `zap` (Uber) or `logrus` provide excellent support for structured logging.

**Example (using `zap`):**

```go
package main

import (
	"net/http"

	"go.uber.org/zap"
)

var logger *zap.Logger

func main() {
	// Initialize a production-ready logger
	var err error
	logger, err = zap.NewProduction()
	if err != nil {
		panic(err)
	}
	defer logger.Sync() // Flushes any buffered log entries

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/greet", greetHandler)

	logger.Info("Server starting", zap.String("port", ":8080"))
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		logger.Fatal("Server failed to start", zap.Error(err))
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	logger.Info("Received home request",
		zap.String("method", r.Method),
		zap.String("path", r.URL.Path),
		zap.String("remote_addr", r.RemoteAddr),
	)
	w.Write([]byte("Welcome to the Go service!"))
}

func greetHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		name = "Guest"
	}

	logger.Debug("Greeting user", zap.String("user_name", name))
	w.Write([]byte("Hello, " + name + "!"))
}
```

When `homeHandler` is called, it would produce a log similar to:

```json
{"level":"info","ts":1678886400.123,"caller":"main/main.go:30","msg":"Received home request","method":"GET","path":"/","remote_addr":"127.0.0.1:54321"}
```

## 2. Metrics Gathering and Visualization

**Concept:** Metrics are numerical data points collected at regular intervals to represent system behavior. Common types include counters (e.g., total requests), gauges (e.g., current goroutines), and histograms/summaries (e.g., request latencies).

**Tools:**
*   **Prometheus:** A powerful open-source monitoring system that scrapes (pulls) metrics from configured targets at specified intervals, stores them as time-series data, and supports a flexible query language (PromQL).
*   **Grafana:** An open-source analytics and interactive visualization web application. It allows you to create dashboards, graphs, and alerts using data from various sources, including Prometheus.

**Implementation in Go (using `prometheus/client_go`):**

```go
package main

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	requestsTotal = promauto.NewCounter(prometheus.CounterOpts{
		Name: "myapp_requests_total",
		Help: "Total number of HTTP requests.",
	})

	requestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "myapp_request_duration_seconds",
		Help:    "Histogram of request durations.",
		Buckets: prometheus.DefBuckets, // default buckets for latency
	}, []string{"path", "method"})
)

func main() {
	http.Handle("/metrics", promhttp.Handler()) // Expose Prometheus metrics endpoint
	http.HandleFunc("/", instrumentHandler("/"))
	http.HandleFunc("/health", instrumentHandler("/health"))

	_ = http.ListenAndServe(":8080", nil)
}

// instrumentHandler is a middleware to record metrics for each request.
func instrumentHandler(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Increment total requests counter
		requestsTotal.Inc()

		// Serve the actual request
		w.Write([]byte("OK"))

		// Record request duration
		duration := time.Since(start).Seconds()
		requestDuration.WithLabelValues(path, r.Method).Observe(duration)
	}
}
```

Run this service and access `http://localhost:8080/metrics` to see the exposed metrics. Prometheus can then scrape this endpoint.

## 3. Distributed Tracing

**Concept:** In microservices architectures, a single user request can traverse multiple services. Distributed tracing tracks the path of a request from its origin to its completion, across all involved services. It visualizes the flow, latency, and errors at each step (called a "span").

**Tools:**
*   **OpenTelemetry:** A vendor-neutral set of APIs, SDKs, and tools to instrument, generate, collect, and export telemetry data (metrics, logs, and traces). It's the industry standard for observability.
*   **Jaeger:** An open-source end-to-end distributed tracing system used for monitoring and troubleshooting complex microservices-based architectures. It collects, stores, and visualizes trace data, often exported via OpenTelemetry.

**Implementation in Go (basic OpenTelemetry with Jaeger):**

```go
package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.7.0"
)

// initTracer sets up the OpenTelemetry TracerProvider.
func initTracer() *tracesdk.TracerProvider {
	exporter, err := jaeger.New(jaeger.WithAgentHost("localhost"), jaeger.WithAgentPort("6831"))
	if err != nil {
		panic(fmt.Errorf("failed to create Jaeger exporter: %w", err))
	}

	// Use the global TracerProvider
	tp := tracesdk.NewTracerProvider(
		tracesdk.WithBatcher(exporter),
		tracesdk.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String("my-go-service"),
			attribute.String("environment", "development"),
		)),
	)
	otel.SetTracerProvider(tp)

	return tp
}

func main() {
	tp := initTracer()
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			fmt.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	handler := http.HandlerFunc(helloHandler)
	http.Handle("/hello", otelhttp.NewHandler(handler, "hello"))

	fmt.Println("Listening on :8080")
	_ = http.ListenAndServe(":8080", nil)
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	tracer := otel.Tracer("my-go-service")

	_, span := tracer.Start(ctx, "hello-world")
	defer span.End()

	fmt.Fprintf(w, "Hello from OpenTelemetry!")
}
```

Before running this, you'd typically need a Jaeger agent/collector running (e.g., via Docker: `docker run -d --name jaeger -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 -e COLLECTOR_OTLP_ENABLED=true -p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one:latest`). Access Jaeger UI at `http://localhost:16686`.

## 4. In-depth Profiling with `pprof`

**Concept:** `pprof` is a powerful Go tool for visualizing and analyzing profiling data (CPU, memory, goroutine, blocking, mutex contention). It helps identify performance bottlenecks and memory leaks.

**Usage:**
*   **`net/http/pprof`:** Exposes profiling endpoints on a running HTTP server.
*   **`go tool pprof`:** Command-line tool to analyze profile files or interact with live services via HTTP endpoints.

**Example (Exposing `pprof` endpoints):**

```go
package main

import (
	"net/http"
	_ "net/http/pprof" // Automatically registers pprof handlers
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, profiling world!"))
	})

	// ListenAndServe for your application's main routes
	go func() {
		_ = http.ListenAndServe(":8080", nil)
	}()

	// ListenAndServe for pprof. It's often recommended to run pprof on a separate port
	// for security and to avoid impacting application performance.
	_ = http.ListenAndServe(":6060", nil) // pprof default port
}
```

Access `http://localhost:6060/debug/pprof/` to see available profiles. You can then use `go tool pprof http://localhost:6060/debug/pprof/heap` for memory analysis or `go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30` for a 30-second CPU profile.

## 5. Health Checks and Alerting Strategies

**Concept:**
*   **Health Checks:** Endpoints (e.g., `/health`, `/ready`, `/live`) that report the operational status of a service. Essential for load balancers and orchestration systems (Kubernetes) to determine if an instance can receive traffic (readiness) or needs to be restarted (liveness).
*   **Alerting:** Proactive notifications when system metrics or logs indicate potential issues (e.g., high error rates, low disk space, service down). Prevents minor issues from escalating into major outages.

**Implementation in Go (basic health check):**

```go
package main

import (
	"net/http"
	"sync"
	"time"
)

var ( // Simulate a dependency status
	dbConnected bool
	mu          sync.RWMutex
)

func init() {
	// Simulate a background check for database connection
	go func() {
		for {
			// In a real app, you'd try to ping the DB
			isHealthy := (time.Now().Second()%10) != 0 // Simulate intermittent failure
			mu.Lock()
			dbConnected = isHealthy
			mu.Unlock()
			time.Sleep(2 * time.Second)
		}
	}()
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Application running"))
	})
	http.HandleFunc("/health", healthCheckHandler) // Liveness and Readiness

	_ = http.ListenAndServe(":8080", nil)
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	mu.RLock()
	connected := dbConnected
	mu.RUnlock()

	if connected {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("{"status":"UP","dependencies":{"database":"UP"}}"))
	} else {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte("{"status":"DOWN","dependencies":{"database":"DOWN"}}"))
	}
}
```

**Alerting Strategies:**
*   **Prometheus Alertmanager:** Handles alerts generated by Prometheus, grouping, silencing, and routing them to various notification channels (Slack, PagerDuty, email).
*   **Grafana Alerting:** Allows setting up alerts directly within Grafana dashboards based on metric thresholds, sending notifications to similar channels.
*   **Log-based alerting:** Tools like Elastic Stack (ELK) or Loki can trigger alerts based on specific log patterns or error rates.

## Quick Checklist / Exercise

1.  **Identify:** List the three core pillars of observability and briefly explain the primary question each helps answer.
2.  **Differentiate:** In the context of a Go service, describe the roles of Prometheus and Grafana, and how they complement each other for monitoring.
3.  **Debug:** If your Go service is consuming too much CPU, which specific `pprof` profile would you analyze first, and how would you typically access it?
