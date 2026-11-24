# Versioning & Compatibility (/docs/reference/versioning)



# Versioning & Compatibility [#versioning--compatibility]

## Package versions (current, 2026-11) [#package-versions-current-2026-11]

| Package                                                                                                          | Version |
| ---------------------------------------------------------------------------------------------------------------- | ------: |
| `@kwiva/core`                                                                                                    |   0.2.0 |
| `@kwiva/data`                                                                                                    |   0.2.0 |
| `@kwiva/http`                                                                                                    |   0.2.0 |
| `@kwiva/ui`                                                                                                      |   0.2.0 |
| `@kwiva/client`                                                                                                  |   0.2.0 |
| `@kwiva/auth`                                                                                                    |   0.2.0 |
| `@kwiva/jobs`                                                                                                    |   0.2.0 |
| `@kwiva/events`                                                                                                  |   0.2.0 |
| `@kwiva/mail`                                                                                                    |   0.2.0 |
| `@kwiva/mcp`                                                                                                     |   0.1.0 |
| `@kwiva/search`                                                                                                  |   0.1.0 |
| `@kwiva/storage`                                                                                                 |   0.1.0 |
| `@kwiva/testing`                                                                                                 |   0.1.0 |
| `@kwiva/cli`                                                                                                     |   0.3.0 |
| `@kwiva/auth-better-auth`, `@kwiva/jobs-pg-boss`, `@kwiva/mail-smtp`, `@kwiva/mail-resend`, `@kwiva/store-redis` |   0.0.1 |

Root workspace: `0.0.0` (private).

## Supported runtimes [#supported-runtimes]

* **Bun ≥ 1.4.0** (primary, `engines.bun`)
* **Node ≥ 20** (API-only compatibility, `import.meta.main`-free)

## Supported OS [#supported-os]

* Linux, Windows (Node), macOS — via engines + platform CI.

## Dependency policy [#dependency-policy]

* No breaking changes in public API during 0.x — minor bump for additions.
* Deprecations: tracked in [architecture](/architecture) ADRs.

> \[!TIP]
> See [implementation-status](/docs/research/implementation-status) for per-feature status.
