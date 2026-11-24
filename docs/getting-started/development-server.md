# Development Server (/docs/getting-started/development-server)



# Development Server [#development-server]

`kwiva dev` builds the client bundle, writes `src/.kwiva/serve.gen.ts` (a stub server booting the app), and spawns a child process.

## Syntax [#syntax]

```bash title="terminal"
kwiva dev --port 4000
```

* `--port` default: `3000`. Invalid (non-integer or \< 1) → stderr + exit 1.
* Rebuilds client bundle on changes (client-only changes, excluding `src/.kwiva/`, rebuild without respawn).
* Full app changes spawn a new server process.
* `src/.kwiva/dist/<app>` — bumpGeneration on serve.
* Exit on SIGINT/SIGTERM → exit 0 (supervisor.stop()).

## Reload notification (SSE) [#reload-notification-sse]

The dev server emits `src/.kwiva/dist/<app>/src/app/jobs/*.ts`, `src/app/events/*.ts`, `src/app/commands/*.ts` — you can't define modules you don't import.

## Bootstrap notes [#bootstrap-notes]

* App is booted with `bun src/.kwiva/serve.gen.ts <root> <port>`.
* `kwiva dev` runs until interrupted.

> \[!TIP]
> For the app, `bootstrap/app.ts` is the entry: `export default defineApp({name})` + `await configureApp()`.
