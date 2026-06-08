# Python for Security Scripting & Automation: Study Guide

Python has become an indispensable language in cybersecurity, offering powerful capabilities for scripting, automation, and tool development. Its simplicity, extensive libraries, and cross-platform compatibility make it ideal for tasks ranging from network scanning and vulnerability analysis to log parsing and incident response.

## 1. Core Python Programming Fundamentals

Before diving into security-specific applications, a solid grasp of Python's basics is crucial.

*   **Variables & Data Types**: Understand integers, floats, strings, booleans, lists, tuples, dictionaries, and sets.
*   **Control Flow**: Master `if/elif/else` statements for conditional logic and `for`/`while` loops for iteration.
*   **Functions**: Define and call functions to encapsulate reusable code blocks.
*   **Modules & Packages**: Learn how to import and use standard library modules (e.g., `os`, `sys`) and external packages (`pip`).

```python
# Example: Basic function and list iteration
def greet_users(user_list):
    for user in user_list:
        print(f"Hello, {user}!")

security_analysts = ["Alice", "Bob", "Charlie"]
greet_users(security_analysts)
```

## 2. Network Programming with Sockets

The `socket` module in Python provides access to the BSD socket interface, allowing you to create network connections and build client-server applications.

*   **Socket Basics**: Understand `socket.socket()`, `bind()`, `listen()`, `accept()` for servers, and `connect()` for clients.
*   **TCP (SOCK_STREAM)**: Reliable, connection-oriented communication, ideal for data transfer where integrity is paramount.
*   **UDP (SOCK_DGRAM)**: Connectionless, unreliable, but faster communication, suitable for tasks like port scanning or DNS queries.

```python
# Example: Simple TCP Client (conceptual for a port scanner)
import socket

def check_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1) # 1 second timeout
        result = sock.connect_ex((host, port))
        if result == 0:
            print(f"Port {port} on {host} is OPEN")
        else:
            print(f"Port {port} on {host} is CLOSED")
        sock.close()
    except socket.error as e:
        print(f"Error connecting to {host}:{port} - {e}")

# check_port("scanme.nmap.org", 80) # Uncomment to test
```

## 3. File I/O Operations

Interacting with files is fundamental for reading configurations, saving output, or parsing log files.

*   **Reading Files**: Using `open()` with `"r"` mode, `read()`, `readline()`, `readlines()`, and iterating over file objects.
*   **Writing Files**: Using `open()` with `"w"` (write, overwrites), `"a"` (append) modes, and `write()`, `writelines()`.
*   **Context Managers (`with` statement)**: Essential for ensuring files are properly closed, even if errors occur.

```python
# Example: Reading and writing a simple log file
log_content = [
    "[INFO] User 'admin' logged in from 192.168.1.100",
    "[WARNING] Failed login attempt from 10.0.0.5",
    "[ERROR] Critical service stopped"
]

with open("security.log", "w") as f:
    for line in log_content:
        f.write(line + "\n")

with open("security.log", "r") as f:
    for line in f:
        print(f"Log Entry: {line.strip()}")
```

## 4. Regular Expressions (Regex)

The `re` module allows for powerful pattern matching and manipulation of strings, crucial for parsing unstructured text like log entries or network traffic.

*   **Basic Syntax**: Characters (`.`, `*`, `+`, `?`), character classes (`[a-zA-Z0-9]`, `\d`, `\w`, `\s`), anchors (`^`, `$`, `\b`).
*   **Functions**: `re.search()`, `re.match()`, `re.findall()`, `re.sub()`, `re.compile()`.

```python
# Example: Parsing IP addresses from a log line
import re

log_line = "[INFO] User 'admin' logged in from 192.168.1.100 at 2023-10-27 10:30:00"
ip_pattern = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"

match = re.search(ip_pattern, log_line)
if match:
    print(f"Found IP Address: {match.group(0)}")

failed_attempts = "[WARNING] Failed login attempt from 10.0.0.5 and 10.0.0.6"
all_ips = re.findall(ip_pattern, failed_attempts)
print(f"All IPs in line: {all_ips}")
```

## 5. Data Parsing (JSON, XML, CSV)

Security tools often interact with data in structured formats. Python's built-in libraries make parsing these formats straightforward.

*   **JSON (`json` module)**: `json.loads()` (string to dict), `json.dumps()` (dict to string), `json.load()` (file to dict), `json.dump()` (dict to file).
*   **XML (`xml.etree.ElementTree` module)**: Parsing XML structures, navigating elements, attributes, and text.
*   **CSV (`csv` module)**: Reading and writing tabular data.

## 6. Interacting with APIs

Many security services (e.g., threat intelligence platforms, vulnerability scanners, SIEMs) provide APIs for programmatic access. The `requests` library is the de facto standard for HTTP requests in Python.

*   **`requests` library**: Making GET, POST, PUT, DELETE requests.
*   **Request Parameters**: `params` (query string), `data` (form-encoded), `json` (JSON payload), `headers`.
*   **Response Handling**: Accessing `response.status_code`, `response.text`, `response.json()`, `response.headers`.
*   **Authentication**: Basic, token, OAuth (conceptual understanding).

```python
# Example: Fetching data from a public API
import requests

def get_public_ip():
    try:
        response = requests.get("https://api.ipify.org?format=json")
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        ip_data = response.json()
        print(f"Your public IP address is: {ip_data['ip']}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching IP: {e}")

# get_public_ip() # Uncomment to test
```

## 7. Developing Simple Security Tools

Combine the above concepts to build practical security scripts.

*   **Port Scanners**: Use sockets to connect to a range of ports on a target host to identify open services.
*   **Log Parsers**: Apply file I/O and regular expressions to extract specific information (e.g., IP addresses, error codes, usernames) from large log files.
*   **Network Packet Analyzers (Basic)**: Using libraries like `scapy` (external, not covered here) or raw sockets to capture and inspect network traffic.
*   **Password Brute-Forcers (Educational)**: Implement scripts to attempt multiple password guesses against a service, understanding ethical implications and rate limiting.

## Checklist/Exercise:

1.  **Log File Analysis**: Write a Python script that reads a simulated web server access log (e.g., `access.log` with lines like `192.168.1.10 - [27/Oct/2023:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1234`) and extracts all unique IP addresses that generated a `200 OK` status code.
2.  **API Interaction**: Use the `requests` library to query a public API (e.g., `https://api.github.com/users/octocat`) and print specific fields from the JSON response, such as the user's name and number of public repositories.
3.  **Basic Network Scan**: Create a simple Python script using the `socket` module to check if port 22 (SSH) and port 80 (HTTP) are open on `scanme.nmap.org`. Print whether each port is open or closed.