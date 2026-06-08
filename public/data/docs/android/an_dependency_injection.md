# Dependency Injection with Hilt in Android

This guide will walk you through the principles of Dependency Injection (DI) and how to implement it effectively in an Android application using Dagger Hilt. Understanding DI is crucial for building robust, testable, and maintainable Android apps.

## 1. Understanding Dependency Injection (DI)

### What is Dependency Injection?
Dependency Injection is a design pattern that allows us to remove hard-coded dependencies. Instead of a class creating its own dependencies, it receives them from an external source (an "injector"). This inversion of control makes classes more independent and reusable.

**Analogy:** Imagine building a car. Without DI, each part (engine, wheels, seats) would try to build its sub-parts or components. With DI, the car (your class) simply requests an engine, wheels, and seats, and an assembly line (the injector) provides them. The car doesn't care *how* these parts are built, only that it gets them.

### Benefits of DI
*   **Testability:** Easier to swap out real dependencies for mock objects during testing, making unit tests faster and more reliable.
*   **Modularity & Reusability:** Components become independent and can be reused across different parts of the application or even in different projects.
*   **Maintainability:** Changes to a dependency don't require changes in the dependent class, as long as the interface remains the same.
*   **Decoupling:** Reduces coupling between components, leading to a more flexible and robust codebase.
*   **Scalability:** Easier to manage complex projects with many interconnected parts.

## 2. Introducing Dagger Hilt

### What is Hilt?
Hilt is a dependency injection library for Android that simplifies using Dagger in your application. Dagger is a powerful compile-time dependency injector, but it traditionally involved a lot of boilerplate code for Android-specific use cases (like activities, fragments, services). Hilt provides a standard way to do DI in Android by generating and managing Dagger components automatically, reducing boilerplate and ensuring correct scoping.

### Why Hilt for Android?
*   **Android-specific integrations:** Hilt integrates directly with Android lifecycle components (Application, Activity, Fragment, Service, ViewModel).
*   **Simplified Dagger usage:** Reduces the amount of manual Dagger setup and configuration.
*   **Standardization:** Provides a standard set of components and scopes for common Android lifecycles, making it easier for teams to adopt and maintain.
*   **Compile-time safety:** Like Dagger, Hilt performs dependency graph validation at compile time, catching errors early.

## 3. Core Hilt Concepts and Annotations

Here are the fundamental annotations you'll use with Hilt:

*   `@HiltAndroidApp`: Marks your `Application` class. This triggers Hilt's code generation and sets up the root component for your app.

    ```kotlin
    @HiltAndroidApp
    class MyApplication : Application() {
        // ...
    }
    ```

*   `@AndroidEntryPoint`: Used on Android classes (Activities, Fragments, Services, BroadcastReceivers, ViewModels) to enable Hilt to inject dependencies into them.

    ```kotlin
    @AndroidEntryPoint
    class MainActivity : AppCompatActivity() {
        // ...
    }
    ```

*   `@Inject`: Used to request dependencies. Can be used on constructors (constructor injection) or fields (field injection).

    ```kotlin
    class UserRepository @Inject constructor(private val apiService: ApiService) {
        // ...
    }

    @AndroidEntryPoint
    class MyFragment : Fragment() {
        @Inject lateinit var userRepository: UserRepository
        // ...
    }
    ```

*   `@Module`: Annotates a class that provides dependencies that cannot be constructor-injected (e.g., interfaces, third-party classes, classes built with the Builder pattern).

*   `@InstallIn`: Used with `@Module` to specify which Hilt component the module should be installed in. This determines the lifecycle and scope of the dependencies provided by the module.

    ```kotlin
    @Module
    @InstallIn(SingletonComponent::class)
    object AppModule {
        // ...
    }
    ```

*   `@Provides`: Used inside a `@Module` to define a method that tells Hilt how to create an instance of a particular type. Useful for concrete classes where you need custom setup.

    ```kotlin
    @Module
    @InstallIn(SingletonComponent::class)
    object NetworkModule {
        @Provides
        @Singleton
        fun provideOkHttpClient(): OkHttpClient {
            return OkHttpClient.Builder().build()
        }

        @Provides
        @Singleton
        fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
            return Retrofit.Builder()
                .baseUrl("https://api.example.com/")
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
    }
    ```

*   `@Binds`: Used inside a `@Module` to tell Hilt which implementation to use for an interface. It's more efficient than `@Provides` for this specific use case as it avoids creating a new instance for the implementation if it's already available.

    ```kotlin
    interface AnalyticsService {
        fun trackEvent(eventName: String)
    }

    class FirebaseAnalyticsService @Inject constructor() : AnalyticsService {
        override fun trackEvent(eventName: String) {
            // ... Firebase specific tracking
        }
    }

    @Module
    @InstallIn(SingletonComponent::class)
    abstract class AnalyticsModule {
        @Binds
        abstract fun bindAnalyticsService(impl: FirebaseAnalyticsService): AnalyticsService
    }
    ```

*   **Scoping Annotations (`@Singleton`, `@ActivityScoped`, etc.):** Control the lifecycle of injected objects. For example, `@Singleton` ensures only one instance exists throughout the app's lifecycle when installed in `SingletonComponent`.

## 4. Hilt Components and Lifecycles
Hilt automatically generates and manages components that are tied to specific Android class lifecycles. These components dictate where and for how long dependencies can be injected.

| Component                  | Binds To Lifecycle      | Can Inject Into                                     | Default Scope        |
| :------------------------- | :---------------------- | :-------------------------------------------------- | :------------------- |
| `SingletonComponent`       | `Application`           | `Application`                                       | `@Singleton`         |
| `ActivityRetainedComponent`| `Activity` (retained)   | `ViewModel`                                         | `@ActivityRetainedScoped` |
| `ActivityComponent`        | `Activity`              | `Activity`                                          | `@ActivityScoped`    |
| `FragmentComponent`        | `Fragment`              | `Fragment`                                          | `@FragmentScoped`    |
| `ViewComponent`            | `View`                  | `View`                                              | `@ViewScoped`        |
| `ViewWithFragmentComponent`| `View` (in Fragment)    | `View` (in Fragment)                                | `@ViewScoped`        |
| `ServiceComponent`         | `Service`               | `Service`                                           | `@ServiceScoped`     |

Dependencies provided in a higher-level component (e.g., `SingletonComponent`) are available to all lower-level components. Dependencies in a lower-level component are only available to that component and its children.

## 5. Basic Hilt Implementation Example

**1. Add Hilt Dependencies in `build.gradle` (Project level):**

```gradle
// project/build.gradle
buildscript {
    ext.hilt_version = '2.48'
    dependencies {
        classpath "com.google.dagger:hilt-android-gradle-plugin:$hilt_version"
    }
}
```

**2. Add Hilt Dependencies and Plugins in `build.gradle` (Module level):**

```gradle
// app/build.gradle
plugins {
    id 'kotlin-kapt'
    id 'com.google.dagger.hilt.android'
}

android {
    // ...
}

dependencies {
    implementation "com.google.dagger:hilt-android:$hilt_version"
    kapt "com.google.dagger:hilt-compiler:$hilt_version"

    // For ViewModel injection (if using)
    implementation "androidx.hilt:hilt-navigation-fragment:1.0.0" // Or 1.1.0
    kapt "androidx.hilt:hilt-compiler:1.0.0"
}
```

**3. Create your `Application` class:**

```kotlin
// MyApplication.kt
package com.example.myapp

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Any other application-level setup
    }
}
```

Make sure to declare this `Application` class in your `AndroidManifest.xml`:

```xml
<!-- AndroidManifest.xml -->
<application
    android:name=".MyApplication"
    ...
>
    <!-- ... -->
</application>
```

**4. Define a simple interface and its implementation:**

```kotlin
// Logger.kt
package com.example.myapp.data

interface Logger {
    fun log(message: String)
}

class DebugLogger @Inject constructor() : Logger {
    override fun log(message: String) {
        println("DEBUG: $message")
    }
}
```

**5. Create a Hilt module to provide the interface implementation:**

```kotlin
// AppModule.kt
package com.example.myapp.di

import com.example.myapp.data.DebugLogger
import com.example.myapp.data.Logger
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class) // This module's dependencies live as long as the application
abstract class AppModule {

    @Binds // Tells Hilt to use DebugLogger when an instance of Logger is requested
    @Singleton // Ensures only one instance of DebugLogger is created throughout the app
    abstract fun bindLogger(impl: DebugLogger): Logger
}
```

**6. Inject and use the dependency in an Activity:**

```kotlin
// MainActivity.kt
package com.example.myapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.myapp.data.Logger
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint // Mark MainActivity for Hilt injection
class MainActivity : AppCompatActivity() {

    @Inject // Hilt will provide an instance of Logger here
    lateinit var logger: Logger

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        logger.log("MainActivity created using Hilt!")
        // You should see "DEBUG: MainActivity created using Hilt!" in Logcat
    }
}
```

## Quick Checklist/Exercise

1.  **Identify the problem:** Without Hilt, how would you typically provide a `Logger` instance to `MainActivity` if `Logger` had complex dependencies? What issues would this approach create for testing `MainActivity`?
2.  **Hilt Annotations:** Explain the purpose of `@HiltAndroidApp`, `@AndroidEntryPoint`, and `@Inject` in the context of the example above.
3.  **Module Scoping:** If you wanted the `Logger` instance to be unique for each `Activity` (meaning a new `Logger` for `MainActivity` and another for `SecondActivity`), how would you change `AppModule` and why? Which `InstallIn` component and scope annotation would you use?
