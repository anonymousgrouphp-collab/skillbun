# Advanced Compose UI & Navigation

Jetpack Compose empowers developers to build beautiful, reactive UIs for Android. This guide delves into advanced techniques to create complex, dynamic, and intuitive user experiences, along with robust navigation strategies.

## 1. Custom Modifiers

Modifiers are fundamental to Compose, allowing you to decorate or augment your composables. While Compose provides a rich set of built-in modifiers, custom modifiers let you encapsulate complex logic or styling into reusable, composable units.

**Core Concept:** A custom modifier is typically a `composed` function or a custom `Modifier.Node` that applies a set of standard modifiers or custom drawing/layout logic.

**When to use:**
*   To create reusable UI components with consistent styling.
*   To abstract complex layout or drawing logic.
*   To encapsulate stateful logic that affects a composable's appearance or behavior.

**Simple Example: A Custom Border Modifier**

```kotlin
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

fun Modifier.customBorder(color: Color, width: Dp) = composed {
    // Access context-dependent values like density if needed
    Modifier.border(width = width, color = color, shape = RoundedCornerShape(4.dp))
        .padding(8.dp)
}

// Usage:
// @Composable
// fun MyCustomComposable() {
//     Text(
//         text = "Hello Custom Border!",
//         modifier = Modifier.customBorder(Color.Blue, 2.dp)
//     )
// }
```

## 2. Theming in Compose

Theming is crucial for maintaining a consistent brand identity and providing a great user experience. Jetpack Compose offers powerful tools for implementing Material Design, custom themes, and dark mode.

### 2.1. Material Design 3

Jetpack Compose strongly encourages the use of Material Design 3, providing a comprehensive system for color, typography, and shape.

*   **`MaterialTheme`**: The central composable that applies Material Design styling. It defines `colors`, `typography`, and `shapes`.
*   **`Color.kt`**: Defines your app's color palette (primary, secondary, background, etc.).
*   **`Type.kt`**: Defines your app's typography (font families, weights, sizes).
*   **`Shape.kt`**: Defines your app's default shapes for components.

### 2.2. Custom Themes

You can customize `MaterialTheme` or create your own theme system.

**Implementing Dark Mode:**
Compose themes typically include two `ColorScheme` objects: one for light mode and one for dark mode.
```kotlin
// ui.theme/Theme.kt
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

// Example colors (define these in ui.theme/Color.kt)
val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)
val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40
    // Other default colors to override
)

@Composable
fun MyAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(), // Checks system setting
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colors,
        typography = Typography, // Define in ui.theme/Type.kt
        shapes = Shapes,       // Define in ui.theme/Shape.kt
        content = content
    )
}

// Ensure your root composable is wrapped in `MyAppTheme`.
```

## 3. Basic Animations

Animations enhance user experience by providing visual feedback and guiding attention. Compose provides a declarative API for animations.

*   **`animate*AsState`**: Simple APIs for animating a single value (e.g., `animateFloatAsState`, `animateColorAsState`).
*   **`AnimatedVisibility`**: Animates the appearance and disappearance of content.
*   **`Crossfade`**: Animates content transitions by fading out the old content and fading in the new.

**Example: Animating a color change**

```kotlin
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun AnimatedColorBox() {
    var isToggled by remember { mutableStateOf(false) }
    val animatedColor by animateColorAsState(
        targetValue = if (isToggled) Color.Red else Color.Blue,
        animationSpec = tween(durationMillis = 1000),
        label = "colorAnimation"
    )

    Box(
        modifier = Modifier
            .size(100.dp)
            .background(animatedColor)
            .clickable { isToggled = !isToggled }
    )
}
```

## 4. Custom Layouts

For highly specific UI requirements not covered by standard `Row`, `Column`, `Box`, or `ConstraintLayout`, you can create custom layouts.

*   **`Layout` composable**: The most flexible way to define a custom layout. You get access to the `measurables` (children to measure) and the constraints, allowing you to manually measure and place each child.
*   **`SubcomposeLayout`**: Useful when you need to measure a composable's content multiple times or based on other content, often used for complex UI patterns like tabs where content size affects tab width.

**Core Idea:**
1.  Measure children using `measure(constraints)`.
2.  Place children using `placeRelative(x, y)`.

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.unit.Constraints

@Composable
fun CustomFlowLayout(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Layout(
        content = content,
        modifier = modifier
    ) { measurables, constraints ->
        // This is a simplified example, real flow layout is more complex
        val placeables = measurables.map { measurable ->
            measurable.measure(Constraints(0, constraints.maxWidth, 0, constraints.maxHeight))
        }

        layout(constraints.maxWidth, constraints.maxHeight) {
            var yPosition = 0
            var xPosition = 0
            var rowHeight = 0

            placeables.forEach { placeable ->
                if (xPosition + placeable.width > constraints.maxWidth) {
                    xPosition = 0
                    yPosition += rowHeight
                    rowHeight = 0
                }
                placeable.placeRelative(x = xPosition, y = yPosition)
                xPosition += placeable.width
                rowHeight = maxOf(rowHeight, placeable.height)
            }
        }
    }
}
```

## 5. Gesture Handling

Compose provides powerful modifiers for handling user input gestures, from simple taps to complex drags and multi-touch transformations.

*   **`pointerInput` modifier**: The entry point for custom gesture detection. It provides access to raw pointer events.
*   **`detectTapGestures`**: For single taps, double taps, long presses, and press events.
*   **`detectDragGestures`**: For handling drag events, providing drag amount.
*   **`detectTransformGestures`**: For handling multi-touch gestures like pan, zoom, and rotation.

**Example: Detecting a tap gesture**

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp

@Composable
fun TapSensitiveBox() {
    var tapCount by remember { mutableStateOf(0) }
    Box(
        modifier = Modifier
            .size(150.dp)
            .background(Color.Cyan)
            .pointerInput(Unit) { // Unit as key ensures lambda is recreated only if dependencies change
                detectTapGestures(
                    onTap = { offset ->
                        tapCount++
                        println("Tapped at $offset. Total taps: $tapCount")
                    },
                    onLongPress = { offset ->
                        println("Long pressed at $offset")
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        Text("Taps: $tapCount")
    }
}
```

## 6. Jetpack Compose Navigation

Jetpack Compose Navigation is the recommended way to implement navigation between screens in Compose apps, leveraging the Navigation component from Android Architecture Components.

**Key Components:**
*   **`NavController`**: Manages app navigation, tracks back stack, and enables navigation actions. Created using `rememberNavController()`.
*   **`NavHost`**: A composable that acts as a container for displaying different composables (destinations) based on the current route.
*   **`NavGraphBuilder.composable`**: Defines a destination in your `NavHost`, mapping a route string to a specific composable.

**Basic Setup:**

```kotlin
// app.navigation/AppNavigation.kt
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

// Define routes as constants for type safety
object Routes {
    const val HOME = "home"
    const val DETAIL = "detail/{itemId}" // Path argument
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(onNavigateToDetail = { itemId ->
                navController.navigate("detail/$itemId")
            })
        }
        composable(Routes.DETAIL) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(itemId = itemId)
        }
    }
}

// Example HomeScreen
@Composable
fun HomeScreen(onNavigateToDetail: (String) -> Unit) {
    Column(modifier = Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text("Home Screen")
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { onNavigateToDetail("123") }) {
            Text("Go to Detail 123")
        }
    }
}

// Example DetailScreen
@Composable
fun DetailScreen(itemId: String?) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Detail Screen for Item ID: $itemId")
    }
}

// Usage in MainActivity:
// class MainActivity : ComponentActivity() {
//     override fun onCreate(savedInstanceState: Bundle?) {
//         super.onCreate(savedInstanceState)
//         setContent {
//             MyAppTheme { // Your app's theme
//                 AppNavigation()
//             }
//         }
//     }
// }
```

**Passing Arguments:**
Arguments can be passed via path (e.g., `detail/{itemId}`) or query parameters. Define argument types in `composable` block using `arguments = listOf(navArgument("itemId") { type = NavType.StringType })`.

## Checklist / Exercises

1.  **Custom Modifier Challenge**: Create a custom modifier that applies a "debug highlight" (e.g., a random colored border) to a composable and include a `Text` composable with this modifier.
2.  **Theming Switcher**: Modify the `MyAppTheme` to include a button that toggles between light and dark mode, overriding the system's dark theme setting.
3.  **Navigation with Arguments**: Extend the `AppNavigation` example to include a third screen, `SettingsScreen`. From `HomeScreen`, navigate to `SettingsScreen` and pass a boolean argument (`showAdvancedSettings`) to it. Display this argument on `SettingsScreen`.