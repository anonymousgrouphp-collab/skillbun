# Advanced Shell Scripting (Bash/Zsh)

Advanced Shell Scripting empowers engineers to automate complex operational tasks, manage system configurations, and process data efficiently using the power of the command line. Mastering these techniques transforms repetitive manual work into reliable, scalable, and maintainable scripts. This guide covers essential advanced topics in Bash and Zsh scripting.

## 1. Conditional Logic

Conditional statements allow scripts to make decisions based on various conditions, enabling dynamic behavior.

### `if`/`elif`/`else`

Executes blocks of code based on whether a condition is true or false.

```bash
#!/bin/bash
read -p "Enter a number: " num

if [ "$num" -gt 10 ]; then
  echo "$num is greater than 10."
elif [ "$num" -eq 10 ]; then
  echo "$num is equal to 10."
else
  echo "$num is less than 10."
fi
```

### `case` statements

Provides a cleaner way to handle multiple `elif` conditions, especially when comparing a single variable against several possible values.

```bash
#!/bin/bash
read -p "Enter a color (red/blue/green): " color

case "$color" in
  "red")
    echo "You chose red."
    ;;
  "blue")
    echo "You chose blue."
    ;;
  "green")
    echo "You chose green."
    ;;
  *)
    echo "Unknown color."
    ;;
esac
```

## 2. Loops

Loops are fundamental for repeating a set of commands multiple times, iterating over lists, or processing data until a condition is met.

### `for` loop

Iterates over a list of items (e.g., files, strings, numbers).

```bash
#!/bin/bash
echo "Listing files in current directory:"
for file in *; do
  if [ -f "$file" ]; then
    echo "  - $file"
  fi
done
```

### `while` loop

Executes commands as long as a specified condition is true.

```bash
#!/bin/bash
count=1
while [ $count -le 5 ]; do
  echo "Count: $count"
  count=$((count + 1))
done
```

## 3. Functions

Functions encapsulate reusable blocks of code, improving script readability, modularity, and maintainability.

```bash
#!/bin/bash

# Function definition
greet_user() {
  local name=$1 # 'local' ensures the variable is scoped to the function
  echo "Hello, $name! Welcome to advanced scripting."
  return 0 # Explicitly return success
}

# Calling the function
greet_user "Alice"
greet_user "Bob"

# Accessing function arguments: $1, $2, ..., $@ (all arguments), $# (number of arguments)
add_numbers() {
  echo "Adding $1 and $2..."
  sum=$(( $1 + $2 ))
  echo "Sum is: $sum"
}

add_numbers 10 20
```

## 4. Error Handling

Robust scripts anticipate and handle errors gracefully.

*   `set -e`: Exits immediately if a command exits with a non-zero status (error).
*   `set -u`: Treats unset variables as an error and exits.
*   `set -o pipefail`: Returns the exit status of the last command in the pipe that failed.
*   `trap`: Executes a command when a signal is received (e.g., `EXIT`, `ERR`, `INT`).

```bash
#!/bin/bash
set -euo pipefail # Enable strict error handling

# Function to clean up resources
cleanup() {
  echo "Cleaning up temporary files..."
  rm -f /tmp/myapp_temp_file_*.txt
  echo "Cleanup complete."
}

# Register the cleanup function to run on script exit (even if it fails)
trap cleanup EXIT

echo "Starting script..."

# Simulate a command that might fail
# cp non_existent_file.txt /tmp/myapp_temp_file_123.txt # Uncomment to test error exit

echo "Script finished successfully."
# If an error occurred before this, 'cleanup' would still run.
```

## 5. Environment Variables

Environment variables are dynamic named values that can affect the way running processes behave. They are crucial for configuring scripts without hardcoding values.

```bash
#!/bin/bash

# Set an environment variable (for the current shell session/script)
export APP_CONFIG_PATH="/etc/myapp/config.yml"

echo "Application config path: $APP_CONFIG_PATH"

# Accessing built-in environment variables
echo "Current user: $USER"
echo "Home directory: $HOME"
echo "Current shell: $SHELL"
```

## 6. Powerful Text Processing Tools

These tools are indispensable for parsing, filtering, and transforming text data, often used in conjunction with pipelines.

### `grep` (Global Regular Expression Print)

Searches for patterns in text files.

```bash
#!/bin/bash
echo "Searching for 'error' in log.txt:"
grep -i "error" /var/log/syslog # -i for case-insensitive
```

### `sed` (Stream Editor)

A powerful tool for performing text transformations on an input stream (a file or input from a pipeline).

```bash
#!/bin/bash
echo "Original: Hello World" | sed 's/World/Bash/' # Substitute 'World' with 'Bash'
echo "Line 1\nLine 2\nLine 3" | sed '2d' # Delete the second line
```

### `awk`

A programming language designed for processing text files, particularly useful for structured data (columns).

```bash
#!/bin/bash
# Simulate a CSV file
echo "Name,Age,City\nAlice,30,NY\nBob,24,LA\nCharlie,35,Chicago" | awk -F',' '{print "Name:", $1, ", Age:", $2}'
# -F',' sets comma as field separator
# print $1 (first field), $2 (second field)
```

### `jq`

A lightweight and flexible command-line JSON processor. Essential for working with JSON data in scripts.

```bash
#!/bin/bash
# Simulate a JSON string
json_data='{"name": "Alice", "age": 30, "city": "New York"}'

echo "$json_data" | jq '.name'      # Extract 'name'
echo "$json_data" | jq '.age'       # Extract 'age'
echo "$json_data" | jq '.city'      # Extract 'city'
echo "$json_data" | jq '{user: .name, location: .city}' # Transform JSON
```

## Checklist/Exercises:

1.  **Script a Backup:** Write a Bash script that takes a directory path as an argument. The script should create a compressed `.tar.gz` archive of that directory, naming the archive `backup_<DATETIME>.tar.gz` and placing it in a `/tmp/backups` directory (create if not exists). Implement error handling to ensure the script exits if the source directory doesn't exist.
2.  **Log Analysis with `awk` & `grep`:** Given a simulated log file (`my_app.log`) with lines like `[INFO] User logged in`, `[ERROR] Failed to connect`, `[DEBUG] Variable x=5`, write a script that first `grep`s for all "ERROR" lines, then uses `awk` to extract the error message (e.g., everything after `[ERROR] `).
3.  **JSON Configuration Loader with `jq`:** Imagine a `config.json` file: `{"server_ip": "192.168.1.1", "port": 8080, "log_level": "INFO"}`. Write a script that reads `server_ip` and `port` using `jq` and then prints "Connecting to server_ip:port...".