# Cloud Database Operations, Cost Optimization & IaC: Study Guide

DBAs are increasingly responsible for cloud costs and deploying database infrastructure using Infrastructure as Code (IaC) like Terraform.

## 1. Key Concepts

### Concept 1: Infrastructure as Code (IaC)
Defining database infrastructure (instances, parameters, subnet groups) in declarative code (Terraform/CloudFormation) for reproducibility.

### Concept 2: Database Cost Optimization
Right-sizing instances, selecting correct storage classes (e.g., GP3 vs IO1), cleaning up unconsumed backups, and scheduling dev database shutdowns.

### Concept 3: Configuration Management
Managing DB parameter groups and options in a centralized, version-controlled manner.

## 2. Practical Example

### Cloud Database Operations, Cost Optimization & IaC Example Setup
```javascript
Terraform configuration snippet to deploy a PostgreSQL database instance with AWS RDS:
resource "aws_db_instance" "postgres" {
  allocated_storage = 20
  engine            = "postgres"
  instance_class    = "db.t4g.micro"
}
```

## 3. Quick Check-Up

1. How does declarative IaC prevent configuration drift in staging and production databases?
2. What strategies can you use to reduce AWS RDS storage and IOPS costs?
3. Explain the difference between db.t3 (burstable) and db.m5 (general purpose) instances for databases.
