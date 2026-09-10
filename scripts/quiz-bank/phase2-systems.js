/**
 * Phase 2: Systems & Software Engineering Pillar Questions
 * Focuses on differentiating between Frontend, Backend, Fullstack, Mobile (Android/iOS/Flutter/RN), Desktop, and specific language stacks.
 */

module.exports = [
  {
    id: 101,
    phase: 2,
    pillar: "systems",
    q: "When building a web or mobile application, which domain of code do you find yourself enjoying most?",
    options: [
      { l: "A", t: "Frontend UI: Crafting responsive layouts, state management, animations, and component styling.", tags: ["frontend", "nextjs_developer", "react_native_developer"], i: "Frontend champion, {name}! Bringing pixel-perfect interfaces to life is your core strength." },
      { l: "B", t: "Backend Logic: Building REST/GraphQL APIs, database queries, authentication pipelines, and server logic.", tags: ["backend", "java_developer", "go_developer", "python_developer"], i: "Backend architect, {name}! Server-side logic, performance, and databases are your sweet spot." },
      { l: "C", t: "End-to-End Fullstack: Connecting database tables to APIs and rendering them directly in modern UI frameworks.", tags: ["fullstack", "nextjs_developer"], i: "Fullstack versatile, {name}! Owning features from DB schema all the way to UI is your goal." },
      { l: "D", t: "Mobile Native/Cross-Platform: Building smooth smartphone apps optimized for touch gestures and mobile OS APIs.", tags: ["flutter_developer", "android", "ios_developer"], i: "Mobile creator, {name}! Native or cross-platform smartphone experiences excite you." }
    ]
  },
  {
    id: 102,
    phase: 2,
    pillar: "systems",
    q: "If you had to pick your primary backend programming ecosystem for the next 2 years, which philosophy matches yours?",
    options: [
      { l: "A", t: "JavaScript / TypeScript (Node.js, Express, Next.js) — Single language across frontend and backend.", tags: ["fullstack", "nextjs_developer"], i: "TS ecosystem enthusiast, {name}! One language across fullstack simplifies development." },
      { l: "B", t: "Java / Spring Boot or C# / .NET — Enterprise battle-tested reliability, strict typing, and large ecosystems.", tags: ["java_developer", "dotnet_developer"], i: "Enterprise developer, {name}! Robust enterprise stacks like Spring Boot or .NET build solid tech careers." },
      { l: "C", t: "Go (Golang) or Rust — High concurrency, low memory footprint, ultra-fast microservices, and systems programming.", tags: ["go_developer", "rust_developer", "c_cpp_systems_developer"], i: "Systems performance geek, {name}! Ultra-fast compiled languages give you supreme engineering control." },
      { l: "D", t: "Python (FastAPI, Django) or PHP (Laravel) — Rapid development speed, clean code syntax, and quick iteration.", tags: ["python_developer", "php_laravel_developer"], i: "Rapid ship developer, {name}! High-velocity stacks like FastAPI or Laravel get MVPs out lightning fast." }
    ]
  },
  {
    id: 103,
    phase: 2,
    pillar: "systems",
    q: "In mobile development, how do you approach building apps for both Android and iOS users in India?",
    options: [
      { l: "A", t: "Flutter (Dart) — Beautiful 60fps UI rendering engine, high performance, and single codebase.", tags: ["flutter_developer"], i: "Flutter advocate, {name}! Dart's UI engine gives you complete visual control across devices." },
      { l: "B", t: "React Native / Expo (JavaScript/TypeScript) — Leveraging web React skills to ship native iOS and Android apps.", tags: ["react_native_developer"], i: "React Native strategist, {name}! Sharing React knowledge across web and mobile is super efficient." },
      { l: "C", t: "Native Android (Kotlin / Jetpack Compose) — Deep integration with Android system services and hardware.", tags: ["android", "java_developer"], i: "Android Specialist, {name}! Deep native Android mastery gives you unmatched device performance." },
      { l: "D", t: "Native iOS (Swift / SwiftUI) — Premium Apple ecosystem integration, slick HIG guidelines, and iOS performance.", tags: ["ios_developer", "macos_developer"], i: "iOS Developer, {name}! SwiftUI and native iOS architecture craft high-end user experiences." }
    ]
  },
  {
    id: 104,
    phase: 2,
    pillar: "systems",
    q: "How do you prefer handling API communication between frontend apps and backend servers?",
    options: [
      { l: "A", t: "RESTful JSON APIs — Simple, clean HTTP methods, route conventions, and OpenAPI/Swagger docs.", tags: ["backend", "api_platform_engineer"], i: "REST purist, {name}! Clean standards-based HTTP APIs keep client-server contracts simple." },
      { l: "B", t: "GraphQL (Apollo, Schema Federation) — Allowing clients to query exact fields needed without over-fetching.", tags: ["graphql_api_developer", "frontend"], i: "GraphQL innovator, {name}! Precise data fetching and schema federation power flexible UIs." },
      { l: "C", t: "gRPC & Protocol Buffers — Binary serialization, ultra-fast low-latency RPCs for microservice communication.", tags: ["go_developer", "c_cpp_systems_developer"], i: "Microservices engineer, {name}! High-speed gRPC binary protocols excel in distributed backends." },
      { l: "D", t: "WebSockets & WebRTC — Real-time bidirectional streaming for live chat, multi-player, and streaming data.", tags: ["fullstack", "elixir_phoenix_developer"], i: "Real-time developer, {name}! WebSockets and live event streams keep applications dynamic and instant." }
    ]
  },
  {
    id: 105,
    phase: 2,
    pillar: "systems",
    q: "What kind of application platform excites you most to build and maintain?",
    options: [
      { l: "A", t: "Web Applications — Accessible instantly from any browser worldwide without app store downloads.", tags: ["frontend", "fullstack", "nextjs_developer"], i: "Web platform builder, {name}! Instant web reach and seamless URL sharing are unbeatable." },
      { l: "B", t: "Mobile Applications — Installed directly on smartphones with push notifications, offline mode, and camera access.", tags: ["flutter_developer", "android", "react_native_developer"], i: "Mobile app developer, {name}! Personal smartphone presence and hardware access drive engagement." },
      { l: "C", t: "Desktop & Cross-Platform Utilities — Heavyweight desktop software using Electron, Tauri, C++, or WinUI/macOS.", tags: ["desktop_app_developer", "rust_developer", "windows_app_developer"], i: "Desktop software builder, {name}! High-performance desktop utilities deliver raw local compute power." },
      { l: "D", t: "High-Throughput Distributed Microservices — Invisible backend infrastructure handling millions of API calls.", tags: ["backend", "go_developer", "java_developer"], i: "High-scale backend engineer, {name}! Distributed service architecture is the backbone of big tech." }
    ]
  }
];
