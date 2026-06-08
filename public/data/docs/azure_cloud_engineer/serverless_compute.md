# Azure Functions & Logic Apps (Serverless Compute)

Serverless computing allows you to build and run applications and services without managing infrastructure. Your application still runs on servers, but all the server management is done by Azure. This model enables developers to focus solely on writing code. Azure offers two primary serverless compute services: Azure Functions for executing code on demand and Azure Logic Apps for building automated workflows.

## 1. Azure Functions: Event-Driven Code Execution

Azure Functions are a serverless compute service that enables you to run small pieces of code ("functions") without explicitly provisioning or managing infrastructure. Functions are event-driven, meaning they are executed in response to specific triggers (e.g., an HTTP request, a timer, a new message on a queue).

### Core Concepts

*   **Event-Driven:** Functions are executed by a specific event or trigger.
*   **Stateless by Default:** Each execution is typically independent. However, Durable Functions provide stateful orchestration.
*   **Scalability:** Functions automatically scale out or in based on demand.
*   **Consumption Plan:** Pay only for the compute resources consumed while your function is running.
*   **Language Support:** Supports C#, F#, Java, JavaScript, Python, PowerShell, and more.
*   **Triggers and Bindings:**
    *   **Triggers:** Define how a function is invoked (e.g., HTTP, Timer, Blob Storage, Queue Storage, Cosmos DB).
    *   **Input Bindings:** Connect to data sources to make data easily available to your function.
    *   **Output Bindings:** Connect to data sinks to write data from your function.

### Common Use Cases

*   Building serverless APIs and microservices.
*   Processing data from various sources (e.g., image resizing when a blob is uploaded).
*   Running scheduled tasks (e.g., daily database cleanup).
*   Responding to events in real-time.

### Example: HTTP Triggered Function (C# In-Process Model)

This function responds to an HTTP GET or POST request.

```csharp
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

public static class HttpTriggerFunctionExample
{
    [FunctionName("GreetingFunction")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");

        string name = req.Query["name"];

        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = JsonConvert.DeserializeObject(requestBody);
        name = name ?? data?.name;

        string responseMessage = string.IsNullOrEmpty(name)
            ? "This HTTP-triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response."
            : $"Hello, {name}. This HTTP-triggered function executed successfully.";

        return new OkObjectResult(responseMessage);
    }
}
```

This example demonstrates:
*   `[FunctionName("GreetingFunction")]`: Defines the function's name.
*   `[HttpTrigger(...)]`: Specifies it's an HTTP trigger, allowing GET/POST requests and requiring a function-level authorization key.
*   `HttpRequest req`: The incoming HTTP request object.
*   `ILogger log`: For logging information.
*   Reading query parameters and request body.
*   Returning an `IActionResult`.

## 2. Azure Logic Apps: Automated Workflow Orchestration

Azure Logic Apps provide a way to automate workflows and integrate systems across enterprises or organizations. They are a cloud-based service for scheduling, automating, and orchestrating tasks, business processes, and workflows when you need to integrate apps, data, devices, and services.

### Core Concepts

*   **Visual Designer:** Build workflows using a drag-and-drop interface.
*   **Connectors:** Hundreds of pre-built connectors to various services (e.g., Office 365, Twitter, SQL Server, SharePoint, Salesforce, custom APIs).
*   **Triggers:** The starting point for a logic app, which can be a schedule (recurrence), an event (e.g., a new email), or a manual HTTP request.
*   **Actions:** Subsequent steps in the workflow, performing operations (e.g., sending an email, writing to a database, calling an Azure Function).
*   **Conditions and Loops:** Allow for branching logic and iterative processing.

### Common Use Cases

*   Integrating cloud services and on-premises systems.
*   Automating business processes (e.g., order processing, expense approvals).
*   Creating event-driven integrations (e.g., Twitter sentiment analysis).
*   Building data integration pipelines.

### Example: Workflow for Processing New Emails with Attachments

Consider a Logic App that monitors an inbox, extracts attachments, and uploads them to Azure Blob Storage.

1.  **Trigger:** "When a new email arrives (Office 365 Outlook)" - configured to only trigger if the email has an attachment.
2.  **Condition:** "If Attachment Name contains 'report'" (or other filtering logic).
3.  **Action (True branch):** "Get attachment (V2)" - retrieve the attachment content.
4.  **Action (True branch):** "Create blob (Azure Blob Storage)" - upload the attachment content to a specified blob container.
5.  **Action (False branch):** "Send an email (Office 365 Outlook)" - notify that an irrelevant email was received.

This flow is designed visually, selecting connectors and actions, configuring their properties, and connecting them logically.

## 3. Functions vs. Logic Apps: When to Use Which?

Both services enable serverless execution, but they cater to different scenarios:

| Feature          | Azure Functions                               | Azure Logic Apps                                        |
| :--------------- | :-------------------------------------------- | :------------------------------------------------------ |
| **Focus**        | Code-first, custom compute logic              | Workflow-first, integration & orchestration             |
| **Development**  | Write code in various languages               | Visual designer (low-code/no-code)                      |
| **Granularity**  | Individual tasks, microservices               | Multi-step workflows, business processes                |
| **Connectors**   | Uses input/output bindings (limited)          | Hundreds of pre-built connectors                        |
| **Integration**  | Primarily through code/bindings               | Native integration with diverse services through connectors |
| **Use Cases**    | Data processing, API backend, scheduled tasks | EAI, B2B integration, automated business processes      |
| **Cost Model**   | Consumption plan (per execution)              | Consumption plan (per action execution)                 |

*   **Choose Azure Functions when:** You need to execute custom code for specific tasks, require fine-grained control over the execution environment, or are building high-throughput, compute-intensive event processing.
*   **Choose Azure Logic Apps when:** You need to integrate multiple services, orchestrate complex workflows visually, or work with a wide range of SaaS applications and enterprise systems without writing extensive code.

## Quick Understanding Checklist/Exercise

1.  **Scenario:** You need to automatically resize images uploaded to an Azure Blob Storage container. Which Azure serverless service would you primarily use and why?
2.  **Comparison:** List one key advantage of Azure Functions over Logic Apps, and one key advantage of Logic Apps over Azure Functions.
3.  **Trigger Identification:** If you wanted an Azure Logic App to start whenever a new item is added to a SharePoint list, what type of component would you configure first in your Logic App?