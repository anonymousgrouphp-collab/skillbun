# API Integration & Secure Communication in Flutter

Integrating with APIs is a fundamental part of building most modern Flutter applications. This guide covers how to perform HTTP requests, handle data serialization, manage authentication, ensure secure communication, and gracefully handle API errors.

## 1. Performing HTTP Requests

Flutter applications can make HTTP requests using several packages. The most common ones are `http` and `Dio`.

### The `http` Package

The `http` package is a lightweight, Future-based library for making HTTP requests.

**Installation:**
Add to `pubspec.yaml`:
```yaml
dependencies:
  http: ^1.0.0 # Use the latest stable version
```

**Basic Usage Example (GET Request):**
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<dynamic>> fetchPosts() async {
  final response = await http.get(Uri.parse('https://jsonplaceholder.typicode.com/posts'));

  if (response.statusCode == 200) {
    // If the server returns a 200 OK response, parse the JSON.
    return jsonDecode(response.body);
  } else {
    // If the server did not return a 200 OK response,
    // throw an exception.
    throw Exception('Failed to load posts');
  }
}

// Basic Usage Example (POST Request):
Future<http.Response> createPost(String title, String body) async {
  final response = await http.post(
    Uri.parse('https://jsonplaceholder.typicode.com/posts'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'title': title,
      'body': body,
      'userId': '1',
    }),
  );
  if (response.statusCode == 201) { // 201 Created for successful POST
    return response;
  } else {
    throw Exception('Failed to create post');
  }
}
```

### The `Dio` Package

Dio is a powerful HTTP client for Dart, which supports Interceptors, FormData, Request Cancellation, File downloading, Timeout, etc. It's often preferred for more complex scenarios due to its rich feature set.

**Installation:**
Add to `pubspec.yaml`:
```yaml
dependencies:
  dio: ^5.0.0 # Use the latest stable version
```

**Basic Usage Example (GET with Dio):**
```dart
import 'package:dio/dio.dart';

final dio = Dio();

Future<Map<String, dynamic>> fetchUserData(String userId) async {
  try {
    final response = await dio.get('https://api.example.com/users/$userId');
    if (response.statusCode == 200) {
      return response.data; // Dio automatically decodes JSON
    } else {
      throw Exception('Failed to load user data');
    }
  } on DioException catch (e) { // Specific Dio error handling
    if (e.response != null) {
      print('Dio error!');
      print('STATUS: ${e.response?.statusCode}');
      print('DATA: ${e.response?.data}');
      print('HEADERS: ${e.response?.headers}');
    } else {
      // Error due to setting up or sending the request
      print('Error sending request!');
      print(e.message);
    }
    throw Exception('Failed to load user data: ${e.message}');
  }
}
```

## 2. JSON Serialization/Deserialization

When you receive data from an API, it's typically in JSON format. You need to convert this JSON string into Dart objects (deserialization) and convert Dart objects back into JSON strings before sending them to an API (serialization).

### Manual Serialization/Deserialization

For simple cases, you can manually parse JSON using `dart:convert`.

```dart
// Example of a simple Dart model
class Post {
  final int userId;
  final int id;
  final String title;
  final String body;

  Post({required this.userId, required this.id, required this.title, required this.body});

  // Factory constructor for deserialization (JSON to Dart object)
  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      userId: json['userId'] as int,
      id: json['id'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
    );
  }

  // Method for serialization (Dart object to JSON)
  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'id': id,
      'title': title,
      'body': body,
    };
  }
}

// Usage:
// Deserialization:
// Map<String, dynamic> jsonMap = jsonDecode(response.body);
// Post post = Post.fromJson(jsonMap);

// Serialization:
// Post newPost = Post(userId: 1, id: 101, title: 'foo', body: 'bar');
// String jsonString = jsonEncode(newPost.toJson());
```

### Automated Serialization with `json_serializable`

For complex models or many models, manually writing `fromJson` and `toJson` methods becomes tedious and error-prone. The `json_serializable` package, in conjunction with `build_runner`, automates this process.

**Installation:**
Add to `pubspec.yaml`:
```yaml
dependencies:
  json_annotation: ^4.8.1 # For annotations

dev_dependencies:
  build_runner: ^2.4.6 # Code generation tool
  json_serializable: ^6.7.1 # Generates serialization code
```

**Usage Example:**
```dart
import 'package:json_annotation/json_annotation.dart';

// This is required for the generated file to access your model
part 'user.g.dart'; // `user.g.dart` will be generated

@JsonSerializable()
class User {
  final String name;
  final String email;

  User({required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

// Run this command in your terminal to generate `user.g.dart`:
// flutter pub run build_runner build
// Or for continuous generation:
// flutter pub run build_runner watch
```

## 3. Managing Authentication Tokens

Authentication tokens are crucial for securing API access. Common types include JWT (JSON Web Tokens) and OAuth tokens.

### JWT (JSON Web Tokens)

JWTs are compact, URL-safe means of representing claims to be transferred between two parties. They are often used for stateless authentication.

*   **Issuance:** After successful login, the server issues a JWT.
*   **Storage:** Store the JWT securely on the client-side (e.g., using `flutter_secure_storage`).
*   **Usage:** Include the JWT in the `Authorization` header of subsequent API requests, typically as a Bearer token.

### OAuth

OAuth is an open standard for access delegation, commonly used as a way for Internet users to grant websites or applications access to their information on other websites without giving them their passwords.

*   **Process:** Involves authorization servers, resource owners, and client applications. It's more complex, involving redirects and exchanging authorization codes for access tokens (and often refresh tokens).
*   **Flutter:** Typically integrated using specific OAuth client libraries or by opening web views for the authorization flow.

### Secure Token Storage

Storing tokens (especially access tokens, refresh tokens, and sensitive user data) securely is paramount.

*   `flutter_secure_storage`: A package that provides a secure way to store data on the device's keychain (iOS) or encrypted shared preferences (Android).

**Example of including JWT in headers:**
```dart
import 'package:http/http.dart' as http;
// Assume you have a stored JWT token
String? jwtToken = await storage.read(key: 'jwt_token'); // Using flutter_secure_storage

Future<http.Response> getProtectedData() async {
  if (jwtToken == null) {
    throw Exception('No JWT token found');
  }

  final response = await http.get(
    Uri.parse('https://api.example.com/protected'),
    headers: <String, String>{
      'Authorization': 'Bearer $jwtToken', // Include the token
      'Content-Type': 'application/json',
    },
  );

  if (response.statusCode == 200) {
    return response;
  } else if (response.statusCode == 401) {
    // Token expired or invalid, prompt for re-login or refresh token
    throw Exception('Unauthorized: Invalid or expired token');
  } else {
    throw Exception('Failed to load protected data');
  }
}
```

## 4. Implementing Secure API Communication

Security should be a top priority when interacting with APIs.

*   **HTTPS (SSL/TLS):** Always use HTTPS for all API communications. This encrypts data in transit, preventing eavesdropping and tampering. Most `http` and `Dio` requests automatically use HTTPS if the URL starts with `https://`.
*   **Certificate Pinning:** (Advanced) This is a security mechanism where your app "pins" or associates a host with its expected X.509 certificate or public key. If the server presents a different certificate during a TLS handshake, the connection is aborted. This protects against sophisticated Man-in-the-Middle (MITM) attacks. Implementations often involve packages like `dio_certificate_pinning`.
*   **Data Validation:** On both client and server sides, validate all input and output data to prevent injection attacks and ensure data integrity.
*   **Never Hardcode Sensitive Information:** API keys, secrets, and credentials should never be hardcoded directly into your application's source code. Use environment variables or secure configuration management.

## 5. Handling Common API Error Scenarios

Robust applications handle API errors gracefully, providing a good user experience even when things go wrong.

*   **Network Errors:**
    *   No internet connection.
    *   Timeout.
    *   Handle with `try-catch` blocks for `SocketException` (for `http` package) or `DioExceptionType.connectionError` (for Dio).
    *   Inform the user and offer a retry option.

*   **HTTP Status Codes:**
    *   **4xx Client Errors:**
        *   `400 Bad Request`: Invalid request payload.
        *   `401 Unauthorized`: Authentication required or failed (token missing/invalid). Often requires refreshing token or re-login.
        *   `403 Forbidden`: Authenticated, but user doesn't have permission.
        *   `404 Not Found`: Resource does not exist.
        *   `429 Too Many Requests`: Rate limiting applied.
    *   **5xx Server Errors:**
        *   `500 Internal Server Error`: Generic server error.
        *   `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`: Server issues.
    *   Always check `response.statusCode` and provide specific user feedback based on the error.

*   **Malformed Responses:**
    *   API returns non-JSON or unexpected data.
    *   Wrap `jsonDecode` calls in `try-catch` for `FormatException`.

**General Error Handling Strategy:**
```dart
try {
  final response = await http.get(Uri.parse('https://api.example.com/data'));
  if (response.statusCode == 200) {
    // Process data
  } else {
    // Handle specific HTTP status codes
    if (response.statusCode == 401) {
      print('Unauthorized! Please log in again.');
      // Navigate to login screen
    } else if (response.statusCode == 404) {
      print('Resource not found.');
    } else {
      print('Server error: ${response.statusCode}');
    }
  }
} on http.ClientException catch (e) {
  // Network-related errors (e.g., no internet, DNS lookup failed)
  print('Network error: ${e.message}');
  // Show a snackbar or dialog indicating no internet
} on FormatException {
  // JSON parsing error
  print('Invalid response format from server.');
} catch (e) {
  // Catch any other unexpected errors
  print('An unknown error occurred: $e');
}
```

---

### Quick Understanding Checklist/Exercise:

1.  **Package Selection:** When would you choose the `Dio` package over the `http` package for API integration in a Flutter app?
2.  **Authentication Flow:** Describe the typical steps involved in using a JWT for authenticating subsequent API requests after a user logs in.
3.  **Error Handling:** You receive a `401 Unauthorized` status code from an API. What are the common reasons for this error, and how should your Flutter app typically respond to it?