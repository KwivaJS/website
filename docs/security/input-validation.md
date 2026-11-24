# Input Validation (/docs/security/input-validation)



# Input Validation [#input-validation]

Validation happens at three layers:

1. **Field DSL** (write-time): `.validation(v => v)` via Standard Schema — errors → `ValidationError` with `fields`
2. **Route-level** (read-time): `api.post(path, handler, { input: {body, params, query, headers, cookie} })` — Standard Schema each section
3. **Contracts**: `defineContract({request, response})`

## `parsePart(part, schema, value)` [#parsepartpart-schema-value]

Throws `VALIDATION` 422 on failure; `validateStandard(schema, value)` for direct use.

## Field map DSL (`validateStandard`) [#field-map-dsl-validatestandard]

Alternate map: `{title: StringSchema, status: {oneOf: [...]}}` — more verbose.

## Examples [#examples]

```ts
import { ValidationError, validateStandard } from "@kwiva/core";

const res = await validateStandard({name: StringSchema}, {name: ""});
if (!res.success) throw new ValidationError(422, res.issues);
```

> \[!TIP]
> For custom rules: `validateStandard(schema, value)` + `issuesToFields`.
