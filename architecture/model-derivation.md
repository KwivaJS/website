# Model Derivation (/architecture/model-derivation)



# Model Derivation [#model-derivation]

`defineModel` → `ModelDefinition` (IR) → artifacts:

| Artifact                     | Source                                          |
| ---------------------------- | ----------------------------------------------- |
| Database schema + migrations | `@kwiva/data` (`migrateGenerate`, `migrate`)    |
| REST routes                  | `@kwiva/http` (`restRoutes`, `mountAutoRoutes`) |
| Typed client                 | `@kwiva/client` (route tree + callRoute)        |
| MCP tools                    | `@kwiva/mcp` (`generateModelTools`)             |
| OpenAPI                      | `@kwiva/http` (`mountOpenAPI`)                  |
| Realtime broadcast           | `@kwiva/events` (`broadcastOn` metadata)        |

## No-drift guarantee [#no-drift-guarantee]

Single source: `src/app/models/*.ts` → IR → all derived artifacts.

See [advanced/model-ir](/docs/advanced/model-ir).
