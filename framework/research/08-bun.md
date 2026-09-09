# Research — Bun

**Source**: bun docs + ecosystem 2026-09-08; part of Anthropic since 2025
**Relevance**: Kwiva primary runtime (ADR-0007)

## Position

Bun is a fast JavaScript runtime (WebKit JavaScriptCore), package manager, test runner, and bundler in one binary. Post-2025 Bun is part of **Anthropic** — funding stability improved, roadmap continuity watched.

## Capabilities Kwiva Relies On

- **Native TS/TSX execution** — no dev compile step; the `kwiva dev` server executes app sources directly.
- **`Bun.serve`**, with routes + `fetch` handler; powers the dev server and the `bun-server` engine preset.
- **`Bun.build`** incl. `--compile` → **single-file executables** (2-3x memory reduction when used for servers, zero-runtime artifacts) — the `standalone` mode artifact.
- **Built-ins**: `Bun.sql` (Postgres/SQLite), `Bun.redis`, `Bun.S3Client`, `Bun.password` (argon2/bcrypt/scrypt), `Bun.file`, `Bun.shell`.
- **Web-standard APIs**: `Request`/`Response`/`WebSocket`/`fetch` — same shapes the owned HTTP pipeline and Nitro expect.
- **Package manager**: lockfile `bun.lock`, workspaces (the monorepo package manager), `bun install --production`.
- **Test runner**: `bun test` — the runner for `@kwiva/testing` (unit + integration).
- **Cluster/SO_REUSEPORT**: multi-instance listening on one port (Linux) — `kwiva build --preset bun` + cluster mode (v1.x).
- **Node compat**: runs npm packages; `node:` module support via unenv where presets need it.

## Kwiva Usage

| Concern | Bun feature |
|---|---|
| Dev runtime | `kwiva dev` (Bun.serve + oxc resolver/transformer) |
| Prod server | Nitro `bun-server` preset (or `node_server` for portability) |
| Single-binary deploy | `kwiva build --binary` → `bun build --compile` (distroless-ready artifact) |
| Testing | `bun test` via `@kwiva/testing`; Playwright for e2e |
| Native connectors | `Bun.sql` fast path in the data engine; `Bun.redis`/`Bun.S3Client` for queue/storage/cache backends |
| Workspaces | monorepo package management (`packages/*`) |

## Constraints & Caveats

- **Edge**: Bun runtime not available on Vercel/CF edge — those presets use their native runtime; Kwiva apps stay web-standard so code is portable (constraint set in `06-adapter-matrix.md`).
- **AVX2**: single-binary target requires AVX2-capable hosts (documented in deploy guide).
- **Windows support**: runtime works but `--compile` targets limited (no `bun-windows-arm64`); ARM64 mac uses x64 emulation on some versions — check target matrix.
- **Ecosystem drift**: some libs assume Node; unenv + `node:false` preset handles most; the owned HTTP layer and CrossWS are Bun-first.

## Version Pinning

Kwiva supports Bun ≥1.4. Project `engines.bun` pinned; the CLI manages runtime checks (`kwiva doctor`, v1.x); CI uses the same Bun version. Runtime management is Bun-native (Vite+ `vp env` is reference-only — ADR-0021).
