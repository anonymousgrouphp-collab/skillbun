# Network Communication & RESTful APIs in Android

Network communication is a cornerstone of modern Android applications, enabling them to fetch data, interact with services, and provide dynamic content. This guide covers essential concepts and popular libraries for consuming RESTful APIs.

## 1. Understanding RESTful APIs

REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs are stateless, client-server based, and utilize standard HTTP methods to perform operations on resources.

*   **Resources:** Any data object accessible via a URL (e.g., `/users`, `/products/123`).
*   **HTTP Methods:**
    *   `GET`: Retrieve data.
    *   `POST`: Create new data.
    *   `PUT`/`PATCH`: Update existing data.
    *   `DELETE`: Remove data.
*   **Statelessness:** Each request from a client to a server must contain all the information needed to understand the request.
*   **JSON (JavaScript Object Notation):** The most common data interchange format for RESTful APIs due to its human-readability and lightweight nature.

## 2. Core Networking Libraries

Android's default `HttpURLConnection` is functional but often verbose. Third-party libraries simplify network interactions significantly.

### OkHttp

OkHttp is an efficient HTTP client developed by Square. It's a low-level library that handles connection pooling, gzipping, response caching, and retries automatically. Many higher-level networking libraries, including Retrofit, use OkHttp internally.

**Key Features:**
*   Handles network connection issues gracefully.
*   Supports synchronous and asynchronous requests.
*   Interceptor mechanism for modifying requests and responses.

### Retrofit

Retrofit, also by Square, is a type-safe HTTP client for Android and Java. It builds on top of OkHttp and provides a powerful, declarative way to interact with REST APIs using annotations.

**Key Features:**
*   **Declarative API:** Define API endpoints using Java/Kotlin interfaces and annotations.
*   **Converter Factories:** Seamlessly integrates with JSON (Moshi, Gson, Jackson) or XML serialization libraries.
*   **Asynchronous & Synchronous:** Supports both `Call` objects for asynchronous execution and `suspend` functions for Kotlin coroutines.

## 3. JSON Serialization/Deserialization

To convert JSON data from an API into Java/Kotlin objects and vice-versa, you need a serialization library.

### Moshi vs. Gson

*   **Moshi:** Developed by Square, often preferred for Kotlin projects due to its Kotlin-friendly extensions and support for Kotlin data classes.
*   **Gson:** Developed by Google, widely used and mature, compatible with Java and Kotlin.

Both integrate with Retrofit via `Converter.Factory` implementations (e.g., `MoshiConverterFactory`, `GsonConverterFactory`).

## 4. Implementing Network Requests with Retrofit (Example)

Let's illustrate a basic setup for fetching a list of posts from a dummy API (`https://jsonplaceholder.typicode.com/posts`).

### Step 1: Add Dependencies

In your `build.gradle (Module: app)`:

```gradle
dependencies {
    // Retrofit & OkHttp
    implementation "com.squareup.retrofit2:retrofit:2.9.0"
    implementation "com.squareup.okhttp3:okhttp:4.12.0" // Ensure OkHttp matches Retrofit's internal version or is compatible
    
    // Moshi Converter (or Gson/Jackson)
    implementation "com.squareup.retrofit2:converter-moshi:2.9.0"
    implementation "com.squareup.moshi:moshi-kotlin:1.15.0"
    kapt "com.squareup.moshi:moshi-kotlin-codegen:1.15.0" // For Kotlin data classes with Moshi
}
```
**Note**: `kapt` requires the Kotlin Annotation Processing Plugin (`id 'org.jetbrains.kotlin.kapt'` at the top of `build.gradle`).

### Step 2: Create a Data Model

Define a Kotlin data class representing a single post:

```kotlin
// data/Post.kt
package com.skillbun.myapp.data

import com.squareup.moshi.JsonClass // For Moshi

@JsonClass(generateAdapter = true) // For Moshi code generation
data class Post(
    val userId: Int,
    val id: Int,
    val title: String,
    val body: String
)
```

### Step 3: Define the API Interface

Create an interface with Retrofit annotations to describe your API endpoints:

```kotlin
// api/ApiService.kt
package com.skillbun.myapp.api

import com.skillbun.myapp.data.Post
import retrofit2.Response
import retrofit2.http.GET

interface ApiService {
    @GET("posts") // Relative URL path
    suspend fun getPosts(): Response<List<Post>> // Using suspend for Coroutines
}
```

### Step 4: Create a Retrofit Instance

Initialize Retrofit and your API service:

```kotlin
// network/RetrofitClient.kt
package com.skillbun.myapp.network

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://jsonplaceholder.typicode.com/"

    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory()) // For Kotlin data classes
        .build()

    val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(MoshiConverterFactory.create(moshi)) // Use Moshi for serialization
            .build()
    }

    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}
```

### Step 5: Make the API Call

Execute the request, typically from a ViewModel or Repository, within a Coroutine scope:

```kotlin
// Example in a ViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.skillbun.myapp.network.RetrofitClient
import kotlinx.coroutines.launch

class MyViewModel : ViewModel() {

    fun fetchPosts() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.getPosts()
                if (response.isSuccessful) {
                    val posts = response.body()
                    // Process posts (e.g., update LiveData)
                    println("Fetched ${posts?.size} posts")
                } else {
                    // Handle API error (e.g., 404, 500)
                    println("API Error: ${response.code()} - ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                // Handle network error (e.g., no internet, timeout)
                println("Network Error: ${e.message}")
            }
        }
    }
}
```

## 5. Robust Error Handling

*   **HTTP Status Codes:** Always check `response.isSuccessful()` and handle different `response.code()` values (e.g., 401 Unauthorized, 404 Not Found, 500 Internal Server Error).
*   **Network Exceptions:** Use `try-catch` blocks to catch `IOException` (no internet, timeout) or other exceptions during the network call.
*   **Error Body:** Parse `response.errorBody()?.string()` for detailed error messages from the API.

## 6. Network State Awareness

Before initiating network requests, it's good practice to check for active internet connectivity.

*   **`ConnectivityManager`:** Use `ConnectivityManager` to check the network status.
*   **Permissions:** Add `<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />` to `AndroidManifest.xml`.

```kotlin
// Example check
fun isNetworkAvailable(context: Context): Boolean {
    val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    val activeNetwork = connectivityManager.activeNetwork ?: return false
    val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return false
    return when {
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> true
        else -> false
    }
}
```

## 7. Secure Handling of API Keys and Sensitive Data

*   **Never hardcode API keys directly in source code.** They can be easily extracted.
*   **`local.properties`:** Store API keys in `local.properties` (which is not committed to version control) and inject them into `build.gradle` using `buildConfigField`.

    ```properties
    # local.properties
    API_KEY="your_super_secret_key"
    ```
    ```gradle
    // build.gradle (Module: app)
    android {
        defaultConfig {
            // ...
            Properties properties = new Properties()
            properties.load(project.rootProject.file("local.properties").newDataInputStream())
            buildConfigField "String", "API_KEY", "\"${properties.getProperty("API_KEY")}""
        }
    }
    ```
    Access in code: `BuildConfig.API_KEY`.

*   **Backend for Sensitive Operations:** For highly sensitive operations (e.g., payment processing), consider performing them on a secure backend server rather than directly from the Android client.
*   **HTTPS:** Always use HTTPS to encrypt communication and protect data in transit.
*   **ProGuard/R8:** Use obfuscation and shrinking tools (enabled by default in release builds) to make reverse-engineering harder, though not impossible.

---

### Quick Check/Exercise

1.  Explain the primary difference and relationship between OkHttp and Retrofit.
2.  Why is it crucial to handle API keys securely, and what is one recommended method to do so in an Android project?
3.  Describe a scenario where checking `ConnectivityManager` before making a network request is beneficial.