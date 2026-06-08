# Authentication & Authorization Strategies in Angular

Securing your Angular application is paramount in today's web landscape. This guide will take a deep dive into implementing robust authentication and authorization strategies, covering essential concepts, common patterns, and practical Angular-specific implementations.

## 1. Core Concepts: Authentication vs. Authorization

Before diving into implementation, it's crucial to understand the distinction:

*   **Authentication:** Verifying who a user is. This is the process of confirming a user's identity (e.g., by checking a username and password).
*   **Authorization:** Determining what an authenticated user is allowed to do. Once a user's identity is verified, authorization decides their access rights to specific resources or functionalities.

## 2. Common Authentication & Authorization Patterns

### 2.1. JWT (JSON Web Tokens)

JWTs are a popular open standard (RFC 7519) for securely transmitting information between parties as a JSON object. They are often used for authentication, especially in single-page applications (SPAs) like Angular.

*   **Structure:** A JWT consists of three parts separated by dots (`.`):
    1.  **Header:** Contains the token type (JWT) and the signing algorithm (e.g., HMAC SHA256 or RSA).
    2.  **Payload:** Contains the claims (statements about an entity, typically the user, and additional data).
    3.  **Signature:** Used to verify that the sender of the JWT is who it says it is and to ensure the message wasn't changed along the way.

*   **Flow:**
    1.  User sends credentials (username/password) to the backend.
    2.  Backend authenticates user and generates a JWT.
    3.  Backend sends the JWT back to the Angular client.
    4.  Angular client stores the JWT (e.g., in `localStorage` or `sessionStorage`).
    5.  For subsequent requests to protected routes/APIs, Angular attaches the JWT in the `Authorization` header (e.g., `Bearer <token>`).
    6.  Backend validates the JWT and authorizes the request.

### 2.2. OAuth 2.0 and OpenID Connect (OIDC)

*   **OAuth 2.0:** An authorization framework that enables an application to obtain limited access to a user's account on an HTTP service, such as Facebook or Google. It delegates user authentication to the service that hosts the user account and authorizes third-party applications to access that user account. It's about *authorization*, not authentication.
*   **OpenID Connect (OIDC):** An identity layer built on top of the OAuth 2.0 framework. It allows clients to verify the identity of the end-user based on the authentication performed by an authorization server, as well as to obtain basic profile information about the end-user in an interoperable and REST-like manner. OIDC provides *authentication* on top of OAuth 2.0's authorization.

These are commonly used when integrating with third-party Identity Providers (IdPs) like Auth0, Okta, Google Sign-In, etc.

## 3. Implementing Authentication & Authorization in Angular

### 3.1. Integrating with Identity Providers (IdPs)

Angular applications often offload the complexity of authentication to dedicated Identity Providers. This typically involves:

1.  **Redirecting:** Sending the user from your Angular app to the IdP's login page.
2.  **Authentication:** The user logs in securely with the IdP.
3.  **Callback:** The IdP redirects the user back to your Angular application with an authorization code or tokens (ID token, access token).
4.  **Token Exchange/Storage:** Your Angular app or a backend component exchanges the authorization code for tokens and stores them.

### 3.2. Token Management

Handling tokens effectively is critical for security and user experience.

*   **Storage:**
    *   `localStorage` / `sessionStorage`: Convenient for storing JWTs. Be aware of XSS (Cross-Site Scripting) vulnerabilities.
    *   HTTP-only Cookies: More secure against XSS, but can be susceptible to CSRF (Cross-Site Request Forgery) if not properly protected. Typically managed by a backend.
*   **Refresh Tokens:** To avoid long-lived access tokens (which increase the window of vulnerability), refresh tokens are used. When an access token expires, a refresh token (also obtained during login) can be sent to the backend to get a new access token without requiring the user to re-authenticate.

### 3.3. Route Guards for Authorization

Angular's route guards (`CanActivate`, `CanActivateChild`, `CanLoad`, `CanDeactivate`, `Resolve`) are powerful tools for protecting routes based on authentication and authorization status.

The `CanActivate` guard is commonly used to prevent unauthenticated or unauthorized users from accessing specific routes.

**Example: `AuthGuard`**

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Assume you have an AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticated()) { // isAuthenticated() checks for valid token
      return true;
    } else {
      // Redirect to login page or a "not authorized" page
      this.router.navigate(['/login']);
      return false;
    }
  }
}
```

**Usage in `app-routing.module.ts`:**

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // ... other routes
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 3.4. HTTP Interceptors for Secure API Communication

HTTP Interceptors allow you to intercept incoming and outgoing HTTP requests and responses. This is invaluable for:

*   **Attaching Tokens:** Automatically adding the authorization token to the `Authorization` header of all outgoing API requests.
*   **Error Handling:** Catching `401 Unauthorized` or `403 Forbidden` responses to redirect to login or show an error.
*   **Token Refresh:** Implementing logic to refresh an expired token and retry the original request.

**Example: `AuthInterceptor`**

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Assume you have an AuthService
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken(); // Method to get the stored token

    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Token expired or unauthorized. Logout user and redirect to login.
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
  }
}
```

**Registering the Interceptor in `app.module.ts`:**

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// ... other imports

import { AuthInterceptor } from './auth.interceptor'; // Import your interceptor

@NgModule({
  // ... declarations, imports
  providers: [
    // ... other services
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Essential for multiple interceptors
    }
  ],
  // ... bootstrap
})
export class AppModule { }
```

## 4. Security Best Practices

*   **Never store sensitive information (like tokens) directly in your source code.**
*   **Use HTTPS:** Always serve your application over HTTPS to prevent man-in-the-middle attacks.
*   **Validate Tokens Server-Side:** Always validate JWTs on the backend, checking signature, expiry, and claims.
*   **Avoid XSS and CSRF:** Be mindful of where and how you store tokens. Consider using HttpOnly cookies for refresh tokens.
*   **Implement Token Refresh:** For better security and UX.
*   **Least Privilege:** Users should only have access to what they absolutely need.

## 5. Checklist / Exercise

1.  **Explain the difference between `CanActivate` and `CanLoad` route guards.** When would you use each?
2.  **Describe how an HTTP Interceptor can help manage JWTs in an Angular application.**
3.  **Why is it generally considered bad practice to store long-lived access tokens directly in `localStorage` without a refresh mechanism?**