# Multi-Tenancy (/docs/tenancy)



# Multi-Tenancy [#multi-tenancy]

Kwiva has tenancy-first data access: models, queries, storage, and events are automatically scoped to a tenant.

## Layer diagram [#layer-diagram]

```
ALS tenant (context) → @kwiva/data (auto-scoping) → @kwiva/storage (prefix)
                                              ↓
                                      @kwiva/jobs + cache: tenant-scoped
```

## Entry points [#entry-points]

| Topic                 | Page                                         |
| --------------------- | -------------------------------------------- |
| Tenancy Configuration | [Configuration](/docs/tenancy/configuration) |
| Tenant Resolution     | [Resolution](/docs/tenancy/resolution)       |
| Scoping               | [Scoping](/docs/tenancy/scoping)             |
| Isolation             | [Isolation](/docs/tenancy/isolation)         |
