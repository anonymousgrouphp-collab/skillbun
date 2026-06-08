# Server Hardware, Storage & Virtualization: Study Guide

As a Database Administrator, understanding the underlying server hardware, storage systems, and virtualization technologies is crucial for optimizing database performance, ensuring data reliability, and troubleshooting issues. This guide will walk you through the essential concepts.

## 1. Server Hardware Fundamentals

### CPU Architectures

**Central Processing Unit (CPU)** is the "brain" of the server, executing instructions and processing data. For database workloads, key factors include:

*   **Cores and Threads**: More cores and threads generally allow for greater parallel processing of database queries and background tasks.
*   **Cache**: On-chip memory (L1, L2, L3) that stores frequently accessed data, reducing the need to access slower main RAM.
*   **Architectures**:
    *   **x86-64 (Intel Xeon, AMD EPYC)**: Dominant in enterprise servers, offering high performance for general-purpose computing and database applications.
    *   **ARM**: Gaining traction for its energy efficiency, suitable for scale-out architectures and specific cloud workloads. May be relevant for certain database services.

### RAM (Random Access Memory)

**RAM** is volatile memory used to store active data and program instructions, allowing for quick access by the CPU. For databases, RAM is vital for:

*   **Buffer Pool/Cache**: Databases heavily rely on RAM to cache frequently accessed data blocks and indexes, significantly reducing slow disk I/O.
*   **Query Processing**: Holding intermediate results, sorting data, and executing complex queries.
*   **Types**:
    *   **DDR4/DDR5**: Different generations offering varying speeds and bandwidths.
    *   **ECC (Error-Correcting Code) RAM**: Crucial for database servers. It detects and corrects memory errors, preventing data corruption and system crashes, which is paramount for data integrity.

## 2. Storage Technologies

Storage forms the foundation of data persistence and directly impacts database performance.

### Direct Attached Storage (DAS)

Storage directly connected to a single server.

*   **Hard Disk Drives (HDDs)**:
    *   **Mechanism**: Mechanical platters store data magnetically, accessed by read/write heads.
    *   **Characteristics**: High capacity, low cost per GB, but slow I/O operations per second (IOPS) and high latency due to mechanical movement.
    *   **Best for**: Archival storage, backups, less performance-critical data.
*   **Solid State Drives (SSDs)**:
    *   **Mechanism**: Uses NAND flash memory to store data electronically.
    *   **Characteristics**: Significantly higher IOPS, much lower latency than HDDs, no moving parts, more expensive per GB.
    *   **Types**:
        *   **SATA SSD**: Connects via SATA interface, limited by SATA bus speed (up to 600 MB/s).
        *   **NVMe SSD**: Connects via PCIe interface, offering direct path to the CPU. Provides extreme performance with very low latency and high throughput (multiple GB/s). Ideal for critical database files, transaction logs, and `tempdb`.

### Network Attached Storage (NAS)

*   **Concept**: A dedicated file storage server accessible over a standard network (Ethernet) using file-level protocols like NFS (Network File System) or SMB/CIFS.
*   **Characteristics**: Centralized, easy to manage, good for shared file storage, backups, and less I/O-intensive databases.
*   **Impact on Databases**: Can introduce network latency. Generally not recommended for high-performance OLTP (Online Transaction Processing) databases unless network and NAS appliance are highly optimized.

### Storage Area Network (SAN)

*   **Concept**: A dedicated, high-speed network that provides block-level storage access to multiple servers. Servers perceive SAN storage as directly attached local disks.
*   **Protocols**: Fibre Channel (FC) for high performance, iSCSI for IP-based storage over Ethernet.
*   **Characteristics**: Highly scalable, high performance, robust data management features (snapshots, replication, thin provisioning).
*   **Best for**: Large, mission-critical databases requiring high performance, availability, and advanced storage features.

## 3. RAID Levels (Redundant Array of Independent Disks)

RAID combines multiple physical disk drives into one or more logical units for data redundancy and/or performance improvement.

*   **RAID 0 (Striping)**:
    *   **Function**: Data is split across all disks. No redundancy.
    *   **Pros**: Max performance (reads/writes).
    *   **Cons**: No fault tolerance; if one disk fails, all data is lost.
*   **RAID 1 (Mirroring)**:
    *   **Function**: Data is duplicated across two disks. 50% storage efficiency.
    *   **Pros**: Excellent read performance, good fault tolerance (can lose one disk).
    *   **Cons**: Poorer write performance (data written twice).
*   **RAID 5 (Striping with Parity)**:
    *   **Function**: Data striped across disks with parity information distributed among them. Tolerates one disk failure.
    *   **Pros**: Good balance of performance, capacity, and redundancy.
    *   **Cons**: Write performance penalty due to parity calculation; rebuild times can be long.
*   **RAID 6 (Striping with Double Parity)**:
    *   **Function**: Similar to RAID 5 but includes two independent parity blocks. Tolerates two disk failures.
    *   **Pros**: Higher fault tolerance than RAID 5.
    *   **Cons**: Higher write penalty than RAID 5, lower performance due to double parity calculation.
*   **RAID 10 (1+0) (Striping of Mirrors)**:
    *   **Function**: Combines RAID 1 (mirroring) and RAID 0 (striping). Data is mirrored, then the mirrors are striped.
    *   **Pros**: Excellent performance (especially reads), high redundancy (can lose multiple disks as long as they are not mirrors of each other).
    *   **Cons**: High cost per GB (50% storage efficiency).
    *   **Best for**: High-performance, mission-critical database applications.

## 4. Filesystems for Databases

A filesystem organizes and manages files on storage devices, impacting how data is accessed and managed.

*   **ext4 (Fourth Extended Filesystem)**:
    *   **Characteristics**: Default Linux filesystem, journaling capabilities (improves crash recovery), stable, widely adopted.
    *   **Suitability**: Good general-purpose filesystem, suitable for many database workloads.
*   **XFS (Extended File System)**:
    *   **Characteristics**: High-performance, highly scalable filesystem developed by SGI. Optimized for large files and parallel I/O, excellent for concurrent read/write operations.
    *   **Suitability**: Often preferred for large databases and high-I/O workloads where performance is critical.
*   **ZFS (Zettabyte File System)**:
    *   **Characteristics**: Advanced filesystem and logical volume manager. Features include data integrity (checksums), copy-on-write, snapshots, data compression, deduplication, and a robust storage pooling model.
    *   **Suitability**: Offers unparalleled data integrity and management features, but can be resource-intensive (especially RAM) and complex to configure.

### Example: Formatting and Mounting an XFS Filesystem

```bash
# Step 1: Install XFS utilities if not already installed
# For Debian/Ubuntu:
sudo apt update
sudo apt install xfsprogs

# For CentOS/RHEL:
sudo yum install xfsprogs

# Step 2: Format a disk partition (e.g., /dev/sdb1) with XFS
# WARNING: This will erase all data on the partition!
sudo mkfs.xfs /dev/sdb1

# Step 3: Create a mount point for the filesystem
sudo mkdir /mnt/database_data

# Step 4: Mount the XFS filesystem
sudo mount /dev/sdb1 /mnt/database_data

# Step 5: Verify the mount
df -h /mnt/database_data

# Step 6: Add an entry to /etc/fstab for persistent mounting across reboots
# First, find the UUID of your new XFS filesystem:
# sudo blkid /dev/sdb1
# Example output: /dev/sdb1: UUID="a1b2c3d4-e5f6-7890-1234-567890abcdef" TYPE="xfs"

# Open /etc/fstab with a text editor (e.g., nano or vim)
sudo nano /etc/fstab

# Add the following line, replacing with your actual UUID:
# UUID=a1b2c3d4-e5f6-7890-1234-567890abcdef /mnt/database_data xfs defaults,noatime 0 2

# The 'noatime' option can improve performance by reducing metadata writes.
# Save and exit the editor. Test fstab by remounting everything:
sudo mount -a
```

## 5. Virtualization and Databases

**Virtualization** allows multiple isolated virtual machines (VMs) to run on a single physical server (host) using a hypervisor (e.g., VMware ESXi, KVM, Hyper-V).

*   **Benefits**: Increased resource utilization, flexibility, easier disaster recovery, simplified server provisioning.
*   **Challenges for Databases**:
    *   **Resource Contention**: If not properly managed, VMs can compete for CPU, RAM, and I/O resources, leading to performance degradation.
    *   **I/O Overhead**: The virtualization layer can add latency to disk I/O, impacting transaction throughput.
    *   **Proper Sizing**: Databases often require dedicated or carefully allocated resources (CPU cores, RAM reservations, direct access storage where possible, like RDM in VMware or pass-through).
    *   **CPU Over-provisioning**: Can lead to 