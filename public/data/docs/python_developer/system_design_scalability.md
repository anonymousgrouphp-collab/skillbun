# System Design & Scalability Basics

System design is the art of building software that handles growth — more users, more data, more features — without falling over. This guide introduces the foundational concepts every Python backend developer should know.

---

## Monolith vs Microservices

| Approach | Pros | Cons |
|---|---|---|
| **Monolith** | Simple to develop, test, deploy | Hard to scale individual components |
| **Microservices** | Independent scaling, tech diversity | Operational complexity, network overhead |

> **Start with a monolith.** Extract microservices only when you have a clear reason (e.g., one component needs independent scaling or a different tech stack).

---

## Load Balancing

A load balancer distributes incoming requests across multiple server instances.

```
                    ┌─── Server 1
Client ──▶ LB ─────┼─── Server 2
                    └─── Server 3
```

### Common Algorithms

- **Round Robin** — rotate through servers sequentially.
- **Least Connections** — send to the server with fewest active connections.
- **Weighted** — send more traffic to more powerful servers.
- **IP Hash** — same client always hits the same server (sticky sessions).

Tools: **Nginx**, **HAProxy**, **AWS ALB**, **Traefik**.

---

## Caching Strategies

Caching reduces database load and speeds up responses dramatically.

| Layer | Tool | Use Case |
|---|---|---|
| **Application cache** | Redis, Memcached | Session data, API responses, computed results |
| **Database query cache** | Built-in to many DBs | Repeated identical queries |
| **CDN** | CloudFlare, CloudFront | Static assets, edge caching |
| **Browser cache** | HTTP headers | Client-side caching |

```python
import redis

r = redis.Redis()

def get_user_profile(user_id: int) -> dict:
    cache_key = f"user:{user_id}:profile"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    profile = db.query(User).get(user_id).to_dict()
    r.setex(cache_key, 300, json.dumps(profile))  # cache 5 min
    return profile
```

### Cache Invalidation Patterns

- **TTL (Time-To-Live)** — expire after N seconds (simplest).
- **Write-through** — update cache on every write.
- **Write-behind** — batch cache updates asynchronously.
- **Event-driven** — invalidate on specific events.

---

## Message Brokers & Event-Driven Architecture

Decouple services by communicating through messages rather than direct API calls.

```
Service A ──▶ Message Broker ──▶ Service B
                              ──▶ Service C
```

| Broker | Strengths |
|---|---|
| **RabbitMQ** | Flexible routing, mature, good for task queues |
| **Apache Kafka** | High throughput, event streaming, replay capability |
| **Redis Streams** | Lightweight, already in your stack if using Redis |

### Use Cases

- **Order processing** — place order → payment service → inventory service → notification service.
- **Data pipelines** — collect events → transform → load into analytics DB.
- **Webhooks** — receive external events and process asynchronously.

---

## API Gateways

An API gateway sits in front of your services and handles cross-cutting concerns:

- **Routing** — direct requests to the right service.
- **Authentication** — verify tokens before reaching the service.
- **Rate limiting** — prevent abuse.
- **Response caching** — cache common responses.
- **Request transformation** — modify headers, payloads.

Tools: **Kong**, **Traefik**, **AWS API Gateway**, **Nginx**.

---

## Database Scaling

### Vertical Scaling (Scale Up)

Bigger server: more CPU, RAM, storage. Simple but has a ceiling.

### Horizontal Scaling (Scale Out)

- **Read replicas** — route reads to replicas, writes to primary.
- **Sharding** — split data across multiple databases by key (e.g., user ID ranges).
- **Connection pooling** — PgBouncer in front of PostgreSQL.

---

## Data Consistency Models

| Model | Guarantee | Trade-off |
|---|---|---|
| **Strong consistency** | Read always sees latest write | Higher latency |
| **Eventual consistency** | Read may see stale data briefly | Lower latency, higher availability |

The **CAP theorem** states you can only have two of: Consistency, Availability, Partition tolerance. Most distributed systems choose availability + partition tolerance (AP) and accept eventual consistency.

---

## Fault Tolerance & Resilience

- **Retries with backoff** — don't hammer a failing service.
- **Circuit breakers** — stop calling a service that's down.
- **Timeouts** — never wait forever for a response.
- **Health checks** — automatically remove unhealthy instances.
- **Graceful degradation** — serve a cached or simplified response when a dependency fails.

```python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def call_payment_service(order_id: int):
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(f"http://payments/charge/{order_id}")
        resp.raise_for_status()
        return resp.json()
```

---

## Designing for Scale — A Checklist

1. **Stateless services** — no in-memory state, use external stores.
2. **Horizontal scaling** — add more instances, not bigger ones.
3. **Cache aggressively** — reduce DB and compute load.
4. **Async where possible** — offload slow work to queues.
5. **Monitor everything** — you can't optimise what you can't measure.

---

## Checklist & Exercises

- [ ] Draw a system architecture diagram for a URL shortener that handles 10,000 requests per minute, including caching, load balancing, and a database.
- [ ] Implement a caching layer with Redis for a slow database query and measure the latency improvement.
- [ ] Explain the CAP theorem in your own words and describe which trade-off you'd choose for (a) a banking app and (b) a social media feed.
