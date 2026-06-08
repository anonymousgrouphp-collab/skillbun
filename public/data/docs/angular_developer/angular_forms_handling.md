# Forms & User Input in Angular

Angular provides powerful and flexible ways to handle user input through forms. Mastering Angular forms is crucial for building interactive enterprise web applications, allowing you to collect, validate, and process data efficiently. Angular offers two distinct approaches: Template-driven Forms and Reactive Forms.

## 1. Understanding Angular Forms

Angular forms help manage user input, track input values, validate them, and display error messages. They provide a structured way to interact with user-submitted data.

### 1.1. Template-driven Forms (FormsModule)

Template-driven forms are easy to use for simple forms and are built primarily with directives in your template. They rely heavily on two-way data binding (`ngModel`) and automatically track form and control states.

*   **Declarative:** Most of the logic resides in the template.
*   **Simpler for Basic Forms:** Quick to set up for straightforward use cases.
*   **`FormsModule`:** Must be imported into your `AppModule` or feature module.
*   **`ngModel`:** Binds a control to a property in your component class.

**Example (Template-driven Form):**

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule // Add FormsModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <label for="username">Username:</label>
  <input type="text" id="username" name="username" [(ngModel)]="user.username" required #usernameField="ngModel">
  <div *ngIf="usernameField.invalid && usernameField.touched">
    <p *ngIf="usernameField.errors?.['required']">Username is required.</p>
  </div>

  <button type="submit" [disabled reluctance to implement something that has never been implemented before. A company may not have the resources or expertise to develop a new product, or it may be unwilling to take the financial risk associated with a new venture.

## 3. Validation Techniques

Angular provides robust validation capabilities to ensure data integrity. These can be applied to both template-driven (via directives) and reactive forms (via `Validators` functions).

### 3.1. Built-in Validators

Angular provides a set of common validators in the `@angular/forms` module, typically used with `Validators` class for reactive forms.

*   `Validators.required`: Ensures the control has a non-empty value.
*   `Validators.email`: Checks for a valid email format.
*   `Validators.minLength(num)`: Requires a minimum length.
*   `Validators.maxLength(num)`: Requires a maximum length.
*   `Validators.pattern(regex)`: Requires the value to match a regular expression.

### 3.2. Custom Validators

When built-in validators aren't enough, you can create your own custom validator functions. A custom validator is a function that takes a `FormControl` (or `AbstractControl`) and returns a validation error object if the control's value is invalid, or `null` if it's valid.

**Example (Custom Validator):**

```typescript
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { 'forbiddenName': { value: control.value } } : null;
  };
}

// Usage in a FormControl:
// new FormControl('', [Validators.required, forbiddenNameValidator(/bob/i)])
```

### 3.3. Asynchronous Validators

Asynchronous validators are used for validation that requires some time to complete, such as making an HTTP request to a server to check if a username is already taken. They return a `Promise<ValidationErrors | null>` or an `Observable<ValidationErrors | null>`.

**Example (Async Validator Structure):**

```typescript
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export function uniqueUsernameValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    // Simulate an HTTP call
    if (!control.value) {
      return of(null); // Don't validate if empty
    }
    return of(control.value).pipe(
      delay(500), // Simulate network delay
      map(value => {
        const existingUsernames = ['admin', 'skillbun'];
        return existingUsernames.includes(value) ? { 'uniqueUsername': true } : null;
      })
    );
  };
}

// Usage in a FormControl:
// new FormControl('', { asyncValidators: [uniqueUsernameValidator()] })
```

## Checklist / Exercise:

1.  **Scenario Analysis:** You need to build a user registration form with a dynamically growing list of contact phone numbers. Would you primarily use template-driven or reactive forms, and why? Which `FormGroup` building block would be most suitable for the phone numbers?
2.  **Implementation Challenge:** Create a reactive form with `username`, `email`, and `password` fields. Implement the following validation rules: `username` (required, min length 5), `email` (required, valid email format), `password` (required, custom validator that checks for at least one uppercase letter and one number).
3.  **Error Display:** For the form created in exercise 2, display appropriate error messages for each field (e.g., "Username is required.", "Password must contain at least one uppercase letter and one number.") when the user attempts to submit the form with invalid input or blurs an invalid field.
