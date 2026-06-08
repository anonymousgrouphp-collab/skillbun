# Go Packages, Modules, and Workspaces

Go's approach to code organization, dependency management, and multi-project development is centered around **packages**, **modules**, and **workspaces**. Understanding these core concepts is fundamental to writing maintainable, scalable, and collaborative Go applications.

## 1. Go Packages: The Building Blocks

A **package** in Go is a way to organize related Go source files. It's akin to libraries or namespaces in other languages. Every Go program must belong to a package.

*   **Purpose:** Encapsulation, reusability, and modularity.
*   **Package Declaration:** Every `.go` file must start with `package <name>`.
    *   `package main`: This declares an an executable program. The `main` package must contain a `main()` function, which is the entry point of the application.
    *   `package <name>` (e.g., `package utils`): These are utility packages intended to be imported and used by other packages.
*   **Import Paths:** To use functions or variables from another package, you must import it using its path.
    *   Standard library packages (e.g., `fmt`, `net/http`) are imported directly.
    *   Local or third-party packages are imported using their module path (e.g., `github.com/myuser/mymodule/mypackage`).
*   **Visibility (Exported vs. Unexported):**
    *   **Exported:** Identifiers (variables, functions, types) starting with an **uppercase** letter are exported and can be accessed from outside the package.
    *   **Unexported:** Identifiers starting with a **lowercase** letter are unexported and can only be accessed within the same package.

### Example: Custom Package and Import

Let's create a simple utility package and use it in our `main` program.

**File: `myproject/calculator/add.go`**
```go
package calculator

// Add returns the sum of two integers.
func Add(a, b int) int {
    return a + b
}

// subtract is an unexported function (only visible within 'calculator' package)
func subtract(a, b int) int {
    return a - b
}
```

**File: `myproject/main.go`**
```go
package main

import (
    