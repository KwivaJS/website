# Tenant Isolation (/docs/tenancy/isolation)



# Tenant Isolation [#tenant-isolation]

Tenancy propagates to:

| Subsystem | How                                       |
| --------- | ----------------------------------------- |
| Storage   | prefix scoping (`storage.disk().qualify`) |
| Cache     | `currentTenant()` prefix in key           |
| Queue     | per-tenant queues                         |
| Session   | via cookie                                |
| Broadcast | channelFor by tenant                      |
| Audit     | via `tenantField` in model options        |

## Notes [#notes]

* Multi-instance: no cross-instance leakage via Redis-backed cache/store-redis.

> \[!TIP]
> One codebase — many tenants — kwiva dev.
