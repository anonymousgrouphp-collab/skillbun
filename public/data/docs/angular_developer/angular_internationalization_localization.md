# Internationalization (i18n) & Localization in Angular

## Introduction

In today's globalized world, building web applications that cater to a diverse audience speaking different languages is crucial. **Internationalization (i18n)** is the process of designing and developing an application in a way that makes it adaptable to various languages and regions without requiring engineering changes. **Localization (L10n)** is the process of adapting an internationalized application for a specific locale (e.g., language, region, culture), which includes translating text, formatting dates and numbers, and adjusting for cultural nuances.

Angular provides robust, built-in tooling and features to streamline the i18n and L10n process, enabling developers to create truly global applications.

## Angular's i18n Tooling: Core Concepts

Angular's i18n system focuses on providing tools to mark text for translation, extract messages, and serve localized versions of your application.

### 1. Marking Text for Translation

You mark elements in your Angular templates for translation using the `i18n` attribute. This attribute tells Angular's i18n tooling that the content of this element needs to be translated.

```html
<h1 i18n="@@welcomeMessage">Welcome to our application!</h1>
<p i18n>This paragraph will also be translated.</p>
<button i18n="loginButton@@loginAction">Login</button>
```

*   The `i18n` attribute can optionally include a `description` (for translators) and a custom `@@ID`. The custom ID (`@@welcomeMessage`) provides a stable identifier for the translation unit, which is crucial if the original text changes, preventing translators from having to re-translate messages unnecessarily.

### 2. Extracting Translation Files

After marking text in your templates, you use the Angular CLI to extract these messages into a source translation file. The most common formats are XLIFF (XML Localization Interchange File Format) or XMB (XML Message Bundle).

```bash
ng extract-i18n --output-path src/locale --format xlf
```

This command generates a file (e.g., `src/locale/messages.xlf`) containing all marked texts from your templates and component code, ready for translators.

### 3. Translating and Merging

Translators then take the generated `messages.xlf` file and translate its contents into target languages. For each target language (e.g., French, Spanish), a new translation file is created (e.g., `messages.fr.xlf`, `messages.es.xlf`). These files contain the translated text corresponding to the original source messages.

### 4. Serving Localized Versions

To serve a localized version of your application, you need to build it for a specific locale. Angular's CLI simplifies this by allowing you to configure locales in your `angular.json` file and then build/serve localized versions.

**In `angular.json`:**

```json
{
  "projects": {
    "my-app": {
      "i18n": {
        "sourceLocale": "en-US",
        "locales": {
          "fr": {
            "translation": "src/locale/messages.fr.xlf",
            "baseHref": "/fr/"
          },
          "es": {
            "translation": "src/locale/messages.es.xlf",
            "baseHref": "/es/"
          }
        }
      },
      "architect": {
        "build": {
          "configurations": {
            "production": { /* ... */ },
            "fr": {
              "localize": ["fr"]
            },
            "es": {
              "localize": ["es"]
            }
          }
        },
        "serve": {
          "configurations": {
            "fr": {
              "browserTarget": "my-app:build:fr"
            },
            "es": {
              "browserTarget": "my-app:build:es"
            }
          }
        }
      }
    }
  }
}
```

With this configuration, you can build and serve specific locales:

```bash
# Build for French
ng build --configuration=fr

# Serve for French (during development)
ng serve --configuration=fr --open
```

Angular will build a separate, optimized version of your application for each specified locale, embedding the respective translations. The `baseHref` ensures correct routing if you deploy different locales to subdirectories.

## Advanced Localization Features

### Pluralization (`i18n-plural`)

Handling plural forms correctly across different languages is crucial, as plural rules vary significantly. Angular's `i18n-plural` attribute provides a way to define messages based on a numeric value.

```html
<p i18n-plural="{ '0': 'No items', '1': 'One item', 'other': '{{value}} items' }">
  There are {{itemCount}} items in your cart.
</p>
```

The `itemCount` variable's value determines which translation rule (`'0'`, `'1'`, `'other'`) is applied.

### Gender and Selection (`i18n-select`)

For messages that change based on a selection (like gender or status), use the `i18n-select` attribute.

```html
<p i18n-select="{ 'male': 'He is logged in.', 'female': 'She is logged in.', 'other': 'They are logged in.' }">
  Logged in user: {{gender}}
</p>
```

### Date, Currency, and Number Formatting

Angular's built-in pipes (`DatePipe`, `CurrencyPipe`, `DecimalPipe`, `PercentPipe`) automatically adapt to the `LOCALE_ID` set for your application. When you build your app for a specific locale using `localize`, Angular automatically sets the `LOCALE_ID` and registers the necessary locale data, so no special `i18n` attribute is needed here.

**Example:**

```html
<p>Current Date: {{ today | date:'fullDate' }}</p>
<p>Product Price: {{ price | currency:'USD':'symbol':'1.2-2' }}</p>
<p>Progress: {{ progress | percent }}</p>
```

These pipes will display the date, currency, and percentage formatted according to the conventions of the active locale (e.g., `July 17, 2024` for `en-US` vs. `17 juillet 2024` for `fr`).

### Right-to-Left (RTL) Layouts

For languages like Arabic or Hebrew, the text direction is right-to-left. While Angular's i18n doesn't directly manage CSS for RTL, it facilitates building different versions. You'll need to:

1.  **Add `dir="rtl"`:** Conditionally add `dir="rtl"` to your `<body>` or root HTML element for RTL locales. This can be done dynamically or via build-time modifications to `index.html`.
2.  **CSS Adjustments:** Use CSS frameworks that support RTL or write specific RTL CSS rules. Consider using modern CSS logical properties (e.g., `margin-inline-start` instead of `margin-left`) for easier adaptation across LTR and RTL layouts.

## Simple Code Example: "Hello World" in Multiple Languages

Let's walk through a minimal setup to demonstrate Angular i18n.

1.  **Create a new Angular app:**
    ```bash
    ng new my-i18n-app --defaults
    cd my-i18n-app
    ```

2.  **Mark text in `src/app/app.component.html`:**
    ```html
    <div style="text-align:center; margin-top: 20px;">
      <h1 i18n="@@appTitle">Welcome to My Internationalized App!</h1>
      <p i18n>This is a demonstration of Angular's i18n features.</p>
      <p i18n="@@todayDate">Today's date: {{ today | date:'fullDate' }}</p>
    </div>
    ```

3.  **Add `today` property to `src/app/app.component.ts`:**
    ```typescript
    import { Component } from '@angular/core';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
      title = 'my-i18n-app';
      today = new Date(); // Added for date formatting example
    }
    ```

4.  **Configure `angular.json` for locales (e.g., `es`, `fr`):**
    Locate the `projects.my-i18n-app` object. Add the `i18n` block and `configurations` for `es` and `fr` under both `build` and `serve` architects. 
    
    *A simplified snippet showing relevant parts:* 

    ```json
    {
      "projects": {
        "my-i18n-app": {
          "i18n": {
            "sourceLocale": "en-US",
            "locales": {
              "es": {
                "translation": "src/locale/messages.es.xlf",
                "baseHref": "/es/"
              },
              "fr": {
                "translation": "src/locale/messages.fr.xlf",
                "baseHref": "/fr/"
              }
            }
          },
          "architect": {
            "build": {
              "configurations": {
                "production": { /* ... */ },
                "es": {
                  "localize": ["es"]
                },
                "fr": {
                  "localize": ["fr"]
                }
              }
            },
            "serve": {
              "configurations": {
                "es": {
                  "browserTarget": "my-i18n-app:build:es"
                },
                "fr": {
                  "browserTarget": "my-i18n-app:build:fr"
                }
              }
            }
            // ... other architects like "extract-i18n", "test"
          }
        }
      }
    }
    ```

5.  **Extract messages:**
    ```bash
    ng extract-i18n --output-path src/locale --format xlf
    ```
    This creates `src/locale/messages.xlf` with the marked strings.

6.  **Create translation files:**
    Copy `messages.xlf` to `src/locale/messages.es.xlf` and `src/locale/messages.fr.xlf`.

    *Edit `src/locale/messages.es.xlf` (Spanish translations):*
    ```xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
      <file source-language="en-US" datatype="plaintext" original="ng2.template">
        <body>
          <trans-unit id="appTitle" datatype="html">
            <source>Welcome to My Internationalized App!</source>
            <target>¡Bienvenido a Mi Aplicación Internacionalizada!</target>
            <note priority="1" from="description">@@appTitle</note>
          </trans-unit>
          <trans-unit id="8868832049970347854" datatype="html">
            <source>This is a demonstration of Angular&apos;s i18n features.</source>
            <target>Esta es una demostración de las características i18n de Angular.</target>
            <note priority="1" from="description">Description of this paragraph for translators</note>
          </trans-unit>
          <trans-unit id="todayDate" datatype="html">
            <source>Today&apos;s date: <x id="INTERPOLATION" equiv-text="{{ today | date:'fullDate' }}"/></source>
            <target>Fecha de hoy: <x id="INTERPOLATION" equiv-text="{{ today | date:'fullDate' }}"/></target>
            <note priority="1" from="description">@@todayDate</note>
          </trans-unit>
        </body>
      </file>
    </xliff>
    ```

    *Edit `src/locale/messages.fr.xlf` (French translations):*
    ```xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
      <file source-language="en-US" datatype="plaintext" original="ng2.template">
        <body>
          <trans-unit id="appTitle" datatype="html">
            <source>Welcome to My Internationalized App!</source>
            <target>Bienvenue sur Mon Application Internationalisée !</target>
            <note priority="1" from="description">@@appTitle</note>
          </trans-unit>
          <trans-unit id="8868832049970347854" datatype="html">
            <source>This is a demonstration of Angular&apos;s i18n features.</source>
            <target>Ceci est une démonstration des fonctionnalités i18n d&apos;Angular.</target>
            <note priority="1" from="description">Description of this paragraph for translators</note>
          </trans-unit>
          <trans-unit id="todayDate" datatype="html">
            <source>Today&apos;s date: <x id="INTERPOLATION" equiv-text="{{ today | date:'fullDate' }}"/></source>
            <target>Date d&apos;aujourd&apos;hui: <x id="INTERPOLATION" equiv-text="{{ today | date:'fullDate' }}"/></target>
            <note priority="1" from="description">@@todayDate</note>
          </trans-unit>
        </body>
      </file>
    </xliff>
    ```

7.  **Serve localized app:**
    ```bash
    # Serve in English (default, or ng serve --configuration=en if en is defined)
    ng serve

    # Serve in Spanish
    ng serve --configuration=es --open

    # Serve in French
    ng serve --configuration=fr --open
    ```
    You should see your application's text translated and the date formatted according to the locale's conventions (e.g., in French, the date might display as "mercredi 17 juillet 2024").

## Quick Checklist/Exercise

1.  **Mark for Translation:** In your `my-i18n-app`, add a new paragraph `<p>` with some text and mark it for translation using the `i18n` attribute, including a custom `@@ID`.
2.  **Generate & Translate:** Run `ng extract-i18n` again. Then, create a simple Italian (`it`) translation file (e.g., `src/locale/messages.it.xlf`) by copying `messages.xlf` and translating the newly added paragraph.
3.  **Build & Serve:** Update your `angular.json` to include the Italian locale configuration (similar to `es` and `fr`). Finally, build and serve your application using `ng serve --configuration=it` to verify your Italian translations.