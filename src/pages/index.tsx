import { Link } from "fumapress/client";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Box,
  Braces,
  Check,
  CheckCircle2,
  Database,
  FlaskConical,
  Globe,
  LayoutTemplate,
  Package,
  Rocket,
  Server,
  Terminal,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { CopyButton, Reveal } from "../components/home/interactive";
import { BlueprintHero } from "../components/home/blueprint";
import { DefinexExplorer, type FactoryGroup, type FactoryItem } from "../components/home/explorer";
import { LayerExplorer } from "../components/home/layers";
import { CapabilitySurface } from "../components/home/surface";
import { Parallax, ScrollRail, type RailSection } from "../components/home/motion";
import { Button, CodeWindow, Eyebrow, GithubMark, Kbd, SectionHead } from "../components/brand";

/* ------------------------------------------------------------------ */
/* Local tokens                                                        */
/* ------------------------------------------------------------------ */

const ACC = "text-kwiva-600 dark:text-kwiva-400";
const STR = "text-emerald-600 dark:text-emerald-400";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const definexGroups: { id: FactoryGroup; label: string }[] = [
  { id: "data", label: "Data" },
  { id: "http", label: "HTTP" },
  { id: "app", label: "App" },
  { id: "domain", label: "Domain" },
  { id: "ops", label: "Ops" },
  { id: "ui", label: "UI" },
  { id: "ai", label: "AI" },
];

const definexFactories: FactoryItem[] = [
  {
    name: "defineModel",
    purpose: "Data models & relations — the single source of truth for the data plane",
    pkg: "@kwiva/data",
    group: "data",
    href: "/docs/getting-started/first-model",
    file: "src/app/models/users.ts",
    derives: ["schema + migrations", "seeders", "REST API", "typed client", "Studio", "OpenAPI", "MCP"],
    snippet: `defineModel("posts", (f) => ({
  id: f.id(),
  title: f.string(),
  body: f.text().optional(),
  status: f.enum("draft", "published").default("draft"),
  author: f.belongsTo(() => User),
  comments: f.hasMany(() => Comment),
}), { timestamps: true, permission: "posts" })`,
  },
  {
    name: "defineController",
    purpose: "Typed HTTP handlers with validation, auth and policy hooks",
    pkg: "@kwiva/http",
    group: "http",
    href: "/docs/getting-started/first-api",
    file: "src/app/http/controllers/posts.ts",
    derives: ["typed context", "validation", "auth guards", "policy hooks"],
    snippet: `defineController((api) => {
  api.get("/posts", ({ db }) => db.post.findMany())
  api.post("/posts", createPost, { auth: true })
  api.delete("/posts/:id", removePost, { policy: "posts.delete" })
})`,
  },
  {
    name: "defineMiddleware",
    purpose: "Pipeline middleware for cross-cutting request concerns",
    pkg: "@kwiva/http",
    group: "http",
    href: "/docs/core-concepts/definex",
    file: "src/app/http/middleware/timing.ts",
    derives: ["request id", "tracing", "session", "tenancy"],
    snippet: `defineMiddleware(async (ctx, next) => {
  const t0 = performance.now()
  const res = await next()
  console.log("handled in", performance.now() - t0)
  return res
})`,
  },
  {
    name: "defineServerRoute",
    purpose: "Infrastructure routes — cache rules, redirects, proxies",
    pkg: "@kwiva/http",
    group: "http",
    href: "/docs/core-concepts/definex",
    file: "src/routes/rules.ts",
    derives: ["route rules", "SWR / ISR", "redirects", "proxies"],
    snippet: `defineServerRoute("/health", async () => {
  return Response.json({ status: "ok", uptime: process.uptime() })
})`,
  },
  {
    name: "defineApp",
    purpose: "Application composition — the single entry point",
    pkg: "@kwiva/core",
    group: "app",
    href: "/docs/core-concepts/applications",
    file: "src/bootstrap/app.ts",
    derives: ["modules", "providers", "boot"],
    snippet: `defineApp({
  name: "my-app",
  modules: [BlogModule],
})`,
  },
  {
    name: "defineConfig",
    purpose: "Typed, env-aware configuration with sensible defaults",
    pkg: "@kwiva/config",
    group: "app",
    href: "/docs/core-concepts/configuration",
    file: "src/config/database.ts",
    derives: ["typed env", "defaults", "inline overrides"],
    snippet: `defineConfig({
  app: { env: "development" },
  database: { url: env("DATABASE_URL") },
})`,
  },
  {
    name: "definePlugin",
    purpose: "Reusable extensions that hook into the framework",
    pkg: "@kwiva/core",
    group: "app",
    href: "/docs/core-concepts/definex",
    derives: ["hooks", "config extension"],
    snippet: `definePlugin((api) => {
  api.hook("boot", async () => seed(api.models))
  api.extend(extraRoutes)
})`,
  },
  {
    name: "defineModule",
    purpose: "Encapsulated feature modules with dependency wiring",
    pkg: "@kwiva/core",
    group: "app",
    href: "/docs/core-concepts/definex",
    derives: ["encapsulation", "imports"],
    snippet: `defineModule({
  name: "blog",
  routes: [postRoutes],
  imports: [CommentModule],
})`,
  },
  {
    name: "defineService",
    purpose: "Reusable domain services with typed injection",
    pkg: "@kwiva/services",
    group: "domain",
    href: "/docs/core-concepts/services",
    file: "src/app/services/posts.ts",
    derives: ["typed injection", "model access"],
    snippet: `defineService("posts", ({ models }) => ({
  publish(id) {
    return models.post.update(id, { status: "published" })
  },
}))`,
  },
  {
    name: "definePolicy",
    purpose: "Declarative authorization rules, scoped to a resource",
    pkg: "@kwiva/core",
    group: "domain",
    href: "/docs/core-concepts/definex",
    file: "src/app/policies/posts.ts",
    derives: ["rules", "model guards"],
    snippet: `definePolicy("posts", ({ user, model }) => ({
  view: () => true,
  update: () => user.id === model.authorId,
  delete: () => user.roles.includes("admin"),
}))`,
  },
  {
    name: "defineAuth",
    purpose: "Authentication — providers, sessions, strategies",
    pkg: "@kwiva/auth",
    group: "domain",
    href: "/docs/core-concepts/definex",
    file: "src/app/http/auth.ts",
    derives: ["sessions", "OAuth", "passkeys"],
    snippet: `defineAuth({
  providers: [emailPassword(), github()],
  session: { strategy: "jwt", cookie: "httpOnly" },
})`,
  },
  {
    name: "defineJob",
    purpose: "Durable background jobs on the queue",
    pkg: "@kwiva/queue",
    group: "ops",
    href: "/docs/core-concepts/definex",
    file: "src/app/jobs/send-digest.ts",
    derives: ["workers", "retries + backoff", "DLQ"],
    snippet: `defineJob("send-digest", async ({ userId }) => {
  const posts = await db.post.dailyDigest(userId)
  await mail.send({ to: userId, subject: "Your digest", html: render(posts) })
})`,
  },
  {
    name: "defineEvent",
    purpose: "Domain events with fan-out listeners",
    pkg: "@kwiva/events",
    group: "ops",
    href: "/docs/core-concepts/definex",
    file: "src/app/events/user-signed-up.ts",
    derives: ["listeners", "outbox"],
    snippet: `defineEvent("user.signed-up", async ({ user }) => {
  await welcome.send(user.email)
  await analytics.track("user.signed-up", { id: user.id })
})`,
  },
  {
    name: "defineTask",
    purpose: "Scheduled, recurring background tasks",
    pkg: "@kwiva/http",
    group: "ops",
    href: "/docs/core-concepts/definex",
    file: "src/app/tasks/cleanup.ts",
    derives: ["cron", "scheduler controls"],
    snippet: `defineTask("daily-cleanup", async () => {
  await db.sessions.deleteMany({
    where: { expiresAt: { lt: now() } },
  })
})`,
  },
  {
    name: "defineCommand",
    purpose: "CLI commands for your application console",
    pkg: "@kwiva/cli",
    group: "ops",
    href: "/docs/core-concepts/definex",
    file: "src/app/console/import-legacy.ts",
    derives: ["console", "logger"],
    snippet: `defineCommand("cache:flush", async ({ logger }) => {
  await cache.flushAll()
  logger.success("Cache flushed")
})`,
  },
  {
    name: "definePage",
    purpose: "Server-first React pages with routing and loaders",
    pkg: "@kwiva/react",
    group: "ui",
    href: "/docs/getting-started/first-page",
    file: "src/ui/pages/dashboard.tsx",
    derives: ["file-based route", "loaders", "streaming SSR"],
    snippet: `export default definePage("/dashboard", async ({ session }) => {
  const stats = await db.user.stats(session.user.id)
  return <Dashboard user={session.user} stats={stats} />
})`,
  },
  {
    name: "defineMcpTool",
    purpose: "Expose application capabilities to AI agents over MCP",
    pkg: "@kwiva/mcp",
    group: "ai",
    href: "/docs/core-concepts/definex",
    derives: ["agent tools", "bearer auth"],
    snippet: `defineMcpTool("search_posts", {
  description: "Search published posts",
  params: { q: z.string(), limit: z.number().optional() },
  run: async ({ q, limit }) => db.post.search(q, limit),
})`,
  },
];

const fragmentStack = [
  "runtime",
  "router",
  "http framework",
  "ORM",
  "validation",
  "auth",
  "RBAC",
  "tenancy",
  "queue",
  "scheduler",
  "realtime",
  "data fetching",
  "SSR",
  "caching",
  "observability",
  "deployment",
];

const systemRows = [
  { label: "data", items: "models · services · migrations" },
  { label: "http", items: "controllers · routes · middleware" },
  { label: "frontend", items: "pages · router · SSR" },
  { label: "platform", items: "jobs · events · policies · tasks" },
];

const specStrip = [
  { v: "17", k: "defineX factories" },
  { v: "17", k: "@kwiva/* packages" },
  { v: "6", k: "sealed engines" },
  { v: "8", k: "deploy presets" },
];

const derivedPlane = [
  { label: "DB schema + migrations + seeders", via: "@kwiva/data" },
  { label: "Typed REST API — 5 routes per model", via: "@kwiva/http" },
  { label: "Typed RPC client SDK", via: "@kwiva/client" },
  { label: "Studio — generated operations UI", via: "@kwiva/studio" },
  { label: "OpenAPI specification", via: "@kwiva/http" },
  { label: "MCP tools for AI agents", via: "@kwiva/mcp" },
];

const lifecycleSteps = [
  { icon: Terminal, label: "develop", desc: "kwiva dev · HMR" },
  { icon: CheckCircle2, label: "check", desc: "oxlint · oxfmt · types" },
  { icon: FlaskConical, label: "test", desc: "bun test harness" },
  { icon: Package, label: "build", desc: "rolldown · minify" },
  { icon: Rocket, label: "deploy", desc: "8 presets · binary" },
  { icon: Activity, label: "observe", desc: "OTel spans · metrics" },
  { icon: TrendingUp, label: "scale", desc: "stateless · queues" },
];

const journeySteps: { label: string; href?: string }[] = [
  { label: "Discover", href: "/docs" },
  { label: "Install", href: "/docs/getting-started/create-project" },
  { label: "Build", href: "/docs/getting-started/first-model" },
  { label: "Secure", href: "/docs/core-concepts" },
  { label: "Scale" },
  { label: "Deploy", href: "/docs/getting-started/first-deployment" },
  { label: "Extend", href: "/docs/core-concepts/definex" },
];

/* Narrative order for the architecture rail — mirrors the numbered
   sections below exactly, so the rail's "you are here" tick always
   matches the section heading the visitor is reading. */
const railSections: RailSection[] = [
  { id: "hero", label: "Kwiva" },
  { id: "problem", label: "01 · Problem" },
  { id: "definex", label: "02 · defineX" },
  { id: "architecture", label: "03 · Architecture" },
  { id: "source-of-truth", label: "04 · Source of truth" },
  { id: "request-flow", label: "05 · Request flow" },
  { id: "surface", label: "06 · Surface" },
  { id: "platform", label: "07 · Platform" },
  { id: "lifecycle", label: "08 · Production" },
  { id: "journey", label: "09 · The path" },
  { id: "documentation", label: "10 · Documentation" },
  { id: "cta", label: "11 · Build" },
];

const docsIndex = {
  "Getting started": [
    { label: "Create a project", href: "/docs/getting-started/create-project" },
    { label: "Project structure", href: "/docs/getting-started/project-structure" },
    { label: "Development server", href: "/docs/getting-started/development-server" },
    { label: "Configuration", href: "/docs/getting-started/configuration" },
    { label: "First model", href: "/docs/getting-started/first-model" },
    { label: "First API", href: "/docs/getting-started/first-api" },
    { label: "First page", href: "/docs/getting-started/first-page" },
    { label: "First deployment", href: "/docs/getting-started/first-deployment" },
  ],
  "Core concepts": [
    { label: "defineX convention", href: "/docs/core-concepts/definex" },
    { label: "Application lifecycle", href: "/docs/core-concepts/lifecycle" },
    { label: "Request context", href: "/docs/core-concepts/context" },
    { label: "Services", href: "/docs/core-concepts/services" },
    { label: "Applications", href: "/docs/core-concepts/applications" },
    { label: "Auto-discovery", href: "/docs/core-concepts/auto-discovery" },
    { label: "Type inference", href: "/docs/core-concepts/type-inference" },
    { label: "Error handling", href: "/docs/core-concepts/error-handling" },
  ],
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <>
      <title>Kwiva — Batteries-included TypeScript application framework</title>
      <meta name="description" content="Kwiva is a batteries-included TypeScript application framework with a Laravel-shaped, framework-owned architecture — one CLI, one configuration model, one defineX language." />

      <ScrollRail sections={railSections} />

      {/* ============================ 00 / HERO ============================ */}
      <section id="hero" className="kw-hero-glow relative isolate overflow-hidden">
        <div className="kw-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_85%_65%_at_50%_-5%,black,transparent)]" />
        <div className="kw-noise pointer-events-none absolute inset-0 -z-10" />
        <Parallax
          strength={20}
          className="pointer-events-none absolute -top-16 right-[-8%] -z-10 h-[26rem] w-[26rem] rounded-full bg-kwiva-500/10 blur-3xl sm:right-[2%]"
        />

        <div className="grid items-center gap-12 py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:py-20">
          {/* Positioning */}
          <div className="max-w-xl">
            <Reveal>
              <Eyebrow>Kwiva · TypeScript application framework</Eyebrow>
            </Reveal>

            <Reveal delay={50}>
              <h1 className="mt-6 font-display font-expanded text-balance text-4xl font-bold leading-[1.04] tracking-tight text-fd-foreground sm:text-5xl lg:text-[3.3rem]">
                Serious applications,
                <br />
                built as{" "}
                <span className="text-kwiva-600 dark:text-kwiva-400">one system</span>.
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-fd-muted-foreground">
                Kwiva is a batteries-included framework with a Laravel-shaped architecture — one
                CLI, one configuration model, one <Kbd>defineX</Kbd> language. From model to
                database to API to page, the framework owns the plumbing so your code stays about
                the product.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <Button
                  href="/docs/getting-started"
                  variant="primary"
                  icon={<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                >
                  Get started
                </Button>
                <Button href="/architecture" variant="secondary">
                  Explore the architecture
                </Button>
                <Button
                  href="https://github.com/kwiva/kwiva"
                  variant="secondary"
                  size="icon"
                  iconOnly
                  ariaLabel="Kwiva on GitHub"
                  icon={<GithubMark className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground" />}
                />
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 max-w-md">
                <div className="flex items-center gap-3 rounded-md border border-fd-border bg-fd-background px-4 py-3">
                  <span className={`font-mono text-sm ${ACC}`}>$</span>
                  <code className="flex-1 truncate font-mono text-sm text-fd-foreground">
                    bun create kwiva
                  </code>
                  <CopyButton value="bun create kwiva" label="" />
                </div>
                <p className="mt-2.5 font-mono text-[11px] text-fd-muted-foreground">
                  then <span className={ACC}>kwiva dev</span> — generators for everything else
                </p>
              </div>
            </Reveal>
          </div>

          {/* Blueprint centerpiece */}
          <Reveal delay={120}>
            <BlueprintHero />
          </Reveal>
        </div>

        {/* Spec strip */}
        <div className="border-t border-fd-border">
          <dl className="grid grid-cols-2 sm:grid-cols-4">
            {specStrip.map((s) => (
              <div key={s.k} className="flex items-baseline gap-2.5 px-4 py-4 sm:justify-center">
                <dt className="font-display font-expanded-md text-2xl font-bold text-fd-foreground">
                  {s.v}
                </dt>
                <dd className="font-mono text-[11px] uppercase tracking-wider text-fd-muted-foreground">
                  {s.k}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============================ 01 / PROBLEM ============================ */}
      <section id="problem" className="py-20 lg:py-24">
        <SectionHead
          n="01"
          kicker="The problem"
          title="Assembly is not architecture."
          sub="The modern stack asks you to choose, glue and maintain sixteen independent pieces — before writing a single feature."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Fragmentation */}
          <Reveal>
            <div className="kw-panel h-full rounded-lg border border-fd-border bg-fd-background p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                The typical stack — assembled by you
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {fragmentStack.map((f) => (
                  <span
                    key={f}
                    className="rounded border border-fd-border bg-fd-secondary/40 px-2 py-1 font-mono text-[11px] text-fd-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <p className="mt-5 border-t border-dashed border-fd-border pt-4 font-mono text-[12px] text-fd-muted-foreground">
                16 decisions — plus all the glue between them.
              </p>
            </div>
          </Reveal>

          {/* The system */}
          <Reveal delay={80}>
            <div className="kw-panel relative h-full rounded-lg border border-kwiva-500/40 bg-fd-background p-6">
              <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-kwiva-500 via-kwiva-500/40 to-transparent" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-kwiva-600 dark:text-kwiva-400">
                Kwiva — one coherent system
              </p>
              <ul className="mt-5 divide-y divide-fd-border/70">
                {systemRows.map((row) => (
                  <li key={row.label} className="flex items-baseline gap-4 py-2.5">
                    <span className="w-20 shrink-0 font-mono text-[12px] font-medium text-kwiva-700 dark:text-kwiva-300">
                      {row.label}
                    </span>
                    <span className="font-mono text-[12px] text-fd-muted-foreground">{row.items}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-dashed border-fd-border pt-4 font-mono text-[12px] text-fd-muted-foreground">
                one config · one CLI · one grammar
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <blockquote className="mx-auto mt-14 max-w-2xl text-center">
            <p className="kw-quote text-balance text-2xl leading-snug text-fd-foreground/90 sm:text-[2rem]">
              “A framework should provide coherence, not just components.”
            </p>
          </blockquote>
        </Reveal>
      </section>

      {/* ============================ 02 / LANGUAGE ============================ */}
      <section id="definex" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="02"
            kicker="defineX"
            title="One grammar for everything you build."
            sub="Every app-facing construct is a factory. Learn the grammar once — it reads the same in models, controllers, jobs, policies and pages."
          />
          <Reveal>
            <div className="mb-5 flex flex-wrap items-center justify-center gap-1.5">
              {definexGroups.map((g) => {
                const count = definexFactories.filter((f) => f.group === g.id).length;
                return (
                  <span
                    key={g.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-background px-2.5 py-1 font-mono text-[11px] text-fd-muted-foreground"
                  >
                    {g.label.toLowerCase()}
                    <span className="text-kwiva-600 dark:text-kwiva-400">{count}</span>
                  </span>
                );
              })}
            </div>
            <DefinexExplorer factories={definexFactories} />
          </Reveal>
        </div>
      </section>

      {/* ============================ 03 / ARCHITECTURE ============================ */}
      <section id="architecture" className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="03"
            kicker="Architecture"
            title="Five layers. One hard boundary."
            sub="The app depends only on the framework. The framework depends on engines and the oxc toolchain. App code never imports an engine by name."
          />
          <Reveal>
            <LayerExplorer />
          </Reveal>
        </div>
      </section>

      {/* ============================ 04 / SOURCE OF TRUTH ============================ */}
      <section id="source-of-truth" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="04"
            kicker="Source of truth"
            title="Define the model. Derive the plane."
            sub="One defineModel becomes a typed intermediate representation. Everything below it is generated — nothing is written twice, so nothing drifts."
          />

          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <CodeWindow
                title="src/app/models/post.ts"
                copy={`defineModel("posts", (f) => ({\n  id: f.id(),\n  title: f.string(),\n  body: f.text().optional(),\n  status: f.enum("draft", "published"),\n  author: f.belongsTo(() => User),\n  comments: f.hasMany(() => Comment),\n}), { timestamps: true })`}
              >
                <code>
                  <span className={ACC}>export const</span> Post ={" "}
                  <span className={ACC}>defineModel</span>(<span className={STR}>"posts"</span>, (f) =&gt; {"{"}
                  {"\n"}  id: f.id(),
                  {"\n"}  title: f.string(),
                  {"\n"}  body: f.text().optional(),
                  {"\n"}  status: f.enum(<span className={STR}>"draft"</span>, <span className={STR}>"published"</span>),
                  {"\n"}  author: f.<span className={ACC}>belongsTo</span>(() =&gt; User),
                  {"\n"}  comments: f.<span className={ACC}>hasMany</span>(() =&gt; Comment),
                  {"\n"}
                  {"}"}, {"{"} timestamps: <span className="text-fd-muted-foreground">true</span> {"}"});
                </code>
              </CodeWindow>
            </Reveal>

            <Reveal delay={80}>
              <div className="kw-panel overflow-hidden rounded-lg border border-fd-border bg-fd-background">
                <div className="border-b border-fd-border bg-fd-secondary/40 px-5 py-3">
                  <p className="font-mono text-[11px] text-fd-muted-foreground">
                    models/*.ts <span className={ACC}>→</span> IR{" "}
                    <span className="text-fd-muted-foreground/60">(typed intermediate representation)</span>{" "}
                    <span className={ACC}>→</span>
                  </p>
                </div>
                <ul className="divide-y divide-fd-border/70">
                  {derivedPlane.map((d, i) => (
                    <li key={d.label} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="w-6 shrink-0 font-mono text-[10px] text-fd-muted-foreground/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-fd-foreground">
                        {d.label}
                      </span>
                      <span className="hidden shrink-0 font-mono text-[10.5px] text-fd-muted-foreground sm:block">
                        {d.via}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-dashed border-fd-border px-5 py-3 font-mono text-[11.5px] text-kwiva-700 dark:text-kwiva-300">
                  → no drift between types, API, and database
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ 05 / REQUEST FLOW ============================ */}
      <section id="request-flow" className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="05"
            kicker="Request flow"
            title="One pipeline. Page or API."
            sub="Every request enters the same HTTP pipeline — middleware for request id, tracing, session and tenancy — then flows to a streamed page or a typed controller."
          />

          <Reveal>
            <div className="rounded-lg border border-fd-border bg-fd-background p-5 sm:p-7">
              {/* Desktop flow */}
              <div className="hidden items-stretch gap-0 lg:flex">
                <FlowNode icon={Globe} label="client" caption="browser · agent" />
                <FlowArrow />
                <FlowNode icon={Server} label="engine adapter" caption="nitro preset" />
                <FlowArrow />
                <FlowNode icon={Workflow} label="http pipeline" caption="id · trace · session · tenant" />
                <FlowArrow />
                <div className="flex flex-col justify-center gap-2">
                  <FlowNode icon={LayoutTemplate} label="page route" caption="router → SSR → stream" compact />
                  <FlowNode icon={Braces} label="api route" caption="controller → validate" compact />
                </div>
                <FlowArrow />
                <FlowNode icon={Database} label="model → sql" caption="drizzle engine" />
                <FlowArrow />
                <FlowNode icon={Box} label="database" caption="sqlite · postgres" />
              </div>

              {/* Mobile flow */}
              <ol className="space-y-1 lg:hidden">
                {[
                  { icon: Globe, label: "client", caption: "browser · agent" },
                  { icon: Server, label: "engine adapter", caption: "nitro preset" },
                  { icon: Workflow, label: "http pipeline", caption: "id · trace · session · tenant" },
                  { icon: LayoutTemplate, label: "page route", caption: "router → SSR → stream" },
                  { icon: Braces, label: "api route", caption: "controller → validate" },
                  { icon: Database, label: "model → sql", caption: "drizzle engine" },
                  { icon: Box, label: "database", caption: "sqlite · postgres" },
                ].map((n) => (
                  <li key={n.label}>
                    <FlowNode icon={n.icon} label={n.label} caption={n.caption} compact />
                  </li>
                ))}
              </ol>

              <p className="mt-6 border-t border-dashed border-fd-border pt-4 font-mono text-[11.5px] leading-relaxed text-fd-muted-foreground">
                Whatever the preset, the app sees the same framework API —{" "}
                <span className="text-fd-foreground">deploy differences stay in the engine.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ 06 / SURFACE ============================ */}
      <section id="surface" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="06"
            kicker="Surface"
            title="Everything the application needs."
            sub="Batteries included — grouped the way you operate them, not the way packages happen to be named."
          />
          <Reveal>
            <CapabilitySurface />
          </Reveal>
        </div>
      </section>

      {/* ============================ 07 / PLATFORM ============================ */}
      <section id="platform" className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="07"
            kicker="Platform"
            title="Built for tenants and agents."
            sub="Kwiva treats multi-tenancy and AI access as architecture — not add-ons bolted on after launch."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Tenancy */}
            <Reveal>
              <div className="kw-panel h-full rounded-lg border border-fd-border bg-fd-background p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                  <Users className="size-3.5 text-kwiva-500" />
                  Tenancy-first data access
                </p>
                <div className="mt-6 space-y-3">
                  <div className="mx-auto w-fit rounded-md border border-kwiva-500/50 bg-kwiva-500/10 px-6 py-2 font-mono text-[12px] font-medium text-kwiva-700 dark:text-kwiva-300">
                    kwiva app
                  </div>
                  <div className="mx-auto h-4 w-px bg-fd-border" />
                  <div className="grid grid-cols-3 gap-2">
                    {["tenant a", "tenant b", "tenant c"].map((t) => (
                      <div
                        key={t}
                        className="rounded-md border border-fd-border bg-fd-secondary/40 px-2 py-2 text-center font-mono text-[11px] text-fd-muted-foreground"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto h-4 w-px bg-fd-border" />
                  <div className="grid grid-cols-3 gap-2">
                    {["data", "data", "data"].map((t, i) => (
                      <div
                        key={i}
                        className="rounded border border-dashed border-fd-border px-2 py-2 text-center font-mono text-[10.5px] text-fd-muted-foreground"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-dashed border-fd-border pt-4">
                  {["tenant-aware data", "authorization", "jobs", "caching", "realtime", "isolation by default"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 font-mono text-[11px] text-fd-muted-foreground">
                        <Check className="size-3 shrink-0 text-kwiva-500" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </Reveal>

            {/* Agents */}
            <Reveal delay={80}>
              <div className="kw-panel h-full rounded-lg border border-fd-border bg-fd-background p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                  <Bot className="size-3.5 text-kwiva-500" />
                  An interface for agents
                </p>
                <div className="mt-6 space-y-3">
                  <div className="mx-auto w-fit rounded-md border border-kwiva-500/50 bg-kwiva-500/10 px-6 py-2 font-mono text-[12px] font-medium text-kwiva-700 dark:text-kwiva-300">
                    kwiva application
                  </div>
                  <div className="mx-auto h-4 w-px bg-fd-border" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-fd-border bg-fd-secondary/40 px-3 py-2.5 text-center">
                      <Users className="mx-auto size-4 text-fd-muted-foreground" />
                      <p className="mt-1.5 font-mono text-[11px] text-fd-muted-foreground">humans</p>
                      <p className="font-mono text-[10px] text-fd-muted-foreground/60">web · api</p>
                    </div>
                    <div className="rounded-md border border-fd-border bg-fd-secondary/40 px-3 py-2.5 text-center">
                      <Bot className="mx-auto size-4 text-fd-muted-foreground" />
                      <p className="mt-1.5 font-mono text-[11px] text-fd-muted-foreground">agents</p>
                      <p className="font-mono text-[10px] text-fd-muted-foreground/60">mcp</p>
                    </div>
                  </div>
                </div>
                <p className="mt-6 border-t border-dashed border-fd-border pt-4 text-[13px] leading-relaxed text-fd-muted-foreground">
                  Every model can expose <span className="font-mono text-kwiva-700 dark:text-kwiva-300">defineMcpTool</span>{" "}
                  capabilities — your application becomes an interface for AI systems, with the same
                  typed IR that drives the REST API.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ 08 / LIFECYCLE ============================ */}
      <section id="lifecycle" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="08"
            kicker="Production"
            title="From dev to scale, one toolchain."
            sub="The kwiva CLI owns the whole loop — an oxc-powered pipeline that stays fast at every stage."
          />
          <Reveal>
            <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-fd-border bg-fd-border/60 sm:grid-cols-4 lg:grid-cols-7">
              {lifecycleSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.label} className="bg-fd-background p-4">
                    <div className="flex items-center justify-between">
                      <Icon className="size-5 text-kwiva-600 dark:text-kwiva-400" />
                      <span className="font-mono text-[10px] text-fd-muted-foreground/50">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[12.5px] font-semibold text-fd-foreground">
                      {step.label}
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-fd-muted-foreground">
                      {step.desc}
                    </p>
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 text-center font-mono text-[11.5px] text-fd-muted-foreground">
              stateless multi-instance by construction — externalized state everywhere
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================ 09 / JOURNEY ============================ */}
      <section id="journey" className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            n="09"
            kicker="The path"
            title="From discover to extend."
            sub="Each stage lands in the documentation — the homepage is the start of the onboarding, not the end of it."
          />
          <Reveal>
            <ol className="flex snap-x gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
              {journeySteps.map((step, i) => {
                const inner = (
                  <>
                    <span className="font-mono text-[10px] text-kwiva-600 dark:text-kwiva-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-2 block font-mono text-[12.5px] font-semibold text-fd-foreground">
                      {step.label}
                    </span>
                    {step.href ? (
                      <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[10.5px] text-kwiva-600 dark:text-kwiva-400">
                        docs <ArrowUpRight className="size-3" />
                      </span>
                    ) : (
                      <span className="mt-1.5 block font-mono text-[10.5px] text-fd-muted-foreground/50">
                        planned
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={step.label} className="min-w-36 snap-start lg:min-w-0">
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="block h-full rounded-lg border border-fd-border bg-fd-background p-4 transition-colors hover:border-kwiva-500/50 hover:bg-fd-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="block h-full rounded-lg border border-dashed border-fd-border bg-fd-background/50 p-4">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ============================ 10 / DOCUMENTATION ============================ */}
      <section id="documentation" className="border-t border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHead
            n="10"
            kicker="Documentation"
            title="Start learning Kwiva."
            sub="The full portal — guides, architecture notes, decision records and API reference — is one click deep."
          />
          <Reveal>
            <div className="kw-panel overflow-hidden rounded-lg border border-fd-border bg-fd-background">
              <div className="grid divide-y divide-fd-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {(Object.entries(docsIndex) as [string, { label: string; href: string }[]][]).map(
                  ([group, pages]) => (
                    <div key={group} className="p-5">
                      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                        {group}
                      </p>
                      <ul className="space-y-0.5">
                        {pages.map((p) => (
                          <li key={p.href}>
                            <Link
                              href={p.href}
                              className="group flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-[13.5px] text-fd-foreground/85 transition-colors hover:bg-fd-accent/50 hover:text-fd-foreground"
                            >
                              {p.label}
                              <ArrowRight className="size-3.5 shrink-0 text-fd-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-kwiva-500" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-fd-border bg-fd-secondary/30 px-5 py-3.5">
                {[
                  { label: "guides", href: "/guides" },
                  { label: "architecture", href: "/architecture" },
                  { label: "decision records", href: "/architecture/design-principles" },
                  { label: "api reference", href: "/api" },
                  { label: "blog", href: "/blog" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-mono text-[11.5px] text-fd-muted-foreground transition-colors hover:text-kwiva-600 dark:hover:text-kwiva-400"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button
                href="/docs/getting-started"
                variant="primary"
                icon={<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              >
                Start learning Kwiva
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ 11 / CTA ============================ */}
      <section id="cta" className="py-20 lg:py-24">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl border border-kwiva-700/50 bg-kwiva-950 px-6 py-16 text-center shadow-[var(--shadow-soft-md)] sm:px-12">
            <div className="kw-grid pointer-events-none absolute inset-0 -z-10 opacity-25" />
            <div className="kw-noise pointer-events-none absolute inset-0 -z-10" />
            <Parallax
              strength={16}
              className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-kwiva-500/25 blur-3xl"
            />
            <div className="relative">
              <Eyebrow tone="accent" className="justify-center">
                11 — Build
              </Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl font-display font-expanded text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Build with Kwiva.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-white/70">
                One project, one configuration model, one CLI, one defineX language — for everything
                you ship.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                <Button
                  href="/docs/getting-started"
                  variant="contrast"
                  icon={<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                >
                  Create your first app
                </Button>
                <Button
                  href="https://github.com/kwiva/kwiva"
                  variant="inverse"
                  icon={<GithubMark className="size-4" />}
                  iconPosition="leading"
                >
                  GitHub
                </Button>
              </div>
              <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-md border border-white/15 bg-black/30 px-4 py-3 text-left shadow-[var(--shadow-soft-sm)]">
                <span className="font-mono text-sm text-kwiva-300">$</span>
                <code className="flex-1 truncate font-mono text-sm text-white">bun create kwiva</code>
                <CopyButton variant="inverse" value="bun create kwiva" label="" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Flow helpers                                                        */
/* ------------------------------------------------------------------ */

function FlowNode({
  icon: Icon,
  label,
  caption,
  compact = false,
}: {
  icon: typeof Globe;
  label: string;
  caption: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-center rounded-md border border-fd-border bg-fd-secondary/30 px-4 text-center transition-colors hover:border-kwiva-500/50 ${
        compact ? "min-w-0 flex-1 py-2.5" : "min-w-0 flex-1 py-4"
      }`}
    >
      <Icon className="mx-auto size-4 text-kwiva-600 dark:text-kwiva-400" />
      <p className={`mt-1.5 font-mono font-medium text-fd-foreground ${compact ? "text-[11px]" : "text-[12px]"}`}>
        {label}
      </p>
      <p className="mt-0.5 font-mono text-[9.5px] leading-snug text-fd-muted-foreground">{caption}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex shrink-0 items-center px-1.5" aria-hidden="true">
      <svg width="18" height="10" viewBox="0 0 18 10" className="text-fd-border">
        <line x1="0" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1" className="kw-flow-dash" />
        <path d="M12 1.5 L16.5 5 L12 8.5" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
