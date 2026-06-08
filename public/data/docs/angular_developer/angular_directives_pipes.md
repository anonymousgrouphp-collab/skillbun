# Directives & Pipes in Angular: Enhancing UI and Data Presentation

Angular Directives and Pipes are fundamental building blocks that empower developers to create dynamic, interactive, and beautifully formatted user interfaces. Directives allow you to manipulate the DOM, changing its structure, appearance, or behavior, while Pipes provide a way to transform and format data directly within your templates.

## Angular Directives

Directives are classes that add additional behavior to elements in your Angular applications. Angular has three types of directives:

1.  **Component Directives:** These are directives with a template. Components are the most common type of directive.
2.  **Structural Directives:** These directives change the DOM layout by adding, removing, or manipulating elements. They are prefixed with an asterisk (`*`).
3.  **Attribute Directives:** These directives change the appearance or behavior of an element, component, or another directive. They are enclosed in square brackets (`[]`).

### Structural Directives

Structural directives are powerful tools for dynamically changing the structure of your HTML.

*   `*ngIf`: Conditionally adds or removes an element from the DOM based on a boolean expression.

    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-ngif-example',
      template: `
        <button (click)="toggleDisplay()">Toggle Display</button>
        <p *ngIf="isDisplayed">This paragraph is visible!</p>
        <p *ngIf="!isDisplayed">This paragraph is hidden!</p>
      `
    })
    export class NgIfExampleComponent {
      isDisplayed = true;
      toggleDisplay() {
        this.isDisplayed = !this.isDisplayed;
      }
    }
    ```

*   `*ngFor`: Renders a list of items by iterating over a collection.

    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-ngfor-example',
      template: `
        <h3>My Shopping List</h3>
        <ul>
          <li *ngFor="let item of items; let i = index">
            {{ i + 1 }}. {{ item }}
          </li>
        </ul>
      `
    })
    export class NgForExampleComponent {
      items = ['Apples', 'Bananas', 'Milk', 'Bread'];
    }
    ```

*   `*ngSwitch` (`ngSwitch`, `ngSwitchCase`, `ngSwitchDefault`): Renders one of several possible elements based on a switch value.

    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-ngswitch-example',
      template: `
        <select [(ngModel)]="selectedColor">
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
        </select>

        <div [ngSwitch]="selectedColor">
          <p *ngSwitchCase="'red'">You chose Red!</p>
          <p *ngSwitchCase="'blue'">You chose Blue!</p>
          <p *ngSwitchCase="'green'">You chose Green!</p>
          <p *ngSwitchDefault>Please choose a color.</p>
        </div>
      `
    })
    export class NgSwitchExampleComponent {
      selectedColor = '';
    }
    ```

### Attribute Directives

Attribute directives modify the appearance or behavior of an element.

*   `[ngClass]`: Dynamically adds or removes CSS classes from an element.

    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-ngclass-example',
      template: `
        <button (click)="toggleActive()">Toggle Active</button>
        <p [ngClass]="{'active': isActive, 'highlight': true}">
          This text changes class based on 'isActive'.
        </p>
      `,
      styles: [`
        .active { color: blue; font-weight: bold; }
        .highlight { background-color: yellow; }
      `]
    })
    export class NgClassExampleComponent {
      isActive = false;
      toggleActive() {
        this.isActive = !this.isActive;
      }
    }
    ```

*   `[ngStyle]`: Dynamically sets inline styles on an element.

    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-ngstyle-example',
      template: `
        <button (click)="changeColor()">Change Color</button>
        <p [ngStyle]="{'color': myColor, 'font-size.px': 20}">
          This text changes color and size.
        </p>
      `
    })
    export class NgStyleExampleComponent {
      myColor = 'purple';
      changeColor() {
        this.myColor = this.myColor === 'purple' ? 'orange' : 'purple';
      }
    }
    ```

### Custom Attribute Directives

You can create your own directives to encapsulate reusable DOM manipulation logic.

1.  **Create the directive:**
    ```bash
    ng generate directive highlight
    ```
2.  **Implement the logic:**

    ```typescript
    import { Directive, ElementRef, HostListener, Input } from '@angular/core';

    @Directive({
      selector: '[appHighlight]' // This is how you'll use it: <p appHighlight>
    })
    export class HighlightDirective {
      @Input() appHighlight = 'yellow'; // Default color, can be customized

      constructor(private el: ElementRef) { }

      @HostListener('mouseenter') onMouseEnter() {
        this.highlight(this.appHighlight);
      }

      @HostListener('mouseleave') onMouseLeave() {
        this.highlight('');
      }

      private highlight(color: string) {
        this.el.nativeElement.style.backgroundColor = color;
      }
    }
    ```
3.  **Use it in a template:**

    ```html
    <p appHighlight="lightblue">Hover over me!</p>
    <p appHighlight>Hover over me for default yellow!</p>
    ```

## Angular Pipes

Pipes are simple functions used in template expressions to transform data before displaying it. They are denoted by the pipe symbol (`|`).

### Built-in Pipes

Angular provides several built-in pipes for common data transformations.

*   `DatePipe`: Formats a date value according to locale rules.

    ```typescript
    // In your component
    export class DatePipeExampleComponent {
      today = new Date(); // e.g., Sat Nov 06 2023 10:00:00 GMT-0500 (Eastern Standard Time)
    }
    ```
    ```html
    <p>Default: {{ today | date }}</p>
    <p>Short Date: {{ today | date:'shortDate' }}</p>
    <p>Full Date: {{ today | date:'fullDate' }}</p>
    <p>Custom: {{ today | date:'dd/MM/yyyy HH:mm' }}</p>
    ```

*   `CurrencyPipe`: Formats a number as a currency value.

    ```typescript
    // In your component
    export class CurrencyPipeExampleComponent {
      price = 1234.56;
    }
    ```
    ```html
    <p>Default: {{ price | currency }}</p>
    <p>EUR: {{ price | currency:'EUR' }}</p>
    <p>GBP with symbol: {{ price | currency:'GBP':'symbol' }}</p>
    ```

*   `AsyncPipe`: Automatically subscribes to an `Observable` or `Promise` and returns its latest value. It also unsubscribes automatically when the component is destroyed.

    ```typescript
    import { Component } from '@angular/core';
    import { Observable, interval } from 'rxjs';
    import { map } from 'rxjs/operators';

    @Component({
      selector: 'app-async-pipe-example',
      template: `
        <p>Current Time (AsyncPipe): {{ time$ | async | date:'mediumTime' }}</p>
      `
    })
    export class AsyncPipeExampleComponent {
      time$: Observable<Date>;

      constructor() {
        this.time$ = interval(1000).pipe(map(() => new Date()));
      }
    }
    ```

### Chaining Pipes

You can chain multiple pipes together, where the output of one pipe becomes the input of the next.

```html
<p>Chained Pipes: {{ 'HELLO WORLD' | lowercase | titlecase }}</p>
<p>Chained Pipes: {{ 12345.6789 | currency:'USD':'symbol':'1.2-2' | uppercase }}</p>
```

### Custom Pipes

To create a custom pipe:

1.  **Generate the pipe:**
    ```bash
    ng generate pipe reverseString
    ```
2.  **Implement the `PipeTransform` interface:**

    ```typescript
    import { Pipe, PipeTransform } from '@angular/core';

    @Pipe({
      name: 'reverseString' // This is how you'll use it: 'value' | reverseString
    })
    export class ReverseStringPipe implements PipeTransform {
      transform(value: string): string {
        if (!value) return '';
        return value.split('').reverse().join('');
      }
    }
    ```
3.  **Use it in a template:**

    ```html
    <p>Original: Angular</p>
    <p>Reversed: {{ 'Angular' | reverseString }}</p>
    ```

---

### Checklist / Exercise

1.  **Identify Directive Types:** Given an HTML snippet `<div *ngIf="isValid" [ngClass]="{'active': isActive}">Hello</div>`, identify which part uses a structural directive and which uses an attribute directive.
2.  **Pipe Usage:** How would you display a date object `myDate = new Date()` in the format "YYYY-MM-DD" using Angular's built-in pipes?
3.  **Custom Logic:** Outline the steps to create a custom pipe named `truncate` that takes a string and a limit number, returning the string truncated with "..." if it exceeds the limit.