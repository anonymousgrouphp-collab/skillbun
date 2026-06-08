# Routing & Navigation in Angular

Angular's Router is a powerful module that enables client-side navigation between different components within your application. It allows you to build Single Page Applications (SPAs) that feel like multi-page applications, providing a seamless user experience without full page reloads.

## 1. Understanding Angular's RouterModule

The `RouterModule` is the core of Angular's routing capabilities. It provides the necessary directives and services to define routes, navigate, and handle route-related events.

### Defining Routes

Routes are defined as an array of `Route` objects, typically in a dedicated routing module (e.g., `app-routing.module.ts`). Each `Route` object maps a URL path to a component.

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent }, // Route with parameter
  { path: '**', component: PageNotFoundComponent } // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Use forRoot for the root module
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

*   **`path`**: The URL path. An empty string `''` represents the default route. `**` is a wildcard path for any unmatched URL, useful for a 404 page.
*   **`component`**: The Angular component to display when the path matches.
*   **`forRoot()` vs `forChild()`**:
    *   `RouterModule.forRoot(routes)`: Used in the root `AppRoutingModule`. It registers global router providers and directives.
    *   `RouterModule.forChild(routes)`: Used in feature modules to register additional routes specific to that module without re-registering global providers.

## 2. Programmatic Navigation

While `routerLink` directive handles navigation from templates, the `Router` service allows you to navigate programmatically from your component logic.

```typescript
import { Router } from '@angular/router';

@Component({ /* ... */ })
export class MyComponent {
  constructor(private router: Router) { }

  goToProducts(): void {
    this.router.navigate(['/products']); // Navigates to /products
  }

  goToProductDetail(id: number): void {
    this.router.navigate(['/products', id]); // Navigates to /products/123
  }

  goToProductsWithQuery(): void {
    this.router.navigate(['/products'], { queryParams: { category: 'electronics' } }); // Navigates to /products?category=electronics
  }
}
```

*   **`router.navigate(['/path', param1, ...])`**: Takes an array of path segments. Relative paths are possible.
*   **`router.navigateByUrl('/full/url')`**: Takes a full URL string.

## 3. Passing Route Parameters

Angular supports two types of route parameters: path parameters and query parameters.

### Path Parameters

Defined in the route configuration with a colon (e.g., `products/:id`). Accessed via the `ActivatedRoute` service.

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({ /* ... */ })
export class ProductDetailComponent implements OnInit {
  productId: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Snapshot approach (for initial load)
    this.productId = this.route.snapshot.paramMap.get('id');

    // Observable approach (for reacting to changes in the same component instance)
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      // Fetch product data based on this.productId
    });
  }
}
```

### Query Parameters

Appended to the URL after a question mark (e.g., `/products?category=electronics`). Also accessed via `ActivatedRoute`.

```typescript
// Inside a component
this.route.queryParamMap.subscribe(params => {
  const category = params.get('category'); // 'electronics'
  const sort = params.get('sort'); // null if not present
});
```

## 4. Route Guards

Route guards are interfaces that can be implemented to control access to routes based on certain conditions.

*   **`CanActivate`**: Decides if a route can be activated. Useful for authorization (e.g., only logged-in users can access admin pages).
    ```typescript
    // auth.guard.ts
    import { Injectable } from '@angular/core';
    import { CanActivate, Router, UrlTree } from '@angular/router';
    import { Observable } from 'rxjs';
    import { AuthService } from './auth.service'; // Assume this service exists

    @Injectable({ providedIn: 'root' })
    export class AuthGuard implements CanActivate {
      constructor(private authService: AuthService, private router: Router) {}

      canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this.authService.isLoggedIn()) {
          return true;
        }
        return this.router.createUrlTree(['/login']); // Redirect to login
      }
    }

    // In routes configuration
    const routes: Routes = [
      { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] }
    ];
    ```
*   **`CanDeactivate`**: Decides if a route can be deactivated. Useful for preventing users from leaving a page with unsaved changes.
*   **`Resolve`**: Pre-fetches data before the route is activated. This ensures that the component has all necessary data immediately upon creation, preventing "flickering" or loading spinners.
    ```typescript
    // user.resolver.ts
    import { Injectable } from '@angular/core';
    import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
    import { Observable } from 'rxjs';
    import { UserService, User } from './user.service';

    @Injectable({ providedIn: 'root' })
    export class UserResolver implements Resolve<User> {
      constructor(private userService: UserService) {}

      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        return this.userService.getUser(route.paramMap.get('id')!);
      }
    }

    // In routes configuration
    const routes: Routes = [
      { path: 'users/:id', component: UserDetailComponent, resolve: { userData: UserResolver } }
    ];
    ```
    In `UserDetailComponent`, you access the resolved data via `this.route.data.subscribe(data => this.user = data.userData);`.

## 5. Lazy Loading Feature Modules

Lazy loading is a performance optimization technique where Angular loads feature modules only when they are needed (i.e., when a user navigates to their routes). This significantly reduces the initial bundle size and improves application startup time.

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: '**', component: PageNotFoundComponent }
];
```

*   **`loadChildren`**: Instead of `component`, you use `loadChildren` and a dynamic `import()` statement to load the module. Angular automatically splits this module into a separate JavaScript bundle.

---

### Quick Check / Exercise:

1.  Explain the primary difference between `RouterModule.forRoot()` and `RouterModule.forChild()`. When would you use each?
2.  Imagine you have a `ProductEditComponent` where users can make changes. Which route guard would you use to warn users before they accidentally navigate away with unsaved changes, and why?
3.  How would you configure a route to display a `DashboardComponent` when the URL is `/dashboard` and also ensure that the `DashboardComponent` receives a `userId` from the URL path (e.g., `/dashboard/123`)? How would the `DashboardComponent` access this `userId`?