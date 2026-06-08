## Performance, Optimization & Change Detection in Angular

Optimizing Angular applications is crucial for delivering a smooth and responsive user experience, especially in enterprise-grade applications. This guide covers key strategies and tools to enhance your application's performance.

### 1. Change Detection Strategies (OnPush)

Angular's change detection mechanism automatically updates the DOM when component data changes. By default, it's quite powerful but can be inefficient for large applications as it checks all components in a tree. The `OnPush` strategy offers a significant performance boost.

*   **Default Strategy:** Angular checks all components from top to bottom whenever an event occurs (e.g., user interaction, HTTP response, timer event).
*   **OnPush Strategy:** With `ChangeDetectionStrategy.OnPush`, Angular only runs change detection for a component (and its sub-components) if:
    *   Its `@Input()` reference changes (for objects, it must be a *new* object reference, not just a mutated property). Immutable data patterns are highly recommended.
    *   An event originated from the component itself or one of its children.
    *   An observable in the template using the `async` pipe emits a new value.
    *   `ChangeDetectorRef.detectChanges()` or `ChangeDetectorRef.markForCheck()` is explicitly called.

**Example: Using `OnPush`**

```typescript
import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-item',
  template: `
    <div class="item">
      <h4>{{item.name}}</h4>
      <p>Price: {{item.price | currency}}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnChanges {
  @Input() item: { id: number; name: string; price: number };

  ngOnChanges(changes: SimpleChanges): void {
    // This will only log if the 'item' *reference* changes
    if (changes['item']) {
      console.log('Item input changed:', changes['item'].currentValue);
    }
  }
}

// To trigger change detection in parent:
// this.items = [...this.items, newItem]; // new array reference
// this.currentItem = { ...this.currentItem, price: 120 }; // new object reference
```

### 2. Lazy Loading Modules and Routes

Lazy loading allows you to load parts of your application only when they are needed, rather than loading everything upfront. This significantly reduces the initial bundle size, leading to faster application startup times.

*   **Concept:** Instead of bundling all modules into a single JavaScript file, Angular creates separate bundles for lazy-loaded modules.
*   **Implementation:** Configure your Angular router to load modules asynchronously using `loadChildren`.

**Example: Lazy-loaded Route Configuration**

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) // Lazy-loaded
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) // Lazy-loaded
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 3. Ahead-of-Time (AOT) Compilation

AOT compilation converts your Angular HTML and TypeScript code into efficient JavaScript code during the build process, before the browser even loads the application.

*   **Benefits:**
    *   **Faster Rendering:** The browser downloads a pre-compiled version of the application, eliminating the compilation step at runtime.
    *   **Smaller Bundles:** The Angular compiler is not shipped to the client, reducing the bundle size.
    *   **Early Error Detection:** Template errors are caught during the build process, not at runtime.
    *   **Better Security:** No HTML/TypeScript evaluation at runtime reduces potential injection attacks.
*   **Usage:** For Angular CLI projects, AOT is enabled by default for production builds (`ng build --configuration=production` or `ng build --prod`).

### 4. Tree Shaking for Bundle Size Reduction

Tree shaking is a dead code elimination technique that removes unused code from your final JavaScript bundle. This is crucial for minimizing application size.

*   **How it works:** Modern JavaScript module bundlers (like Webpack, used by Angular CLI) analyze your code and identify exports that are never imported or used. These unused exports are then 