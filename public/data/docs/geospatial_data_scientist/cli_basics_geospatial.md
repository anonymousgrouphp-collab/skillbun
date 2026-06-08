# Command Line Interface (CLI) & Scripting Basics

## Introduction to the Command Line Interface (CLI)

The Command Line Interface (CLI) is a text-based interface used to operate software and operating systems. Unlike graphical user interfaces (GUIs), the CLI allows users to interact with the computer by typing commands. For a geospatial data scientist, mastering the CLI is indispensable. It provides direct, powerful control over files, processes, and applications, essential for automating tasks, managing large datasets, and interacting with specialized geospatial tools like GDAL/OGR, which often have powerful command-line interfaces.

## Fundamental Command-Line Operations

Here are some essential commands for navigating and managing your file system:

*   **`pwd` (Print Working Directory):** Shows the absolute path of your current location in the file system.
    ```bash
    pwd
    ```
*   **`ls` (List Directory Contents):** Lists files and directories in the current directory.
    *   `ls -l`: Long format (permissions, owner, size, date).
    *   `ls -a`: Show all files, including hidden ones (starting with `.`).
    *   `ls -F`: Append indicator (*/@/=|>|) to entries.
    ```bash
    ls -laF
    ```
*   **`cd` (Change Directory):** Navigates between directories.
    *   `cd ..`: Go up one directory.
    *   `cd ~`: Go to your home directory.
    *   `cd /path/to/directory`: Go to a specific absolute path.
    *   `cd my_project`: Go to a subdirectory named `my_project`.
    ```bash
    cd ..
    cd ~/Desktop/geo_data
    ```
*   **`mkdir` (Make Directory):** Creates new directories.
    *   `mkdir -p path/to/new/directory`: Creates parent directories if they don't exist.
    ```bash
    mkdir new_geodata_project
    mkdir -p raw_data/vector
    ```
*   **`rmdir` (Remove Directory):** Deletes empty directories. Use `rm -r` for non-empty ones.
    ```bash
    rmdir empty_folder
    ```
*   **`touch` (Create Empty File):** Creates an empty file or updates the timestamp of an existing one.
    ```bash
    touch notes.txt
    ```
*   **`cp` (Copy Files and Directories):** Copies files or directories.
    *   `cp source_file destination_file`
    *   `cp -r source_directory destination_directory`: Recursively copy directories.
    ```bash
    cp config.ini backup/config.ini.bak
    cp -r vector_data archives/vector_backup
    ```
*   **`mv` (Move or Rename Files and Directories):** Moves or renames files/directories.
    ```bash
    mv old_name.txt new_name.txt # Rename
    mv data.csv processed_data/ # Move
    ```
*   **`rm` (Remove Files and Directories):** Deletes files or directories. **Use with caution!**
    *   `rm filename.txt`
    *   `rm -r directory_name`: Recursively delete a directory and its contents.
    *   `rm -f filename.txt`: Force removal, ignore non-existent files.
    *   `rm -rf directory_name`: Force recursive deletion. **Extremely dangerous!**
    ```bash
    rm temp_file.log
    rm -r old_project_files
    ```
*   **`cat`, `less`, `more` (View File Content):**
    *   `cat file.txt`: Displays the entire content of a file.
    *   `less file.txt`: Allows interactive viewing, scrolling, and searching (press `q` to exit).
    *   `more file.txt`: Similar to `less` but with more limited functionality.
    ```bash
    cat README.md
    less large_log_file.txt
    ```
*   **`man` (Manual Pages):** Provides documentation for most commands.
    ```bash
    man ls
    ```

## File System Navigation: Absolute vs. Relative Paths

Understanding paths is crucial:

*   **Absolute Path:** The full path from the root directory (`/`). E.g., `/home/user/documents/report.txt`.
*   **Relative Path:** The path relative to your current working directory. E.g., if you are in `/home/user/documents`, then `report.txt` is a relative path to the file.
    *   `.`: Represents the current directory.
    *   `..`: Represents the parent directory.

## Pipes and Redirection

These powerful features allow you to chain commands and control input/output.

*   **`|` (Pipe):** Sends the standard output of one command as the standard input to another command.
    ```bash
    ls -l | less # List files in long format and pipe to less for interactive viewing
    cat data.csv | grep "Error" # Filter lines containing "Error" from data.csv
    ```
*   **`>` (Redirect Standard Output):** Redirects the standard output of a command to a file, overwriting it if it exists.
    ```bash
    ls -l > file_list.txt # Save directory listing to a file
    ```
*   **`>>` (Append Standard Output):** Redirects the standard output to a file, appending to it if it exists.
    ```bash
    echo "This is new data." >> log.txt # Add a line to log.txt
    ```
*   **`<` (Redirect Standard Input):** Redirects the content of a file as standard input to a command.
    ```bash
    # Example: sort < unsorted.txt > sorted.txt
    ```

## Introduction to Basic Scripting (Bash)

Bash scripting allows you to automate sequences of commands.

*   **Shebang:** The first line of a script, `#!/bin/bash`, tells the system which interpreter to use.
*   **Variables:** Define variables using `NAME="value"`. Access them with `$NAME`.
*   **Comments:** Lines starting with `#` are comments.
*   **Executing a Script:** Make it executable (`chmod +x script.sh`) and then run it (`./script.sh`).

### Example: A Simple Bash Script for Geospatial Data

Let's create a script that lists shapefiles (`.shp`) in a directory and then runs a hypothetical `gdal_info` command on each.

```bash
#!/bin/bash

# Define the directory containing geospatial data
DATA_DIR="./geospatial_assets"

# Create the directory if it doesn't exist
if [ ! -d "$DATA_DIR" ]; then
    echo "Creating directory: $DATA_DIR"
    mkdir -p "$DATA_DIR"
    # Create some dummy shapefiles for demonstration
    touch "$DATA_DIR/roads.shp" "$DATA_DIR/rivers.shp" "$DATA_DIR/buildings.shp"
fi

echo "--- Listing Shapefiles in $DATA_DIR ---"
# Loop through all .shp files in the specified directory
for shp_file in "$DATA_DIR"/*.shp; do
    if [ -f "$shp_file" ]; then # Check if it's a file
        echo "Found: $(basename "$shp_file")"
        # Simulate running a GDAL/OGR command
        echo "  Running 'gdalinfo' on $(basename "$shp_file")..."
        # In a real scenario, you'd replace this with an actual gdalinfo call:
        # gdalinfo "$shp_file" | head -n 5 # Only show first 5 lines for brevity
        echo "  (gdalinfo output would go here)"
    fi
done

echo "--- Script Finished ---"
```

To run this script:
1.  Save it as `process_geo_data.sh`.
2.  Make it executable: `chmod +x process_geo_data.sh`
3.  Run it: `./process_geo_data.sh`

## Relevance to Geospatial Data Science

CLI and scripting are paramount for geospatial professionals:
*   **GDAL/OGR:** These are the backbone of many geospatial operations. Their command-line utilities (`gdal_translate`, `ogr2ogr`, `gdalwarp`, `ogrinfo`, etc.) are heavily used for data format conversion, re-projection, spatial operations, and querying.
*   **Automation:** Scripts can automate repetitive tasks like downloading satellite imagery, converting file formats, processing large batches of LiDAR data, or generating daily reports.
*   **Reproducibility:** Scripts ensure that data processing steps are consistently applied, making workflows reproducible and auditable.
*   **Server Environments:** Many geospatial processes run on remote servers without a GUI, making CLI the only way to interact.

## Quick Understanding Checklist/Exercise

1.  Create a new directory named `my_geospatial_project`. Inside it, create two subdirectories: `raw` and `processed`.
2.  Navigate into the `raw` directory. Create an empty file named `elevation.tif`. Then, copy `elevation.tif` to the `processed` directory, renaming it to `elevation_clipped.tif` during the copy.
3.  Write a simple one-line command that lists all files in your home directory, pipes the output to `grep` to find any files containing "report", and then redirects this filtered output to a new file called `found_reports.txt` in your current working directory.
