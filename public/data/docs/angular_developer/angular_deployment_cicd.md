# Deployment & CI/CD for Angular Applications

## Introduction

Deploying an Angular application involves making your build accessible to users on the internet. Continuous Integration (CI) and Continuous Deployment (CD) automate this process, ensuring that your application is consistently tested and deployed with every code change, leading to faster release cycles and fewer manual errors.

## 1. Building for Production

Before deploying, your Angular application must be built for production. This process optimizes the application for performance and size.

```bash
ng build --configuration production
# Shorthand for Angular versions < 9:
# ng build --prod
```

This command performs several optimizations:
*   **Ahead-of-Time (AOT) Compilation**: Compiles your Angular HTML and TypeScript into JavaScript during the build process, leading to faster rendering.
*   **Tree Shaking**: Removes unused code from your application bundle.
*   **Minification**: Reduces the size of your JavaScript, CSS, and HTML files.
*   **Bundling**: Combines multiple files into single files to reduce HTTP requests.
*   **Dead Code Elimination**: Removes code that is unreachable or has no effect.

The output of this build is a `dist/<your-app-name>` folder containing static assets (HTML, CSS, JavaScript, images) ready to be served by any static file host.

## 2. Hosting Platforms for Angular Applications

Angular applications, once built, are essentially static websites and can be hosted on a variety of platforms.

*   **Netlify**: Offers free, blazing-fast hosting for static sites with a seamless integration for Git repositories. Automatic deployments on every push to your main branch.
*   **Vercel**: Similar to Netlify, Vercel provides a platform for static sites and serverless functions, known for its developer experience and integration with Next.js (but also great for Angular).
*   **Firebase Hosting**: Google's hosting solution provides fast and secure static hosting with a global CDN. It integrates well with other Firebase services.
    ```bash
    npm install -g firebase-tools
    firebase login
    firebase init hosting # Follow prompts, select your dist folder
    firebase deploy
    ```
*   **AWS S3 & CloudFront**: Amazon S3 can store your static assets, and CloudFront (CDN) can deliver them globally with low latency. This is a highly scalable and cost-effective solution.
*   **Azure Static Web Apps**: Microsoft Azure's offering for static sites, providing a streamlined developer experience with integrated CI/CD, global distribution, and API support.

## 3. Continuous Integration (CI)

CI is a development practice where developers frequently merge their code changes into a central repository. Automated builds and tests are then run. The primary goals are to find and address integration bugs quicker, improve software quality, and reduce the time it takes to validate and release new software updates.

**Key steps in Angular CI:**
*   **Code Linting**: Enforce coding standards (`ng lint`).
*   **Unit Testing**: Run tests for individual components, services (`ng test`).
*   **End-to-End Testing**: Run tests that simulate user interaction (`ng e2e`).
*   **Build Application**: Create a production-ready build (`ng build --configuration production`).

## 4. Continuous Deployment (CD)

CD extends CI by automatically deploying all code changes that pass the automated tests to a production environment. This means every successful build can be released to users without manual intervention, assuming all CI checks pass.

## 5. CI/CD Tools for Angular

*   **GitHub Actions**: A flexible CI/CD platform directly integrated into GitHub. Workflows are defined using YAML files (`.github/workflows/*.yml`).
*   **GitLab CI/CD**: Built-in CI/CD for GitLab repositories. Workflows are defined in `.gitlab-ci.yml`.
*   **Jenkins**: An open-source automation server that can orchestrate a wide range of tasks, including building, testing, and deploying. It's highly configurable but requires more setup and maintenance.

### Example: Basic GitHub Actions Workflow for Angular Build

This `.github/workflows/angular-ci.yml` file demonstrates a simple workflow to build an Angular application and run unit tests on every push.

```yaml
name: Angular CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --no-watch --no-progress --browsers=ChromeHeadlessCI

      - name: Build Angular app for production
        run: npm run build -- --configuration production --base-href=/

      - name: Upload production build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: angular-build
          path: dist/<YOUR_APP_NAME_HERE>/
```

*To extend this to CD*, you would add another job or steps that utilize a deployment action (e.g., `netlify/actions/cli@v2` for Netlify, `FirebaseExtended/action-hosting-deploy@v0` for Firebase, or AWS S3 sync commands) after the `build-angular-app` step, conditional on the build and tests passing.

## Checklist / Exercise

1.  **Build and Inspect**: Create a new Angular project, run `ng build --configuration production`, and inspect the contents of the `dist/` folder. Identify the main `index.html` and the bundled JavaScript files.
2.  **Firebase Hosting Deployment**: Deploy a simple Angular application to Firebase Hosting. Familiarize yourself with `firebase init` and `firebase deploy` commands.
3.  **CI/CD Workflow Sketch**: Outline the steps you would include in a GitHub Actions workflow to automatically build, test, and deploy your Angular application to a hosting platform like Vercel or Netlify upon every push to the `main` branch.