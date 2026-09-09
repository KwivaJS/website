# quiva-docs

Official documentation portal for the [Kwiva](https://github.com/kwiva-js/kwiva) framework — the batteries-included TypeScript application framework.

Built with [Fumapress](https://press.fumadocs.dev) + [Fumadocs](https://fumadocs.dev), React 19, Tailwind CSS v4, Vite, and Bun.

## Content

The site is organized into five content collections under `content/`:

| Collection      | Directory                | Route          |
| --------------- | ------------------------ | -------------- |
| Documentation   | `content/docs/`          | `/docs`        |
| Guides          | `content/guides/`        | `/guides`      |
| Architecture    | `content/architecture/`  | `/architecture`|
| API reference   | `content/api/`           | `/api`         |
| Blog            | `content/blog/`          | `/blog`        |

Collection wiring, layout switching, SEO metadata, and plugins (sitemap, RSS, llms.txt, AI chat, MCP, feedback, link validation) live in `press.config.tsx`. Global styles and the Kwiva design system are in `src/app.css`, and custom routes (homepage, 404) under `src/pages/`.

## Development

```sh
bun install
bun run dev      # dev server on http://localhost:4000
bun run build    # production build
bun run start    # serve the production build
bun run types:check
```

## Ask AI

The docs site ships with an AI assistant (`@fumapress/ai`) that answers questions grounded in the documentation. Set the `OPENROUTER_API_KEY` environment variable (`.env.local`) for it to work.