"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Braces,
  Database,
  Globe,
  Package,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { CopyButton } from "./interactive";

export type FactoryGroup = "data" | "http" | "app" | "domain" | "ops" | "ui" | "ai";

export interface FactoryItem {
  name: string;
  purpose: string;
  pkg: string;
  group: FactoryGroup;
  href: string;
  snippet: string;
  file?: string;
  derives?: string[];
}

const GROUP_META: Record<FactoryGroup, { label: string; icon: LucideIcon }> = {
  data: { label: "Data", icon: Database },
  http: { label: "HTTP", icon: Globe },
  app: { label: "App", icon: Package },
  domain: { label: "Domain", icon: ShieldCheck },
  ops: { label: "Ops", icon: Workflow },
  ui: { label: "UI", icon: Braces },
  ai: { label: "AI", icon: Sparkles },
};

export function DefinexExplorer({ factories }: { factories: FactoryItem[] }) {
  const [filter, setFilter] = useState<FactoryGroup | "all">("all");
  const visible = useMemo(
    () => (filter === "all" ? factories : factories.filter((f) => f.group === filter)),
    [factories, filter]
  );
  const [active, setActive] = useState<string>(factories[0]?.name ?? "");
  const selected =
    factories.find((f) => f.name === active && (filter === "all" || f.group === filter)) ??
    visible[0] ??
    factories[0];

  const selectGroup = (group: FactoryGroup | "all") => {
    setFilter(group);
    const next = group === "all" ? factories : factories.filter((f) => f.group === group);
    if (next[0]) setActive(next[0].name);
  };

  return (
    <div className="kw-panel overflow-hidden rounded-lg border border-fd-border bg-fd-card/40">
      {/* Group filter */}
      <div
        role="group"
        aria-label="Filter factories by group"
        className="flex flex-wrap items-center gap-1.5 border-b border-fd-border bg-fd-background/60 px-4 py-3"
      >
        <button
          type="button"
          onClick={() => selectGroup("all")}
          aria-pressed={filter === "all"}
          className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 ${
            filter === "all"
              ? "border-kwiva-500 bg-kwiva-500/10 text-kwiva-700 dark:text-kwiva-300"
              : "border-fd-border text-fd-muted-foreground hover:border-kwiva-500/40 hover:text-fd-foreground"
          }`}
        >
          all <span className="opacity-60">{factories.length}</span>
        </button>
        {(Object.keys(GROUP_META) as FactoryGroup[]).map((group) => {
          const meta = GROUP_META[group];
          const count = factories.filter((f) => f.group === group).length;
          const Icon = meta.icon;
          return (
            <button
              key={group}
              type="button"
              onClick={() => selectGroup(group)}
              aria-pressed={filter === group}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 ${
                filter === group
                  ? "border-kwiva-500 bg-kwiva-500/10 text-kwiva-700 dark:text-kwiva-300"
                  : "border-fd-border text-fd-muted-foreground hover:border-kwiva-500/40 hover:text-fd-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {meta.label.toLowerCase()} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr]">
        {/* Factory list */}
        <div className="max-h-72 overflow-y-auto border-b border-fd-border p-2 lg:max-h-[32rem] lg:border-b-0 lg:border-r">
          <ul className="space-y-0.5">
            {visible.map((f, i) => {
              const isActive = f.name === selected?.name;
              return (
                <li key={f.name}>
                  <button
                    type="button"
                    onClick={() => setActive(f.name)}
                    aria-pressed={isActive}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 ${
                      isActive
                        ? "bg-kwiva-500/10 ring-1 ring-inset ring-kwiva-500/40"
                        : "hover:bg-fd-accent/60"
                    }`}
                  >
                    <span
                      className={`w-5 shrink-0 font-mono text-[10px] ${
                        isActive ? "text-kwiva-600 dark:text-kwiva-300" : "text-fd-muted-foreground/50"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-mono text-[13px] font-medium ${
                          isActive ? "text-kwiva-700 dark:text-kwiva-300" : "text-fd-foreground/85"
                        }`}
                      >
                        {f.name}
                      </span>
                      <span className="block truncate text-[11px] text-fd-muted-foreground">
                        {f.purpose.split("—")[0]?.trim()}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail panel */}
        {selected ? <FactoryDetail factory={selected} /> : null}
      </div>
    </div>
  );
}

function FactoryDetail({ factory }: { factory: FactoryItem }) {
  const title: ReactNode = factory.file ?? factory.pkg;
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4">
        <div className="min-w-0">
          <p className="font-mono text-[17px] font-semibold text-kwiva-700 dark:text-kwiva-300">
            {factory.name}
          </p>
          <p className="mt-1 max-w-md text-[13px] leading-relaxed text-fd-muted-foreground">
            {factory.purpose}
          </p>
        </div>
        <a
          href={factory.href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-xs font-medium text-fd-foreground transition-colors hover:border-kwiva-500/50 hover:bg-fd-accent"
        >
          docs
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>

      <div className="mx-5 mb-4 overflow-hidden rounded-md border border-fd-border bg-fd-background">
        <div className="flex items-center justify-between gap-3 border-b border-fd-border bg-fd-secondary/40 px-4 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-kwiva-500" />
            <span className="truncate font-mono text-[11px] text-fd-muted-foreground">{title}</span>
          </div>
          <CopyButton value={factory.snippet} />
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-fd-foreground/90">
          <code>{factory.snippet}</code>
        </pre>
        {factory.derives ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-dashed border-fd-border px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fd-muted-foreground">
              {factory.pkg}
            </span>
            <span className="text-fd-border">→</span>
            {factory.derives.map((d) => (
              <span
                key={d}
                className="rounded border border-fd-border bg-fd-secondary/50 px-1.5 py-0.5 font-mono text-[10.5px] text-fd-muted-foreground"
              >
                {d}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
