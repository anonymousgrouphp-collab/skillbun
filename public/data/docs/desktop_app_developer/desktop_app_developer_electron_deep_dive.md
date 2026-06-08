# Framework Deep Dive: Electron: Study Guide

Electron is the most popular framework for building desktop apps with web technologies, powering VS Code, Discord, and Slack. It combines Chromium and Node.js.

## 1. Key Concepts

### Concept 1: Multi-Process Architecture
Electron separates operations into a Main process (handles native OS integration, windows) and Renderer processes (handles UI, Chromium).

### Concept 2: IPC Bridge (Inter-Process Communication)
Communicating securely between the Main and Renderer processes using ipcMain and ipcRenderer channels.

### Concept 3: Context Isolation & Security
Enforcing security configurations like contextIsolation, nodeIntegration: false, and using preload scripts to expose specific APIs.

## 2. Practical Example

### Framework Deep Dive: Electron Example Setup
```javascript
Enforcing security context isolation in Electron main.js:
const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  }
});
```

## 3. Quick Check-Up

1. Why does Electron run Chromium and Node.js in separate processes?
2. What is a preload script and why is it crucial for security in Electron?
3. How do you configure Content Security Policy (CSP) in an Electron app?
