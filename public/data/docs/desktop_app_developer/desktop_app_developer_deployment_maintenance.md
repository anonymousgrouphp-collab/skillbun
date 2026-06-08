# Deployment, Distribution, and Maintenance: Study Guide

Publishing desktop apps requires compiling, packaging, code signing, and distributing installers through stores or auto-update networks.

## 1. Key Concepts

### Concept 1: Code Signing & Certificates
Signing application binaries using Apple Developer Certificates and Windows Authenticode to avoid OS security alerts (SmartScreen).

### Concept 2: App Store Publishing
Meeting sandbox guidelines and submission requirements for the Microsoft Store and Mac App Store.

### Concept 3: Cross-Platform Packaging
Building packages for various systems: MSI/EXE (Windows), DMG/PKG (macOS), DEB/RPM/AppImage (Linux).

## 2. Practical Example

### Deployment, Distribution, and Maintenance Example Setup
```javascript
Configuring electron-builder.json for automatic packaging and code signing configurations.
```

## 3. Quick Check-Up

1. Why is code signing mandatory for modern desktop applications?
2. What is macOS App Notarization and how does it fit into the release workflow?
3. Explain the differences between standard installers (MSI) and portable binaries (AppImage).
