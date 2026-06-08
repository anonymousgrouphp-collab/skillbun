# Components, Templates & Data Binding in Angular

Angular applications are built from components, which are the fundamental building blocks of any Angular UI. Each component encapsulates a part of the UI and its associated logic, styles, and data.

## 1. Angular Components: The Building Blocks

An Angular component is essentially a TypeScript class adorned with the `@Component()` decorator. This decorator provides metadata about the component, instructing Angular on how to process it.

*   **`selector`**: A CSS selector that identifies this component in a template.
*   **`templateUrl` or `template`**: The path to an HTML file or inline HTML that defines the component's view.
*   **`styleUrls` or `styles`**: An array of paths to CSS files or inline CSS for component-specific styling.

**Example Component Structure:**

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.css']
})
export class MyComponent implements OnInit {
  message: string = 'Hello, Angular!';
  counter: number = 0;

  constructor() { }

  ngOnInit(): void {
    console.log('Component initialized!');
  }

  incrementCounter(): void {
    this.counter++;
  }
}
```

## 2. Component Lifecycle Hooks

Angular components have a lifecycle, a series of stages it goes through from creation to destruction. Lifecycle hooks allow you to tap into these moments to perform actions (e.g., initialization, data changes, cleanup). `ngOnInit` is a common hook called once, after Angular has initialized all data-bound properties of a directive.

## 3. Templates (HTML) & Component-Specific Styles (CSS)

*   **Templates**: Define the component's UI using standard HTML, extended with Angular's template syntax. They describe *what* to render.
*   **Component-Specific Styles**: Encapsulate styles within the component, preventing them from bleeding into other parts of the application. This ensures modularity and maintainability.

**Example Template (`my-component.component.html`):**

```html
<div>
  <h1>{{ message }}</h1>
  <button (click)="incrementCounter()">Increment</button>
  <p>Counter: {{ counter }}</p>
</div>
```

## 4. Data Binding: Connecting Component & Template

Data binding is how you communicate between your component's TypeScript class and its HTML template. Angular supports four main forms:

### a) Interpolation (`{{ value }}`)
Displays a component property's value directly in the template. It's a one-way binding from component to view.

**Syntax:** `{{ componentProperty }}`

**Example:**
```html
<p>Current message: {{ message }}</p>
```

### b) Property Binding (`[property]="value"`)
Binds a component property to a DOM element property, directive, or component `@Input()`. It's also a one-way binding from component to view.

**Syntax:** `<element [domProperty]="componentPropertyExpression"></element>`

**Example:**
```html
<img [src]="imageUrl" [alt]="imageAltText">
<button [disabled]="isButtonDisabled">Click Me</button>
```
*   `imageUrl` and `imageAltText` are properties in the component class.
*   `isButtonDisabled` is a boolean property.

### c) Event Binding (`(event)="handler()"`)
Allows you to listen for events (like clicks, keypresses, form submissions) on DOM elements and execute component methods when those events occur. It's a one-way binding from view to component.

**Syntax:** `<element (domEvent)="componentMethod($event)"></element>`

**Example:**
```html
<button (click)="incrementCounter()">Click to Increment</button>
<input (keyup.enter)="onEnterPressed($event)" placeholder="Press Enter">
```
*   `incrementCounter()` and `onEnterPressed()` are methods in the component class.
*   `$event` is an optional special variable containing event data.

### d) Two-Way Data Binding (`[(ngModel)]="property"`)
Combines property binding and event binding to synchronize data between the component and the form input element. Changes in the input automatically update the component property, and changes in the component property automatically update the input.

**Syntax:** `<input [(ngModel)]="componentProperty">`

**Note:** Two-way data binding typically requires `FormsModule` to be imported in your root module (`app.module.ts`).

**Example:**
```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <label>Name: <input [(ngModel)]="userName"></label>
    <p>Hello, {{ userName }}!</p>
  `
})
export class AppComponent {
  userName: string = 'SkillBun User';
}
```

## 5. Component Interaction: `@Input()` and `@Output()`

Components often need to communicate with each other, especially between parent and child components.

### a) `@Input()` Decorator: Parent to Child Communication
The `@Input()` decorator allows a child component to receive data from its parent component. The parent component binds a property to the child's `@Input()` property.

**Child Component (`child.component.ts`):**

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-child',
  template: '<h2>{{ messageFromParent }}</h2>'
})
export class ChildComponent {
  @Input() messageFromParent: string = '';
}
```

**Parent Component (`parent.component.html`):**

```html
<app-child [messageFromParent]="'Data from Parent!'"></app-child>
```

### b) `@Output()` Decorator: Child to Parent Communication
The `@Output()` decorator allows a child component to send data or events up to its parent. This is achieved using an `EventEmitter`. The child *emits* an event, and the parent *listens* for it.

**Child Component (`child.component.ts`):**

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  template: '<button (click)="notifyParent()">Click Me</button>'
})
export class ChildComponent {
  @Output() childEvent = new EventEmitter<string>();

  notifyParent(): void {
    this.childEvent.emit('Hello from Child!');
  }
}
```

**Parent Component (`parent.component.html`):**

```html
<app-child (childEvent)="handleChildEvent($event)"></app-child>
<p>Message from child: {{ childData }}</p>
```

**Parent Component (`parent.component.ts`):**

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html'
})
export class ParentComponent {
  childData: string = '';

  handleChildEvent(data: string): void {
    this.childData = data;
  }
}
```

---

## Quick Checklist/Exercise:

1.  Describe the primary difference in data flow between interpolation `{{ }}` and event binding `( )`.
2.  You have a `ProductListComponent` and a `ProductCardComponent`. How would you pass the `product` object from the list to an individual card for display?
3.  Which data binding mechanism is ideal for creating interactive input fields where both the display and the underlying data model need to be instantly updated?
