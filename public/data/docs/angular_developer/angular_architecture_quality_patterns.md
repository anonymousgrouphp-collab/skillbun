# Angular Architecture, Code Quality & Best Practices

Building enterprise-grade Angular applications requires more than just knowing the framework's syntax; it demands a deep understanding of architecture, code quality, and best practices. Adopting these principles ensures your applications are scalable, maintainable, performant, and enjoyable to work with by a team.

## 1. Ensuring Code Quality: Linting and Formatting

Consistent code quality is paramount for collaboration and long-term maintainability.

### ESLint for Linting

**ESLint** is a powerful static analysis tool that identifies problematic patterns found in JavaScript/TypeScript code. It helps enforce coding standards, catch potential bugs early, and ensure consistency across a codebase.

*   **Purpose:** Enforce coding standards, detect errors, encourage best practices.
*   **Benefits:** Reduces bugs, improves readability, standardizes code style.

**Example: Basic `.eslintrc.json` snippet for Angular/TypeScript**
```json
{
  "root": true,
  "ignorePatterns": [
    "projects/**/*"
  ],
  "overrides": [
    {
      "files": [
        "*.ts"
      ],
      "parserOptions": {
        "project": [
          "tsconfig.json",
          "e2e/tsconfig.json"
        ],
        "createDefaultProgram": true
      },
      "extends": [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      "files": [
        "*.html"
      ],
      "extends": [
        "plugin:@angular-eslint/template/recommended"
      ],
      "rules": {}
    }
  ]
}
```

### Prettier for Formatting

**Prettier** is an opinionated code formatter that enforces a consistent style by parsing your code and re-printing it with its own rules. It works seamlessly with ESLint to handle stylistic issues, allowing ESLint to focus on code quality.

*   **Purpose:** Automate code formatting to ensure consistency.
*   **Benefits:** Eliminates style debates, speeds up development, improves readability.

**Example: `.prettierrc` configuration**
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

## 2. Effective Project Structuring

A well-organized project structure makes an application easier to understand, navigate, and scale.

### Feature Modules

**Feature modules** are NgModules dedicated to a particular feature or domain of your application. They help organize components, services, and routes related to that feature, promoting modularity and lazy loading.

*   **Benefits:** Improved organization, better maintainability, lazy loading capabilities, easier collaboration.
*   **When to use:** For distinct functional areas (e.g., `AuthModule`, `ProductsModule`, `AdminModule`).

### Core Module

The **Core Module** (often `CoreModule`) is a place for singleton services, components, and other providers that should only be instantiated once and used throughout the application. It is typically imported only by the root `AppModule`.

*   **Content:** Services that should be singletons (e.g., authentication service, logger service), global components (e.g., header, footer), guard services, interceptors.
*   **Purpose:** Prevents multiple instances of services, centralizes common application-wide logic.

### Shared Module

The **Shared Module** (often `SharedModule`) is for components, directives, and pipes that will be used in multiple feature modules. It should only *declare* and *export* these common UI elements and *never* provide services.

*   **Content:** Common UI components (e.g., custom button, modal), directives (e.g., `highlight`), pipes.
*   **Purpose:** Avoids code duplication, centralizes reusable UI elements.

### Standalone Components

Introduced in Angular 14, **Standalone Components** allow you to build Angular applications without NgModules. They simplify project structure by making components, directives, and pipes self-contained, directly importing their dependencies.

*   **Benefits:** Reduced boilerplate, simpler dependency management, easier lazy loading, improved tree-shaking.
*   **Impact:** Offers an alternative or complementary approach to module-based structuring, gradually becoming the default.

**Example: Project Structure Overview**
```
src/
├── app/
│   ├── core/                  // CoreModule, singleton services, global components
│   │   ├── auth/
│   │   ├── services/
│   │   └── core.module.ts
│   ├── shared/                // SharedModule, common UI components, directives, pipes
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   ├── features/
│   │   ├── auth/              // AuthModule, login/registration components, services
│   │   │   └── auth.module.ts
│   │   ├── products/          // ProductsModule, product listing, detail components
│   │   │   └── products.module.ts
│   │   └── ...
│   ├── app.component.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
└── environments/
└── assets/
```

## 3. Architectural Patterns: Smart/Dumb Components

The **Container/Presenter** pattern (also known as **Smart/Dumb components** or **Stateful/Stateless components**) separates concerns within your component hierarchy, making components more reusable, testable, and easier to manage.

### Smart (Container) Components

*   **Role:** Handle data fetching, state management, and application logic.
*   **Characteristics:**
    *   Aware of the application's state and services.
    *   Rarely have their own UI markup, primarily orchestrate child components.
    *   Pass data down to dumb components via `@Input()` and listen to events via `@Output()`.
    *   Often connected to a store (e.g., NgRx) or services.

### Dumb (Presenter) Components

*   **Role:** Focus solely on rendering UI based on inputs and emitting events for user interactions.
*   **Characteristics:**
    *   Unaware of the application's state or how data is fetched.
    *   Receive all data via `@Input()`.
    *   Communicate user actions back to smart components via `@Output()`.
    *   Highly reusable and easily testable in isolation.
    *   Pure functions of their inputs.

**Benefits:**
*   **Separation of Concerns:** Clear responsibilities for each component type.
*   **Reusability:** Dumb components can be reused across different parts of the application or even different projects.
*   **Testability:** Dumb components are easier to test as they depend only on their inputs and outputs.
*   **Maintainability:** Changes in data logic don't necessarily affect UI logic and vice-versa.

## 4. Design Principles for Scalable Applications

Adhering to fundamental design principles fosters robust and adaptable Angular applications.

### SOLID Principles

A set of five design principles intended to make software designs more understandable, flexible, and maintainable.

1.  **Single Responsibility Principle (SRP):** A class or module should have only one reason to change.
    *   *Angular Context:* A component should ideally handle one specific UI concern (e.g., `ProductListComponent` displays products, not also responsible for filtering data). A service should handle one specific domain concern (e.g., `AuthService` handles authentication, not also user profile management).
2.  **Open/Closed Principle (OCP):** Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification.
    *   *Angular Context:* Use interfaces, abstract classes, and inheritance. Instead of modifying an existing service to add new functionality, extend it or create a new service that uses the existing one.
3.  **Liskov Substitution Principle (LSP):** Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.
    *   *Angular Context:* If you have a base class for a component or service, any derived class should be usable in its place without breaking the application.
4.  **Interface Segregation Principle (ISP):** Clients should not be forced to depend on interfaces they do not use.
    *   *Angular Context:* Avoid "fat" interfaces. If a service provides many unrelated methods, split it into smaller, more focused interfaces. This reduces coupling.
5.  **Dependency Inversion Principle (DIP):**
    *   a) High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces).
    *   b) Abstractions should not depend on details. Details (concrete implementations) should depend on abstractions.
    *   *Angular Context:* This is heavily supported by Angular's Dependency Injection. Services (high-level modules) should depend on abstract tokens or interfaces (abstractions) rather than concrete implementations (low-level modules).

### DRY (Don't Repeat Yourself)

*   **Principle:** Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.
*   *Angular Context:*
    *   Use shared components, directives, and pipes for common UI elements.
    *   Create reusable services for common business logic.
    *   Centralize configurations and constants.
    *   Avoid copy-pasting code.

### KISS (Keep It Simple, Stupid)

*   **Principle:** Most systems work best if they are kept simple rather than made complicated; therefore, simplicity should be a key goal in design, and unnecessary complexity should be avoided.
*   *Angular Context:*
    *   Write clear, concise code.
    *   Avoid over-engineering. Start with a simpler solution and refactor if complexity arises.
    *   Keep components focused and small.
    *   Prefer built-in Angular features over custom solutions when appropriate.

## Quick Checklist/Exercise

1.  **Code Quality:** Describe one key difference in purpose between ESLint and Prettier.
2.  **Project Structure:** You have a custom `ButtonComponent` that needs to be used in `AuthModule` and `ProductsModule`. Which specific module (`CoreModule`, `SharedModule`, or a feature module) should declare and export this `ButtonComponent`?
3.  **Architectural Patterns:** Explain why a "dumb" component is easier to test in isolation compared to a "smart" component.