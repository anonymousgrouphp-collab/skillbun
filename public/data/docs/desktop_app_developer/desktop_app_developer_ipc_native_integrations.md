# Inter-Process Communication (IPC) & Native OS Integrations: Study Guide

IPC allows the sandboxed UI layer to securely request action execution from the native OS process, enabling interactions with the system tray, menus, and file systems.

## 1. Key Concepts

### Concept 1: File System access
Using native OS save/open dialog boxes to read and write files locally.

### Concept 2: System Tray and Menus
Adding application icons to the OS system tray/notification area and creating context menus.

### Concept 3: Global Shortcuts
Registering global keyboard shortcuts that trigger app actions even when the window is blurred.

## 2. Practical Example

### Inter-Process Communication (IPC) & Native OS Integrations Example Setup
```javascript
Opening a native file dialog in Electron main process:
const { dialog } = require('electron');
dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
```

## 3. Quick Check-Up

1. How does context isolation affect how IPC is exposed to frontend JavaScript?
2. Why are global shortcuts dangerous to register without proper bounds?
3. How do you implement system tray alerts and notifications?
