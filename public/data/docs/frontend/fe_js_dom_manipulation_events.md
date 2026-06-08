## DOM Manipulation & Event Handling

The Document Object Model (DOM) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content. When a web page is loaded, the browser creates a DOM of the page. This study guide covers how to interact with this model to create dynamic and interactive user interfaces.

### 1. Understanding the DOM

The DOM represents an HTML document as a tree structure, where each HTML element, attribute, and text piece is a "node." JavaScript can access and manipulate these nodes. The `document` object is the entry point to the DOM.

### 2. Selecting Elements

To manipulate an element, you first need to select it using various methods provided by the `document` object.

*   `document.getElementById('idName')`: Selects a single element by its unique ID.
*   `document.querySelector('selector')`: Selects the *first* element that matches a specified CSS selector (e.g., `'#myId'`, `'.myClass'`, `'div'`).
*   `document.querySelectorAll('selector')`: Selects *all* elements that match a specified CSS selector, returning a `NodeList`.
*   `document.getElementsByClassName('className')`: Selects all elements with a specific class name, returning an `HTMLCollection`.
*   `document.getElementsByTagName('tagName')`: Selects all elements with a specific tag name (e.g., `'div'`, `'p'`), returning an `HTMLCollection`.

**Example:**
```javascript
const myDiv = document.getElementById('myDiv');
const paragraphs = document.querySelectorAll('p.intro');
```

### 3. Manipulating Elements

Once selected, elements can be modified, created, or removed from the DOM.

#### Modifying Content and Attributes:

*   `element.textContent`: Gets or sets the text content of an element (safe from XSS).
*   `element.innerHTML`: Gets or sets the HTML content of an element (can introduce XSS if not careful).
*   `element.style.propertyName`: Directly modifies inline CSS properties (e.g., `myDiv.style.backgroundColor = 'blue'`).
*   `element.setAttribute('name', 'value')`: Sets the value of an attribute.
*   `element.removeAttribute('name')`: Removes an attribute.
*   `element.classList.add('className')`, `element.classList.remove('className')`, `element.classList.toggle('className')`: Manages an element's CSS classes.

#### Creating and Removing Elements:

*   `document.createElement('tagName')`: Creates a new HTML element.
*   `element.appendChild(childElement)`: Adds a child element to the end of a parent element's children.
*   `element.insertBefore(newElement, referenceElement)`: Inserts a new element before a reference element within the same parent.
*   `element.removeChild(childElement)`: Removes a specified child element from its parent.
*   `element.remove()`: Removes the element itself from the DOM.

**Example:**
```javascript
const newParagraph = document.createElement('p');
newParagraph.textContent = 'This is a new paragraph.';
document.body.appendChild(newParagraph);

newParagraph.classList.add('highlight'); // Add a class
```

### 4. Event Handling Basics

Event handling allows you to react to user interactions or browser events, making UIs interactive.

*   `element.addEventListener('eventName', callbackFunction)`: The preferred method to attach an event listener.
    *   `eventName`: The type of event (e.g., `'click'`, `'mouseover'`, `'submit'`, `'keydown'`).
    *   `callbackFunction`: The function to execute when the event occurs.
*   `event.target`: Inside an event handler, refers to the element that triggered the event.
*   `event.preventDefault()`: Prevents the default action of an event (e.g., a form submission).
*   `event.stopPropagation()`: Stops the event from bubbling up the DOM tree.

**Common Events:**
*   `click`: When an element is clicked.
*   `mouseover`, `mouseout`: When the mouse pointer enters/leaves an element.
*   `keydown`, `keyup`: When a keyboard key is pressed/released.
*   `submit`: When a form is submitted.
*   `load`, `DOMContentLoaded`: When the page/DOM is fully loaded.

### 5. Advanced Event Concepts

#### Event Propagation (Bubbling & Capturing):

When an event occurs on an element, it doesn't just happen on that element. It propagates through its ancestors in two phases:

*   **Capturing Phase:** The event travels down from the `window` to the target element.
*   **Target Phase:** The event reaches the target element.
*   **Bubbling Phase:** The event travels up from the target element back to the `window`.

`addEventListener` defaults to the bubbling phase. You can specify `true` as the third argument to listen during the capturing phase: `element.addEventListener('click', handler, true)`.

#### Event Delegation:

Instead of attaching event listeners to many individual child elements, attach a single listener to a common parent element. When an event occurs on a child, it bubbles up to the parent, and the parent's listener can then identify the actual target (`event.target`) and react accordingly. This is efficient for dynamic lists or many similar elements, as it reduces memory usage and simplifies managing listeners.

**Example of Event Delegation:**
```javascript
const myList = document.getElementById('myList'); // An unordered list
myList.addEventListener('click', function(event) {
  if (event.target.tagName === 'LI') { // Check if the clicked element is an LI
    alert(`You clicked on: ${event.target.textContent}`);
  }
});
```

### Code Example: Interactive Button

Let's create a button that changes text and background color on click.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM & Events Example</title>
    <style>
        #myButton {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: white;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }
        #myButton.clicked {
            background-color: #28a745;
        }
        #message {
            margin-top: 15px;
            font-family: sans-serif;
        }
    </style>
</head>
<body>
    <button id="myButton">Click Me!</button>
    <p id="message">Button not clicked yet.</p>

    <script>
        const button = document.getElementById('myButton');
        const message = document.getElementById('message');
        let clickCount = 0;

        button.addEventListener('click', function() {
            clickCount++;
            message.textContent = `Button clicked ${clickCount} time(s)!`;
            button.textContent = `Clicked ${clickCount}`;
            
            // Toggle a class for styling
            button.classList.toggle('clicked');

            // Change style directly
            if (clickCount % 2 === 0) {
                button.style.transform = 'scale(1)';
            } else {
                button.style.transform = 'scale(1.05)';
            }
        });
    </script>
</body>
</html>
```

### Checklist / Exercises:

1.  **Element Creation & Appending:** Create a new `<div>` element, give it the `id="newContainer"`, add some text content like "Hello DOM!", and append it to the `<body>` of the document using JavaScript.
2.  **Event Listener & Modification:** Add a click event listener to the `newContainer` you just created. When clicked, change its `background-color` to a random color and log its current `textContent` to the console.
3.  **Event Delegation:** Imagine you have an unordered list (`<ul>`) with several list items (`<li>`). Demonstrate how to use event delegation to log the text content of *any* clicked `<li>` within that `<ul>` by attaching only one event listener to the `<ul>` itself.