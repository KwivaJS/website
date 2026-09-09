"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Box,
  Cpu,
  GitBranch,
  Layers,
  Rocket,
  type LucideIcon,
} from "lucide-react";

interface Layer {
  n: string;
  icon: LucideIcon;
  title: string;
  tag: string;
  desc: string;
  members: string[];
  rule: string;
  href: string;
  hrefLabel: string;
}

const LAYERS: Layer[] = [
  {
    n: "01",
    icon: Box,
    title: "Application",
    tag: "src/ — your code",
    desc: "A lowercase, Laravel-shaped filesystem: models, http controllers, services, jobs, events, console, routes, config. Application code writes defineX() only and imports only @kwiva/*.",
    members: ["models", "controllers", "pages", "services", "jobs", "policies", "config"],
    rule: "Engine imports are blocked by an oxlint lint gate — no-engine-imports.",
    href: "/docs/core-concepts",
    hrefLabel: "Core concepts",
  },
  {
    n: "02",
    icon: Layers,
    title: "Framework API",
    tag: "@kwiva/* — 17 packages",
    desc: "One coherent, framework-owned surface for every concern — data, HTTP, routing, React, auth, queue, events, Studio, MCP. The only thing your app imports.",
    members: ["core", "schema", "data", "http", "router", "react", "client", "auth", "queue", "mcp", "+7"],
    rule: "Every app-facing construct is a defineX factory (ADR-0019).",
    href: "/docs/core-concepts/definex",
    hrefLabel: "The defineX convention",
  },
  {
    n: "03",
    icon: Cpu,
    title: "Engines",
    tag: "sealed — internal",
    desc: "Proven machinery, configured by the framework and never touched by app code. Nitro carries the server, Drizzle the SQL, Better Auth the sessions, TanStack Query the client cache. The oxc toolchain (rolldown, oxlint, oxfmt) builds it all.",
    members: ["Nitro", "Drizzle", "Better Auth", "TanStack Query", "CrossWS", "unstorage", "oxc"],
    rule: "Sealed engines are implementation details — swappable, never imported.",
    href: "/architecture",
    hrefLabel: "Architecture overview",
  },
  {
    n: "04",
    icon: GitBranch,
    title: "References",
    tag: "inspire only — 0 deps",
    desc: "Elysia shapes @kwiva/http's lifecycle. TanStack Router shapes @kwiva/router's ergonomics. Vite+ shapes the CLI pipeline. Laravel shapes the app structure. Questpie shapes model derivation. None of them ship a single line of runtime code.",
    members: ["Elysia", "TanStack Router", "Vite+", "Laravel", "Questpie"],
    rule: "References shape the API design — zero runtime dependency (ADR-0016).",
    href: "/adr",
    hrefLabel: "Decision records",
  },
  {
    n: "05",
    icon: Rocket,
    title: "Runtime",
    tag: "Bun · Node · edge",
    desc: "Bun is the primary runtime — native TypeScript, fast startup, single-binary output. Node stays compatible, and edge targets arrive through Nitro presets: 8 deploy targets, no code changes.",
    members: ["Bun", "Node.js", "Cloudflare", "Vercel", "Netlify", "Lambda", "static", "binary"],
    rule: "Deploy differences stay in the engine — the app never changes.",
    href: "/docs/getting-started/first-deployment",
    hrefLabel: "Deploy guide",
  },
];

export function LayerExplorer() {
  const [active, setActive] = useState("02");
  const layer = LAYERS.find((l) => l.n === active) ?? LAYERS[1];
  if (!layer) return null;
  const Icon = layer.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Layer rail */}
      <ol role="tablist" aria-label="Architecture layers" className="flex flex-col gap-1.5">
        {LAYERS.map((l) => {
          const LIcon = l.icon;
          const on = l.n === layer.n;
          return (
            <li key={l.n}>
              <button
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(l.n)}
                className={`group flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 ${
                  on
                    ? "border-kwiva-500/60 bg-kwiva-500/8"
                    : "border-fd-border bg-fd-background hover:border-kwiva-500/35"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tracking-widest ${
                    on ? "text-kwiva-600 dark:text-kwiva-300" : "text-fd-muted-foreground"
                  }`}
                >
                  {l.n}
                </span>
                <LIcon
                  className={`size-4 shrink-0 ${on ? "text-kwiva-600 dark:text-kwiva-300" : "text-fd-muted-foreground"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${on ? "text-fd-foreground" : "text-fd-foreground/80"}`}>
                    {l.title}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-fd-muted-foreground">{l.tag}</span>
                </span>
                <span
                  className={`h-6 w-0.5 rounded-full transition-colors ${
                    on ? "bg-kwiva-500" : "bg-transparent"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ol>

      {/* Detail panel */}
      <div className="relative overflow-hidden rounded-lg border border-fd-border bg-fd-background p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-kwiva-500/60 via-kwiva-500/20 to-transparent" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md border border-kwiva-500/30 bg-kwiva-500/10 text-kwiva-600 dark:text-kwiva-300">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-fd-muted-foreground">
                LAYER {layer.n}
              </p>
              <h3 className="font-display text-xl font-bold text-fd-foreground">{layer.title}</h3>
            </div>
          </div>
          <a
            href={layer.href}
            className="group inline-flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-xs font-medium text-fd-foreground transition-colors hover:border-kwiva-500/50 hover:bg-fd-accent"
          >
            {layer.hrefLabel}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-fd-muted-foreground">{layer.desc}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {layer.members.map((m) => (
            <span
              key={m}
              className="rounded border border-fd-border bg-fd-secondary/50 px-2 py-0.5 font-mono text-[11px] text-fd-muted-foreground"
            >
              {m}
            </span>
          ))}
        </div>

        <p className="mt-6 border-t border-dashed border-fd-border pt-4 font-mono text-[12px] leading-relaxed text-kwiva-700 dark:text-kwiva-300">
          → {layer.rule}
        </p>
      </div>
    </div>
  );
}
