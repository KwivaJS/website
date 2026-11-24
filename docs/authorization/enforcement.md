# Enforcement Points (/docs/authorization/enforcement)



# Enforcement Points [#enforcement-points]

Authorization is enforced at multiple layers:

| Surface          | Enforcement                              |
| ---------------- | ---------------------------------------- |
| Generated routes | `model.options.permission` via `ctx.can` |
| Controllers      | `ctx.can` / `authorize(policy, ...)`     |
| WS channels      | `channel().policy(fn)`                   |
| MCP tools        | `ability` + `ctx.can`                    |
| Seeders/tasks    | `ctx.can` ambient checks (where used)    |

> \[!TIP]
> Check at every boundary — defense in depth, not a single gate.
