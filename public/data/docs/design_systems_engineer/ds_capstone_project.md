# Capstone Project: Building a Production-Ready Design System: Study Guide

The capstone project is the culmination of your DSE training. It represents a fully documented, tested, and published React/CSS component library that follows industry-standard design ops practices.

## 1. Key Concepts

### Concept 1: Production Token System
Create a design token architecture with global aliases and semantic tokens, processed by Style Dictionary into CSS custom properties, JS constants, and TypeScript types.

### Concept 2: Accessible Components in isolation
Build at least 5 core UI components (Button, Modal, Input, Toast, Accordion) in React/TypeScript, fully matching WCAG AA accessibility standards, documented interactively in Storybook.

### Concept 3: CI/CD & Publishing Automated Pipeline
Configure automated workflows for linting, unit tests, Chromatic visual regression testing, and semantic package versioning/publishing to NPM.

## 2. Practical Example

### Sample GitHub Actions Workflow for Chromatic Visual Regression
```javascript
name: "Chromatic Visual Testing"
on: push

jobs:
  chromatic-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Install Dependencies
        run: npm ci
      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

## 3. Quick Check-Up

1. Why is pixel-perfect visual regression testing critical for component updates?
2. Explain the differences between global tokens and semantic tokens in design systems.
3. How do you enforce WCAG keyboard-accessibility patterns in custom modal components?
