# Advanced Compose UI Patterns & Accessibility

This study guide delves into advanced Jetpack Compose UI patterns, enabling the creation of robust, flexible, and inclusive Android applications. We'll cover handling various UI states, integrating complex user input, building responsive designs, understanding the composable lifecycle, and implementing crucial accessibility features.

## 1. Advanced UI Patterns

### 1.1 Handling Various UI States (Loading, Error, Empty)

Modern applications frequently deal with asynchronous data fetching, leading to different UI states. Compose allows for declarative state management, making it straightforward to represent these states.

*   **Loading State:** Show a progress indicator while data is being fetched.
*   **Error State:** Display an error message and potentially a retry option if data fetching fails.
*   **Empty State:** Inform the user when there's no data to display (e.g., an empty list).

**Core Concept:** Use a sealed class or an enum to represent the different UI states, and then use a `when` expression on a `State` object to render the appropriate UI.

```kotlin
sealed class UiState {
    object Loading : UiState()
    data class Success(val data: List<String>) : UiState()
    data class Error(val message: String) : UiState()
    object Empty : UiState()
}

@Composable
fun DataScreen(uiState: UiState) {
    when (uiState) {
        UiState.Loading -> {
            CircularProgressIndicator(modifier = Modifier.fillMaxSize().wrapContentSize(Alignment.Center))
        }
        is UiState.Success -> {
            LazyColumn {
                items(uiState.data) { item ->
                    Text(text = item, modifier = Modifier.padding(16.dp))
                }
            }
        }
        is UiState.Error -> {
            Column(
                modifier = Modifier.fillMaxSize().wrapContentSize(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "Error: ${uiState.message}", color = Color.Red)
                Button(onClick = { /* Handle retry */ }) {
                    Text("Retry")
                }
            }
        }
        UiState.Empty -> {
            Text(text = "No data available.", modifier = Modifier.fillMaxSize().wrapContentSize(Alignment.Center))
        }
    }
}
```

### 1.2 Integrating Sophisticated User Input

Compose offers flexible APIs to handle complex user interactions beyond simple clicks and text input.

*   **Custom Gestures:** Use `Modifier.pointerInput` for low-level gesture detection (tap, press, drag, zoom, rotate).
*   **InteractionSource:** A powerful API to observe and react to various interaction states (pressed, dragged, focused) on a composable, enabling custom visual feedback.
*   **Focus Management:** `FocusRequester` for programmatically requesting and moving focus, crucial for accessibility and keyboard navigation.

### 1.3 Ensuring Responsive Design

Designing for various screen sizes, orientations, and form factors is essential.

*   **Window Size Classes:** Use `WindowSizeClass` (from `androidx.compose.material3.windowsizeclass`) to categorize available screen space (Compact, Medium, Expanded) and adapt UI accordingly.
*   **`BoxWithConstraints`:** A composable that provides the min/max width and height constraints of its parent, allowing child composables to adjust their layout based on available space.
*   **Adaptive Layouts:** Create different composables or modify existing ones using conditionals based on `WindowSizeClass` or direct width/height measurements to create adaptive UIs. For example, a `Row` on expanded screens might become a `Column` on compact screens.

### 1.4 Understanding Composable Lifecycle

Composables have a lifecycle managed by the Compose runtime, involving composition, recomposition, and disposal. Understanding this is key for managing side effects and resources.

*   **`remember`:** Caches a value during recompositions. `rememberSaveable` works across process death.
*   **`LaunchedEffect`:** Runs a suspend function in a Compose-managed coroutine scope. It restarts if its keys change and cancels if the composable leaves the composition. Ideal for one-shot operations, observing flows, or side effects tied to the composable's presence.
*   **`SideEffect`:** Executes a non-suspendable side effect after every successful recomposition. Useful for synchronizing Compose state with external systems (e.g., analytics, updating global state).
*   **`DisposableEffect`:** Similar to `LaunchedEffect` but specifically for side effects that need cleanup. It provides an `onDispose` block for cleanup logic. Ideal for observing external lifecycle owners or registering/unregistering callbacks.

```kotlin
@Composable
fun LifecycleExample(itemId: String) {
    // LaunchedEffect: Runs when itemId changes or on initial composition,
    // cancels if composable leaves composition or itemId changes again.
    LaunchedEffect(itemId) {
        println("Fetching data for $itemId...")
        // Simulate network call
        kotlinx.coroutines.delay(1000)
        println("Data for $itemId fetched.")
    }

    // DisposableEffect: Sets up a listener, cleans up when composable leaves or key changes.
    DisposableEffect(Unit) {
        val listener = object : MyExternalService.Listener {
            override fun onEvent() {
                println("External event received!")
            }
        }
        MyExternalService.addListener(listener)
        onDispose {
            MyExternalService.removeListener(listener)
            println("Listener removed.")
        }
    }

    Text("Item ID: $itemId")
}

object MyExternalService { // Dummy service
    interface Listener { fun onEvent() }
    private val listeners = mutableListOf<Listener>()
    fun addListener(listener: Listener) = listeners.add(listener)
    fun removeListener(listener: Listener) = listeners.remove(listener)
}
```

## 2. Accessibility in Compose

Accessibility ensures your app is usable by people with diverse abilities. Compose provides powerful tools for building inclusive UIs.

### 2.1 Semantics Modifiers

The `Modifier.semantics` API is central to communicating UI information to accessibility services (like TalkBack).

*   **`contentDescription`:** Provides a descriptive label for visual elements (e.g., `Image`, `Icon`) that don't have text. Crucial for screen readers.
    ```kotlin
    Icon(
        imageVector = Icons.Default.Info,
        contentDescription = "Information icon", // This is read aloud
        modifier = Modifier.size(24.dp)
    )
    ```
*   **`role`:** Specifies the role of a composable (e.g., `Role.Button`, `Role.Checkbox`).
*   **`stateDescription`:** Describes the current state of an interactive element (e.g., "checked", "not checked").
*   **`onClick(label: String?, action: (() -> Unit)?)`:** Provides an accessible label for clickable areas, especially useful if the clickable area itself doesn't have descriptive text.

### 2.2 Focus Management and Order

Accessibility services navigate UI elements in a logical order.

*   **`Modifier.focusable()` / `Modifier.focusRequester()`:** Helps manage focus programmatically.
*   **`Modifier.semantics(mergeDescendants = true)`:** Merges the semantics of child composables into their parent, creating a single, more coherent spoken announcement for a group of related elements (e.g., a custom card containing an image and text).

### 2.3 Color Contrast and Text Scaling

*   **Color Contrast:** Ensure sufficient contrast between text and background colors to aid users with low vision or color blindness. Tools like Material Design's color tool or accessibility checkers can help.
*   **Scalable Text:** Users often adjust font sizes in system settings. Compose `Text` composables automatically respect these settings. Always use `dp` for dimensions and `sp` for text sizes to ensure proper scaling.

### 2.4 Providing Clear Feedback

*   Ensure all interactive elements provide clear visual and audible feedback when interacted with.
*   Use `Modifier.clickable` with ripples for visual feedback.
*   For custom interactive elements, ensure focus changes and state changes are communicated via semantics.

---

## Quick Checklist/Exercise:

1.  **Scenario:** You're building a screen that displays a list of articles. How would you use a `sealed class` and a `when` expression to gracefully handle `Loading`, `Success` (with data), `Error` (with a message), and `Empty` (no articles found) states for this screen? Describe the UI implications for each state.
2.  **Responsiveness:** Explain how `WindowSizeClass` and `BoxWithConstraints` can be used together to create a layout that shows a two-column grid on large screens and a single-column list on small screens.
3.  **Accessibility:** You have an `Image` composable displaying a decorative background. Another `Image` composable displays an avatar. How would you use `contentDescription` to ensure proper accessibility for these two different scenarios?