# Compose Previews & Basic UI Testing

This guide will cover two essential aspects of modern Android UI development with Jetpack Compose: leveraging `@Preview` annotations for efficient UI design and iteration, and performing fundamental UI testing to ensure robustness and correctness.

## 1. Compose Previews with `@Preview`

The `@Preview` annotation is a powerful tool in Jetpack Compose that allows developers to render composable functions directly within the Android Studio design surface without needing to deploy the app to an emulator or device. This significantly speeds up UI development, design system creation, and iteration.

### Core Concepts and Benefits:

*   **Rapid Iteration:** See UI changes instantly as you type code, providing immediate feedback.
*   **Design System Development:** Easily visualize and test different states and configurations of your design system components (buttons, cards, text fields, etc.).
*   **Multi-configuration Testing:** Preview your UI across various device configurations (different screen sizes, light/dark themes, locales, font scales) simultaneously.
*   **Isolated Component View:** Focus on individual composables without running the entire application.

### Key `@Preview` Parameters:

The `@Preview` annotation offers several parameters to customize the preview rendering:

*   `name`: A descriptive name for the preview.
*   `group`: Groups related previews together in the UI panel.
*   `showBackground`: `true` to display a background for the composable.
*   `backgroundColor`: Sets the background color (e.g., `0xFFFFFFFF` for white).
*   `widthDp`, `heightDp`: Sets the explicit width and height in density-independent pixels.
*   `apiLevel`: Specifies the API level to use for rendering.
*   `uiMode`: Simulates different UI modes like `android.content.res.Configuration.UI_MODE_NIGHT_YES` for dark theme.
*   `locale`: Sets the locale for the preview.
*   `device`: Predefined device configurations (e.g., `Devices.PIXEL_3A`).

### Code Example:

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

// A simple reusable composable
@Composable
fun GreetingCard(name: String) {
    Text(
        text = "Hello, $name!", // Changed to direct string for simplicity
        modifier = Modifier
            .padding(16.dp)
            .background(Color.LightGray)
            .padding(8.dp)
    )
}

// Previewing the GreetingCard in different configurations
@Preview(
    name = "Default Greeting",
    showBackground = true,
    backgroundColor = 0xFFFFFFFF
)
@Composable
fun DefaultGreetingPreview() {
    GreetingCard("Alice")
}

@Preview(
    name = "Long Name Greeting",
    group = "Greetings",
    widthDp = 200,
    heightDp = 100
)
@Composable
fun LongNameGreetingPreview() {
    GreetingCard("Wolfeschlegelsteinhausenbergerdorff")
}

@Preview(
    name = "Dark Theme Greeting",
    group = "Greetings",
    uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES,
    showBackground = true,
    backgroundColor = 0xFF121212 // Dark background
)
@Composable
fun DarkThemeGreetingPreview() {
    GreetingCard("Bob")
}

@Preview(
    name = "Tablet Preview",
    device = Devices.TABLET,
    showBackground = true
)
@Composable
fun TabletGreetingPreview() {
    GreetingCard("Charlie")
}
```

## 2. Basic UI Testing with Compose

Testing your Compose UI ensures that your components behave as expected, are accessible, and remain consistent across changes. Jetpack Compose provides a dedicated testing API that allows you to interact with your UI using semantic properties rather than pixel coordinates.

### Key Components for Compose UI Testing:

*   **`createComposeRule()`**: This is the entry point for Compose UI tests. It provides access to the test environment and allows you to set the content for testing.
*   **Semantic Tree**: Compose organizes UI elements into a semantic tree, which describes the elements in a way that accessibility services and testing frameworks can understand. Your tests interact with this tree.
*   **Semantic Matchers**: Functions like `onNodeWithText()`, `onNodeWithContentDescription()`, `onNodeWithTag()`, `hasText()`, `isDisplayed()`, `performClick()`, etc., are used to locate UI elements in the semantic tree and assert their state or perform actions.
*   **Test Tags (`Modifier.testTag`)**: An invaluable tool for making specific composables discoverable by tests, especially when standard matchers are insufficient or ambiguous.

### Setting up Your Test Environment:

To write UI tests for Compose, you'll typically add the following dependencies to your `build.gradle (Module: app)`:

```gradle
androidTestImplementation platform('androidx.compose:compose-bom:2023.08.00') // Use latest BOM
androidTestImplementation 'androidx.compose.ui:ui-test-junit4'
debugImplementation 'androidx.compose.ui:ui-test-manifest'
```

### Writing a Basic UI Test:

1.  **Create a Test Class:** Place your test files in the `app/src/androidTest/java` directory.
2.  **Use `createComposeRule`:** Declare a `ComposeTestRule` using `@get:Rule`.
3.  **Set Content:** Use `composeTestRule.setContent {}` to define the composable you want to test.
4.  **Find UI Elements:** Use semantic matchers on `composeTestRule` to locate nodes.
5.  **Perform Actions (Optional):** Use `performClick()`, `performTextInput()`, etc.
6.  **Assert States:** Use matchers like `assertIsDisplayed()`, `assertTextEquals()`, `assertIsSelected()`, etc., to verify the UI's state.

### Code Example:

Let's test a simple `Counter` composable.

```kotlin
// In your app's composable file (e.g., MainActivity.kt or a separate file)
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag

@Composable
fun Counter(modifier: Modifier = Modifier) {
    var count by remember { mutableIntStateOf(0) }

    Column(modifier = modifier) {
        Text(
            text = "Count: $count",
            modifier = Modifier.testTag("countText") // Add a test tag for easy access
        )
        Row {
            Button(
                onClick = { count++ },
                modifier = Modifier.testTag("incrementButton")
            ) {
                Text("Increment")
            }
            Button(
                onClick = { count-- },
                modifier = Modifier.testTag("decrementButton")
            ) {
                Text("Decrement")
            }
        }
    }
}
```

```kotlin
// In your androidTest directory (e.g., ExampleInstrumentedTest.kt)
package com.example.app // Replace with your package name

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.ext.junit.runners.AndroidJUnit4

@RunWith(AndroidJUnit4::class)
class CounterTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun counter_initialStateIsZero() {
        composeTestRule.setContent {
            Counter()
        }

        composeTestRule.onNodeWithText("Count: 0").assertIsDisplayed()
        composeTestRule.onNodeWithTag("countText").assertTextEquals("Count: 0")
    }

    @Test
    fun counter_incrementButtonIncreasesCount() {
        composeTestRule.setContent {
            Counter()
        }

        // Initial state
        composeTestRule.onNodeWithTag("countText").assertTextEquals("Count: 0")

        // Click increment button
        composeTestRule.onNodeWithTag("incrementButton").performClick()

        // Assert new state
        composeTestRule.onNodeWithTag("countText").assertTextEquals("Count: 1")
    }

    @Test
    fun counter_decrementButtonDecreasesCount() {
        composeTestRule.setContent {
            Counter()
        }

        // Initial state
        composeTestRule.onNodeWithTag("countText").assertTextEquals("Count: 0")

        // Click increment once to get to 1, then decrement
        composeTestRule.onNodeWithTag("incrementButton").performClick()
        composeTestRule.onNodeWithTag("countText").assertTextEquals("Count: 1") // Verify increment first

        // Click decrement button
        composeTestRule.onNodeWithTag("decrementButton").performClick()

        // Assert new state
        composeTestRule.onNodeWithTag("countText").assertTextEquals("Count: 0")
    }
}
```

## Quick Checklist/Exercise:

1.  Create a simple `UserProfileCard` composable that displays a user's name and email. Add at least three different `@Preview` annotations to showcase it: one with a default user, one simulating a dark theme, and one on a tablet device.
2.  For the `UserProfileCard` you created, add a `Modifier.testTag` to the `Text` composable displaying the user's name.
3.  Write an Android UI test (`@Test`) using `createComposeRule` that verifies the user's name displayed in the `UserProfileCard` is correct, using both `onNodeWithText` and `onNodeWithTag` matchers.