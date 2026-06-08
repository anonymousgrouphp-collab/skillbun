### File System Forensics Deep Dive

#### Introduction
File system forensics is a critical discipline within digital forensics, focusing on the examination of how data is stored, retrieved, and managed on storage devices. Understanding the intricacies of various file systems (like NTFS, Ext4, APFS, HFS+) is paramount for a DFIR analyst to uncover crucial evidence, reconstruct events, and recover deleted information. This study guide provides a deep dive into common file systems, their structures, metadata, journaling mechanisms, and advanced artifact analysis techniques.

#### 1. Common File Systems and Their Structures

##### 1.1. NTFS (New Technology File System)
Predominantly used by Windows operating systems, NTFS is a robust, journaling file system offering features like security descriptors, compression, encryption, and support for very large files.

*   **Master File Table (MFT):** The heart of NTFS. It's a database containing metadata about every file and directory on the volume. Each file/directory has at least one MFT record.
    *   **MFT Record Attributes:**
        *   `$STANDARD_INFORMATION`: Timestamps (creation, modification, access, MFT entry change), file attributes.
        *   `$FILE_NAME`: File name, parent directory MFT reference, timestamps.
        *   `$DATA`: The actual file content. For small files, data resides directly within the MFT record (resident data). For larger files, it points to external data runs (non-resident data).
    *   **Key Files within MFT:**
        *   `$MFT`: The MFT itself.
        *   `$LogFile`: Transaction log for file system integrity.
        *   `$UsnJrnl`: Update Sequence Number Journal.
        *   `$Bitmap`: Tracks allocated/unallocated clusters.
        *   `$Volume`: Volume metadata.

##### 1.2. Ext4 (Fourth Extended File System)
The default file system for many Linux distributions, Ext4 is a journaling file system that improves upon its predecessors (Ext2, Ext3) with better performance, larger volume/file size limits, and extent-based allocation.

*   **Structure:**
    *   **Superblock:** Contains global file system information (total blocks, inodes, free blocks, etc.).
    *   **Group Descriptors:** Describe each block group (location of bitmap, inode table).
    *   **Block Groups:** The file system is divided into groups, each typically containing:
        *   **Data Block Bitmap:** Tracks free/used data blocks.
        *   **Inode Bitmap:** Tracks free/used inodes.
        *   **Inode Table:** Stores inodes.
        *   **Data Blocks:** Where actual file data resides.
*   **Inodes:** Index nodes store metadata about files/directories (permissions, ownership, timestamps, size, data block pointers). Unlike NTFS where MFT records can contain data, Ext4 inodes primarily point to data blocks.
*   **Extents:** A contiguous range of physical blocks, improving performance by reducing fragmentation compared to traditional block mapping.

##### 1.3. APFS (Apple File System) and HFS+ (Hierarchical File System Plus)
APFS is Apple's modern file system, replacing HFS+ on macOS, iOS, and other Apple platforms. It's optimized for flash/SSD storage.

*   **HFS+:** Older Apple file system, single-file copies, less efficient for SSDs. Still found on older macOS systems and external drives.
*   **APFS Advantages:**
    *   **Snapshots:** Efficient point-in-time copies of the file system.
    *   **Space Sharing:** Multiple volumes can share the same underlying storage space.
    *   **Clones:** Instant copies of files/directories without consuming extra storage (until modifications occur).
    *   **Encryption:** Native multi-key encryption.
*   **APFS Structure:** Organized into Containers, which hold multiple APFS Volumes (e.g., System, Data, Preboot, Recovery). Uses B-trees for efficient data management and metadata storage.

#### 2. Advanced Artifact Analysis

##### 2.1. USN Journal (Update Sequence Number Journal - NTFS)
*   A change journal that tracks modifications to files and directories on an NTFS volume.
*   Records events like file creation, deletion, modification, renaming, and security changes.
*   **Forensic Value:** Provides a chronological history of file system activity, invaluable for timeline reconstruction and identifying user actions. Stored in the `$UsnJrnl` metadata file.

##### 2.2. Volume Shadow Copies (VSC - NTFS)
*   A technology that creates point-in-time copies (snapshots) of files or volumes. Windows uses VSCs for System Restore points, backups, and file versioning.
*   **Forensic Value:** Can contain previous versions of files, including deleted files or files modified to hide evidence. Analysts can mount VSCs to access historical data.

##### 2.3. APFS Snapshots (APFS)
*   Similar in concept to VSCs, APFS snapshots create read-only, point-in-time copies of an APFS volume.
*   **Forensic Value:** Preserves the state of the file system at the time of the snapshot, crucial for recovering previous versions of files, analyzing system state, and circumventing anti-forensic measures. Often created automatically by macOS (e.g., Time Machine local snapshots).

#### 3. Deleted File Recovery Techniques
When a file is "deleted" from a file system, its data blocks are often not immediately overwritten. Instead, the file system marks the allocated space as free and removes the pointers to the data (e.g., removes the MFT entry for NTFS, or marks the inode as free and removes directory entry for Ext4).

*   **Data Carving:** Recovering files based on their header and footer signatures (magic numbers), even if their metadata is lost.
*   **Unallocated Space Analysis:** Searching regions of the disk marked as "free" for remnants of deleted files or other relevant data.
*   **Journal Analysis:** Examining file system journals (NTFS `$LogFile`, Ext4 journal) can sometimes reveal information about deleted files before they were completely deallocated.
*   **Volume Shadow Copies/APFS Snapshots:** These can contain full copies of deleted files from a past state.

#### 4. Practical Example: Examining Ext4 Inode Information with `istat`
The `istat` tool, part of The Sleuth Kit (TSK), allows forensic analysts to display metadata about a specific inode in an Ext* file system.

Let's assume you have a disk image `evidence.dd` and you want to examine inode `12345` on partition `1`.

```bash
# First, identify the starting sector/offset of the Ext4 partition within the image.
# Use 'mmls' or 'fdisk -l' on the image to find partition details.
# Assuming partition 1 starts at sector 2048 (offset 2048 * 512 bytes = 1048576)

# Use istat to display inode information
istat -o 1048576 evidence.dd 12345
```

This command would output details such as:
*   Inode number and type
*   Permissions and ownership
*   Creation, modification, access, and deletion timestamps
*   File size
*   Number of links
*   Pointers to data blocks

#### 5. Quick Checklist/Exercise

1.  **Distinguish MFT vs. Inode:** Explain the fundamental difference between how NTFS uses the Master File Table (MFT) records and how Ext4 uses inodes to store file metadata.
2.  **USN Journal Value:** Describe two specific ways the NTFS USN Journal can be invaluable for a digital forensics investigation.
3.  **Deleted File Recovery:** Beyond simply marking space as "free", what are two key techniques used by forensic analysts to recover data from deleted files?