# Building Blocks: Angular Core Study Guide

Angular applications are built upon a robust set of fundamental building blocks that enable the creation of powerful, single-page applications. Mastering these core concepts is crucial for any Angular developer.

## 1. Components: The UI Backbone

Components are the most fundamental building blocks of an Angular application. They are responsible for a specific part of the UI and the logic that controls it. Every Angular application has at least one root component (`AppComponent`).

*   **Definition**: A class decorated with `@Component()` that specifies its template, styles, and a selector.
*   **Structure**:
    *   **Template**: An HTML snippet (`templateUrl` or `template`) that defines the component's view.
    *   **Stylesheet**: CSS styles (`styleUrls` or `styles`) specific to the component.
    *   **Class Logic**: A TypeScript class (`export class MyComponent { ... }`) that handles the component's data and behavior.
    *   **Selector**: A CSS selector (`selector: 'app-my-component'`) that Angular uses to identify and instantiate the component in an HTML template.

**Example:**
```typescript
// my-component.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `
    <h2>{{ title }}</h2>
    <p>This is my first Angular component.</p>
  `,
  styles: [`
    h2 { color: blue; }
  `]
})
export class MyComponent {
  title = 'Hello Angular!';
}
```

## 2. Data Binding: Connecting UI and Logic

Data binding is a mechanism that synchronizes data between the component's logic and its template. Angular supports several types of data binding:

*   **Interpolation `{{ ... }}`**: Displays a component property's value in the template. (One-way: component to view).
    *   Example: `<h2>{{ title }}</h2>`
*   **Property Binding `[property]="value"`**: Binds a component property's value to an HTML element's property. (One-way: component to view).
    *   Example: `<img [src]="imageUrl">`
*   **Event Binding `(event)="handler()"`**: Listens for events on an HTML element and executes a component method. (One-way: view to component).
    *   Example: `<button (click)="onClick()">Click Me</button>`
*   **Two-Way Data Binding `[(ngModel)]="property"`**: Combines property binding and event binding to synchronize data in both directions (component to view and view to component). Requires `FormsModule`.
    *   Example: `<input [(ngModel)]="userName">`

## 3. Services & Dependency Injection: Reusable Logic

Services are plain TypeScript classes that provide specific functionality (e.g., fetching data, logging, calculations) and can be reused across multiple components. They help keep components lean and focused on UI logic.

*   **Definition**: A class decorated with `@Injectable()` (usually) to make it available for Angular's Dependency Injection (DI) system.
*   **Dependency Injection (DI)**: A design pattern where a class receives its dependencies from external sources rather than creating them itself. Angular's DI system provides instances of services to components or other services that declare them as dependencies in their constructor.

**Example:**
```typescript
// data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes the service a singleton available throughout the app
})
export class DataService {
  getData(): string[] {
    return ['Item 1', 'Item 2', 'Item 3'];
  }
}

// my-component.component.ts (using the service)
import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-my-component',
  template: `
    <ul>
      <li *ngFor="let item of items">{{ item }}</li>
    </ul>
  `
})
export class MyComponent {
  items: string[] = [];

  constructor(private dataService: DataService) { // Inject DataService
    this.items = this.dataService.getData();
  }
}
```

## 4. NgModules: Organizing Your Application

NgModules are containers for a cohesive block of code dedicated to an application domain, a workflow, or a set of closely related capabilities. They help organize the application and manage compilation scope.

*   **Root Module (`AppModule`)**: Every Angular app has one root module, typically named `AppModule`, located in `app.module.ts`. It bootstraps the application.
*   **Feature Modules**: Used to organize components, services, and other code related to a specific feature, making the application more maintainable and scalable. They can be lazy-loaded.
*   **Key properties**:
    *   `declarations`: Components, directives, and pipes that belong to this module.
    *   `imports`: Other modules whose exported classes are needed by component templates in this module.
    *   `providers`: Services that the module contributes to the global service collection (the injector).
    *   `bootstrap`: The root component(s) that Angular should bootstrap when it starts the application (only for the root module).

## 5. Routing: Navigating Your App

Angular Router enables navigation from one view to the next as users perform application tasks. It maps URL paths to components.

*   **Configuration**: Defined in an array of `Routes` within `app-routing.module.ts` (or similar).
*   **`RouterModule`**: Provides the routing capabilities. `RouterModule.forRoot()` in the root module and `RouterModule.forChild()` in feature modules.
*   **`RouterOutlet`**: A directive that marks where the router should display views.
*   **`RouterLink`**: A directive used in anchor tags (`<a>`) to navigate to different routes without full page reloads.

**Example:**
```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

```html
<!-- app.component.html -->
<nav>
  <a routerLink="/">Home</a> |
  <a routerLink="/about">About</a>
</nav>
<router-outlet></router-outlet>
```

## 6. Forms: User Input Management

Angular provides two distinct approaches for building forms:

*   **Template-driven Forms**: Rely heavily on directives in the template (e.g., `ngModel`, `ngForm`). Easier for simple forms.
    *   Requires `FormsModule` to be imported.
*   **Reactive Forms**: Provide more explicit and programmatic control over form validation and state management. Based on RxJS observables. Preferred for complex forms.
    *   Requires `ReactiveFormsModule` to be imported.

**Example (Template-driven input):**
```html
<input type="text" [(ngModel)]="userName" name="userName" #name="ngModel" required>
<div *ngIf="name.invalid && name.touched">Name is required.</div>
```

## 7. Reactive Programming with RxJS

RxJS (Reactive Extensions for JavaScript) is a library for composing asynchronous and event-based programs using observable sequences. Angular leverages RxJS extensively for handling asynchronous operations (like HTTP requests, user events, routing).

*   **Observables**: Represent a stream of values or events over time. They are "lazy" (don't emit until subscribed).
*   **Subscribers**: An observer (object with `next`, `error`, `complete` methods) that consumes values emitted by an Observable.
*   **Operators**: Functions that allow you to transform, filter, and combine observables. Common operators include `map`, `filter`, `debounceTime`, `switchMap`.

**Example:**
```typescript
import { fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Create an observable from DOM events
const clicks = fromEvent(document, 'click');

// Use operators to transform and filter the stream
const heavyClicks = clicks.pipe(
  filter((event: MouseEvent) => event.clientX > 100),
  map((event: MouseEvent) => `Clicked at X: ${event.clientX}`)
);

// Subscribe to the observable to react to events
heavyClicks.subscribe(message => console.log(message));
```

---

## Quick Understanding Checklist/Exercise:

1.  **Component Interaction**: Describe how two sibling components could communicate with each other using services.
2.  **Data Flow**: Explain the difference between `{{ property }}` and `[property]="value"` in terms of data flow direction.
3.  **RxJS Application**: You need to fetch user data from an API only when a search input has been stable for 500ms. Which RxJS operators would you likely use, and why?