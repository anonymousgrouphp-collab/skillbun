# Advanced Deployment Strategies & Rollback

## Introduction
In modern software development, deploying new features or bug fixes frequently and reliably is paramount. Traditional 'big bang' deployments are risky and often lead to downtime or user impact. Advanced deployment strategies mitigate these risks by introducing methods for gradual rollouts, isolated testing, and rapid recovery, ensuring high availability and a smooth user experience. This study guide will delve into sophisticated deployment patterns and robust rollback mechanisms.

## Core Concepts

### 1. Rolling Updates

**Concept:** Rolling updates incrementally replace old versions of an application with new ones. New instances are brought up, and old ones are terminated, often one by one or in small batches, until all instances are updated. This ensures the application remains available throughout the process.

**Pros:**
*   Zero downtime (if configured correctly with enough replicas).
*   Easy to implement in container orchestration platforms like Kubernetes.
*   Changes are immediately visible.

**Cons:**
*   Can lead to mixed environments (old and new versions running simultaneously), which might require backward compatibility.
*   Rollback can be slow as it effectively performs another rolling update in reverse.

**Example (Kubernetes):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app-container
        image: myrepo/my-app:v1.0.0 # Initial version
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1 # Max pods unavailable during update
      maxSurge: 1       # Max pods created above desired count
```
To update to a new image:
```bash
kubectl set image deployment/my-app-deployment my-app-container=myrepo/my-app:v1.1.0
```

### 2. Blue/Green Deployment

**Concept:** This strategy involves running two identical production environments, 