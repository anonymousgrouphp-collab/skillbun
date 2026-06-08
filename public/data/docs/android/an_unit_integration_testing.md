# Unit & Integration Testing in Android

Testing is a critical part of developing robust and maintainable Android applications. It helps ensure that your code behaves as expected, catches bugs early, and facilitates refactoring with confidence. This guide covers the fundamentals of Unit and Integration Testing in Android.

## 1. Why Test Your Android App?

*   **Catch Bugs Early**: Identify issues before they reach users.
*   **Improve Code Quality**: Encourages modular, testable, and clean code.
*   **Facilitate Refactoring**: Confidence to make changes without breaking existing functionality.
*   **Enhance Maintainability**: Easier to understand and extend the codebase.
*   **Faster Development**: Reduce manual testing cycles.

## 2. Unit Testing

Unit tests verify the smallest testable parts of your application in isolation. They are fast and run on the JVM, without needing an Android device or emulator.

### Core Concepts

*   **Isolation**: Test a single component (e.g., a function, a class) without its dependencies.
*   **Mocks/Fakes**: Replace real dependencies with test doubles (mocks, stubs, fakes) to control their behavior and verify interactions.
*   **Tools**: 
    *   **JUnit 4/5**: The primary testing framework for Java/Kotlin.
    *   **Mockito/MockK**: Mocking frameworks for Java (Mockito) and Kotlin (MockK) to create test doubles.

### What to Unit Test

*   **Business Logic**: Pure Kotlin/Java classes containing application logic.
*   **ViewModels**: Test how ViewModels handle UI state, interact with repositories, and expose data.
*   **Repositories**: Verify data fetching, caching logic, and error handling without actual network or database calls.
*   **Utility Classes**: Helper functions, formatters, etc.

### Example: Unit Testing a ViewModel with MockK

Let's imagine a `LoginViewModel` that depends on a `LoginRepository`.

```kotlin
// LoginViewModel.kt
class LoginViewModel(private val repository: LoginRepository) : ViewModel() {
    private val _loginStatus = MutableLiveData<Boolean>()
    val loginStatus: LiveData<Boolean> = _loginStatus

    fun login(username: String, password: String) {
        viewModelScope.launch {
            val success = repository.performLogin(username, password)
            _loginStatus.postValue(success)
        }
    }
}

// LoginRepository.kt (Interface for easy mocking)
interface LoginRepository {
    suspend fun performLogin(username: String, password: String): Boolean
}
```

Now, let's write a unit test for `LoginViewModel` using JUnit and MockK. We'll use `Dispatchers.Unconfined` to execute coroutines synchronously for testing.

```kotlin
// LoginViewModelTest.kt
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import androidx.lifecycle.Observer
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.*
import org.junit.Assert.assertEquals

@ExperimentalCoroutinesApi
class LoginViewModelTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule() // For LiveData

    private val testDispatcher = TestCoroutineDispatcher()
    private val testScope = TestCoroutineScope(testDispatcher)

    @MockK
    lateinit var mockRepository: LoginRepository

    private lateinit var viewModel: LoginViewModel

    @Before
    fun setup() {
        MockKAnnotations.init(this) // Initialize mocks
        Dispatchers.setMain(testDispatcher) // Set Main dispatcher for coroutines
        viewModel = LoginViewModel(mockRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain() // Reset Main dispatcher
        testDispatcher.cleanupTestCoroutines()
        testScope.cleanupTestCoroutines()
        unmockkAll() // Clean up all mocks
    }

    @Test
    fun `login with valid credentials should post true`() = testScope.runBlockingTest {
        // Arrange
        val username = "testuser"
        val password = "password123"
        coEvery { mockRepository.performLogin(username, password) } returns true

        val observer = mockk<Observer<Boolean>>(relaxed = true)
        viewModel.loginStatus.observeForever(observer)

        // Act
        viewModel.login(username, password)
        advanceUntilIdle() // Ensure coroutines complete

        // Assert
        verifySequence {
            observer.onChanged(true) // Verify LiveData update
        }
        coVerify(exactly = 1) { mockRepository.performLogin(username, password) }

        viewModel.loginStatus.removeObserver(observer)
    }

    @Test
    fun `login with invalid credentials should post false`() = testScope.runBlockingTest {
        // Arrange
        val username = "wronguser"
        val password = "wrongpassword"
        coEvery { mockRepository.performLogin(username, password) } returns false

        val observer = mockk<Observer<Boolean>>(relaxed = true)
        viewModel.loginStatus.observeForever(observer)

        // Act
        viewModel.login(username, password)
        advanceUntilIdle() // Ensure coroutines complete

        // Assert
        verifySequence {
            observer.onChanged(false) // Verify LiveData update
        }
        coVerify(exactly = 1) { mockRepository.performLogin(username, password) }

        viewModel.loginStatus.removeObserver(observer)
    }
}
```

## 3. Integration Testing

Integration tests verify the interactions between multiple components or modules of your application. They ensure that different parts of your system work together correctly and that data flows as expected.

### Core Concepts

*   **Component Interaction**: Focus on the behavior of groups of components.
*   **Real Dependencies (sometimes)**: May involve real network calls, database access, or other external systems (though often fakes are used for external systems to keep tests fast and reliable).
*   **Tools**: 
    *   **JUnit**: For test structure.
    *   **AndroidX Test**: A collection of libraries for testing Android apps (e.g., `AndroidJUnit4`, `ActivityScenarioRule`).
    *   **Hilt/Dagger (for dependency injection)**: Simplifies managing real dependencies for tests.
    *   **MockWebServer**: For faking network responses.
    *   **Room Testing Library**: For testing Room databases.

### What to Integration Test

*   **Repository-to-DataSource**: Verify a repository correctly interacts with its data sources (e.g., network service, local database).
*   **ViewModel-to-Repository**: Ensure the ViewModel correctly calls the repository and handles its responses.
*   **Component Interaction**: Verify how different parts of a feature (e.g., login screen's ViewModel, repository, and service) work together.

### Example: Integration Testing a Repository with a Fake Data Source

Let's integrate test the `LoginRepository` with a fake `LoginService`. This test still runs on the JVM.

```kotlin
// LoginService.kt (Interface)
interface LoginService {
    suspend fun loginUser(username: String, password: String): Boolean
}

// LoginRepositoryImpl.kt (Implementation)
class LoginRepositoryImpl(private val service: LoginService) : LoginRepository {
    override suspend fun performLogin(username: String, password: String): Boolean {
        return service.loginUser(username, password)
    }
}
```

Now, an integration test for `LoginRepositoryImpl` using a simple `FakeLoginService`.

```kotlin
// LoginRepositoryImplTest.kt
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

// Fake implementation for LoginService
class FakeLoginService : LoginService {
    var shouldSucceed = true // Control login outcome
    override suspend fun loginUser(username: String, password: String): Boolean {
        // Simulate some delay if needed
        return shouldSucceed
    }
}

class LoginRepositoryImplTest {

    private lateinit var fakeLoginService: FakeLoginService
    private lateinit var loginRepository: LoginRepositoryImpl

    @Before
    fun setup() {
        fakeLoginService = FakeLoginService()
        loginRepository = LoginRepositoryImpl(fakeLoginService)
    }

    @Test
    fun `performLogin with successful service should return true`() = runBlocking {
        // Arrange
        fakeLoginService.shouldSucceed = true // Configure fake service
        val username = "test"
        val password = "pwd"

        // Act
        val result = loginRepository.performLogin(username, password)

        // Assert
        assertTrue(result)
    }

    @Test
    fun `performLogin with failed service should return false`() = runBlocking {
        // Arrange
        fakeLoginService.shouldSucceed = false // Configure fake service
        val username = "test"
        val password = "pwd"

        // Act
        val result = loginRepository.performLogin(username, password)

        // Assert
        assertFalse(result)
    }
}
```

## 4. Best Practices for Testing

*   **Test Pyramid**: Prioritize unit tests (fast, cheap) over integration tests, and integration tests over UI tests (slow, expensive).
*   **Arrange-Act-Assert (AAA)**: Structure your tests with these three distinct phases.
*   **Given-When-Then**: A common behavior-driven development (BDD) approach similar to AAA.
*   **Keep Tests Independent**: Each test should run independently of others.
*   **Meaningful Test Names**: Clearly describe what the test is verifying.
*   **Test One Thing**: Each test should ideally assert a single outcome or behavior.

## Checklist/Exercise

1.  Explain the key difference between a Unit Test and an Integration Test, and provide an example of a component suitable for each.
2.  If you have a `UserRepository` that depends on a `UserDao` (Room database access object) and a `UserApiService` (network service), which one would you mock when writing a unit test for the `UserRepository`? Why?
3.  Write a simple unit test for a `Calculator` class with an `add(a, b)` method, using JUnit.