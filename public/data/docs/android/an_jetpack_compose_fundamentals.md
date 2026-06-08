### Introduction to Jetpack Compose

Jetpack Compose is Android's modern toolkit for building native UI. It simplifies and accelerates UI development with a declarative approach, replacing the traditional XML-based imperative UI system. With Compose, you describe your UI by calling composable functions, and the framework takes care of rendering and updating it efficiently.

### Core Concepts

#### 1. Declarative UI Paradigm

Unlike imperative UI, where you manually manipulate UI widgets (e.g., `findViewById`, `setText`), declarative UI describes what the UI *should look like* for a given state. Compose automatically updates the UI when the underlying data changes, making UI development more intuitive and less error-prone.

#### 2. Composables

Composables are the fundamental building blocks of a Compose UI. They are regular Kotlin functions annotated with `@Composable` that describe a part of your UI. Composables are designed to be small, stateless, and reusable.

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello $name!")
}
```

#### 3. Modifiers

Modifiers are used to decorate or augment your composables. They allow you to change the composable's size, layout, appearance, or add interaction behaviors. Modifiers are applied sequentially, and their order matters.

```kotlin
@Composable
fun MyButton() {
    Button(
        onClick = { /* Do something */ },
        modifier = Modifier
            .padding(16.dp)
            .fillMaxWidth()
    ) {
        Text("Click Me")
    }
}
```

#### 4. State Management

Managing UI state is crucial for dynamic applications. Compose provides several APIs for handling state, ensuring your UI reacts to data changes.

*   **`remember`**: This API stores an object in composition and "remembers" it across recompositions. It's often used with `mutableStateOf`.
*   **`mutableStateOf<T>`**: Creates an observable state holder. When the `value` of a `MutableState` object changes, composable functions that read this `value` are automatically recomposed.
    ```kotlin
    @Composable
    fun Counter() {
        var count by remember { mutableStateOf(0) } // 'by' delegate syntax
        Button(onClick = { count++ }) {
            Text("Count: $count")
        }
    }
    ```
*   **`derivedStateOf`**: Use this when you have a state that is derived from other state objects, and you only want to recompose when the *derived* state actually changes, rather than when any of its underlying states change. This helps optimize recomposition.
    ```kotlin
    val isEnabled by remember { derivedStateOf { username.value.isNotEmpty() && password.value.isNotEmpty() } }
    ```
*   **`produceState`**: Converts non-Compose observable sources (like Flow, LiveData, or even suspend functions) into Compose `State` objects. It's a composable function that launches a coroutine to produce a state value.
    ```kotlin
    @Composable
    fun loadData(url: String): State<Result<String>> {
        return produceState(initialValue = Result.Loading(), url) {
            val response = try {
                Result.Success(HttpClient.get(url))
            } catch (e: Exception) {
                Result.Error(e)
            }
            value = response
        }
    }
    ```

#### 5. Recomposition

Recomposition is the process of re-executing composable functions when their inputs (state or parameters) change. Compose's runtime intelligently skips composables whose inputs haven't changed, making the update process efficient. Understanding recomposition is key to building performant Compose UIs.

#### 6. Side Effects

Side effects are changes to the app's state that happen outside the scope of a composable function, such as launching coroutines, updating Shared Preferences, or subscribing to observables. Compose provides specific APIs to manage side effects safely and predictably within the lifecycle of a composable:
*   `LaunchedEffect`: For launching a coroutine that should execute when the composable enters the composition and be cancelled when it leaves.
*   `DisposableEffect`: For effects that need cleanup when the composable leaves the composition.
*   `rememberCoroutineScope`: To obtain a `CoroutineScope` tied to the composable's lifecycle.
*   `SideEffect`: To run code after every successful recomposition.
*   `snapshotFlow`: To convert Compose `State` into a Kotlin `Flow`.

```kotlin
@Composable
fun MyScreen(userId: String) {
    // LaunchedEffect to fetch data when userId changes
    LaunchedEffect(userId) {
        // This block will run when MyScreen enters composition or userId changes
        // It will be cancelled when MyScreen leaves composition or userId changes again
        fetchUserData(userId)
    }
    // ... UI content
}
```

### Built-in UI Elements

Compose offers a rich set of Material Design components and basic UI elements:

*   **`Text`**: Displays text.
    ```kotlin
    Text("Hello World", style = MaterialTheme.typography.h6)
    ```
*   **`Button`**: A clickable button.
    ```kotlin
    Button(onClick = { /* Handle click */ }) {
        Text("Tap Me")
    }
    ```
*   **`TextField`**: An editable text input field.
    ```kotlin
    var textValue by remember { mutableStateOf("") }
    TextField(
        value = textValue,
        onValueChange = { textValue = it },
        label = { Text("Enter your name") }
    )
    ```
*   **`Image`**: Displays an image.
    ```kotlin
    Image(
        painter = painterResource(id = R.drawable.my_image),
        contentDescription = "My sample image",
        modifier = Modifier.size(128.dp)
    )
    ```
*   **`Card`**: A Material Design surface with a shadow.
    ```kotlin
    Card(modifier = Modifier.padding(8.dp), elevation = 4.dp) {
        Text("This is inside a Card", modifier = Modifier.padding(16.dp))
    }
    ```

### Layout Composables

Compose provides fundamental layout composables to arrange your UI elements:

*   **`Column`**: Arranges its children vertically.
    ```kotlin
    Column(modifier = Modifier.fillMaxSize()) {
        Text("Item 1")
        Text("Item 2")
    }
    ```
*   **`Row`**: Arranges its children horizontally.
    ```kotlin
    Row(modifier = Modifier.fillMaxWidth()) {
        Text("Left")
        Spacer(Modifier.weight(1f)) // Adds flexible space
        Text("Right")
    }
    ```
*   **`Box`**: Stacks its children on top of each other. Useful for overlaying elements or aligning a single child.
    ```kotlin
    Box(modifier = Modifier.size(100.dp), contentAlignment = Alignment.Center) {
        Image(painter = painterResource(id = R.drawable.background), contentDescription = null)
        Text("Overlay Text")
    }
    ```

### Quick Check / Exercise

1.  **Identify the problem:** You have a `Text` composable that displays a number, and a `Button` that increments it. When you click the button, the number doesn't change. What is the most likely missing component for state management?
2.  **Explain the term:** Briefly describe what "Recomposition" means in the context of Jetpack Compose.
3.  **Choose the right tool:** You need to load data from a network request asynchronously when a specific ID changes and cancel the previous request if the ID changes again. Which Compose side effect API would you use for this task?