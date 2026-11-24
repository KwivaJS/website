# OpenAPI (/docs/api/openapi)



# OpenAPI [#openapi]

Auto-generated from the route manifest. Mount via `mountOpenAPI(app, manifest)`.

## Output [#output]

* `/openapi.json` — OpenAPI 3.1 spec
* `/docs` — Scalar docs UI

## Options [#options]

`OpenAPIOptions{title?, version?, description?, path?, specPath?, scalar?, documentation?, exclude?, models?}`.

## Model schema shaping [#model-schema-shaping]

`fieldToJsonSchema`, `modelToJsonSchema`, `modelSchemas`, `manifestReferences` — from `@kwiva/http`.

> \[!TIP]
> Add models to the manifest via `bootApp(server, {models})` → auto-appears in spec.
