# Local Data Persistence & Offline Support in Flutter

Modern mobile applications often need to function reliably even when network connectivity is unreliable or completely absent. This requires robust local data persistence and strategies for offline support. This guide explores various methods to store data locally in Flutter applications, from simple key-value pairs to complex relational and NoSQL databases, enabling a seamless user experience regardless of network conditions.

## 1. Introduction to Local Data Persistence

Local data persistence refers to storing application data directly on the user's device. This is crucial for:
*   **Offline Access**: Users can view and interact with data even without an internet connection.
*   **Performance**: Retrieving data from local storage is often much faster than fetching it from a remote server.
*   **Caching**: Storing frequently accessed data to reduce network requests and improve responsiveness.
*   **User Preferences**: Saving user settings, themes, and other preferences.

## 2. Shared Preferences (Key-Value Storage)

`shared_preferences` is a Flutter plugin that wraps platform-specific persistent storage for simple data. It's ideal for storing small amounts of primitive data types (booleans, integers, doubles, strings, and string lists).

*   **Use Cases**: User settings, theme preferences, login tokens, small flags.
*   **Limitations**: Not suitable for complex data structures or large datasets.

### Example: Saving and Retrieving a Theme Preference

First, add `shared_preferences` to your `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  shared_preferences: ^2.2.0
```

Then, use it in your Dart code:
```dart
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService {
  static const String _themeKey = 'isDarkMode';

  Future<bool> loadThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_themeKey) ?? false; // Default to light mode
  }

  Future<void> saveThemePreference(bool isDarkMode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_themeKey, isDarkMode);
  }
}

// Usage example:
// void main() async {
//   WidgetsFlutterBinding.ensureInitialized();
//   final themeService = ThemeService();
//   bool isDark = await themeService.loadThemePreference();
//   print('Is dark mode: $isDark');
//   await themeService.saveThemePreference(true);
//   print('Saved dark mode preference');
// }
```

## 3. Relational Databases (SQLite & drift)

For structured, complex data models requiring powerful querying capabilities, relational databases are the go-to solution. SQLite is a lightweight, serverless, self-contained, high-reliability, full-featured relational database engine.

*   **`sqflite`**: A Flutter plugin for SQLite databases. It provides direct access to SQLite operations.
*   **`drift` (formerly `moor`)**: A reactive, type-safe persistence library built on top of SQLite. It generates a lot of boilerplate code for you, making database interactions safer and easier, especially with complex queries and relationships.

*   **Use Cases**: User profiles, product catalogs, task lists, any application with interconnected data.

### Example: Basic `sqflite` Initialization

Add `sqflite` and `path_provider` to your `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  sqflite: ^2.3.0
  path_provider: ^2.1.0
```

Then, initialize and create a table:
```dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart'; // Ensure this is imported for getDatabasesPath

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'my_app_database.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute(
          'CREATE TABLE items(id INTEGER PRIMARY KEY, name TEXT, description TEXT)',
        );
      },
    );
  }

  // Example: Insert an item
  Future<int> insertItem(Map<String, dynamic> item) async {
    Database db = await database;
    return await db.insert('items', item);
  }

  // Example: Query all items
  Future<List<Map<String, dynamic>>> getItems() async {
    Database db = await database;
    return await db.query('items');
  }
}
```

## 4. NoSQL Databases (Hive & Isar)

NoSQL databases are excellent for flexible, schema-less data storage, often providing superior performance for specific use cases, especially with complex object graphs.

*   **Hive**: A lightweight and blazing fast key-value database for Flutter and Dart. It's incredibly simple to use, ideal for caching, and storing objects without complex querying needs.
*   **Isar**: A newer, extremely fast, cross-platform NoSQL database for Flutter. It offers powerful querying capabilities (like SQL-style queries) and is optimized for speed and developer experience.

*   **Use Cases**: Caching large JSON responses, storing user-generated content, logs, frequently changing data.

### Example: Basic Hive Setup

Add `hive` and `hive_flutter` to your `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  path_provider: ^2.1.0 # Required for initializing Hive path
```

Then, initialize Hive and open a box:
```dart
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';

class CacheService {
  static const String _boxName = 'appCache';

  Future<void> init() async {
    final appDocumentDir = await getApplicationDocumentsDirectory();
    await Hive.initFlutter(appDocumentDir.path);
    await Hive.openBox<String>(_boxName); // Box to store key-value strings
  }

  Future<void> saveString(String key, String value) async {
    final box = Hive.box<String>(_boxName);
    await box.put(key, value);
  }

  String? getString(String key) {
    final box = Hive.box<String>(_boxName);
    return box.get(key);
  }
}

// Usage example:
// void main() async {
//   WidgetsFlutterBinding.ensureInitialized();
//   final cacheService = CacheService();
//   await cacheService.init();
//
//   await cacheService.saveString('username', 'Alice');
//   print('Username: ${cacheService.getString('username')}'); // Output: Username: Alice
// }
```

## 5. Offline Support and Caching Strategies

Implementing offline support goes beyond just storing data; it involves strategic decisions on how data is managed when connectivity changes.

*   **Cache-First**: Attempt to load data from the local cache first. If it exists, display it. Then, optionally, fetch fresh data from the network and update the cache.
*   **Network-First with Fallback**: Always try to fetch data from the network. If the network is unavailable, fall back to displaying cached local data.
*   **Stale-While-Revalidate**: Display cached data immediately (stale) while simultaneously checking the network for newer data (revalidate). If new data is available, update the UI and cache.
*   **Background Sync**: Queue up changes made offline and synchronize them with the server when connectivity is restored. This often involves work managers or background tasks.

## Checklist/Exercise

1.  **SharedPreferences**: Implement a feature where a user can toggle a "Dark Mode" setting, and this preference persists across app restarts using `shared_preferences`.
2.  **`sqflite` / `drift`**: Design a simple data model for a "Notes" app (e.g., `Note` with `id`, `title`, `content`, `timestamp`). Outline the basic `CREATE TABLE` SQL command for `sqflite` or define the table with `drift`.
3.  **Hive / Isar**: Explain when you would choose Hive over `sqflite` for storing a list of cached product details fetched from an API. Consider performance and data structure flexibility.