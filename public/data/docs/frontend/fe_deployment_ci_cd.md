# Deployment & Basic CI/CD

Welcome to the Deployment & Basic CI/CD module! This guide will equip you with the knowledge to take your frontend applications from local development to being live and accessible to users worldwide. We'll cover popular deployment platforms and introduce the fundamental concepts of Continuous Integration/Continuous Deployment (CI/CD) pipelines.

## 1. Frontend Application Deployment

Deployment is the process of making your application available for users to access. For frontend applications, this typically involves building your code into static assets (HTML, CSS, JavaScript) and serving them from a web server or a specialized platform.

### 1.1 Popular Deployment Platforms

These platforms simplify the deployment process, often integrating directly with your Git repository for seamless updates.

#### Netlify

Netlify is a powerful platform for deploying modern web projects. It offers a global CDN, automatic SSL, custom domains, serverless functions, and form handling, all optimized for performance and developer experience.

**Key Features:**
*   **Git-based deployments:** Connects directly to GitHub, GitLab, or Bitbucket.
*   **Global CDN:** Fast loading times for users worldwide.
*   **Automatic SSL:** HTTPS by default.
*   **Continuous Deployment:** Automatically redeploys on every `git push`.
*   **Preview Deployments:** Unique URLs for pull requests.

**How to Deploy with Netlify:**
1.  **Connect to Git:** Link your repository.
2.  **Build Settings:** Specify your build command (e.g., `npm run build` or `yarn build`) and publish directory (e.g., `build`, `dist`, `public`).
3.  **Deploy:** Netlify handles the rest, building and deploying your site.

**Example `netlify.toml` (Optional Configuration File):**
For more complex setups, you can define build settings, redirects, and headers in a `netlify.toml` file at the root of your project.

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel

Vercel is another leading platform for frontend developers, especially popular for applications built with Next.js, React, and other frameworks. It prioritizes speed, developer experience, and scalability.

**Key Features:**
*   **Seamless Git Integration:** Similar to Netlify, connects to popular Git providers.
*   **Automatic Optimizations:** Performance enhancements out-of-the-box.
*   **Serverless Functions:** Integrated serverless capabilities.
*   **Instant Deployments:** Rapid build and deployment times.
*   **Preview URLs:** For every push and pull request.

**How to Deploy with Vercel:**
1.  **Install Vercel CLI (optional but recommended):** `npm i -g vercel`
2.  **Connect to Git:** Via the Vercel dashboard or CLI.
3.  **Configure:** Vercel auto-detects most framework settings.
4.  **Deploy:** The platform builds and deploys your application.

**Example `vercel.json` (Optional Configuration File):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### GitHub Pages

GitHub Pages is a free service provided by GitHub to host static websites directly from a GitHub repository. It's ideal for personal portfolios, project documentation, or simple static sites.

**Key Features:**
*   **Free Hosting:** For static sites.
*   **Custom Domains:** Supports custom domain names.
*   **SSL Support:** HTTPS is enforced.
*   **Direct from Repo:** Serves content from a specific branch (`gh-pages` or `main/master`'s `docs` folder).

**How to Deploy with GitHub Pages:**
There are two primary ways:
1.  **Manual Branch:** Push your compiled static assets to a branch named `gh-pages` (or `main` with a `/docs` folder). GitHub will then serve content from that branch.
2.  **GitHub Actions (Recommended for Automation):** Use a GitHub Actions workflow to automate the build and deployment process whenever you push to your main branch.

## 2. Basic Continuous Integration/Continuous Deployment (CI/CD)

CI/CD is a methodology that aims to automate the various stages of application development, from building and testing to deployment.

### 2.1 What is CI/CD?

*   **Continuous Integration (CI):** Developers frequently merge their code changes into a central repository. Automated builds and tests are run to detect integration issues early. This prevents "integration hell."
*   **Continuous Deployment (CD):** After successful CI, changes are automatically deployed to production without manual intervention. This ensures that new features and bug fixes reach users quickly and reliably.

### 2.2 Why is CI/CD Important for Frontend?

*   **Faster Release Cycles:** Automate repetitive tasks, leading to quicker delivery of new features.
*   **Reduced Errors:** Automated tests catch bugs before they reach production.
*   **Improved Collaboration:** Teams can integrate changes more frequently with confidence.
*   **Consistent Deployments:** Ensures that every deployment follows the same, error-proof process.

### 2.3 Common CI/CD Pipeline Steps

A typical frontend CI/CD pipeline often includes:
1.  **Source Code Commit:** Developer pushes code to Git.
2.  **Build:** Install dependencies, compile TypeScript/Sass, bundle JavaScript (e.g., `npm run build`).
3.  **Test:** Run unit tests, integration tests, linting.
4.  **Deploy:** Publish the build artifacts to a hosting platform.

Platforms like Netlify and Vercel inherently provide a simplified CI/CD experience by connecting to your Git repository and automating these steps. For more custom or complex needs, tools like GitHub Actions, GitLab CI, or Jenkins can be used.

### Example: GitHub Actions for Deploying a React App to GitHub Pages

This workflow automates the build and deployment of a React application to GitHub Pages whenever code is pushed to the `main` branch.

```yaml
name: Deploy React App to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18' # Or your preferred Node.js version

      - name: Install dependencies
        run: npm ci # Use npm ci for clean installs in CI environments

      - name: Build React app
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build # Directory where your built app resides
```
*Note: Before using this, ensure your `package.json` has a `homepage` property pointing to your GitHub Pages URL (e.g., `"homepage": "https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>"` for project pages or `"homepage": "https://<YOUR_GITHUB_USERNAME>.github.io"` for user/org pages).* If you're using a create-react-app based project, you might also need to install `gh-pages` and add deploy scripts to your `package.json`.

## Quick Checklist/Exercise:

1.  **Experiment with a Platform:** Take a simple React or Vue project and deploy it to either Netlify or Vercel. Connect it to a GitHub repository and observe the automatic deployment upon pushing changes.
2.  **Understand Build Outputs:** For your deployed project, identify the `publish` or `output` directory that contains the final static assets. Inspect its contents (HTML, CSS, JS files).
3.  **Simulate CI/CD:** If using GitHub Pages, try implementing the provided GitHub Actions workflow to automate the deployment of a simple static site or a Create React App project. Push a change to your `main` branch and verify the updated site.