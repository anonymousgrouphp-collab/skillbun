# File Uploads & Streaming in Elixir/Phoenix

File uploads and efficient data streaming are critical features in modern web applications. Phoenix, especially with LiveView, provides robust mechanisms for handling these, from traditional server-backed uploads to modern direct-to-S3 methods and real-time UI updates via streaming.

## 1. Server-Backed File Uploads

This traditional approach involves the client sending the file directly to your Phoenix server, which then processes and stores it (e.g., in the local filesystem, or uploads it to a cloud storage service from the server).

### How It Works

1.  **Client-Side:** An HTML `<form>` with `enctype="multipart/form-data"` and an `<input type="file">` sends the file.
2.  **Server-Side:** Phoenix receives the file as part of the request. `Plug.Upload` structures are created for each uploaded file.
3.  **Controller/LiveView:** You access these `Plug.Upload` structs in your controller action or `handle_params`/`handle_event` in LiveView, move them to a permanent location, or pipe them to a cloud storage service API.

### Pros & Cons

*   **Pros:**
    *   Simpler setup for small files or when server-side processing/validation is extensive *before* storage.
    *   Full server control over the upload process.
*   **Cons:**
    *   Scalability bottleneck: Server resources (CPU, memory, network bandwidth) are consumed during the upload.
    *   Slower for large files: Files have to travel client -> server -> cloud storage.
    *   Can impact user experience for large files (no direct progress feedback without additional client-side JS).

### Example: Basic Server-Backed Upload in a Phoenix Controller

```elixir
defmodule MyAppWeb.UploadController do
  use MyAppWeb, :controller

  def new(conn, _params) do
    render(conn, "new.html")
  end

  def create(conn, %{"upload" => %{"file" => %Plug.Upload{} = file}}) do
    # In a real app, you'd store this file, e.g., to S3, local disk, etc.
    # For demonstration, let's just log its details.
    IO.inspect(file, label: "Uploaded File Details")

    # Example: Move to a temporary directory (in a real app, move to a permanent location)
    temp_path = Path.join(System.tmp_dir!(), Path.basename(file.filename))
    File.cp!(file.path, temp_path)

    conn
    |> put_flash(:info, "File '#{file.filename}' uploaded successfully to #{temp_path}!")
    |> redirect(to: Routes.upload_path(conn, :new))
  end
end
```

```html
<!-- lib/my_app_web/templates/upload/new.html.eex -->
<h1>Upload a File</h1>

<p><%= get_flash(@conn, :info) %></p>

<%= form_tag Routes.upload_path(@conn, :create), multipart: true, method: :post do %>
  <input type="file" name="upload[file]" />
  <button type="submit">Upload</button>
<% end %>
```

## 2. Direct-to-S3 File Uploads with Phoenix LiveView

This modern approach offloads the heavy lifting of file transfers directly to a cloud storage service (like AWS S3) from the client's browser, bypassing your Phoenix server for the file data itself. Phoenix LiveView facilitates this process seamlessly.

### How It Works (LiveView Uploads)

1.  **Client-Side:** User selects a file using `live_file_input`.
2.  **LiveView Initiation:** LiveView receives metadata about the file and informs the server.
3.  **Server-Side (LiveView):** The LiveView component, using `allow_upload`, requests a *presigned URL* from the cloud storage service (e.g., S3). This URL grants temporary permission for the client to upload directly.
4.  **Client-Side:** LiveView sends this presigned URL back to the browser. The browser then uploads the file *directly* to S3.
5.  **Server-Side (LiveView):** Once the direct upload is complete (or fails), LiveView's `handle_upload` callback is triggered with the final status and metadata. You can then store the S3 object key in your database.

### Pros & Cons

*   **Pros:**
    *   **Scalability:** Your server isn't burdened by large file transfers.
    *   **Performance:** Faster uploads as files take a more direct route.
    *   **Better UX:** LiveView provides built-in progress indicators, allowing real-time feedback.
    *   **Cost-effective:** Reduces server bandwidth usage.
*   **Cons:**
    *   More complex initial setup (integrating with S3 SDK, managing presigned URLs).
    *   Requires a cloud storage service like S3.

### Example: Direct-to-S3 Upload with Phoenix LiveView

This example assumes you have an S3 bucket configured and an S3 client (like `ex_aws_s3`).

```elixir
# lib/my_app_web/live/my_live_component.ex
defmodule MyAppWeb.MyLiveComponent do
  use Phoenix.LiveComponent, view: MyAppWeb.PageView
  alias Phoenix.LiveView.UploadEntry
  # Assuming you have an S3 service module
  # alias MyApp.S3Service

  @impl true
  def mount(socket) do
    {:ok,
     socket
     |> assign(uploaded_file_url: nil)
     |> allow_upload(:photo, accept: ~w(.jpg .jpeg .png), max_entries: 1,
         max_file_size: 5_000_000,  # 5 MB
         auto_upload: true) # Automatically starts upload after selection
    }
  end

  @impl true
  def handle_event("save", _params, socket) do
    # This event might be triggered by a "Save" button after files are uploaded
    # For auto_upload, the files are already in S3, just need to process metadata.
    {:noreply, socket}
  end

  @impl true
  def handle_upload(:photo, entries, socket) do
    case consume_uploaded_entry(socket, entries, fn %UploadEntry{path: path, client_name: client_name} = entry ->
      # In a real app, you would upload to S3 here if not using auto_upload directly to S3
      # Or, if using auto_upload with a S3 integration, the file is already there.
      # This block would typically store the S3 key in your database.

      # For direct-to-S3, the `path` here will typically be a local temporary path
      # if you're doing server-side processing *after* the client-side upload finishes
      # or you've configured a custom uploader for S3 presigned URLs.

      # With auto_upload and a proper S3 integration, the client handles the S3 upload.
      # The entry will contain metadata about the uploaded file in S3.
      # Let's simulate storing an S3 URL.
      IO.inspect(entry, label: "Consumed Upload Entry")
      s3_url = "https://mybucket.s3.amazonaws.com/#{UUID.uuid4()}/#{client_name}"
      {:ok, s3_url} # Return the final URL or identifier
    end) do
      {:ok, [uploaded_url], socket} ->
        socket =
          socket
          |> put_flash(:info, "File uploaded and processed! URL: #{uploaded_url}")
          |> assign(uploaded_file_url: uploaded_url)
        {:noreply, socket}
      {:ok, [], socket} ->
        # No files were uploaded or processed
        {:noreply, socket}
      {:error, :bad_format, socket} ->
        # Handle format errors, max_entries exceeded etc.
        {:noreply, put_flash(socket, :error, "Upload failed: bad format.")}
    end
  end
end
```

```html
<!-- lib/my_app_web/live/my_live_component.html.heex -->
<div>
  <h2>Upload Your Photo</h2>
  <%= if @uploaded_file_url do %>
    <p>Uploaded file URL: <%= @uploaded_file_url %></p>
    <img src="<%= @uploaded_file_url %>" style="max-width: 300px; border: 1px solid #ccc;" />
  <% end %>

  <%= live_file_input @uploads.photo %>

  <%= for entry <- @uploads.photo.entries do %>
    <div class="upload-entry">
      <p>File: <%= entry.client_name %> (Status: <%= entry.upload_ref %>)</p>
      <%= if entry.progress do %>
        <progress value="<%= entry.progress %>" max="100"><%= entry.progress %>%</progress>
      <% end %>
      <%= if entry.errors != [] do %>
        <p class="error">Errors: <%= inspect entry.errors %></p>
      <% end %>
    </div>
  <% end %>

  <p><%= get_flash(@flash, :info) %></p>
  <p class="error"><%= get_flash(@flash, :error) %></p>
</div>
```

## 3. Leveraging LiveView's Streaming Capabilities for Efficient Data Display

LiveView streaming (`stream_insert`, `stream_delete`, `stream_replace`) allows you to efficiently update lists or collections of data in the UI without re-rendering the entire component or sending large patches. This is crucial for applications displaying real-time data or large datasets, including those related to file uploads (e.g., a list of recently uploaded files, or a real-time progress list).

### How It Works

Instead of manipulating a full list in your `assigns` and letting LiveView diff it, you directly instruct LiveView to perform specific DOM manipulations on elements identified by a `phx-id`.

*   `stream_insert(socket, :items, item, at: 0)`: Inserts a new `item` into a stream identified by `:items` at the specified position.
*   `stream_delete(socket, :items, item)`: Deletes an `item` from the stream.
*   `stream_replace(socket, :items, item)`: Replaces an existing `item` in the stream.

### Relevance to File Uploads

*   **Real-time Upload List:** As files are being processed or uploaded, stream their status into a list on the UI.
*   **Recent Uploads Display:** When a file is successfully uploaded and processed, use `stream_insert` to immediately add it to a list of "Recent Files" without needing a full page reload or re-fetching the entire list.
*   **Progress Updates:** While not directly for `stream_insert/delete/replace`, the concept of live updates is key. LiveView's `entry.progress` for file uploads itself is a form of streaming progress.

### Example: Streaming a List of Uploaded Files

Imagine a LiveView component displaying a list of "Recent Files".

```elixir
# lib/my_app_web/live/file_list_live.ex
defmodule MyAppWeb.FileListLive do
  use Phoenix.LiveView

  @impl true
  def mount(_params, _session, socket) do
    # Initially load some files
    files = get_recent_files() # Placeholder for fetching from DB
    {:ok, assign(socket, :files, files)}
  end

  @impl true
  def handle_event("new_file_uploaded", %{"id" => id, "name" => name, "url" => url}, socket) do
    # This event could be triggered from a PubSub message or another component
    new_file = %{id: id, name: name, url: url, timestamp: NaiveDateTime.utc_now()}
    socket = stream_insert(socket, :files, new_file, at: 0) # Add to the top
    {:noreply, socket}
  end

  # ... other event handlers ...

  defp get_recent_files do
    # Simulate fetching from a database
    [
      %{id: "f1", name: "report.pdf", url: "/files/report.pdf", timestamp: NaiveDateTime.utc_now() |> NaiveDateTime.add(-3600)},
      %{id: "f2", name: "image.jpg", url: "/files/image.jpg", timestamp: NaiveDateTime.utc_now() |> NaiveDateTime.add(-7200)}
    ]
  end
end
```

```html
<!-- lib/my_app_web/live/file_list_live.html.heex -->
<div>
  <h2>Recent Files</h2>
  <ul id="file-list" phx-update="stream">
    <%= for file <- @streams.files do %>
      <li id="<%= "file-#{file.id}" %>" phx-id="<%= file.id %>">
        <a href="<%= file.url %>" target="_blank"><%= file.name %></a>
        <small>(<%= file.timestamp %>)</small>
      </li>
    <% end %>
  </ul>
</div>
```

## Quick Checklist/Exercises

1.  **Identify Use Cases:** Describe a scenario where server-backed file uploads would be preferable over direct-to-S3 uploads, and vice-versa.
2.  **LiveView Upload Configuration:** If you wanted to restrict a LiveView file upload to only accept PDF files up to 2MB and allow up to 3 files, what `allow_upload` options would you use?
3.  **Streaming for UI:** How would you use `stream_insert` to add a new "notification" object to a list of notifications displayed in a LiveView component, ensuring the newest notification appears at the top?
