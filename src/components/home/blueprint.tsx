"use client";

import { useState } from "react";
import { CopyButton } from "./interactive";

type Area = "data" | "http" | "ui" | "platform";

interface Primitive {
  key: string;
  area: Area;
  pkg: string;
  file: string;
  declares: string;
  code: string;
  derives: string[];
}

const PRIMITIVES: Primitive[] = [
  {
    key: "defineModel",
    area: "data",
    pkg: "@kwiva/data",
    file: "src/app/models/post.ts",
    declares: "Declare the data plane — the framework derives the rest.",
    code: `defineModel("posts", (f) => ({
  id: f.id(),
  title: f.string(),
  status: f.enum("draft", "published"),
}), { timestamps: true })`,
    derives: ["schema + migrations", "seeders", "REST API", "typed client", "Studio", "OpenAPI", "MCP tools"],
  },
  {
    key: "defineController",
    area: "http",
    pkg: "@kwiva/http",
    file: "src/app/http/controllers/posts.ts",
    declares: "Declare typed HTTP handlers — validation, auth and policies included.",
    code: `defineController((api) => {
  api.get("/posts", ({ db }) => db.post.findMany())
  api.post("/posts", create, { auth: true })
})`,
    derives: ["typed context", "validation", "auth guards", "policy hooks"],
  },
  {
    key: "defineService",
    area: "data",
    pkg: "@kwiva/services",
    file: "src/app/services/posts.ts",
    declares: "Declare reusable domain logic with typed injection.",
    code: `defineService("posts", ({ models }) => ({
  publish: (id) =>
    models.post.update(id, { status: "published" }),
}))`,
    derives: ["typed injection", "model access"],
  },
  {
    key: "definePage",
    area: "ui",
    pkg: "@kwiva/react",
    file: "src/ui/pages/dashboard.tsx",
    declares: "Declare a server-first page — routing, loaders, streaming SSR.",
    code: `export default definePage("/dashboard", async ({ session }) => {
  const stats = await db.user.stats(session.user.id)
  return <Dashboard stats={stats} />
})`,
    derives: ["file-based route", "loaders", "streaming SSR"],
  },
  {
    key: "defineJob",
    area: "platform",
    pkg: "@kwiva/queue",
    file: "src/app/jobs/send-digest.ts",
    declares: "Declare a durable background job — the queue handles the rest.",
    code: `defineJob("send-digest", async ({ userId }) => {
  const posts = await db.post.dailyDigest(userId)
  await mail.send({ to: userId, html: render(posts) })
})`,
    derives: ["queue workers", "retries + backoff", "DLQ"],
  },
  {
    key: "definePolicy",
    area: "platform",
    pkg: "@kwiva/core",
    file: "src/app/policies/posts.ts",
    declares: "Declare who can do what — scoped to one resource.",
    code: `definePolicy("posts", ({ user, model }) => ({
  update: () => user.id === model.authorId,
  delete: () => user.roles.includes("admin"),
}))`,
    derives: ["authorization rules", "model guards"],
  },
];

const AREAS: { id: Area; label: string; subs: { text: string; key?: string }[] }[] = [
  { id: "data", label: "DATA", subs: [{ text: "defineModel", key: "defineModel" }, { text: "defineService", key: "defineService" }] },
  { id: "http", label: "HTTP", subs: [{ text: "defineController", key: "defineController" }, { text: "defineMiddleware" }] },
  { id: "ui", label: "FRONTEND", subs: [{ text: "definePage", key: "definePage" }, { text: "router · ssr" }] },
  { id: "platform", label: "PLATFORM", subs: [{ text: "defineJob", key: "defineJob" }, { text: "definePolicy", key: "definePolicy" }] },
];

/* Desktop SVG geometry */
const COLS = [
  { area: "data" as Area, x: 80, cx: 144 },
  { area: "http" as Area, x: 220, cx: 284 },
  { area: "ui" as Area, x: 360, cx: 424 },
  { area: "platform" as Area, x: 500, cx: 564 },
];
const COL_W = 128;

function DesktopBlueprint({ activeArea, activeKey }: { activeArea: Area; activeKey: string }) {
  return (
    <svg
      viewBox="0 0 640 408"
      className="hidden h-auto w-full lg:block"
      role="img"
      aria-label={`Kwiva blueprint: ${activeKey} highlighted in the ${activeArea} area, flowing through the defineX language and framework API, above sealed engines and the runtime.`}
    >
      {/* annotations */}
      <text x={250} y={11} className="bp-note">01 / APP</text>
      <text x={80} y={190} className="bp-note">02 / LANGUAGE</text>
      <text x={80} y={246} className="bp-note">03 / FRAMEWORK</text>
      <text x={80} y={302} className="bp-note">04 / ENGINES</text>
      <text x={80} y={358} className="bp-note">05 / RUNTIME</text>

      {/* application node */}
      <rect x={250} y={16} width={140} height={32} rx={4} className="bp-box" />
      <text x={320} y={36} textAnchor="middle" className="bp-label">APPLICATION</text>

      {/* app -> columns elbows */}
      {COLS.map((col) => (
        <path
          key={`elbow-${col.area}`}
          d={`M320 48 V64 H${col.cx} V80`}
          className="bp-edge"
          data-on={col.area === activeArea}
        />
      ))}

      {/* columns */}
      {COLS.map((col) => {
        const area = AREAS.find((a) => a.id === col.area);
        if (!area) return null;
        const on = col.area === activeArea;
        return (
          <g key={col.area}>
            <rect x={col.x} y={80} width={COL_W} height={28} rx={4} className="bp-box" data-on={on} />
            <text x={col.cx} y={98} textAnchor="middle" className="bp-label">{area.label}</text>
            {area.subs.map((sub, i) => (
              <text
                key={sub.text}
                x={col.cx}
                y={126 + i * 16}
                textAnchor="middle"
                className="bp-sub"
                data-on={on && (sub.key === activeKey || (sub.key === undefined && true))}
              >
                {sub.text}
              </text>
            ))}
            {/* column -> language */}
            <path d={`M${col.cx} 150 V196`} className="bp-edge" data-on={on} />
          </g>
        );
      })}

      {/* defineX */}
      <path d="M320 228 V252" className="bp-edge" data-on="true" />
      <rect x={80} y={196} width={548} height={32} rx={4} className="bp-box" data-on="true" />
      <text x={354} y={216} textAnchor="middle" className="bp-label">defineX — one language for every construct</text>

      {/* framework api */}
      <path d="M320 284 V308" className="bp-edge" data-on="true" />
      <rect x={80} y={252} width={548} height={32} rx={4} className="bp-box" data-on="true" />
      <text x={354} y={272} textAnchor="middle" className="bp-label">@kwiva/* — framework API</text>

      {/* engines (sealed) */}
      <path d="M320 340 V364" className="bp-edge" />
      <rect x={80} y={308} width={548} height={32} rx={4} className="bp-box bp-dashed" />
      <text x={354} y={328} textAnchor="middle" className="bp-label">engines — sealed · Nitro · Drizzle · Better Auth · Query</text>

      {/* runtime */}
      <rect x={80} y={364} width={548} height={32} rx={4} className="bp-box" />
      <text x={354} y={384} textAnchor="middle" className="bp-label">runtime — Bun · Node · edge presets</text>
    </svg>
  );
}

function MobileBlueprint({ activeArea }: { activeArea: Area }) {
  const rail = "mx-auto h-4 w-px bg-fd-border";
  return (
    <div className="lg:hidden" aria-hidden="true">
      <div className="rounded-md border border-fd-border bg-fd-background px-4 py-2.5 text-center font-mono text-[11px] font-medium tracking-wide text-fd-foreground">
        APPLICATION
      </div>
      <div className={rail} />
      <div className="grid grid-cols-2 gap-2">
        {AREAS.map((area) => (
          <div
            key={area.id}
            className={`rounded-md border px-3 py-2.5 text-center transition-colors ${
              area.id === activeArea
                ? "border-kwiva-500 bg-kwiva-500/10 text-kwiva-700 dark:text-kwiva-300"
                : "border-fd-border bg-fd-background text-fd-muted-foreground"
            }`}
          >
            <p className="font-mono text-[11px] font-medium tracking-wide">{area.label}</p>
            <p className="mt-0.5 font-mono text-[9px] opacity-70">{area.subs.map((s) => s.text).join(" · ")}</p>
          </div>
        ))}
      </div>
      <div className={rail} />
      <div className="rounded-md border border-kwiva-500 bg-kwiva-500/10 px-4 py-2.5 text-center font-mono text-[11px] font-medium tracking-wide text-kwiva-700 dark:text-kwiva-300">
        defineX — one language
      </div>
      <div className={rail} />
      <div className="rounded-md border border-fd-border bg-fd-background px-4 py-2.5 text-center font-mono text-[11px] font-medium tracking-wide text-fd-foreground">
        @kwiva/* — framework API
      </div>
      <div className={rail} />
      <div className="rounded-md border border-dashed border-fd-border bg-fd-background px-4 py-2.5 text-center font-mono text-[11px] tracking-wide text-fd-muted-foreground">
        engines — sealed
      </div>
      <div className={rail} />
      <div className="rounded-md border border-fd-border bg-fd-background px-4 py-2.5 text-center font-mono text-[11px] tracking-wide text-fd-muted-foreground">
        runtime — Bun · Node · edge
      </div>
    </div>
  );
}

export function BlueprintHero() {
  const [activeKey, setActiveKey] = useState("defineModel");
  const prim = PRIMITIVES.find((p) => p.key === activeKey) ?? PRIMITIVES[0];
  if (!prim) return null;
  const activeArea = prim.area;

  return (
    <div className="flex flex-col gap-4">
      {/* Primitive switcher */}
      <div
        role="group"
        aria-label="Select a defineX primitive"
        className="flex flex-wrap items-center gap-1.5"
      >
        {PRIMITIVES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActiveKey(p.key)}
            aria-pressed={p.key === activeKey}
            className={`rounded-md border px-2.5 py-1.5 font-mono text-[11.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500 ${
              p.key === activeKey
                ? "border-kwiva-500 bg-kwiva-500/10 text-kwiva-700 dark:text-kwiva-300"
                : "border-fd-border bg-fd-background text-fd-muted-foreground hover:border-kwiva-500/40 hover:text-fd-foreground"
            }`}
          >
            {p.key}
          </button>
        ))}
      </div>

      {/* Blueprint canvas */}
      <div className="kw-panel rounded-lg border border-fd-border bg-fd-card/40 p-3">
        <DesktopBlueprint activeArea={activeArea} activeKey={activeKey} />
        <MobileBlueprint activeArea={activeArea} />
      </div>

      {/* Declaration panel */}
      <div className="kw-panel overflow-hidden rounded-lg border border-fd-border bg-fd-background">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-fd-border bg-fd-secondary/40 px-4 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-kwiva-500" />
            <span className="truncate font-mono text-[11px] text-fd-muted-foreground">{prim.file}</span>
          </div>
          <CopyButton value={prim.code} />
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-fd-foreground/90">
          <code>{prim.code}</code>
        </pre>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-dashed border-fd-border px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fd-muted-foreground">
            {prim.pkg}
          </span>
          <span className="text-fd-border">→</span>
          {prim.derives.map((d) => (
            <span
              key={d}
              className="rounded border border-fd-border bg-fd-secondary/50 px-1.5 py-0.5 font-mono text-[10.5px] text-fd-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <p className="px-1 text-[13px] leading-relaxed text-fd-muted-foreground">{prim.declares}</p>
    </div>
  );
}
