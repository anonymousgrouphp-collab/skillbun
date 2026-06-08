# Local Data Persistence: Room & DataStore

## Introduction
In Android development, persisting data locally is crucial for providing robust offline-first experiences and ensuring data availability. This guide explores two fundamental Android Jetpack components for local data persistence: **Room Persistence Library** for structured data and **DataStore** for efficient key-value and typed data storage.

## 1. Room Persistence Library
Room is an abstraction layer over SQLite, part of the Android Architecture Components, designed to make database interactions easier and safer. It provides compile-time verification of SQL queries and reduces boilerplate code.

### Key Components
*   **Entity:** A class annotated with `@Entity` that represents a table in the SQLite database. Each field in the class corresponds to a column in the table.
*   **DAO (Data Access Object):** An interface annotated with `@Dao` that defines the methods for interacting with the database (e.g., insert, update, delete, query). Room generates the actual implementation.
*   **Database:** An abstract class that extends `RoomDatabase` and is annotated with `@Database`. It serves as the main access point for the underlying database and provides access to DAOs.

### Implementation Steps
1.  **Add Dependencies** (in `build.gradle` (Module: app)):
    ```gradle
    implementation "androidx.room:room-runtime:2.6.1"
    annotationProcessor "androidx.room:room-compiler:2.6.1"
    // To use Kotlin annotation processing tool (kapt):
    kapt "androidx.room:room-compiler:2.6.1"
    // Kotlin Coroutines extensions for Room
    implementation "androidx.room:room-ktx:2.6.1"
    ```

2.  **Define an Entity** (`User.kt`):
    ```kotlin
    package com.example.app.data

    import androidx.room.Entity
    import androidx.room.PrimaryKey

    @Entity(tableName = "users")
    data class User(
        @PrimaryKey(autoGenerate = true) val id: Int = 0,
        val firstName: String,
        val lastName: String,
        val email: String
    )
    ```

3.  **Define a DAO** (`UserDao.kt`):
    ```kotlin
    package com.example.app.data

    import androidx.room.Dao
    import androidx.room.Delete
    import androidx.room.Insert
    import androidx.room.OnConflictStrategy
    import androidx.room.Query
    import androidx.room.Update
    import kotlinx.coroutines.flow.Flow

    @Dao
    interface UserDao {
        @Query("SELECT * FROM users ORDER BY firstName ASC")
        fun getAllUsers(): Flow<List<User>>

        @Query("SELECT * FROM users WHERE id = :userId")
        suspend fun getUserById(userId: Int): User?

        @Insert(onConflict = OnConflictStrategy.REPLACE)
        suspend fun insertUser(user: User)

        @Update
        suspend fun updateUser(user: User)

        @Delete
        suspend fun deleteUser(user: User)
    }
    ```

4.  **Create a Database Class** (`AppDatabase.kt`):
    ```kotlin
    package com.example.app.data

    import android.content.Context
    import androidx.room.Database
    import androidx.room.Room
    import androidx.room.RoomDatabase

    @Database(entities = [User::class], version = 1, exportSchema = false)
    abstract class AppDatabase : RoomDatabase() {
        abstract fun userDao(): UserDao

        companion object {
            @Volatile
            private var INSTANCE: AppDatabase? = null

            fun getDatabase(context: Context): AppDatabase {
                return INSTANCE ?: synchronized(this) {
                    val instance = Room.databaseBuilder(
                        context.applicationContext,
                        AppDatabase::class.java,
                        "user_database"
                    ).build()
                    INSTANCE = instance
                    instance
                }
            }
        }
    }
    ```

5.  **Access the Database** (e.g., in a Repository or ViewModel):
    ```kotlin
    class UserRepository(private val userDao: UserDao) {
        val allUsers: Flow<List<User>> = userDao.getAllUsers()

        suspend fun insert(user: User) {
            userDao.insertUser(user)
        }

        suspend fun delete(user: User) {
            userDao.deleteUser(user)
        }
    }
    // Initialize in Application or DI framework:
    // val database = AppDatabase.getDatabase(applicationContext)
    // val repository = UserRepository(database.userDao())
    ```

### Migrations
When you change your database schema (e.g., add a new column or table), you must increment the database `version` in the `@Database` annotation. Room requires you to define a `Migration` class to specify how to transform the database from an older schema to a newer one, preventing data loss.

## 2. DataStore
DataStore is a modern and improved data storage solution that allows you to store small amounts of data. Built on Kotlin Coroutines and Flow, it provides an asynchronous, transactional, and type-safe API, making it a robust replacement for `SharedPreferences`.

### Why DataStore over SharedPreferences?
*   **Asynchronous API:** All operations are safe to call on the main thread, as they are implemented with Kotlin Coroutines.
*   **Transactional API:** DataStore ensures data integrity by performing updates transactionally.
*   **Type Safety:** Proto DataStore provides strong type safety and schema enforcement.
*   **Error Handling:** It provides a mechanism for handling errors during data read/write operations.

### Types of DataStore
1.  **Preferences DataStore:** Stores key-value pairs. Similar to `SharedPreferences` but with the benefits of DataStore (asynchronous, transactional, error handling).
2.  **Proto DataStore:** Stores instances of a custom data class. This offers stronger type safety and schema enforcement by defining data using Protocol Buffers.

### Implementation Steps (Preferences DataStore)
1.  **Add Dependencies** (in `build.gradle` (Module: app)):
    ```gradle
    implementation "androidx.datastore:datastore-preferences:1.0.0"
    ```

2.  **Create a DataStore Instance** (e.g., in a `Context` extension):
    ```kotlin
    package com.example.app.settings

    import android.content.Context
    import androidx.datastore.core.DataStore
    import androidx.datastore.preferences.core.Preferences
    import androidx.datastore.preferences.preferencesDataStore

    // At the top level of your Kotlin file:
    val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "app_settings")
    ```

3.  **Define Keys**:
    ```kotlin
    package com.example.app.settings

    import androidx.datastore.preferences.core.booleanPreferencesKey
    import androidx.datastore.preferences.core.stringPreferencesKey

    object PreferencesKeys {
        val USER_NAME = stringPreferencesKey("user_name")
        val IS_DARK_MODE = booleanPreferencesKey("is_dark_mode")
    }
    ```

4.  **Write Data**:
    ```kotlin
    package com.example.app.settings

    import android.content.Context
    import androidx.datastore.preferences.core.edit

    suspend fun saveUserName(context: Context, name: String) {
        context.dataStore.edit { settings ->
            settings[PreferencesKeys.USER_NAME] = name
        }
    }

    suspend fun toggleDarkMode(context: Context, isDark: Boolean) {
        context.dataStore.edit { settings ->
            settings[PreferencesKeys.IS_DARK_MODE] = isDark
        }
    }
    ```

5.  **Read Data**:
    ```kotlin
    package com.example.app.settings

    import android.content.Context
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.map

    fun getUserName(context: Context): Flow<String?> {
        return context.dataStore.data
            .map { preferences ->
                preferences[PreferencesKeys.USER_NAME]
            }
    }

    fun getDarkModePreference(context: Context): Flow<Boolean> {
        return context.dataStore.data
            .map { preferences ->
                preferences[PreferencesKeys.IS_DARK_MODE] ?: false // Default value if not set
            }
    }
    ```

## 3. Offline-First Experiences and Data Synchronization
An offline-first strategy involves designing applications to function fully, or mostly, without network access. This typically includes:
*   **Local Caching:** Using Room or DataStore to store essential data locally so the app can display content even when offline.
*   **Queuing Operations:** Storing user actions (e.g., posts, updates) locally and syncing them with the backend when network connectivity is restored.
*   **Conflict Resolution:** Implementing strategies to handle discrepancies when local changes conflict with remote data during synchronization.

## Checklist/Exercise
1.  Explain the primary advantage of using Room over directly working with SQLite in Android development.
2.  Describe two key benefits of using DataStore compared to the older SharedPreferences API.
3.  Outline the three main components of the Room Persistence Library (Entity, DAO, Database) and briefly describe their roles.
