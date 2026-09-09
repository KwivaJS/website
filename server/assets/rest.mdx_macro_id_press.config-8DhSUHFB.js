import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/api/rest.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "REST Conventions",
	"description": "URL patterns, method mapping, status codes, response envelopes, pagination, naming, and versioning."
};
var lastModified = /* @__PURE__ */ new Date(1788986376e3);
var _markdown = "\n\nKwiva's REST surface follows a small set of conventions you can predict from the model name alone. The conventions are deterministic on purpose: the URL for any resource is derivable, the method mapping is fixed, and the response envelope never varies between generated routes and hand-written controller actions.\n\nPredictability is the contract. Because the conventions are fixed, tooling — the typed client, OpenAPI, Studio, MCP — can derive everything, and a consumer who has seen one resource can navigate any other.\n\n## URL Patterns [#url-patterns]\n\nThe API is mounted at the `/api` prefix, configured in `src/config/api.ts`.\n\n| Pattern                     | Meaning                                                    |\n| --------------------------- | ---------------------------------------------------------- |\n| `/api/{model}`              | collection — a model name resolves to its lowercase plural |\n| `/api/{model}/:id`          | single resource                                            |\n| `/api/{model}/:id/{action}` | custom action (controller-defined)                         |\n| `/api/{controller}/...`     | controller prefix — additional controller routes           |\n| `/openapi.json`             | generated OpenAPI specification                            |\n| `/docs`                     | interactive API documentation (optional)                   |\n| `/healthz` · `/readyz`      | liveness and readiness                                     |\n\n### Naming rules [#naming-rules]\n\n* **Collections** are lowercase and plural: `posts`, `users`, `blog-posts`.\n* **Custom path segments** are kebab-case.\n* **No verbs in paths.** The verb lives in the HTTP method; a verb in the path signals a custom action such as `/api/posts/:id/publish`.\n\n### Collections and fields [#collections-and-fields]\n\n| Construct             | Convention                    | Example                          |\n| --------------------- | ----------------------------- | -------------------------------- |\n| Collection segment    | lowercase plural              | `posts` → `/api/posts`           |\n| Multi-word collection | kebab-case                    | `blog-posts` → `/api/blog-posts` |\n| Field names           | camelCase                     | `publishedAt`, `authorId`        |\n| Custom action         | kebab-case under the resource | `/api/posts/:id/publish`         |\n\n### Versioning [#versioning]\n\nVersioning is configured in `src/config/api.ts`:\n\n```ts title=\"versioning.ts\"\nexport default defineConfig('api', {\n  versioning: { strategy: 'url', default: 'v1' },\n})\n```\n\nWith the `url` strategy every route mounts under a version: `/api/v1/posts`. Breaking changes require a new version; deprecation signals attach to routes via route rules and surface in the OpenAPI output. The typed client targets the configured version, so applications never hard-code the segment.\n\n## Method Mapping [#method-mapping]\n\n| Method   | Path                     | Purpose                 |\n| -------- | ------------------------ | ----------------------- |\n| `GET`    | `/api/posts`             | list a collection       |\n| `GET`    | `/api/posts/:id`         | fetch one resource      |\n| `POST`   | `/api/posts`             | create a resource (201) |\n| `PATCH`  | `/api/posts/:id`         | partial update          |\n| `DELETE` | `/api/posts/:id`         | delete a resource (204) |\n| `POST`   | `/api/posts/:id/publish` | custom action           |\n\n`PATCH` accepts a partial body — send only the fields you change. `POST` to a collection creates; `POST` to a resource subpath runs a custom action. `DELETE` returns 204 with no body.\n\n## JSON Responses [#json-responses]\n\nSingle resources serialize to the model's shape directly. List endpoints use a paginated envelope:\n\n```json title=\"json-responses.json\"\n{\n  \"data\": [],\n  \"total\": 142,\n  \"page\": 3,\n  \"lastPage\": 8\n}\n```\n\n`data` holds the rows, `total` the count across all pages, `page` the current page, and `lastPage` the final page number. The envelope is identical for generated and controller list routes.\n\n## Pagination [#pagination]\n\nOffset pagination is the default contract:\n\n```plaintext title=\"pagination.txt\"\nGET /api/posts?page=3&limit=20\n```\n\n| Query     | Meaning                                  |\n| --------- | ---------------------------------------- |\n| `page`    | 1-based page number                      |\n| `limit`   | page size                                |\n| `orderBy` | model field to order the list by         |\n| `where`   | filter, schema-checked against the model |\n| `with`    | relations to eager-load                  |\n| `q`       | full-text search                         |\n\nCursor mode uses `?cursor=...` and returns `nextCursor` in the response — designed to pair with infinite list hooks. See [Data: pagination](/docs/data/pagination).\n\nThe `where` argument is schema-checked against the model: an unknown field produces a `VALIDATION` error. The `with` argument accepts only declared relations.\n\n## Dates and Identifiers [#dates-and-identifiers]\n\nIdentifiers are opaque strings produced by the field DSL — `f.id()`, `f.uuid()`, `f.ulid()`. Throughout these docs you will see namespaced examples such as `pst_123` and `req_...`.\n\nTimestamps follow the model declaration: `timestamps: true` adds `createdAt` and `updatedAt`, and explicit `f.timestamp()` or `f.date()` fields honor their declared type in responses. See [Data: fields](/docs/data/fields).\n\n## Status Codes [#status-codes]\n\n| Code            | When                                           |\n| --------------- | ---------------------------------------------- |\n| 200 / 201 / 204 | success                                        |\n| 400             | malformed input that is not schema-validatable |\n| 401             | unauthenticated (session missing)              |\n| 403             | policy denial                                  |\n| 404             | not found                                      |\n| 409             | conflict (unique violation, version)           |\n| 422             | validation                                     |\n| 429             | rate limit                                     |\n| 500             | unhandled (sanitized in production)            |\n\nEach failure status maps to one taxonomy code from the shared error model. See the taxonomy table in [API Errors](/docs/api/errors).\n\n## Error Envelope [#error-envelope]\n\nEvery error response uses one envelope:\n\n```json title=\"error-envelope.json\"\n{\n  \"error\": {\n    \"code\": \"NOT_FOUND\",\n    \"message\": \"no such post\",\n    \"requestId\": \"req_...\"\n  }\n}\n```\n\nThe `code` comes from a single error taxonomy mapped to HTTP statuses. A `VALIDATION` error adds `issues` — field-mapped entries your forms can render directly. `requestId` always equals the `x-request-id` header, so any reported error correlates back to its request and trace.\n\n## Deriving a URL [#deriving-a-url]\n\nThe derivation is mechanical. Take the model name, pluralize and lowercase it, mount under the API prefix, and append the version when versioning is on:\n\n```ts title=\"deriving-a-url.ts\"\nposts          →  /api/posts\nposts + id     →  /api/posts/:id\nposts + action →  /api/posts/:id/publish\nreports + get  →  /api/reports/:id\n```\n\nYou never configure these paths individually — they are properties of the model and controller declarations.\n\n## A Full List Round-Trip [#a-full-list-round-trip]\n\nA filtered, eager-loaded list call:\n\n```http title=\"a-full-list-round-trip.http\"\nGET /api/posts?where={\"status\":\"published\"}&with=[\"comments\"]&page=2&limit=10\n```\n\nreads as published posts, comments eager-loaded, page 2 of 10. The response carries `data`, `total`, `page`, and `lastPage`, so pagination state comes back in the same payload as the rows. See [Data: pagination](/docs/data/pagination).\n\n## Versioning and Deprecation [#versioning-and-deprecation]\n\nVersioning is a single config decision, not a copy of the API: `strategy: 'url'` puts every route under `/api/v1`, and a later `v2` mounts alongside it. Deprecation signals attach per route through rules and flow into the OpenAPI document. Breaking changes require a version bump — there is no silent redefinition of a path.\n\n## Backwards Compatibility of the Envelope [#backwards-compatibility-of-the-envelope]\n\nThe envelope is part of the public contract. List responses always use the paginated shape, single resources serialize directly, errors always use the `error` envelope, and cookie-based auth behaves the same across versions. Tools that parse the API can rely on these shapes across upgrades, not just within one release.\n\n## The Method at a Glance [#the-method-at-a-glance]\n\n| Method     | Contract                |\n| ---------- | ----------------------- |\n| `GET` list | 200, paginated envelope |\n| `GET` one  | 200, serialized record  |\n| `POST`     | 201, created record     |\n| `PATCH`    | 200, updated record     |\n| `DELETE`   | 204, no body            |\n\nEvery success status is deliberate: `201` means created, `204` means gone, and the client types distinguish them (`res.data` present or absent) without inspecting status codes by hand.\n\n## Query Strings and Casing [#query-strings-and-casing]\n\nQuery parameters are camelCase: `page`, `limit`, `sort`, `with`, `where`. `where` takes JSON filter objects, `with` takes a JSON array of relations, and both are schema-checked before the query builder runs. The query contract is documented in OpenAPI, so a client generated from the spec already agrees on casing. See [Data: queries](/docs/data/queries).\n\n## Mutually Exclusive Shapes [#mutually-exclusive-shapes]\n\n```ts title=\"mutually-exclusive-shapes.ts\"\n// single record\n{ \"id\": \"...\", \"title\": \"hello\", \"authorId\": \"...\" }\n\n// list envelope\n{ \"data\": [...], \"total\": 12, \"page\": 2, \"lastPage\": 3 }\n\n// error envelope\n{ \"error\": { \"code\": \"NOT_FOUND\", \"message\": \"no such post\", \"requestId\": \"req_...\" } }\n```\n\nErrors never appear in a success payload slot, and payloads never appear in the error envelope. The three shapes are mutually exclusive by contract, which is what makes the typed client's discriminated union sound.\n\n## What's Next [#whats-next]\n\n* [Generated Endpoints](/docs/api/generated-endpoints) — the five routes every model produces\n* [API Errors](/docs/api/errors) — the taxonomy and envelope contract\n* [Typed RPC](/docs/api/rpc) — the same surface, called through the typed client\n* [Validation](/docs/http/validation) — per-route schemas\n* [Controllers](/docs/http/controllers) — write custom actions with `defineController`\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Kwiva's REST surface follows a small set of conventions you can predict from the model name alone. The conventions are deterministic on purpose: the URL for any resource is derivable, the method mapping is fixed, and the response envelope never varies between generated routes and hand-written controller actions."
		},
		{
			"heading": void 0,
			"content": "Predictability is the contract. Because the conventions are fixed, tooling — the typed client, OpenAPI, Studio, MCP — can derive everything, and a consumer who has seen one resource can navigate any other."
		},
		{
			"heading": "url-patterns",
			"content": "The API is mounted at the `/api` prefix, configured in `src/config/api.ts`."
		},
		{
			"heading": "url-patterns",
			"content": "Pattern"
		},
		{
			"heading": "url-patterns",
			"content": "Meaning"
		},
		{
			"heading": "url-patterns",
			"content": "`/api/{model}`"
		},
		{
			"heading": "url-patterns",
			"content": "collection — a model name resolves to its lowercase plural"
		},
		{
			"heading": "url-patterns",
			"content": "`/api/{model}/:id`"
		},
		{
			"heading": "url-patterns",
			"content": "single resource"
		},
		{
			"heading": "url-patterns",
			"content": "`/api/{model}/:id/{action}`"
		},
		{
			"heading": "url-patterns",
			"content": "custom action (controller-defined)"
		},
		{
			"heading": "url-patterns",
			"content": "`/api/{controller}/...`"
		},
		{
			"heading": "url-patterns",
			"content": "controller prefix — additional controller routes"
		},
		{
			"heading": "url-patterns",
			"content": "`/openapi.json`"
		},
		{
			"heading": "url-patterns",
			"content": "generated OpenAPI specification"
		},
		{
			"heading": "url-patterns",
			"content": "`/docs`"
		},
		{
			"heading": "url-patterns",
			"content": "interactive API documentation (optional)"
		},
		{
			"heading": "url-patterns",
			"content": "`/healthz` · `/readyz`"
		},
		{
			"heading": "url-patterns",
			"content": "liveness and readiness"
		},
		{
			"heading": "naming-rules",
			"content": "**Collections** are lowercase and plural: `posts`, `users`, `blog-posts`."
		},
		{
			"heading": "naming-rules",
			"content": "**Custom path segments** are kebab-case."
		},
		{
			"heading": "naming-rules",
			"content": "**No verbs in paths.** The verb lives in the HTTP method; a verb in the path signals a custom action such as `/api/posts/:id/publish`."
		},
		{
			"heading": "collections-and-fields",
			"content": "Construct"
		},
		{
			"heading": "collections-and-fields",
			"content": "Convention"
		},
		{
			"heading": "collections-and-fields",
			"content": "Example"
		},
		{
			"heading": "collections-and-fields",
			"content": "Collection segment"
		},
		{
			"heading": "collections-and-fields",
			"content": "lowercase plural"
		},
		{
			"heading": "collections-and-fields",
			"content": "`posts` → `/api/posts`"
		},
		{
			"heading": "collections-and-fields",
			"content": "Multi-word collection"
		},
		{
			"heading": "collections-and-fields",
			"content": "kebab-case"
		},
		{
			"heading": "collections-and-fields",
			"content": "`blog-posts` → `/api/blog-posts`"
		},
		{
			"heading": "collections-and-fields",
			"content": "Field names"
		},
		{
			"heading": "collections-and-fields",
			"content": "camelCase"
		},
		{
			"heading": "collections-and-fields",
			"content": "`publishedAt`, `authorId`"
		},
		{
			"heading": "collections-and-fields",
			"content": "Custom action"
		},
		{
			"heading": "collections-and-fields",
			"content": "kebab-case under the resource"
		},
		{
			"heading": "collections-and-fields",
			"content": "`/api/posts/:id/publish`"
		},
		{
			"heading": "versioning",
			"content": "Versioning is configured in `src/config/api.ts`:"
		},
		{
			"heading": "versioning",
			"content": "With the `url` strategy every route mounts under a version: `/api/v1/posts`. Breaking changes require a new version; deprecation signals attach to routes via route rules and surface in the OpenAPI output. The typed client targets the configured version, so applications never hard-code the segment."
		},
		{
			"heading": "method-mapping",
			"content": "Method"
		},
		{
			"heading": "method-mapping",
			"content": "Path"
		},
		{
			"heading": "method-mapping",
			"content": "Purpose"
		},
		{
			"heading": "method-mapping",
			"content": "`GET`"
		},
		{
			"heading": "method-mapping",
			"content": "`/api/posts`"
		},
		{
			"heading": "method-mapping",
			"content": "list a collection"
		},
		{
			"heading": "method-mapping",
			"content": "`GET`"
		},
		{
			"heading": "method-mapping",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "method-mapping",
			"content": "fetch one resource"
		},
		{
			"heading": "method-mapping",
			"content": "`POST`"
		},
		{
			"heading": "method-mapping",
			"content": "`/api/posts`"
		},
		{
			"heading": "method-mapping",
			"content": "create a resource (201)"
		},
		{
			"heading": "method-mapping",
			"content": "`PATCH`"
		},
		{
			"heading": "method-mapping",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "method-mapping",
			"content": "partial update"
		},
		{
			"heading": "method-mapping",
			"content": "`DELETE`"
		},
		{
			"heading": "method-mapping",
			"content": "`/api/posts/:id`"
		},
		{
			"heading": "method-mapping",
			"content": "delete a resource (204)"
		},
		{
			"heading": "method-mapping",
			"content": "`POST`"
		},
		{
			"heading": "method-mapping",
			"content": "`/api/posts/:id/publish`"
		},
		{
			"heading": "method-mapping",
			"content": "custom action"
		},
		{
			"heading": "method-mapping",
			"content": "`PATCH` accepts a partial body — send only the fields you change. `POST` to a collection creates; `POST` to a resource subpath runs a custom action. `DELETE` returns 204 with no body."
		},
		{
			"heading": "json-responses",
			"content": "Single resources serialize to the model's shape directly. List endpoints use a paginated envelope:"
		},
		{
			"heading": "json-responses",
			"content": "`data` holds the rows, `total` the count across all pages, `page` the current page, and `lastPage` the final page number. The envelope is identical for generated and controller list routes."
		},
		{
			"heading": "pagination",
			"content": "Offset pagination is the default contract:"
		},
		{
			"heading": "pagination",
			"content": "Query"
		},
		{
			"heading": "pagination",
			"content": "Meaning"
		},
		{
			"heading": "pagination",
			"content": "`page`"
		},
		{
			"heading": "pagination",
			"content": "1-based page number"
		},
		{
			"heading": "pagination",
			"content": "`limit`"
		},
		{
			"heading": "pagination",
			"content": "page size"
		},
		{
			"heading": "pagination",
			"content": "`orderBy`"
		},
		{
			"heading": "pagination",
			"content": "model field to order the list by"
		},
		{
			"heading": "pagination",
			"content": "`where`"
		},
		{
			"heading": "pagination",
			"content": "filter, schema-checked against the model"
		},
		{
			"heading": "pagination",
			"content": "`with`"
		},
		{
			"heading": "pagination",
			"content": "relations to eager-load"
		},
		{
			"heading": "pagination",
			"content": "`q`"
		},
		{
			"heading": "pagination",
			"content": "full-text search"
		},
		{
			"heading": "pagination",
			"content": "Cursor mode uses `?cursor=...` and returns `nextCursor` in the response — designed to pair with infinite list hooks. See Data: pagination."
		},
		{
			"heading": "pagination",
			"content": "The `where` argument is schema-checked against the model: an unknown field produces a `VALIDATION` error. The `with` argument accepts only declared relations."
		},
		{
			"heading": "dates-and-identifiers",
			"content": "Identifiers are opaque strings produced by the field DSL — `f.id()`, `f.uuid()`, `f.ulid()`. Throughout these docs you will see namespaced examples such as `pst_123` and `req_...`."
		},
		{
			"heading": "dates-and-identifiers",
			"content": "Timestamps follow the model declaration: `timestamps: true` adds `createdAt` and `updatedAt`, and explicit `f.timestamp()` or `f.date()` fields honor their declared type in responses. See Data: fields."
		},
		{
			"heading": "status-codes",
			"content": "Code"
		},
		{
			"heading": "status-codes",
			"content": "When"
		},
		{
			"heading": "status-codes",
			"content": "200 / 201 / 204"
		},
		{
			"heading": "status-codes",
			"content": "success"
		},
		{
			"heading": "status-codes",
			"content": "400"
		},
		{
			"heading": "status-codes",
			"content": "malformed input that is not schema-validatable"
		},
		{
			"heading": "status-codes",
			"content": "401"
		},
		{
			"heading": "status-codes",
			"content": "unauthenticated (session missing)"
		},
		{
			"heading": "status-codes",
			"content": "403"
		},
		{
			"heading": "status-codes",
			"content": "policy denial"
		},
		{
			"heading": "status-codes",
			"content": "404"
		},
		{
			"heading": "status-codes",
			"content": "not found"
		},
		{
			"heading": "status-codes",
			"content": "409"
		},
		{
			"heading": "status-codes",
			"content": "conflict (unique violation, version)"
		},
		{
			"heading": "status-codes",
			"content": "422"
		},
		{
			"heading": "status-codes",
			"content": "validation"
		},
		{
			"heading": "status-codes",
			"content": "429"
		},
		{
			"heading": "status-codes",
			"content": "rate limit"
		},
		{
			"heading": "status-codes",
			"content": "500"
		},
		{
			"heading": "status-codes",
			"content": "unhandled (sanitized in production)"
		},
		{
			"heading": "status-codes",
			"content": "Each failure status maps to one taxonomy code from the shared error model. See the taxonomy table in API Errors."
		},
		{
			"heading": "error-envelope",
			"content": "Every error response uses one envelope:"
		},
		{
			"heading": "error-envelope",
			"content": "The `code` comes from a single error taxonomy mapped to HTTP statuses. A `VALIDATION` error adds `issues` — field-mapped entries your forms can render directly. `requestId` always equals the `x-request-id` header, so any reported error correlates back to its request and trace."
		},
		{
			"heading": "deriving-a-url",
			"content": "The derivation is mechanical. Take the model name, pluralize and lowercase it, mount under the API prefix, and append the version when versioning is on:"
		},
		{
			"heading": "deriving-a-url",
			"content": "You never configure these paths individually — they are properties of the model and controller declarations."
		},
		{
			"heading": "a-full-list-round-trip",
			"content": "A filtered, eager-loaded list call:"
		},
		{
			"heading": "a-full-list-round-trip",
			"content": "reads as published posts, comments eager-loaded, page 2 of 10. The response carries `data`, `total`, `page`, and `lastPage`, so pagination state comes back in the same payload as the rows. See Data: pagination."
		},
		{
			"heading": "versioning-and-deprecation",
			"content": "Versioning is a single config decision, not a copy of the API: `strategy: 'url'` puts every route under `/api/v1`, and a later `v2` mounts alongside it. Deprecation signals attach per route through rules and flow into the OpenAPI document. Breaking changes require a version bump — there is no silent redefinition of a path."
		},
		{
			"heading": "backwards-compatibility-of-the-envelope",
			"content": "The envelope is part of the public contract. List responses always use the paginated shape, single resources serialize directly, errors always use the `error` envelope, and cookie-based auth behaves the same across versions. Tools that parse the API can rely on these shapes across upgrades, not just within one release."
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "Method"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "Contract"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "`GET` list"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "200, paginated envelope"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "`GET` one"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "200, serialized record"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "`POST`"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "201, created record"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "`PATCH`"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "200, updated record"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "`DELETE`"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "204, no body"
		},
		{
			"heading": "the-method-at-a-glance",
			"content": "Every success status is deliberate: `201` means created, `204` means gone, and the client types distinguish them (`res.data` present or absent) without inspecting status codes by hand."
		},
		{
			"heading": "query-strings-and-casing",
			"content": "Query parameters are camelCase: `page`, `limit`, `sort`, `with`, `where`. `where` takes JSON filter objects, `with` takes a JSON array of relations, and both are schema-checked before the query builder runs. The query contract is documented in OpenAPI, so a client generated from the spec already agrees on casing. See Data: queries."
		},
		{
			"heading": "mutually-exclusive-shapes",
			"content": "Errors never appear in a success payload slot, and payloads never appear in the error envelope. The three shapes are mutually exclusive by contract, which is what makes the typed client's discriminated union sound."
		},
		{
			"heading": "whats-next",
			"content": "Generated Endpoints — the five routes every model produces"
		},
		{
			"heading": "whats-next",
			"content": "API Errors — the taxonomy and envelope contract"
		},
		{
			"heading": "whats-next",
			"content": "Typed RPC — the same surface, called through the typed client"
		},
		{
			"heading": "whats-next",
			"content": "Validation — per-route schemas"
		},
		{
			"heading": "whats-next",
			"content": "Controllers — write custom actions with `defineController`"
		}
	],
	"headings": [
		{
			"id": "url-patterns",
			"content": "URL Patterns"
		},
		{
			"id": "naming-rules",
			"content": "Naming rules"
		},
		{
			"id": "collections-and-fields",
			"content": "Collections and fields"
		},
		{
			"id": "versioning",
			"content": "Versioning"
		},
		{
			"id": "method-mapping",
			"content": "Method Mapping"
		},
		{
			"id": "json-responses",
			"content": "JSON Responses"
		},
		{
			"id": "pagination",
			"content": "Pagination"
		},
		{
			"id": "dates-and-identifiers",
			"content": "Dates and Identifiers"
		},
		{
			"id": "status-codes",
			"content": "Status Codes"
		},
		{
			"id": "error-envelope",
			"content": "Error Envelope"
		},
		{
			"id": "deriving-a-url",
			"content": "Deriving a URL"
		},
		{
			"id": "a-full-list-round-trip",
			"content": "A Full List Round-Trip"
		},
		{
			"id": "versioning-and-deprecation",
			"content": "Versioning and Deprecation"
		},
		{
			"id": "backwards-compatibility-of-the-envelope",
			"content": "Backwards Compatibility of the Envelope"
		},
		{
			"id": "the-method-at-a-glance",
			"content": "The Method at a Glance"
		},
		{
			"id": "query-strings-and-casing",
			"content": "Query Strings and Casing"
		},
		{
			"id": "mutually-exclusive-shapes",
			"content": "Mutually Exclusive Shapes"
		},
		{
			"id": "whats-next",
			"content": "What's Next"
		}
	]
};
var toc = [
	{
		depth: 2,
		url: "#url-patterns",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "URL Patterns" })
	},
	{
		depth: 3,
		url: "#naming-rules",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Naming rules" })
	},
	{
		depth: 3,
		url: "#collections-and-fields",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Collections and fields" })
	},
	{
		depth: 3,
		url: "#versioning",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Versioning" })
	},
	{
		depth: 2,
		url: "#method-mapping",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Method Mapping" })
	},
	{
		depth: 2,
		url: "#json-responses",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "JSON Responses" })
	},
	{
		depth: 2,
		url: "#pagination",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Pagination" })
	},
	{
		depth: 2,
		url: "#dates-and-identifiers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Dates and Identifiers" })
	},
	{
		depth: 2,
		url: "#status-codes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Status Codes" })
	},
	{
		depth: 2,
		url: "#error-envelope",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Error Envelope" })
	},
	{
		depth: 2,
		url: "#deriving-a-url",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Deriving a URL" })
	},
	{
		depth: 2,
		url: "#a-full-list-round-trip",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "A Full List Round-Trip" })
	},
	{
		depth: 2,
		url: "#versioning-and-deprecation",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Versioning and Deprecation" })
	},
	{
		depth: 2,
		url: "#backwards-compatibility-of-the-envelope",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Backwards Compatibility of the Envelope" })
	},
	{
		depth: 2,
		url: "#the-method-at-a-glance",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "The Method at a Glance" })
	},
	{
		depth: 2,
		url: "#query-strings-and-casing",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Query Strings and Casing" })
	},
	{
		depth: 2,
		url: "#mutually-exclusive-shapes",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Mutually Exclusive Shapes" })
	},
	{
		depth: 2,
		url: "#whats-next",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "What's Next" })
	}
];
function _createMdxContent(props) {
	const _components = {
		a: "a",
		code: "code",
		h2: "h2",
		h3: "h3",
		li: "li",
		p: "p",
		pre: "pre",
		span: "span",
		strong: "strong",
		table: "table",
		tbody: "tbody",
		td: "td",
		th: "th",
		thead: "thead",
		tr: "tr",
		ul: "ul",
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Kwiva's REST surface follows a small set of conventions you can predict from the model name alone. The conventions are deterministic on purpose: the URL for any resource is derivable, the method mapping is fixed, and the response envelope never varies between generated routes and hand-written controller actions." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Predictability is the contract. Because the conventions are fixed, tooling — the typed client, OpenAPI, Studio, MCP — can derive everything, and a consumer who has seen one resource can navigate any other." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "url-patterns",
			children: "URL Patterns"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The API is mounted at the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api" }),
			" prefix, configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Pattern" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/{model}" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "collection — a model name resolves to its lowercase plural" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/{model}/:id" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "single resource" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/{model}/:id/{action}" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "custom action (controller-defined)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/{controller}/..." }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "controller prefix — additional controller routes" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/openapi.json" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "generated OpenAPI specification" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/docs" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "interactive API documentation (optional)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/healthz" }),
				" · ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/readyz" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "liveness and readiness" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "naming-rules",
			children: "Naming rules"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Collections" }),
				" are lowercase and plural: ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "users" }),
				", ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "blog-posts" }),
				"."
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "Custom path segments" }), " are kebab-case."] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "No verbs in paths." }),
				" The verb lives in the HTTP method; a verb in the path signals a custom action such as ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id/publish" }),
				"."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "collections-and-fields",
			children: "Collections and fields"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Construct" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Convention" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Collection segment" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "lowercase plural" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "posts" }),
					" → ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Multi-word collection" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "kebab-case" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "blog-posts" }),
					" → ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/blog-posts" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field names" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "camelCase" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "publishedAt" }),
					", ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "authorId" })
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Custom action" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "kebab-case under the resource" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id/publish" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h3, {
			id: "versioning",
			children: "Versioning"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Versioning is configured in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/api.ts" }),
			":"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "versioning.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "export"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: " default"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: " defineConfig"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'api'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", {"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "  versioning: { strategy: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'url'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", default: "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "'v1'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " },"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "})"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"With the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "url" }),
			" strategy every route mounts under a version: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/v1/posts" }),
			". Breaking changes require a new version; deprecation signals attach to routes via route rules and surface in the OpenAPI output. The typed client targets the configured version, so applications never hard-code the segment."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "method-mapping",
			children: "Method Mapping"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Method" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Path" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Purpose" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "list a collection" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "fetch one resource" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "create a resource (201)" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "partial update" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "delete a resource (204)" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/posts/:id/publish" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "custom action" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }),
			" accepts a partial body — send only the fields you change. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }),
			" to a collection creates; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }),
			" to a resource subpath runs a custom action. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }),
			" returns 204 with no body."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "json-responses",
			children: "JSON Responses"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Single resources serialize to the model's shape directly. List endpoints use a paginated envelope:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "json-responses.json",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "{"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "  \"data\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": [],"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "  \"total\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "142"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "  \"page\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "3"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "  \"lastPage\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "8"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "data" }),
			" holds the rows, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "total" }),
			" the count across all pages, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			" the current page, and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "lastPage" }),
			" the final page number. The envelope is identical for generated and controller list routes."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "pagination",
			children: "Pagination"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Offset pagination is the default contract:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "pagination.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "GET /api/posts?page=3&limit=20" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Query" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Meaning" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "1-based page number" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "page size" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "orderBy" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "model field to order the list by" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "filter, schema-checked against the model" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "relations to eager-load" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "q" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "full-text search" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Cursor mode uses ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "?cursor=..." }),
			" and returns ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "nextCursor" }),
			" in the response — designed to pair with infinite list hooks. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/pagination",
				children: "Data: pagination"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" argument is schema-checked against the model: an unknown field produces a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			" error. The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
			" argument accepts only declared relations."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "dates-and-identifiers",
			children: "Dates and Identifiers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Identifiers are opaque strings produced by the field DSL — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.id()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.uuid()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.ulid()" }),
			". Throughout these docs you will see namespaced examples such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "pst_123" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "req_..." }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Timestamps follow the model declaration: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "timestamps: true" }),
			" adds ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "createdAt" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "updatedAt" }),
			", and explicit ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.timestamp()" }),
			" or ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.date()" }),
			" fields honor their declared type in responses. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/fields",
				children: "Data: fields"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "status-codes",
			children: "Status Codes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Code" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "200 / 201 / 204" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "success" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "400" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "malformed input that is not schema-validatable" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "401" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "unauthenticated (session missing)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "403" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "policy denial" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "404" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "not found" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "409" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "conflict (unique violation, version)" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "422" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "429" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "rate limit" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "500" }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "unhandled (sanitized in production)" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Each failure status maps to one taxonomy code from the shared error model. See the taxonomy table in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "error-envelope",
			children: "Error Envelope"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every error response uses one envelope:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "error-envelope.json",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "{"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#005CC5",
							"--shiki-dark": "#79B8FF"
						},
						children: "  \"error\""
					}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: ": {"
					})]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"code\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"NOT_FOUND\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"message\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"no such post\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ","
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "    \"requestId\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"req_...\""
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "  }"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#24292E",
							"--shiki-dark": "#E1E4E8"
						},
						children: "}"
					})
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "code" }),
			" comes from a single error taxonomy mapped to HTTP statuses. A ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "VALIDATION" }),
			" error adds ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "issues" }),
			" — field-mapped entries your forms can render directly. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "requestId" }),
			" always equals the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "x-request-id" }),
			" header, so any reported error correlates back to its request and trace."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "deriving-a-url",
			children: "Deriving a URL"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "The derivation is mechanical. Take the model name, pluralize and lowercase it, mount under the API prefix, and append the version when versioning is on:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "deriving-a-url.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "posts          →  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "api"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "posts"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "posts "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "+"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " id     →  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "api"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "posts"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":id"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "posts "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "+"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " action →  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "api"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "posts"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "publish"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "reports "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "+"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " get  →  "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "api"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "reports"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "/"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ":id"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "You never configure these paths individually — they are properties of the model and controller declarations." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "a-full-list-round-trip",
			children: "A Full List Round-Trip"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "A filtered, eager-loaded list call:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "a-full-list-round-trip.http",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.span, {
				className: "line",
				children: [(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#D73A49",
						"--shiki-dark": "#F97583"
					},
					children: "GET"
				}), (0, import_jsx_runtime_react_server.jsx)(_components.span, {
					style: {
						"--shiki-light": "#24292E",
						"--shiki-dark": "#E1E4E8"
					},
					children: " /api/posts?where={\"status\":\"published\"}&with=[\"comments\"]&page=2&limit=10"
				})]
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"reads as published posts, comments eager-loaded, page 2 of 10. The response carries ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "data" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "total" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "lastPage" }),
			", so pagination state comes back in the same payload as the rows. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/pagination",
				children: "Data: pagination"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "versioning-and-deprecation",
			children: "Versioning and Deprecation"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Versioning is a single config decision, not a copy of the API: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "strategy: 'url'" }),
			" puts every route under ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "/api/v1" }),
			", and a later ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "v2" }),
			" mounts alongside it. Deprecation signals attach per route through rules and flow into the OpenAPI document. Breaking changes require a version bump — there is no silent redefinition of a path."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "backwards-compatibility-of-the-envelope",
			children: "Backwards Compatibility of the Envelope"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The envelope is part of the public contract. List responses always use the paginated shape, single resources serialize directly, errors always use the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "error" }),
			" envelope, and cookie-based auth behaves the same across versions. Tools that parse the API can rely on these shapes across upgrades, not just within one release."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "the-method-at-a-glance",
			children: "The Method at a Glance"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Method" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Contract" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }), " list"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "200, paginated envelope" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "GET" }), " one"] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "200, serialized record" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "POST" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "201, created record" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "PATCH" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "200, updated record" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "DELETE" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "204, no body" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Every success status is deliberate: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "201" }),
			" means created, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "204" }),
			" means gone, and the client types distinguish them (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "res.data" }),
			" present or absent) without inspecting status codes by hand."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "query-strings-and-casing",
			children: "Query Strings and Casing"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Query parameters are camelCase: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "page" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "limit" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "sort" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			". ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where" }),
			" takes JSON filter objects, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "with" }),
			" takes a JSON array of relations, and both are schema-checked before the query builder runs. The query contract is documented in OpenAPI, so a client generated from the spec already agrees on casing. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/queries",
				children: "Data: queries"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "mutually-exclusive-shapes",
			children: "Mutually Exclusive Shapes"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: (0, import_jsx_runtime_react_server.jsx)(_components.pre, {
			className: "shiki shiki-themes github-light github-dark",
			style: {
				"--shiki-light": "#24292e",
				"--shiki-dark": "#e1e4e8",
				"--shiki-light-bg": "#fff",
				"--shiki-dark-bg": "#24292e"
			},
			tabIndex: "0",
			title: "mutually-exclusive-shapes.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// single record"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"id\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"...\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"title\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"hello\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"authorId\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"...\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// list envelope"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"data\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": ["
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "..."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "], "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"total\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "12"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"page\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "2"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"lastPage\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "3"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " }"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, { className: "line" }),
				"\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.span, {
					className: "line",
					children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
						style: {
							"--shiki-light": "#6A737D",
							"--shiki-dark": "#6A737D"
						},
						children: "// error envelope"
					})
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "{ "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"error\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": { "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"code\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"NOT_FOUND\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"message\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"no such post\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ", "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"requestId\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#032F62",
								"--shiki-dark": "#9ECBFF"
							},
							children: "\"req_...\""
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " } }"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Errors never appear in a success payload slot, and payloads never appear in the error envelope. The three shapes are mutually exclusive by contract, which is what makes the typed client's discriminated union sound." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ul, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/generated-endpoints",
				children: "Generated Endpoints"
			}), " — the five routes every model produces"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/errors",
				children: "API Errors"
			}), " — the taxonomy and envelope contract"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/api/rpc",
				children: "Typed RPC"
			}), " — the same surface, called through the typed client"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/http/validation",
				children: "Validation"
			}), " — per-route schemas"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/http/controllers",
					children: "Controllers"
				}),
				" — write custom actions with ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineController" })
			] }),
			"\n"
		] })
	] });
}
function MDXContent(props = {}) {
	const { wrapper: MDXLayout } = props.components || {};
	return MDXLayout ? (0, import_jsx_runtime_react_server.jsx)(MDXLayout, {
		...props,
		children: (0, import_jsx_runtime_react_server.jsx)(_createMdxContent, { ...props })
	}) : _createMdxContent(props);
}
//#endregion
export { _markdown, MDXContent as default, frontmatter, lastModified, structuredData, toc };
