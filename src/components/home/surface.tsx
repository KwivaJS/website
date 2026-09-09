"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface Feature {
  name: string;
  desc: string;
}

interface Category {
  id: string;
  label: string;
  blurb: string;
  features: Feature[];
  href?: string;
  hrefLabel?: string;
}

const CATEGORIES: Category[] = [
  {
    id: "build",
    label: "Build",
    blurb: "The common path, shipped in minutes",
    features: [
      { name: "Models & migrations", desc: "One defineModel derives schema, migrations and seeders." },
      { name: "REST APIs", desc: "Five typed routes per model, registered automatically." },
      { name: "Typed RPC client", desc: "Eden-style client SDK generated from controller IR." },
      { name: "Pages & routing", desc: "File-based routes, loaders, streaming SSR." },
      { name: "Services & modules", desc: "Typed injection and composable defineModule units." },
    ],
    href: "/docs/getting-started/first-model",
    hrefLabel: "Write your first model",
  },
  {
    id: "secure",
    label: "Secure",
    blurb: "Protection as a first-class layer",
    features: [
      { name: "Authentication", desc: "Sessions, OAuth and passkeys behind defineAuth." },
      { name: "Policies", desc: "Declarative, model-scoped rules via definePolicy." },
      { name: "Tenancy-first data", desc: "Tenant isolation enforced in the data layer (ADR-0015)." },
      { name: "Security middleware", desc: "Request-level guards wired into the HTTP pipeline." },
    ],
    href: "/docs/core-concepts",
    hrefLabel: "Core concepts",
  },
  {
    id: "scale",
    label: "Scale",
    blurb: "Stateless by construction",
    features: [
      { name: "Layered caching", desc: "Route rules → model cache → client cache, with tags." },
      { name: "Durable queues", desc: "defineJob with workers, retries, backoff, DLQ." },
      { name: "Scheduled tasks", desc: "defineTask cron with scheduler controls." },
      { name: "Realtime channels", desc: "WebSockets via CrossWS, with broadcasting." },
    ],
  },
  {
    id: "operate",
    label: "Operate",
    blurb: "Observable, testable, deployable",
    features: [
      { name: "Structured logging", desc: "Correlated request ids across the pipeline." },
      { name: "OTel tracing", desc: "Spans and metrics built in (ADR-0014)." },
      { name: "Testing harness", desc: "App-level test kit with fixtures on bun test." },
      { name: "Migrations", desc: "Versioned DDL derived from model IR." },
      { name: "Deploy presets", desc: "Eight targets from one codebase." },
    ],
  },
  {
    id: "extend",
    label: "Extend",
    blurb: "The framework stays out of your way",
    features: [
      { name: "Plugins", desc: "Hook into boot, routes and configuration." },
      { name: "Modules", desc: "Encapsulated features with dependency wiring." },
      { name: "Custom routes", desc: "Infrastructure endpoints via defineServerRoute." },
      { name: "Adapters", desc: "Runtime and storage presets without code changes." },
    ],
    href: "/docs/core-concepts/definex",
    hrefLabel: "The defineX convention",
  },
];

export function CapabilitySurface() {
  const [active, setActive] = useState("build");
  const cat = CATEGORIES.find((c) => c.id === active) ?? CATEGORIES[0];
  if (!cat) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Category rail */}
      <div role="tablist" aria-label="Capability categories" className="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-1">
        {CATEGORIES.map((c, i) => {
          const on = c.id === cat.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(c.id)}
              className={`group flex flex-1 items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 lg:flex-none ${
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
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${on ? "text-fd-foreground" : "text-fd-foreground/80"}`}>
                  {c.label}
                </span>
                <span className="hidden truncate text-[11px] text-fd-muted-foreground lg:block">{c.blurb}</span>
              </span>
              <span
                className={`font-mono text-[10px] ${on ? "text-kwiva-600 dark:text-kwiva-300" : "text-fd-muted-foreground/60"}`}
              >
                {c.features.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feature list */}
      <div className="overflow-hidden rounded-lg border border-fd-border bg-fd-background">
        <div className="flex items-center justify-between gap-3 border-b border-fd-border bg-fd-secondary/40 px-5 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fd-muted-foreground">
            {cat.label.toLowerCase()} · {cat.features.length} capabilities
          </p>
          {cat.href ? (
            <a
              href={cat.href}
              className="group inline-flex items-center gap-1 font-mono text-[11px] font-medium text-kwiva-600 transition-colors hover:text-kwiva-700 dark:text-kwiva-400 dark:hover:text-kwiva-300"
            >
              {cat.hrefLabel}
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ) : null}
        </div>
        <ul className="divide-y divide-fd-border/70">
          {cat.features.map((f) => (
            <li key={f.name} className="group flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-fd-accent/40 sm:flex-row sm:items-baseline sm:gap-5">
              <span className="w-44 shrink-0 font-mono text-[12.5px] font-medium text-fd-foreground">
                {f.name}
              </span>
              <span className="text-[13px] leading-relaxed text-fd-muted-foreground">{f.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
