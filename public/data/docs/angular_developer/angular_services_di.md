# Services & Dependency Injection in Angular

This study guide will help you understand how to use Services to encapsulate reusable logic and data, and master Angular's powerful Dependency Injection (DI) system.

## 1. What are Services?

In Angular, a **Service** is a class designed to be instantiated once and shared across multiple components, directives, or other services. They are excellent for:

*   **Encapsulating Business Logic**: Keeping complex operations out of components.
*   **Data Access**: Centralizing data fetching, storing, and manipulation.
*   **Sharing State**: Providing a single source of truth for data that needs to be accessed or modified by various parts of your application.
*   **Reusability**: Writing logic once and injecting it wherever needed.

Services promote a clean separation of concerns, making your code more modular, maintainable, and testable.

## 2. Creating an Angular Service

You typically create a service using the Angular CLI:

```bash
ng generate service data
# or ng g s data
```

This generates `data.service.ts` and `data.service.spec.ts`.

### The `@Injectable()` Decorator

Services are plain TypeScript classes, but they are marked with the `@Injectable()` decorator. This decorator signals to Angular that the class can be injected with dependencies and, more importantly, that it *itself* can be injected into other classes.

```typescript
// src/app/data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Explained below
})
export class DataService {
  private data: string[] = ['Item 1', 'Item 2'];

  constructor() { }

  getData(): string[] {
    return this.data;
  }

  addData(item: string): void {
    this.data.push(item);
  }
}
```

### `providedIn: 'root'`

The `providedIn` property in the `@Injectable()` decorator specifies *how* the service should be provided (made available) to the dependency injection system. When set to `'root'`:

*   The service is registered with the root injector.
*   Angular creates a single, global instance of the service.
*   It becomes available everywhere in the application.
*   This makes the service **tree-shakable**, meaning if no component injects it, the service won't be included in the production bundle, saving space.

## 3. Understanding Dependency Injection (DI)

**Dependency Injection (DI)** is a design pattern in which a class requests dependencies from external sources rather than creating them itself. In Angular, the DI system provides a structured way to deliver dependencies to your classes (like components, services, and directives).

Key concepts:

*   **Injector**: An object that creates and maintains instances of dependencies. When a component needs a service, the injector is responsible for finding or creating that service instance.
*   **Provider**: An instruction to the injector on *how* to create an instance of a dependency. This tells the injector which class to instantiate, or which value to return.
*   **Dependency**: The service or object that a class needs to perform its function.

## 4. Providers

Providers tell Angular how to create or obtain a dependency. They are defined in the `providers` array of an `@NgModule()` or `@Component()` decorator. Some common provider configurations:

*   **`{ provide: DataService, useClass: DataService }`**: The most common, implicitly used with `providedIn: 'root'`. Tells Angular to provide an instance of `DataService` by instantiating the `DataService` class.
*   **`{ provide: LoggerService, useValue: { log: (msg) => console.log(msg) } }`**: Provides a static value or object directly.
*   **`{ provide: API_URL, useValue: 'https://api.example.com' }`**: Provides a configuration constant (often using an `InjectionToken`).
*   **`{ provide: OldService, useExisting: NewService }`**: Maps an alias. When `OldService` is requested, `NewService` is provided.
*   **`{ provide: AuthService, useFactory: () => new AuthService(someConfig) }`**: Uses a factory function to create the dependency, allowing for more complex initialization logic.

## 5. Hierarchical Injectors

Angular's DI system is hierarchical. This means there's a tree of injectors, mirroring the component tree:

*   **Root Injector**: The top-level injector, usually created by `providedIn: 'root'` or by adding services to `AppModule`'s `providers` array. Services provided here are singletons throughout the app.
*   **Module Injectors**: When a lazy-loaded module (like `AdminModule`) has its own `providers` array, it creates its own child injector. Services provided here are singletons *within that lazy-loaded module*.
*   **Component Injectors**: Each component can have its own injector if you specify `providers` in its `@Component()` decorator. Services provided here create a *new instance for each instance of the component* and its children.

When a component requests a dependency, Angular's DI system traverses the injector tree upwards, starting from the component's own injector, then its parent component's injector, then its module's injector, and finally the root injector. The first injector that has a provider for the requested dependency will provide it.

## Code Example: Using a Data Service

Let's see how `DataService` can be injected and used in a component:

```typescript
// src/app/data.service.ts (as defined above)
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private items: string[] = ['Angular', 'React', 'Vue'];

  getItems(): string[] {
    return this.items;
  }

  addItem(newItem: string): void {
    this.items.push(newItem);
  }
}
```

```typescript
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service'; // Import the service

@Component({
  selector: 'app-root',
  template: `
    <h1>My App</h1>
    <p>Items from DataService:</p>
    <ul>
      <li *ngFor="let item of items">{{ item }}</li>
    </ul>
    <button (click)="addNewItem()">Add New Item</button>
  `
})
export class AppComponent implements OnInit {
  items: string[] = [];

  // 1. Inject the DataService into the component's constructor
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // 2. Use the injected service to get data
    this.items = this.dataService.getItems();
  }

  addNewItem(): void {
    const newItem = `Item ${this.items.length + 1}`;
    this.dataService.addItem(newItem);
    // Re-fetch items to update the view
    this.items = this.dataService.getItems();
  }
}
```

In this example, `AppComponent` doesn't know *how* `DataService` is created; it just declares that it needs an instance of `DataService` in its constructor. Angular's DI system handles the rest, providing the singleton instance of `DataService` because it's `providedIn: 'root'`.

## Checklist / Exercises

1.  **Explain the primary purpose of an Angular Service.** Why do we use them instead of putting all logic directly into components?
2.  **Describe the role of the `@Injectable()` decorator and the `providedIn: 'root'` option.** What benefit does `providedIn: 'root'` offer, especially in production?
3.  **Imagine you have a `UserService` and a `LoggerService`.** How would you inject `LoggerService` into `UserService`? Provide a simple code snippet for `UserService`'s constructor demonstrating this.