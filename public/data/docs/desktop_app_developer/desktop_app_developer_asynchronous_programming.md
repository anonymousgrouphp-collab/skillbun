# Asynchronous Programming and Concurrency: Study Guide

Desktop apps must remain responsive. Heavy operations like database writes, compiling, or image processing must run asynchronously in worker threads.

## 1. Key Concepts

### Concept 1: Main Loop Block Avoidance
Ensuring the UI render process is never blocked by executing computational loads in child processes or workers.

### Concept 2: Worker Threads & Child Processes
Spawning separate system threads (Node Worker Threads, Rust threads) to execute long-running tasks.

### Concept 3: Promises & Async/Await
Using non-blocking async operations for file reads, database transactions, and network calls.

## 2. Practical Example

### Asynchronous Programming and Concurrency Example Setup
```javascript
Spawning a child process in Node.js to execute a shell command without blocking the Main process:
const { exec } = require('child_process');
exec('npm run build', (error, stdout, stderr) => {
  console.log(stdout);
});
```

## 3. Quick Check-Up

1. Why is blocking the main/UI thread unacceptable in desktop app development?
2. What is the difference between spawning a child process and spawning a worker thread?
3. How does Rust handle safe concurrency and memory access in Tauri backend commands?
