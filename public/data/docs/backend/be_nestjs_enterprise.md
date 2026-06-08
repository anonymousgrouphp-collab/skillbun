# NestJS: Enterprise-Grade Framework

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It leverages TypeScript and combines elements of Object-Oriented Programming (OOP), Functional Programming (FP), and Functional Reactive Programming (FRP). Inspired by Angular, NestJS provides an out-of-the-box application architecture that helps developers create highly testable, scalable, loosely coupled, and easily maintainable applications, making it ideal for enterprise-grade solutions.

## Key Features & Concepts

### 1. Modular Architecture
NestJS applications are organized into modules. A module is a class annotated with the `@Module()` decorator. This decorator provides metadata that NestJS uses to organize the application structure. Each application has at least one root module, but it's highly recommended to break down the application into feature modules. This approach promotes better code organization, reusability, and maintainability.

*   **`@Module()`:** Defines a module. It takes an object with properties like:
    *   `imports`: An array of modules whose exported providers are required by this module.
    *   `controllers`: An array of controllers defined within this module.
    *   `providers`: An array of providers (services, repositories, factories, helpers, etc.) that will be instantiated by the NestJS injector and are available within this module.
    *   `exports`: A subset of `providers` that should be available to other modules that import the current module.

### 2. Dependency Injection (DI)
NestJS incorporates a robust Dependency Injection system, heavily influenced by Angular. DI is a design pattern where an object or function receives its dependencies rather than creating them itself. This promotes loose coupling, making components more independent, easier to test, and more flexible.

*   **Providers:** Services, repositories, factories, and other classes that NestJS can inject are called providers. They are typically marked with the `@Injectable()` decorator.
*   **Consumers:** Controllers, other services, and modules consume these providers by declaring them in their constructors. NestJS's DI container automatically resolves and injects the required instances.

### 3. Decorators
Decorators are a fundamental feature of TypeScript and are extensively used in NestJS to attach metadata to classes, methods, and properties. They play a crucial role in defining application structure, routing, and behavior.

*   `@Controller()`: Marks a class as a controller, responsible for handling incoming HTTP requests.
*   `@Injectable()`: Marks a class as a provider that can be injected into other classes via the DI system.
*   `@Get()`, `@Post()`, `@Put()`, `@Delete()`: Route-handling decorators for specific HTTP methods.
*   `@Param()`, `@Body()`, `@Query()`: Decorators used to extract data from the incoming request object.

### 4. Controllers and Services
*   **Controllers:** Act as the entry points for client requests. They handle incoming requests, validate input, and delegate the business logic to services. They are primarily concerned with routing and responding.
*   **Services (Providers):** Encapsulate the application's business logic and data access operations. They are designed to be reusable and are typically injected into controllers or other services. This clear separation of concerns enhances maintainability and testability.

### 5. Microservice Capabilities
NestJS provides first-class support for building microservices, enabling developers to create distributed systems with various transport layers such as TCP, Redis, gRPC, MQTT, NATS, Kafka, and RabbitMQ. This makes it an excellent framework for constructing scalable, resilient, and independently deployable services.

### 6. Robust CLI
The NestJS CLI (Command Line Interface) is an indispensable tool for rapid development. It facilitates scaffolding new projects, generating various application parts (modules, controllers, services, etc.) with consistent structure, running tests, and building applications, all while adhering to best practices.

## Simple Code Example: Hello Nest!

Let's create a basic "Hello World" API demonstrating a controller and a service with dependency injection.

First, install the NestJS CLI and create a new project:
```bash
npm i -g @nestjs/cli
nest new hello-nestjs
cd hello-nestjs
```

Now, generate a controller and a service:
```bash
nest g controller greetings
nest g service greetings
```

Update `src/greetings/greetings.service.ts`:
```typescript
// src/greetings/greetings.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GreetingsService {
  getHello(): string {
    return 'Hello from NestJS!';
  }
}
```

Update `src/greetings/greetings.controller.ts`:
```typescript
// src/greetings/greetings.controller.ts
import { Controller, Get } from '@nestjs/common';
import { GreetingsService } from './greetings.service';

@Controller('greetings')
export class GreetingsController {
  constructor(private readonly greetingsService: GreetingsService) {}

  @Get()
  getHello(): string {
    return this.greetingsService.getHello();
  }
}
```

NestJS automatically registers these in `src/greetings/greetings.module.ts`:
```typescript
// src/greetings/greetings.module.ts
import { Module } from '@nestjs/common';
import { GreetingsController } from './greetings.controller';
import { GreetingsService } from './greetings.service';

@Module({
  controllers: [GreetingsController],
  providers: [GreetingsService],
})
export class GreetingsModule {}
```

And `src/app.module.ts` will import `GreetingsModule` if generated via CLI from the root:
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GreetingsModule } from './greetings/greetings.module'; // Import your new module

@Module({
  imports: [GreetingsModule], // Add GreetingsModule here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Start the application:
```bash
npm run start:dev
```
Open your browser or use a tool like Postman/cURL to visit `http://localhost:3000/greetings`. You should see "Hello from NestJS!".

## Quick Checklist / Exercise

1.  Explain in your own words how Dependency Injection works in NestJS and why it's beneficial for building scalable applications.
2.  What is the primary architectural difference and responsibility between a `Controller` and a `Service` (Provider) in a NestJS application?
3.  How does the `@Module()` decorator contribute to the modularity, organization, and reusability of a NestJS project?