# REST Conventions (/docs/api/rest)



# REST Conventions [#rest-conventions]

Kwiva auto-generates REST per model (5 routes). These are the conventions.

## URL Structure [#url-structure]

```
/api/{model}         # list/create
/api/{model}/:id     # get/update/remove
```

## Methods & status [#methods--status]

| Route                        | Method    | Status       |
| ---------------------------- | --------- | ------------ |
| `GET /api/{model}`           | GET       | 200 (list)   |
| `POST /api/{model}`          | POST      | 201 (create) |
| `GET /api/{model}/:id`       | GET       | 200          |
| `PATCH/PUT /api/{model}/:id` | PATCH/PUT | 200          |
| `DELETE /api/{model}/:id`    | DELETE    | 200/204      |

## Envelope [#envelope]

```json
{
  "data": { ... },
  "pagination": { "page": 1, "size": 20, "total": 42 }
}
```

List responses: `data` is array (or `{items, cursor?}` for cursor pagination).

## Errors [#errors]

See [Errors](/docs/api/errors) — 8-code taxonomy.

## Auth [#auth]

`GET /session` for session check (via `ctx.session`); `requireAuth` on protected routes; permissions via `{resource}.{action}`.

## Model → route name [#model--route-name]

`registerModel('posts')` → `/api/posts`; `toSnakeCase(pluralize('post')) = "posts"`.
