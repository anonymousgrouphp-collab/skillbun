# Compute Engine: Virtual Machines and Instance Groups Study Guide

Google Compute Engine (GCE) is the Infrastructure as a Service (IaaS) component of Google Cloud, providing scalable, high-performance virtual machines (VMs) that run on Google's global infrastructure. This guide covers how to provision, configure, and manage these VMs, along with advanced concepts like custom images, persistent disks, snapshots, and Managed Instance Groups (MIGs).

## 1. Virtual Machine (VM) Instances

VM instances are customizable virtual machines that offer significant flexibility for various workloads. They are the fundamental compute resource in GCE.

### Key Components of a VM Instance:

*   **Machine Types**: Define the virtual hardware (vCPUs, memory). GCE offers predefined machine types (e.g., `e2-medium`, `n1-standard-1`) optimized for different workloads, and custom machine types for specific needs.
*   **Operating Systems**: Choose from a wide range of public images (Debian, Ubuntu, CentOS, Windows Server, etc.) or create your own [custom images](#3-custom-images).
*   **Regions and Zones**: VMs are deployed within a specific zone (e.g., `us-central1-a`) within a region (e.g., `us-central1`). Zones offer fault isolation within a region, while regions provide geographic distribution for latency and disaster recovery.
*   **Persistent Disks**: Block storage devices that act as the boot disk or additional data disks. They are independent of your VM's lifecycle and offer various performance tiers (Standard HDD, Balanced Persistent Disk, SSD Persistent Disk).
*   **Networking**: Each VM instance belongs to a Virtual Private Cloud (VPC) network, has internal and potentially external IP addresses, and interacts with firewall rules and network tags for traffic control.
*   **SSH Access**: Secure shell access to Linux VMs is typically managed via SSH keys, which can be automatically injected by GCE or manually configured.

### Provisioning a VM Instance (gcloud example):

Creating a basic web server VM with a startup script using the `gcloud` CLI:

```bash
gcloud compute instances create my-web-server \ 
  --project=YOUR_PROJECT_ID \ 
  --zone=us-central1-a \ 
  --machine-type=e2-medium \ 
  --image-family=debian-11 \ 
  --image-project=debian-cloud \ 
  --boot-disk-size=20GB \ 
  --boot-disk-type=pd-balanced \ 
  --tags=http-server \ 
  --metadata=startup-script="#! /bin/bash\nsudo apt-get update\nsudo apt-get install -y apache2\nsudo systemctl start apache2\nsudo systemctl enable apache2"
```

*   `--project`: Your GCP project ID.
*   `--zone`: The specific zone where the VM will be created.
*   `--machine-type`: The predefined machine type (e.g., 2 vCPUs, 4GB RAM).
*   `--image-family`, `--image-project`: Specify the OS image to use (here, Debian 11).
*   `--boot-disk-size`, `--boot-disk-type`: Configure the boot persistent disk.
*   `--tags`: Apply network tags, useful for firewall rules (e.g., allowing HTTP traffic).
*   `--metadata=startup-script`: A script that runs once when the instance starts for the first time, useful for initial software installation and configuration.

## 2. Custom Images

Custom images allow you to create standardized, pre-configured VM images based on your specific requirements. This is crucial for maintaining consistent environments, accelerating deployments, and ensuring that all instances launched from the image have the necessary software and configurations.

### Benefits:

*   **Consistency**: All VMs created from a custom image will have identical configurations.
*   **Faster Deployment**: Skip repetitive software installations and configurations during VM creation.
*   **Compliance**: Ensure VMs adhere to organizational security and software policies.

### Creating Custom Images:

Custom images can be created from an existing running VM instance's boot disk or from a persistent disk snapshot.

## 3. Persistent Disks and Snapshots

### Persistent Disks

Persistent disks are durable block storage devices that VMs use to store data. They are independent of your VM's lifecycle, meaning data persists even if the VM is deleted. They can be attached to multiple VMs in read-only mode.

*   **Disk Types**:
    *   **Standard Persistent Disk (HDD)**: Cost-effective for large, sequential read/write operations.
    *   **Balanced Persistent Disk (SSD-backed)**: Offers a balance of performance and cost, suitable for most workloads.
    *   **SSD Persistent Disk**: Provides the highest IOPS and throughput, ideal for high-performance applications and databases.
*   **Features**: Can be resized, attached, and detached from running VMs (with OS-level configuration).

### Snapshots

Snapshots are point-in-time backups of your persistent disks. They are incremental, meaning only changed blocks are stored after the initial full snapshot, making them cost-effective and fast.

*   **Uses**: Disaster recovery, migrating disks between regions/zones, creating new disks, or creating custom images.
*   **Automatic Snapshots**: Can be configured via `Disk schedules` to automate backups.

## 4. Managed Instance Groups (MIGs)

MIGs are a collection of identical VM instances that you manage as a single entity. They offer powerful features for building scalable, highly available, and resilient applications.

### Benefits of MIGs:

*   **Auto-scaling**: Automatically adds or removes VMs based on actual load.
*   **Auto-healing**: Proactively detects and replaces unhealthy instances, ensuring application availability.
*   **Load Balancing Integration**: Seamlessly integrates with HTTP(S) Load Balancers to distribute traffic across instances.
*   **Rolling Updates**: Safely applies updates to instances (e.g., OS patches, application versions) without downtime.
*   **Multi-zone Deployment**: Distributes instances across multiple zones for regional redundancy and fault tolerance.

### Key Components of MIGs:

*   **Instance Templates**: A crucial component that defines the configuration for VMs within a MIG. An instance template specifies the machine type, boot disk image, network settings, metadata (including startup scripts), and other VM properties. Instance templates are immutable.

    ```bash
    gcloud compute instance-templates create my-web-template \ 
      --machine-type=e2-medium \ 
      --image-family=debian-11 \ 
      --image-project=debian-cloud \ 
      --boot-disk-size=20GB \ 
      --boot-disk-type=pd-balanced \ 
      --tags=http-server \ 
      --metadata=startup-script="#! /bin/bash\nsudo apt-get update\nsudo apt-get install -y apache2\nsudo systemctl start apache2\nsudo systemctl enable apache2"
    ```

*   **Creating a MIG**: Once an instance template is defined, you can create a MIG based on it.

    ```bash
    gcloud compute instance-groups managed create my-web-mig \ 
      --base-instance-name=web-instance \ 
      --size=2 \ 
      --template=my-web-template \ 
      --zone=us-central1-a
    ```

*   **Auto-scaling**: Configures the MIG to automatically adjust its size based on metrics like CPU utilization, HTTP(S) load balancing utilization, or custom metrics.

    ```bash
    gcloud compute instance-groups managed set-autoscaling my-web-mig \ 
      --zone=us-central1-a \ 
      --min-num-replicas=1 \ 
      --max-num-replicas=5 \ 
      --target-cpu-utilization=0.6
    ```

*   **Auto-healing**: MIGs use health checks to monitor the health of instances. If an instance fails a health check, the MIG automatically recreates it.

*   **Rolling Updates**: To update the application or configuration across all instances in a MIG, you create a new instance template and then initiate a rolling update. GCE updates instances gradually, ensuring service availability.

## 5. Checklist / Exercise

Test your understanding with these practical tasks:

1.  **Provision and Connect**: Create an `e2-small` VM instance named `my-test-vm` in the `us-east1-b` zone using a Debian 11 image. SSH into it and install Nginx. Confirm Nginx is running and accessible (if you open a firewall rule).
2.  **Snapshot and Restore**: Create a snapshot of the boot disk of `my-test-vm`. Then, delete `my-test-vm`. Create a *new* VM named `restored-test-vm` using the snapshot as its boot disk. Verify that Nginx is still installed and running on the `restored-test-vm`.
3.  **Managed Instance Group with Auto-scaling**: Create an instance template for a basic web server (e.g., installing Apache). Then, create a regional Managed Instance Group (using `--regions`) with this template, set its initial size to 1, and configure auto-scaling based on CPU utilization to scale up to 3 instances and down to 1. Simulate load to observe scaling behavior.