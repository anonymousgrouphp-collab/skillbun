# Local Data Storage and Persistence Management: Study Guide

Unlike web apps that rely on cloud databases, desktop apps store data locally on the user's hard drive using SQLite, Key-Value stores, or simple JSON files.

## 1. Key Concepts

### Concept 1: Local JSON/Settings Files
Storing configuration preferences in simple files (e.g., config.json) in the user's appData directory.

### Concept 2: SQLite Database
Integrating lightweight, transactional SQL database files directly inside the application folder for complex relational data.

### Concept 3: Key-Value Stores (LevelDB / NeDB)
Using local document-based or key-value libraries for fast local storage without complex SQL setups.

## 2. Practical Example

### Local Data Storage and Persistence Management Example Setup
```javascript
Reading/Writing settings file in Electron main.js:
const fs = require('fs');
const path = require('path');
const configPath = path.join(app.getPath('userData'), 'settings.json');
fs.writeFileSync(configPath, JSON.stringify({ theme: 'dark' }));
```

## 3. Quick Check-Up

1. Where should local application settings be stored on Windows, macOS, and Linux?
2. Explain the advantages of SQLite over simple file storage for desktop apps.
3. How do you manage local database version migrations during application updates?
