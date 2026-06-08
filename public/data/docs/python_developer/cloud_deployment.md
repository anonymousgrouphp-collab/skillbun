# Cloud Deployment & Infrastructure

Deploying your Python application to the cloud is where your code becomes a product. This guide covers cloud concepts, deployment options, and infrastructure basics.

---

## Cloud Computing Models

| Model | You Manage | Provider Manages | Example |
|---|---|---|---|
| **IaaS** | OS, runtime, app, data | Hardware, networking, virtualisation | AWS EC2, DigitalOcean |
| **PaaS** | App, data | Everything else | Heroku, Render, Railway |
| **SaaS** | Nothing (just use it) | Everything | Gmail, Slack |
| **FaaS** (Serverless) | Function code | Infrastructure, scaling, runtime | AWS Lambda, GCP Cloud Functions |

> **Start with PaaS** (Render, Railway) for learning. Move to IaaS/containers when you need control.

---

## Deploying to a PaaS (Render)

Render is one of the simplest platforms for Python deployments.

1. Push your code to GitHub.
2. Connect the repo on Render.
3. Set the build command: `pip install -r requirements.txt`.
4. Set the start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`.
5. Add environment variables in the dashboard.

That's it — Render handles SSL, scaling, and restarts.

---

## AWS — The Industry Standard

### Key Services for Python Developers

| Service | Purpose |
|---|---|
| **EC2** | Virtual servers (full control) |
| **Lambda** | Serverless functions (pay per invocation) |
| **RDS** | Managed PostgreSQL, MySQL |
| **S3** | Object/file storage |
| **ECR** | Docker image registry |
| **ECS / Fargate** | Container orchestration |
| **CloudWatch** | Logs and monitoring |

### Deploying a Docker Container to ECS

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t my-api .
docker tag my-api:latest <account>.dkr.ecr.<region>.amazonaws.com/my-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/my-api:latest
```

### AWS Lambda for Python

```python
# handler.py
import json

def lambda_handler(event, context):
    name = event.get("queryStringParameters", {}).get("name", "World")
    return {
        "statusCode": 200,
        "body": json.dumps({"message": f"Hello, {name}!"}),
    }
```

Package with dependencies using a Lambda layer or container image.

---

## Infrastructure as Code (IaC)

Manual cloud setup is error-prone and unreproducible. IaC tools let you define infrastructure in version-controlled files.

### Terraform

```hcl
# main.tf
resource "aws_instance" "api_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "python-api-server"
  }
}

resource "aws_db_instance" "postgres" {
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  db_name        = "mydb"
  username       = var.db_username
  password       = var.db_password
}
```

```bash
terraform init
terraform plan      # preview changes
terraform apply     # create resources
terraform destroy   # tear down
```

---

## Networking Basics

| Concept | Description |
|---|---|
| **VPC** | Virtual Private Cloud — your isolated network |
| **Subnets** | Divide your VPC into public/private segments |
| **Security Groups** | Firewall rules — which ports/IPs can connect |
| **Load Balancer** | Distribute traffic across multiple instances |
| **DNS** | Map domain names to IP addresses (Route 53) |

> **Security rule:** databases should be in **private subnets** with no public access. Only your API servers should reach them.

---

## Environment Configuration

Follow the **Twelve-Factor App** methodology:

```python
import os

DATABASE_URL = os.environ["DATABASE_URL"]
SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
```

- Store config in **environment variables**, not code.
- Use different values per environment (dev, staging, prod).
- Never commit `.env` files to version control.

---

## Cost Management Tips

1. **Use free tiers** — AWS, GCP, and Azure all offer generous free tiers.
2. **Right-size instances** — start small, scale up when metrics justify it.
3. **Auto-scale** — scale containers up during peak, down during off-hours.
4. **Set billing alerts** — never wake up to a surprise bill.
5. **Use spot/preemptible instances** for non-critical workloads.

---

## Checklist & Exercises

- [ ] Deploy a FastAPI app to Render or Railway with a managed PostgreSQL database, and verify it works via the public URL.
- [ ] Write a Terraform file that provisions an AWS EC2 instance and a security group allowing only HTTP/HTTPS traffic.
- [ ] Deploy a simple function to AWS Lambda and invoke it via API Gateway.
