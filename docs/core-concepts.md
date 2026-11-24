# Core Concepts (/docs/core-concepts)



# Core Concepts [#core-concepts]

## Concept map [#concept-map]

```
Kwiva (framework)
├── App (defineApp)
│   ├── Models (defineModel) → Database + Migrations
│   ├── Controllers (defineController) → HTTP
│   ├── Pages (definePage) → SSR frontend
│   ├── Jobs (defineJob) → Background work
│   ├── Tasks (defineTask) → Scheduled work
│   ├── Events (defineEvent) → Pub/sub
│   ├── Middleware → HTTP pipeline
│   ├── Policies → Authorization
│   ├── Services → DI (defineService)
│   └── Config (defineConfig) → Typed sections
└── Clients, Devtools
```

## Entry points [#entry-points]

| Topic                            | Page                                                  |
| -------------------------------- | ----------------------------------------------------- |
| defineX convention (the grammar) | [The defineX Convention](/docs/core-concepts/definex) |
| Applications (defineApp)         | [Applications](/docs/core-concepts/applications)      |
| Configuration                    | [Configuration](/docs/core-concepts/configuration)    |
| Auto-Discovery                   | [Auto-Discovery](/docs/core-concepts/auto-discovery)  |
| Lifecycle (14 steps)             | [Lifecycle](/docs/core-concepts/lifecycle)            |
| Context                          | [Context](/docs/core-concepts/context)                |
| Services (DI)                    | [Services](/docs/core-concepts/services)              |
| Modules                          | [Modules](/docs/core-concepts/modules)                |
| Plugins                          | [Plugins](/docs/core-concepts/plugins)                |
| Error handling                   | [Error Handling](/docs/core-concepts/error-handling)  |
| Type inference                   | [Type Inference](/docs/core-concepts/type-inference)  |
