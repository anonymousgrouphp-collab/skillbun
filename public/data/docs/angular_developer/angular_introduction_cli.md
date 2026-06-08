# Introduction to Angular & CLI

Angular is a powerful, open-source front-end framework developed by Google for building single-page applications (SPAs) and complex web applications. Written in TypeScript, it provides a structured and opinionated approach to development, making it scalable and maintainable for enterprise-level applications.

## Core Architectural Concepts

Angular applications are built around a set of fundamental building blocks that work together to create dynamic user interfaces.

### 1. Components

Components are the most fundamental building blocks of an Angular application. They control a specific view (a piece of the UI) on the screen. Every component consists of:
*   A **TypeScript class** with the `@Component` decorator, which contains the component's logic.
*   An **HTML template** that defines the component's view.
*   **CSS styles** that define the component's appearance.

**Example Component Structure:**

```typescript
// src/app/my-component/my-component.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-component', // How to use this component in HTML
  templateUrl: './my-component.component.html', // Path to HTML template
  styleUrls: ['./my-component.component.css'] // Path to CSS styles
})
export class MyComponentComponent implements OnInit {
  title = 'My First Angular Component';

  constructor() { }

  ngOnInit(): void {
    console.log('MyComponent has initialized!');
  }
}
```

```html
<!-- src/app/my-component/my-component.component.html -->
<div>
  <h1>{{ title }}</h1>
  <p>This is a paragraph inside my component.</p>
</div>
```

### 2. Modules (NgModules)

Angular applications are modular. NgModules are containers for a cohesive block of functionality. They declare a set of components, services, pipes, and directives that belong together.
*   Every Angular application has at least one **root module**, conventionally named `AppModule`.
*   Modules help organize the application, promote reusability, and can be lazily loaded for performance benefits.

**Example `AppModule`:**

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MyComponentComponent } from './my-component/my-component.component'; // Import your component

@NgModule({
  declarations: [ // Components, directives, pipes that belong to this module
    AppComponent,
    MyComponentComponent
  ],
  imports: [ // Other modules whose exported classes are needed by component templates declared in this module
    BrowserModule
  ],
  providers: [], // Services that this module makes available globally
  bootstrap: [AppComponent] // The root component that Angular starts
})
export class AppModule { }
```

### 3. Services

Services are classes that encapsulate business logic, data fetching, or any functionality that isn't directly related to a view. They are typically injected into components or other services.
*   They are marked with the `@Injectable()` decorator, making them eligible for Angular's dependency injection system.
*   Services promote separation of concerns, keeping components lean and focused on presentation.

**Example Service:**

```typescript
// src/app/data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes the service a singleton available throughout the app
})
export class DataService {
  private data: string[] = ['Item 1', 'Item 2', 'Item 3'];

  constructor() { }

  getData(): string[] {
    return this.data;
  }

  addData(item: string): void {
    this.data.push(item);
  }
}
```

### 4. Dependency Injection (DI)

Dependency Injection is a design pattern used to deliver parts of an application (dependencies) to other parts that rely on them.
*   Angular's DI system allows you to declare the dependencies a class needs in its constructor.
*   Angular then provides instances of these dependencies automatically, making your code more modular, testable, and maintainable.
*   Services are typically registered as "providers" in modules or components, telling Angular how to create and provide instances.

**Example DI in a Component:**

```typescript
// src/app/my-component/my-component.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service'; // Import the service

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.css']
})
export class MyComponentComponent implements OnInit {
  items: string[] = [];

  // DataService is injected into the component's constructor
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.items = this.dataService.getData();
  }
}
```

### 5. Change Detection

Angular's change detection mechanism is responsible for updating the DOM to reflect changes in the application's data.
*   Whenever data bound to a view changes (e.g., through user interaction, `setTimeout`, `XHR` requests), Angular automatically detects these changes.
*   It then re-renders the affected parts of the DOM to synchronize the view with the updated model.
*   By default, Angular uses a sophisticated zone-based mechanism (`zone.js`) to automatically detect when asynchronous operations complete and trigger change detection.

## Angular CLI (Command Line Interface)

The Angular CLI is a powerful tool used to initialize, develop, scaffold, and maintain Angular applications directly from a command shell. It significantly boosts developer productivity.

### Installation

Ensure you have Node.js (LTS version recommended) installed. Then, install the CLI globally:

```bash
npm install -g @angular/cli
```

### Key CLI Commands

1.  **`ng new <project-name>`**:
    *   Creates a new Angular workspace and an initial application.
    *   **Example:** `ng new my-angular-app` (prompts for routing and stylesheet format).

2.  **`ng generate <schematic> <name>` (or `ng g`)**:
    *   Generates and/or modifies files based on a schematic (e.g., component, service, module, pipe, directive).
    *   **Examples:**
        *   `ng generate component my-new-component` (or `ng g c my-new-component`)
        *   `ng generate service user` (or `ng g s user`)
        *   `ng generate module admin --route admin --module app` (creates a lazy-loaded `AdminModule`)

3.  **`ng serve`**:
    *   Builds the application and serves it locally (usually on `http://localhost:4200`).
    *   It automatically watches for changes and reloads the browser (`live-reload`).
    *   **Example:** `ng serve --open` (builds, serves, and opens the app in your default browser).

4.  **`ng build`**:
    *   Compiles an Angular application into an output directory (by default, `dist/`).
    *   This output is suitable for deployment to a web server.
    *   **Example:** `ng build --configuration production` (generates an optimized, production-ready build).

5.  **`ng test`**:
    *   Runs unit tests using Karma.
    *   **Example:** `ng test`

6.  **`ng lint`**:
    *   Runs linting tools (e.g., ESLint) on your code.
    *   **Example:** `ng lint`

### Configuration (`angular.json`)

The `angular.json` file at the root of your workspace is the configuration file for the Angular CLI. It defines:
*   Project-specific settings (e.g., source root, assets, styles, scripts).
*   Build configurations (`architect` section for `build`, `serve`, `test` options).
*   Schematic defaults for `ng generate`.

**Example snippet from `angular.json`:**

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "my-angular-app": {
      "projectType": "application",
      "schematics": {},
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/my-angular-app",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": [
              "zone.js"
            ],
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.css"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "browserTarget": "my-angular-app:build:production"
            },
            "development": {
              "browserTarget": "my-angular-app:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {},
        "test": {}
      }
    }
  }
}
```

---

## Quick Checklist / Exercise

1.  **Identify the Core:** What are the five main architectural concepts (building blocks and mechanisms) that form the foundation of an Angular application? Briefly explain each in your own words.
2.  **CLI Power:** You need to start a brand new Angular project, generate a new component named `dashboard`, and then run the application locally for development. List the exact Angular CLI commands you would use, in order.
3.  **Service Integration:** If you have a `UserService` that fetches user data, describe how you would typically make it available to and use it within an `AppComponent` using Angular's Dependency Injection.