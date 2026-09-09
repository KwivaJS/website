import { t as require_jsx_runtime_react_server } from "./jsx-runtime.react-server-B0o5fl-a.js";
//#region content/docs/data/fields.mdx?macro_id=press.config.tsx%23docs
var import_jsx_runtime_react_server = require_jsx_runtime_react_server();
var frontmatter = {
	"title": "Fields & DSL",
	"description": "Field types, the modifier chain, defaults, validation integration, and how each field maps to a database column."
};
var lastModified = /* @__PURE__ */ new Date(178896021e4);
var _markdown = "\n\nFields are how you describe every attribute, constraint, and behavior of a resource. Kwiva uses a **function-based DSL** rather than classes: each field is started by a type constructor like `f.string()` and refined by chaining typed modifiers such as `.optional()`, `.default()`, `.indexed()`, and `.validation()`. The assembled chain drives three things at once — the TypeScript type, the validation schema, and the database column — so a field can never be typed one way and validated another.\n\nEvery field flows through the same pipeline:\n\n```plaintext title=\"fields-dsl.txt\"\nField definition → Type resolution → Modifier chain → Validation schema → Database column\n```\n\n## Identity [#identity]\n\nEvery model needs a primary key. The default is a UUID primary key, with an autoincrement option:\n\n```ts title=\"identity.ts\"\nid: f.id(),                        // uuid pk by default\nid: f.id('autoincrement'),          // integer autoincrement pk\n```\n\n## Scalar Types [#scalar-types]\n\n| Type            | Database  | Description                           |\n| --------------- | --------- | ------------------------------------- |\n| `f.string()`    | VARCHAR   | Text string                           |\n| `f.text()`      | TEXT      | Long-form text                        |\n| `f.integer()`   | INTEGER   | Whole numbers                         |\n| `f.float()`     | FLOAT     | Decimal numbers                       |\n| `f.boolean()`   | BOOLEAN   | True/false                            |\n| `f.timestamp()` | TIMESTAMP | Date-time with timezone               |\n| `f.datetime()`  | DATETIME  | Date-time without timezone            |\n| `f.date()`      | DATE      | Calendar date                         |\n| `f.json()`      | JSON      | JSON object (typed via `f.json<T>()`) |\n| `f.jsonb()`     | JSONB     | Binary JSON                           |\n| `f.binary()`    | BLOB      | Binary data                           |\n| `f.uuid()`      | UUID      | Universally unique identifier         |\n\n> \\[!NOTE]\n> `f.json<{ readingTime: number }>()` accepts a type parameter so parsed JSON is fully typed in queries, handlers, and the client.\n\n## Specialized Types [#specialized-types]\n\n| Type                | Description                                     |\n| ------------------- | ----------------------------------------------- |\n| `f.currency()`      | Decimal with currency formatting                |\n| `f.geoPoint()`      | Latitude/longitude                              |\n| `f.geoLineString()` | GeoJSON line                                    |\n| `f.geoPolygon()`    | GeoJSON polygon                                 |\n| `f.email()`         | Email validation                                |\n| `f.url()`           | URL validation                                  |\n| `f.phone()`         | Phone number validation                         |\n| `f.ip()`            | IPv4/IPv6                                       |\n| `f.cidr()`          | Network CIDR                                    |\n| `f.color()`         | Hex color                                       |\n| `f.slug()`          | URL-safe slug                                   |\n| `f.regex()`         | Pattern-matched string                          |\n| `f.file()`          | File upload reference                           |\n| `f.image()`         | Image with dimensions                           |\n| `f.object()`        | JSON object                                     |\n| `f.array()`         | Array of typed elements (`f.array(f.string())`) |\n| `f.map()`           | Key-value map (`f.map(f.string())`)             |\n| `f.enumSet()`       | Set of enum values                              |\n\nSpecialized types are thin: they map to a standard column and add domain validation. `f.email()` is the same column as `f.string()` with an email rule attached; `f.geoPoint()` stores coordinates with the right spatial column. Typed collection fields — `f.array(f.string())`, `f.map(f.string())`, `f.json<Shape>()` — keep the inner types flowing through queries, validation, and the client.\n\n## Enums and Choices [#enums-and-choices]\n\n`f.enum` and `f.enumSet` constrain a field to a fixed vocabulary:\n\n```ts title=\"enums-and-choices.ts\"\nstatus: f.enum('draft', 'published', 'archived').default('draft').indexed(),\nlabels: f.enumSet('red', 'green', 'blue').optional(),\n```\n\n| Type                 | Column      | Semantics            |\n| -------------------- | ----------- | -------------------- |\n| `f.enum(a, b, c)`    | Enum column | Exactly one member   |\n| `f.enumSet(a, b, c)` | Set column  | Zero or more members |\n\nEnum members become literal types end to end — the field type, the validation schema, the query shorthand, and the client all know the vocabulary, so `where('status', 'expired')` fails to compile. Prefer enums over bare strings for anything with a closed set of values; the compile-time check is the cheapest validation you get.\n\n## Relationship Types [#relationship-types]\n\n| Type                                        | Description                            |\n| ------------------------------------------- | -------------------------------------- |\n| `f.belongsTo(() => Model)`                  | Many-to-one                            |\n| `f.hasMany(() => Model)`                    | One-to-many                            |\n| `f.hasOne(() => Model)`                     | One-to-one                             |\n| `f.belongsToMany(() => Model, () => Pivot)` | Many-to-many with optional pivot model |\n| `f.morphTo()`                               | Polymorphic owner                      |\n| `f.morphMany(() => Model)`                  | Polymorphic many                       |\n| `f.morphOne(() => Model)`                   | Polymorphic single                     |\n| `f.morphToMany(() => Model)`                | Polymorphic many-to-many               |\n| `f.foreignId('users').references('id')`     | Explicit foreign key column            |\n\nRelations use **lazy references** (`() => Model`) so models compose without circular imports. See [Relations](/docs/data/relations) for loading, pivots, and cascade behavior.\n\n## Common Modifiers [#common-modifiers]\n\nModifiers are chained on any field and are typechecked against it — `f.integer().step(0.01)` compiles, `f.string().step(0.01)` does not:\n\n```ts title=\"common-modifiers.ts\"\nf.string().optional().default('draft').indexed().unique().nullable()\n  .validation((s) => s.min(1).max(200)).searchable().orderable()\n  .hidden().readonly().required().fillable().guarded()\n  .comment('Brief description').generatedAs('computed')\n```\n\n| Modifier                     | Effect                                               |\n| ---------------------------- | ---------------------------------------------------- |\n| `.optional()`                | Field may be absent in input; no database `NOT NULL` |\n| `.required()`                | Field must be present                                |\n| `.nullable()`                | Database column allows `NULL`                        |\n| `.default(value)`            | Default applied at the database and on create        |\n| `.indexed()`                 | Single-column index                                  |\n| `.unique()`                  | Unique constraint on the column                      |\n| `.validation(s => ...)`      | Standard Schema rule for the field                   |\n| `.searchable()`              | Opts the field into full-text search                 |\n| `.orderable()`               | Allows ordering by this field in list queries        |\n| `.hidden()`                  | Excluded from API responses                          |\n| `.readonly()`                | Accepted on create, ignored on update                |\n| `.fillable()` / `.guarded()` | Mass-assignment control                              |\n| `.comment(text)`             | Column comment exported to the schema                |\n| `.generatedAs(expr)`         | Generated column backed by an expression             |\n\nNumeric and string types add constraint modifiers: `f.string().min(1).max(200)`, `f.integer().min(0).max(1_000_000)`, `f.float().step(0.01)`.\n\n## Validation Integration [#validation-integration]\n\n`validation()` compiles the field rule into the request schema for generated routes, and into the same schema used by the client and Studio:\n\n```ts title=\"validation-integration.ts\"\nf.string().validation((s) => s.min(1).max(200))\nf.email().validation((s) => s.email())\nf.integer().validation((s) => s.min(0).max(1000000))\n```\n\nThe rule callback receives a Standard Schema builder and returns a constraint set. The default validator is Valibot; the implementation is switchable in `src/config/app.ts` under the `validator` key — see [Validation](/docs/data/validation).\n\n## Defaults, Computed, and Mutators [#defaults-computed-and-mutators]\n\nThree ways to produce a value for a field:\n\n| Mechanism                 | When it runs                       | Example                                          |\n| ------------------------- | ---------------------------------- | ------------------------------------------------ |\n| `.default(value)`         | At insert, database or model level | `f.enum('draft', 'published').default('draft')`  |\n| `.computed((row) => ...)` | On read, derived and read-only     | `f.string().computed((r) => fullName(r))`        |\n| `.mutator((val) => ...)`  | Before persist, transforms input   | `f.string().mutator((v) => hash(v, 'argon2id'))` |\n\nDefaults are validated against the field type, computed fields never hit the database, and mutators run before hooks and before insert so every derived value is consistent.\n\n## What's Next [#whats-next]\n\n1. [Models](/docs/data/models) — how fields compose into a `defineModel`\n2. [Relations](/docs/data/relations) — relationship fields and loading\n3. [Validation](/docs/data/validation) — rules, Standard Schema, and custom rules\n4. [Your First Model](/docs/getting-started/first-model) — using fields in practice\n";
var structuredData = {
	"contents": [
		{
			"heading": void 0,
			"content": "Fields are how you describe every attribute, constraint, and behavior of a resource. Kwiva uses a **function-based DSL** rather than classes: each field is started by a type constructor like `f.string()` and refined by chaining typed modifiers such as `.optional()`, `.default()`, `.indexed()`, and `.validation()`. The assembled chain drives three things at once — the TypeScript type, the validation schema, and the database column — so a field can never be typed one way and validated another."
		},
		{
			"heading": void 0,
			"content": "Every field flows through the same pipeline:"
		},
		{
			"heading": "identity",
			"content": "Every model needs a primary key. The default is a UUID primary key, with an autoincrement option:"
		},
		{
			"heading": "scalar-types",
			"content": "Type"
		},
		{
			"heading": "scalar-types",
			"content": "Database"
		},
		{
			"heading": "scalar-types",
			"content": "Description"
		},
		{
			"heading": "scalar-types",
			"content": "`f.string()`"
		},
		{
			"heading": "scalar-types",
			"content": "VARCHAR"
		},
		{
			"heading": "scalar-types",
			"content": "Text string"
		},
		{
			"heading": "scalar-types",
			"content": "`f.text()`"
		},
		{
			"heading": "scalar-types",
			"content": "TEXT"
		},
		{
			"heading": "scalar-types",
			"content": "Long-form text"
		},
		{
			"heading": "scalar-types",
			"content": "`f.integer()`"
		},
		{
			"heading": "scalar-types",
			"content": "INTEGER"
		},
		{
			"heading": "scalar-types",
			"content": "Whole numbers"
		},
		{
			"heading": "scalar-types",
			"content": "`f.float()`"
		},
		{
			"heading": "scalar-types",
			"content": "FLOAT"
		},
		{
			"heading": "scalar-types",
			"content": "Decimal numbers"
		},
		{
			"heading": "scalar-types",
			"content": "`f.boolean()`"
		},
		{
			"heading": "scalar-types",
			"content": "BOOLEAN"
		},
		{
			"heading": "scalar-types",
			"content": "True/false"
		},
		{
			"heading": "scalar-types",
			"content": "`f.timestamp()`"
		},
		{
			"heading": "scalar-types",
			"content": "TIMESTAMP"
		},
		{
			"heading": "scalar-types",
			"content": "Date-time with timezone"
		},
		{
			"heading": "scalar-types",
			"content": "`f.datetime()`"
		},
		{
			"heading": "scalar-types",
			"content": "DATETIME"
		},
		{
			"heading": "scalar-types",
			"content": "Date-time without timezone"
		},
		{
			"heading": "scalar-types",
			"content": "`f.date()`"
		},
		{
			"heading": "scalar-types",
			"content": "DATE"
		},
		{
			"heading": "scalar-types",
			"content": "Calendar date"
		},
		{
			"heading": "scalar-types",
			"content": "`f.json()`"
		},
		{
			"heading": "scalar-types",
			"content": "JSON"
		},
		{
			"heading": "scalar-types",
			"content": "JSON object (typed via `f.json<T>()`)"
		},
		{
			"heading": "scalar-types",
			"content": "`f.jsonb()`"
		},
		{
			"heading": "scalar-types",
			"content": "JSONB"
		},
		{
			"heading": "scalar-types",
			"content": "Binary JSON"
		},
		{
			"heading": "scalar-types",
			"content": "`f.binary()`"
		},
		{
			"heading": "scalar-types",
			"content": "BLOB"
		},
		{
			"heading": "scalar-types",
			"content": "Binary data"
		},
		{
			"heading": "scalar-types",
			"content": "`f.uuid()`"
		},
		{
			"heading": "scalar-types",
			"content": "UUID"
		},
		{
			"heading": "scalar-types",
			"content": "Universally unique identifier"
		},
		{
			"heading": "scalar-types",
			"content": "> \\[!NOTE]\n> `f.json<{ readingTime: number }>()` accepts a type parameter so parsed JSON is fully typed in queries, handlers, and the client."
		},
		{
			"heading": "specialized-types",
			"content": "Type"
		},
		{
			"heading": "specialized-types",
			"content": "Description"
		},
		{
			"heading": "specialized-types",
			"content": "`f.currency()`"
		},
		{
			"heading": "specialized-types",
			"content": "Decimal with currency formatting"
		},
		{
			"heading": "specialized-types",
			"content": "`f.geoPoint()`"
		},
		{
			"heading": "specialized-types",
			"content": "Latitude/longitude"
		},
		{
			"heading": "specialized-types",
			"content": "`f.geoLineString()`"
		},
		{
			"heading": "specialized-types",
			"content": "GeoJSON line"
		},
		{
			"heading": "specialized-types",
			"content": "`f.geoPolygon()`"
		},
		{
			"heading": "specialized-types",
			"content": "GeoJSON polygon"
		},
		{
			"heading": "specialized-types",
			"content": "`f.email()`"
		},
		{
			"heading": "specialized-types",
			"content": "Email validation"
		},
		{
			"heading": "specialized-types",
			"content": "`f.url()`"
		},
		{
			"heading": "specialized-types",
			"content": "URL validation"
		},
		{
			"heading": "specialized-types",
			"content": "`f.phone()`"
		},
		{
			"heading": "specialized-types",
			"content": "Phone number validation"
		},
		{
			"heading": "specialized-types",
			"content": "`f.ip()`"
		},
		{
			"heading": "specialized-types",
			"content": "IPv4/IPv6"
		},
		{
			"heading": "specialized-types",
			"content": "`f.cidr()`"
		},
		{
			"heading": "specialized-types",
			"content": "Network CIDR"
		},
		{
			"heading": "specialized-types",
			"content": "`f.color()`"
		},
		{
			"heading": "specialized-types",
			"content": "Hex color"
		},
		{
			"heading": "specialized-types",
			"content": "`f.slug()`"
		},
		{
			"heading": "specialized-types",
			"content": "URL-safe slug"
		},
		{
			"heading": "specialized-types",
			"content": "`f.regex()`"
		},
		{
			"heading": "specialized-types",
			"content": "Pattern-matched string"
		},
		{
			"heading": "specialized-types",
			"content": "`f.file()`"
		},
		{
			"heading": "specialized-types",
			"content": "File upload reference"
		},
		{
			"heading": "specialized-types",
			"content": "`f.image()`"
		},
		{
			"heading": "specialized-types",
			"content": "Image with dimensions"
		},
		{
			"heading": "specialized-types",
			"content": "`f.object()`"
		},
		{
			"heading": "specialized-types",
			"content": "JSON object"
		},
		{
			"heading": "specialized-types",
			"content": "`f.array()`"
		},
		{
			"heading": "specialized-types",
			"content": "Array of typed elements (`f.array(f.string())`)"
		},
		{
			"heading": "specialized-types",
			"content": "`f.map()`"
		},
		{
			"heading": "specialized-types",
			"content": "Key-value map (`f.map(f.string())`)"
		},
		{
			"heading": "specialized-types",
			"content": "`f.enumSet()`"
		},
		{
			"heading": "specialized-types",
			"content": "Set of enum values"
		},
		{
			"heading": "specialized-types",
			"content": "Specialized types are thin: they map to a standard column and add domain validation. `f.email()` is the same column as `f.string()` with an email rule attached; `f.geoPoint()` stores coordinates with the right spatial column. Typed collection fields — `f.array(f.string())`, `f.map(f.string())`, `f.json<Shape>()` — keep the inner types flowing through queries, validation, and the client."
		},
		{
			"heading": "enums-and-choices",
			"content": "`f.enum` and `f.enumSet` constrain a field to a fixed vocabulary:"
		},
		{
			"heading": "enums-and-choices",
			"content": "Type"
		},
		{
			"heading": "enums-and-choices",
			"content": "Column"
		},
		{
			"heading": "enums-and-choices",
			"content": "Semantics"
		},
		{
			"heading": "enums-and-choices",
			"content": "`f.enum(a, b, c)`"
		},
		{
			"heading": "enums-and-choices",
			"content": "Enum column"
		},
		{
			"heading": "enums-and-choices",
			"content": "Exactly one member"
		},
		{
			"heading": "enums-and-choices",
			"content": "`f.enumSet(a, b, c)`"
		},
		{
			"heading": "enums-and-choices",
			"content": "Set column"
		},
		{
			"heading": "enums-and-choices",
			"content": "Zero or more members"
		},
		{
			"heading": "enums-and-choices",
			"content": "Enum members become literal types end to end — the field type, the validation schema, the query shorthand, and the client all know the vocabulary, so `where('status', 'expired')` fails to compile. Prefer enums over bare strings for anything with a closed set of values; the compile-time check is the cheapest validation you get."
		},
		{
			"heading": "relationship-types",
			"content": "Type"
		},
		{
			"heading": "relationship-types",
			"content": "Description"
		},
		{
			"heading": "relationship-types",
			"content": "`f.belongsTo(() => Model)`"
		},
		{
			"heading": "relationship-types",
			"content": "Many-to-one"
		},
		{
			"heading": "relationship-types",
			"content": "`f.hasMany(() => Model)`"
		},
		{
			"heading": "relationship-types",
			"content": "One-to-many"
		},
		{
			"heading": "relationship-types",
			"content": "`f.hasOne(() => Model)`"
		},
		{
			"heading": "relationship-types",
			"content": "One-to-one"
		},
		{
			"heading": "relationship-types",
			"content": "`f.belongsToMany(() => Model, () => Pivot)`"
		},
		{
			"heading": "relationship-types",
			"content": "Many-to-many with optional pivot model"
		},
		{
			"heading": "relationship-types",
			"content": "`f.morphTo()`"
		},
		{
			"heading": "relationship-types",
			"content": "Polymorphic owner"
		},
		{
			"heading": "relationship-types",
			"content": "`f.morphMany(() => Model)`"
		},
		{
			"heading": "relationship-types",
			"content": "Polymorphic many"
		},
		{
			"heading": "relationship-types",
			"content": "`f.morphOne(() => Model)`"
		},
		{
			"heading": "relationship-types",
			"content": "Polymorphic single"
		},
		{
			"heading": "relationship-types",
			"content": "`f.morphToMany(() => Model)`"
		},
		{
			"heading": "relationship-types",
			"content": "Polymorphic many-to-many"
		},
		{
			"heading": "relationship-types",
			"content": "`f.foreignId('users').references('id')`"
		},
		{
			"heading": "relationship-types",
			"content": "Explicit foreign key column"
		},
		{
			"heading": "relationship-types",
			"content": "Relations use **lazy references** (`() => Model`) so models compose without circular imports. See Relations for loading, pivots, and cascade behavior."
		},
		{
			"heading": "common-modifiers",
			"content": "Modifiers are chained on any field and are typechecked against it — `f.integer().step(0.01)` compiles, `f.string().step(0.01)` does not:"
		},
		{
			"heading": "common-modifiers",
			"content": "Modifier"
		},
		{
			"heading": "common-modifiers",
			"content": "Effect"
		},
		{
			"heading": "common-modifiers",
			"content": "`.optional()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Field may be absent in input; no database `NOT NULL`"
		},
		{
			"heading": "common-modifiers",
			"content": "`.required()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Field must be present"
		},
		{
			"heading": "common-modifiers",
			"content": "`.nullable()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Database column allows `NULL`"
		},
		{
			"heading": "common-modifiers",
			"content": "`.default(value)`"
		},
		{
			"heading": "common-modifiers",
			"content": "Default applied at the database and on create"
		},
		{
			"heading": "common-modifiers",
			"content": "`.indexed()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Single-column index"
		},
		{
			"heading": "common-modifiers",
			"content": "`.unique()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Unique constraint on the column"
		},
		{
			"heading": "common-modifiers",
			"content": "`.validation(s => ...)`"
		},
		{
			"heading": "common-modifiers",
			"content": "Standard Schema rule for the field"
		},
		{
			"heading": "common-modifiers",
			"content": "`.searchable()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Opts the field into full-text search"
		},
		{
			"heading": "common-modifiers",
			"content": "`.orderable()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Allows ordering by this field in list queries"
		},
		{
			"heading": "common-modifiers",
			"content": "`.hidden()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Excluded from API responses"
		},
		{
			"heading": "common-modifiers",
			"content": "`.readonly()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Accepted on create, ignored on update"
		},
		{
			"heading": "common-modifiers",
			"content": "`.fillable()` / `.guarded()`"
		},
		{
			"heading": "common-modifiers",
			"content": "Mass-assignment control"
		},
		{
			"heading": "common-modifiers",
			"content": "`.comment(text)`"
		},
		{
			"heading": "common-modifiers",
			"content": "Column comment exported to the schema"
		},
		{
			"heading": "common-modifiers",
			"content": "`.generatedAs(expr)`"
		},
		{
			"heading": "common-modifiers",
			"content": "Generated column backed by an expression"
		},
		{
			"heading": "common-modifiers",
			"content": "Numeric and string types add constraint modifiers: `f.string().min(1).max(200)`, `f.integer().min(0).max(1_000_000)`, `f.float().step(0.01)`."
		},
		{
			"heading": "validation-integration",
			"content": "`validation()` compiles the field rule into the request schema for generated routes, and into the same schema used by the client and Studio:"
		},
		{
			"heading": "validation-integration",
			"content": "The rule callback receives a Standard Schema builder and returns a constraint set. The default validator is Valibot; the implementation is switchable in `src/config/app.ts` under the `validator` key — see Validation."
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "Three ways to produce a value for a field:"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "Mechanism"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "When it runs"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "Example"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "`.default(value)`"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "At insert, database or model level"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "`f.enum('draft', 'published').default('draft')`"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "`.computed((row) => ...)`"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "On read, derived and read-only"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "`f.string().computed((r) => fullName(r))`"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "`.mutator((val) => ...)`"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "Before persist, transforms input"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "`f.string().mutator((v) => hash(v, 'argon2id'))`"
		},
		{
			"heading": "defaults-computed-and-mutators",
			"content": "Defaults are validated against the field type, computed fields never hit the database, and mutators run before hooks and before insert so every derived value is consistent."
		},
		{
			"heading": "whats-next",
			"content": "Models — how fields compose into a `defineModel`"
		},
		{
			"heading": "whats-next",
			"content": "Relations — relationship fields and loading"
		},
		{
			"heading": "whats-next",
			"content": "Validation — rules, Standard Schema, and custom rules"
		},
		{
			"heading": "whats-next",
			"content": "Your First Model — using fields in practice"
		}
	],
	"headings": [
		{
			"id": "identity",
			"content": "Identity"
		},
		{
			"id": "scalar-types",
			"content": "Scalar Types"
		},
		{
			"id": "specialized-types",
			"content": "Specialized Types"
		},
		{
			"id": "enums-and-choices",
			"content": "Enums and Choices"
		},
		{
			"id": "relationship-types",
			"content": "Relationship Types"
		},
		{
			"id": "common-modifiers",
			"content": "Common Modifiers"
		},
		{
			"id": "validation-integration",
			"content": "Validation Integration"
		},
		{
			"id": "defaults-computed-and-mutators",
			"content": "Defaults, Computed, and Mutators"
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
		url: "#identity",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Identity" })
	},
	{
		depth: 2,
		url: "#scalar-types",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Scalar Types" })
	},
	{
		depth: 2,
		url: "#specialized-types",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Specialized Types" })
	},
	{
		depth: 2,
		url: "#enums-and-choices",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Enums and Choices" })
	},
	{
		depth: 2,
		url: "#relationship-types",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Relationship Types" })
	},
	{
		depth: 2,
		url: "#common-modifiers",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Common Modifiers" })
	},
	{
		depth: 2,
		url: "#validation-integration",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Validation Integration" })
	},
	{
		depth: 2,
		url: "#defaults-computed-and-mutators",
		title: (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: "Defaults, Computed, and Mutators" })
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
		blockquote: "blockquote",
		code: "code",
		h2: "h2",
		li: "li",
		ol: "ol",
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
		...props.components
	};
	return (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Fields are how you describe every attribute, constraint, and behavior of a resource. Kwiva uses a ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "function-based DSL" }),
			" rather than classes: each field is started by a type constructor like ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string()" }),
			" and refined by chaining typed modifiers such as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".optional()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".default()" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".indexed()" }),
			", and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".validation()" }),
			". The assembled chain drives three things at once — the TypeScript type, the validation schema, and the database column — so a field can never be typed one way and validated another."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every field flows through the same pipeline:" }),
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
			title: "fields-dsl.txt",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: (0, import_jsx_runtime_react_server.jsx)(_components.span, {
				className: "line",
				children: (0, import_jsx_runtime_react_server.jsx)(_components.span, { children: "Field definition → Type resolution → Modifier chain → Validation schema → Database column" })
			}) })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "identity",
			children: "Identity"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Every model needs a primary key. The default is a UUID primary key, with an autoincrement option:" }),
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
			title: "identity.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),                        "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// uuid pk by default"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "id"
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
							children: "'autoincrement'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "),          "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6A737D",
								"--shiki-dark": "#6A737D"
							},
							children: "// integer autoincrement pk"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "scalar-types",
			children: "Scalar Types"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Database" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "VARCHAR" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Text string" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.text()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "TEXT" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Long-form text" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.integer()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "INTEGER" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Whole numbers" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.float()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "FLOAT" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Decimal numbers" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.boolean()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "BOOLEAN" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "True/false" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.timestamp()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "TIMESTAMP" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Date-time with timezone" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.datetime()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "DATETIME" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Date-time without timezone" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.date()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "DATE" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Calendar date" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.json()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "JSON" }),
				(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
					"JSON object (typed via ",
					(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.json<T>()" }),
					")"
				] })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.jsonb()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "JSONB" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Binary JSON" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.binary()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "BLOB" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Binary data" })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.uuid()" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "UUID" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Universally unique identifier" })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.blockquote, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
				"[!NOTE]\n",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.json<{ readingTime: number }>()" }),
				" accepts a type parameter so parsed JSON is fully typed in queries, handlers, and the client."
			] }),
			"\n"
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "specialized-types",
			children: "Specialized Types"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.currency()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Decimal with currency formatting" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.geoPoint()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Latitude/longitude" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.geoLineString()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "GeoJSON line" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.geoPolygon()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "GeoJSON polygon" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.email()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Email validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.url()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "URL validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.phone()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Phone number validation" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.ip()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "IPv4/IPv6" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.cidr()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Network CIDR" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.color()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Hex color" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.slug()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "URL-safe slug" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.regex()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Pattern-matched string" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.file()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "File upload reference" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.image()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Image with dimensions" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.object()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "JSON object" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.array()" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Array of typed elements (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.array(f.string())" }),
				")"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.map()" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				"Key-value map (",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.map(f.string())" }),
				")"
			] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.enumSet()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Set of enum values" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Specialized types are thin: they map to a standard column and add domain validation. ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.email()" }),
			" is the same column as ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string()" }),
			" with an email rule attached; ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.geoPoint()" }),
			" stores coordinates with the right spatial column. Typed collection fields — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.array(f.string())" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.map(f.string())" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.json<Shape>()" }),
			" — keep the inner types flowing through queries, validation, and the client."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "enums-and-choices",
			children: "Enums and Choices"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.enum" }),
			" and ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.enumSet" }),
			" constrain a field to a fixed vocabulary:"
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
			title: "enums-and-choices.ts",
			icon: "<svg viewBox=\"0 0 24 24\"><path d=\"M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z\" fill=\"currentColor\" /></svg>",
			children: (0, import_jsx_runtime_react_server.jsxs)(_components.code, { children: [
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "status"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enum"
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
							children: "'draft'"
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
							children: "'published'"
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
							children: "'archived'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "default"
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
							children: "'draft'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "indexed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
						})
					]
				}),
				"\n",
				(0, import_jsx_runtime_react_server.jsxs)(_components.span, {
					className: "line",
					children: [
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "labels"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ": f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "enumSet"
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
							children: "'red'"
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
							children: "'green'"
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
							children: "'blue'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "optional"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(),"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Column" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Semantics" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.enum(a, b, c)" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Enum column" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Exactly one member" })
		] }), (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.enumSet(a, b, c)" }) }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Set column" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Zero or more members" })
		] })] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Enum members become literal types end to end — the field type, the validation schema, the query shorthand, and the client all know the vocabulary, so ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "where('status', 'expired')" }),
			" fails to compile. Prefer enums over bare strings for anything with a closed set of values; the compile-time check is the cheapest validation you get."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "relationship-types",
			children: "Relationship Types"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Type" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Description" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.belongsTo(() => Model)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Many-to-one" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.hasMany(() => Model)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One-to-many" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.hasOne(() => Model)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "One-to-one" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.belongsToMany(() => Model, () => Pivot)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Many-to-many with optional pivot model" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.morphTo()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Polymorphic owner" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.morphMany(() => Model)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Polymorphic many" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.morphOne(() => Model)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Polymorphic single" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.morphToMany(() => Model)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Polymorphic many-to-many" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.foreignId('users').references('id')" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Explicit foreign key column" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Relations use ",
			(0, import_jsx_runtime_react_server.jsx)(_components.strong, { children: "lazy references" }),
			" (",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "() => Model" }),
			") so models compose without circular imports. See ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/relations",
				children: "Relations"
			}),
			" for loading, pivots, and cascade behavior."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "common-modifiers",
			children: "Common Modifiers"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Modifiers are chained on any field and are typechecked against it — ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.integer().step(0.01)" }),
			" compiles, ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string().step(0.01)" }),
			" does not:"
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
			title: "common-modifiers.ts",
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
							children: "f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "string"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "optional"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "default"
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
							children: "'draft'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "indexed"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "unique"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "nullable"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
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
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "validation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "s"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "min"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "max"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "200"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "))."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "searchable"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "orderable"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
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
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "hidden"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "readonly"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "required"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "fillable"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "guarded"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()"
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
							children: "  ."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "comment"
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
							children: "'Brief description'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "generatedAs"
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
							children: "'computed'"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Modifier" }), (0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Effect" })] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".optional()" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Field may be absent in input; no database ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NOT NULL" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".required()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Field must be present" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".nullable()" }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: ["Database column allows ", (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "NULL" })] })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".default(value)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Default applied at the database and on create" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".indexed()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Single-column index" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".unique()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Unique constraint on the column" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".validation(s => ...)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Standard Schema rule for the field" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".searchable()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Opts the field into full-text search" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".orderable()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Allows ordering by this field in list queries" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".hidden()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Excluded from API responses" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".readonly()" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Accepted on create, ignored on update" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsxs)(_components.td, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".fillable()" }),
				" / ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".guarded()" })
			] }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Mass-assignment control" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".comment(text)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Column comment exported to the schema" })] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".generatedAs(expr)" }) }), (0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Generated column backed by an expression" })] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"Numeric and string types add constraint modifiers: ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string().min(1).max(200)" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.integer().min(0).max(1_000_000)" }),
			", ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.float().step(0.01)" }),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "validation-integration",
			children: "Validation Integration"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validation()" }), " compiles the field rule into the request schema for generated routes, and into the same schema used by the client and Studio:"] }),
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
			title: "validation-integration.ts",
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
							children: "f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "string"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "validation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "s"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "min"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "max"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "200"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "))"
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
							children: "f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "email"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "validation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "s"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "email"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "())"
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
							children: "f."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "integer"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "()."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "validation"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "(("
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#E36209",
								"--shiki-dark": "#FFAB70"
							},
							children: "s"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ") "
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#D73A49",
								"--shiki-dark": "#F97583"
							},
							children: "=>"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: " s."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "min"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "0"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: ")."
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#6F42C1",
								"--shiki-dark": "#B392F0"
							},
							children: "max"
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
								"--shiki-light": "#005CC5",
								"--shiki-dark": "#79B8FF"
							},
							children: "1000000"
						}),
						(0, import_jsx_runtime_react_server.jsx)(_components.span, {
							style: {
								"--shiki-light": "#24292E",
								"--shiki-dark": "#E1E4E8"
							},
							children: "))"
						})
					]
				})
			] })
		}) }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.p, { children: [
			"The rule callback receives a Standard Schema builder and returns a constraint set. The default validator is Valibot; the implementation is switchable in ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "src/config/app.ts" }),
			" under the ",
			(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "validator" }),
			" key — see ",
			(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/validation",
				children: "Validation"
			}),
			"."
		] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "defaults-computed-and-mutators",
			children: "Defaults, Computed, and Mutators"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Three ways to produce a value for a field:" }),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.table, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.thead, { children: (0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Mechanism" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "When it runs" }),
			(0, import_jsx_runtime_react_server.jsx)(_components.th, { children: "Example" })
		] }) }), (0, import_jsx_runtime_react_server.jsxs)(_components.tbody, { children: [
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".default(value)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "At insert, database or model level" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.enum('draft', 'published').default('draft')" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".computed((row) => ...)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "On read, derived and read-only" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string().computed((r) => fullName(r))" }) })
			] }),
			(0, import_jsx_runtime_react_server.jsxs)(_components.tr, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: ".mutator((val) => ...)" }) }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: "Before persist, transforms input" }),
				(0, import_jsx_runtime_react_server.jsx)(_components.td, { children: (0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "f.string().mutator((v) => hash(v, 'argon2id'))" }) })
			] })
		] })] }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.p, { children: "Defaults are validated against the field type, computed fields never hit the database, and mutators run before hooks and before insert so every derived value is consistent." }),
		"\n",
		(0, import_jsx_runtime_react_server.jsx)(_components.h2, {
			id: "whats-next",
			children: "What's Next"
		}),
		"\n",
		(0, import_jsx_runtime_react_server.jsxs)(_components.ol, { children: [
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [
				(0, import_jsx_runtime_react_server.jsx)(_components.a, {
					href: "/docs/data/models",
					children: "Models"
				}),
				" — how fields compose into a ",
				(0, import_jsx_runtime_react_server.jsx)(_components.code, { children: "defineModel" })
			] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/relations",
				children: "Relations"
			}), " — relationship fields and loading"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/data/validation",
				children: "Validation"
			}), " — rules, Standard Schema, and custom rules"] }),
			"\n",
			(0, import_jsx_runtime_react_server.jsxs)(_components.li, { children: [(0, import_jsx_runtime_react_server.jsx)(_components.a, {
				href: "/docs/getting-started/first-model",
				children: "Your First Model"
			}), " — using fields in practice"] }),
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
