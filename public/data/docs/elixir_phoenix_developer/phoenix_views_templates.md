# Views & EEx Templates in Phoenix

Phoenix views and EEx (Embedded Elixir) templates are fundamental components for rendering dynamic HTML content in your Phoenix applications. They form the presentation layer, separating the logic of preparing data from the actual HTML markup, leading to cleaner, more maintainable code.

## 1. Phoenix Views

Phoenix Views act as intermediaries between your controllers and templates. Their primary responsibility is to prepare and transform data received from the controller into a format suitable for presentation in the EEx templates. Views reside in `lib/<your_app_name>_web/views/`.

*   **Purpose**: To encapsulate presentation logic, ensuring controllers remain focused on handling requests and templates on rendering HTML. Views define functions (typically `render/2`) that accept data (known as `assigns`) and determine which template to use.
*   **`render/2` Function**: This is the core function in a view. It takes the template name (e.g., `"index.html"`) and a map of assigns (`%{key: value}`) and orchestrates the rendering process.
*   **Assigns**: Data passed from the controller to the view, and subsequently to the template, is stored in a map called `assigns`. These are accessible directly as variables within your EEx templates using the `@` prefix (e.g., `@user`).

## 2. EEx Templates (Embedded Elixir)

EEx (Embedded Elixir) templates are plain text files (usually `.eex` for HTML) that contain a mix of static text and embedded Elixir code. Phoenix uses EEx to generate dynamic HTML responses.

*   **Syntax**:
    *   `<%= expression %>`: Evaluates `expression` and embeds its result directly into the output. This is used for displaying dynamic content. *Always use `=` for content you want to render.*
    *   `<%- expression %>`: Evaluates `expression` and embeds its result, then trims surrounding whitespace.
    *   `<% expression %>`: Executes `expression` but does not embed its result. Useful for control flow (e.g., `if`, `for`, `case`).
    *   `<%%` or `%%>`: Escapes the EEx tags, rendering `<%` or `%>` literally.
    *   `<%# comment %>`: A comment that will not appear in the final output.

*   **File Structure**: Templates are typically found in `lib/<your_app_name>_web/templates/`. Each view often has a corresponding directory inside `templates` (e.g., `lib/<your_app_name>_web/templates/page/` for `PageView`).
*   **Accessing Data**: Within an EEx template, variables passed via `assigns` in the view are directly accessible by their key names prefixed with `@` (e.g., if `assigns` contains `%{user: user_data}`, you can use `@user` in the template).

## 3. Layouts

Layouts provide a consistent structure for your web pages. They are EEx templates themselves that wrap other templates. In Phoenix, the main application layout is `lib/<your_app_name>_web/templates/layout/app.html.eex`.

*   **`app.html.eex`**: This is the default layout for most Phoenix applications. It typically includes the HTML `<!DOCTYPE>`, `<html>`, `<head>`, and `<body>` tags, along with placeholders for content.
*   **`<%= @inner_content %>`**: This special assign within a layout template is where the rendered content of the specific view template will be inserted.
*   **`render_layout`**: Controllers implicitly use `render_layout/3` (or `render/2` which calls `render_layout`) to wrap a template's output with a layout. You can specify a different layout or no layout if needed.

## 4. View Helpers

View helpers are Elixir functions, often defined in the view module itself or in separate modules (like `Phoenix.HTML`), that provide reusable functionality for templates. They help keep templates clean by abstracting complex logic or repetitive HTML generation.

*   **`Phoenix.HTML`**: This module provides many useful helpers for generating HTML tags, forms, and more (e.g., `link/2`, `form_for/4`). These are typically imported into your `web.ex` `view` or `controller` macros.
*   **Custom Helpers**: You can create your own helpers by defining functions within your view module. These functions then become available directly in any template rendered by that view.

### Code Example

Let's illustrate with a simple example.

**1. `lib/my_app_web/controllers/page_controller.ex`:**
```elixir
defmodule MyAppWeb.PageController do
  use MyAppWeb, :controller

  def home(conn, _params) do
    # Prepare data for the view
    message = "Welcome to SkillBun!"
    render(conn, "home.html", message: message)
  end
end
```

**2. `lib/my_app_web/views/page_view.ex`:**
```elixir
defmodule MyAppWeb.PageView do
  use MyAppWeb, :view
end
```
(Note: Often, a simple view like this doesn't need custom functions; it just exists to map `PageController` to `page` templates.)

**3. `lib/my_app_web/templates/page/home.html.eex`:**
```html
<h1><%= @message %></h1>
<p>This content is rendered from the home template.</p>
<p><%= link "Go to Dashboard", to: Routes.dashboard_path(@conn, :index) %></p>
```

**4. `lib/my_app_web/templates/layout/app.html.eex` (simplified):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>MyApp</title>
</head>
<body>
    <header>
        <nav>
            <a href="/">Home</a>
        </nav>
    </header>
    <main role="main">
        <%= @inner_content %>
    </main>
    <footer>
        <p>&copy; 2023 SkillBun</p>
    </footer>
</body>
</html>
```
When `PageController.home` is called, it renders `home.html.eex`. The content from `home.html.eex` replaces `@inner_content` in `app.html.eex`, resulting in a complete HTML page. The `@message` variable is accessible because it was passed as an assign. The `link` helper from `Phoenix.HTML` generates the anchor tag.

### Checklist/Exercise

1.  Describe the primary role of a Phoenix View and how it differs from a Controller's role.
2.  Explain the difference between `<%= expression %>` and `<% expression %>` in an EEx template. When would you use each?
3.  How do you include reusable HTML structure (like headers and footers) across multiple pages in Phoenix? What special assign is used for this?