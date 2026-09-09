import { Link } from "fumapress/client";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "../components/home/interactive";
import { Parallax, ScrollRail, type RailSection } from "../components/home/motion";
import { Button, CodeWindow, Eyebrow, GithubMark, Kbd, SectionHead } from "../components/brand";

const ACC = "text-kwiva-600 dark:text-kwiva-400";
const STR = "text-emerald-600 dark:text-emerald-400";

/* Narrative order for the architecture rail — shared with the homepage
   so the same signature interaction reads as one design system, not
   two independently-built pages. */
const railSections: RailSection[] = [
  { id: "hero", label: "About" },
  { id: "why", label: "01 · Why" },
  { id: "philosophy", label: "02 · Philosophy" },
  { id: "boundary", label: "03 · Boundary" },
  { id: "decisions", label: "04 · Decisions" },
  { id: "definex", label: "05 · defineX" },
  { id: "inspiration", label: "06 · Inspiration" },
  { id: "beliefs", label: "07 · Beliefs" },
  { id: "evolution", label: "08 · Evolution" },
  { id: "direction", label: "09 · Direction" },
  { id: "cta", label: "Docs" },
];

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const principles: { statement: string; explanation: string; consequence: string }[] = [
  {
    statement: "Coherence over fragmentation",
    explanation:
      "One shape, one grammar, one narrative. The application talks to a framework, not to a dozen unaffiliated libraries.",
    consequence: "app code imports only @kwiva/*",
  },
  {
    statement: "Framework-owned APIs",
    explanation:
      "Kwiva owns the application-facing surface. Engines live sealed behind it, configured by the framework, never touched by app code.",
    consequence: "no-engine-imports lint gate, enforced by oxlint",
  },
  {
    statement: "Explicit over magical",
    explanation:
      "Plain, serializable definitions — no decorators, no classes, no config sprawl. What you read is what runs.",
    consequence: "definitions you can read, diff and generate",
  },
  {
    statement: "Convention through defineX",
    explanation:
      "Every construct is a factory with one grammar. The syntax you learn for models is the syntax you use for everything.",
    consequence: "17 factories · one grammar (ADR-0019)",
  },
  {
    statement: "Type safety throughout",
    explanation:
      "The model IR drives types from database to API to client. End-to-end inference with zero runtime codegen.",
    consequence: "typed RPC client, generated not hand-written",
  },
  {
    statement: "Batteries included, not forced",
    explanation:
      "Sensible defaults everywhere — and every defineX accepts full inline configuration. When you override, inline wins.",
    consequence: "escape hatches are the rule (ADR-0020)",
  },
  {
    statement: "Production-first",
    explanation:
      "Stateless by construction, observability inside, queues and caching built in. Scaling is a deploy concern, not a rewrite.",
    consequence: "multi-instance without re-architecture",
  },
  {
    statement: "Runtime flexibility",
    explanation:
      "Bun primary, Node compatible, edge via presets. The runtime is a build target — not an identity.",
    consequence: "one codebase · eight deploy targets",
  },
];

const boundaryLayers = [
  { label: "your application", tag: "src/ — yours", desc: "models · controllers · pages · services · jobs · config" },
  { label: "kwiva public api", tag: "@kwiva/*", desc: "the only surface your code sees — 17 packages" },
  { label: "kwiva core system", tag: "framework", desc: "lifecycle · IR · generators · auto-discovery" },
  { label: "internal engines", tag: "sealed", desc: "Nitro · Drizzle · Better Auth · TanStack Query · CrossWS · unstorage" },
  { label: "runtime / infrastructure", tag: "presets", desc: "Bun · Node · edge · eight deploy targets" },
];

const decisions: { adr: string; title: string; why: string }[] = [
  {
    adr: "ADR-0007",
    title: "Bun as the primary runtime",
    why: "Native TypeScript, fast startup, single-binary output — with Node kept compatible.",
  },
  {
    adr: "ADR-0002",
    title: "Nitro as the server foundation",
    why: "Deploy presets, storage, cache and tasks without leaking the engine into app code.",
  },
  {
    adr: "ADR-0003",
    title: "A framework-owned HTTP API",
    why: "Lifecycle, guards and macros designed in-house — Elysia is a reference, not a dependency.",
  },
  {
    adr: "ADR-0004 · 0018",
    title: "The model layer as a function DSL",
    why: "defineModel produces typed IR that derives the whole data plane.",
  },
  {
    adr: "ADR-0006",
    title: "Kwiva owns SSR",
    why: "Streaming-first rendering is part of the framework, not a bolted-on adapter.",
  },
  {
    adr: "ADR-0008 · 0021",
    title: "The oxc toolchain inside the CLI",
    why: "rolldown, oxlint, oxfmt — Rust-speed dev, check, build and format in one binary.",
  },
  {
    adr: "ADR-0009",
    title: "Better Auth as the sealed auth engine",
    why: "Sessions, OAuth and passkeys behind defineAuth — swappable, never imported.",
  },
  {
    adr: "ADR-0015",
    title: "Tenancy-first data access",
    why: "Tenant isolation enforced in the data layer, not sprinkled through handlers.",
  },
];

const inspirations = [
  "Laravel",
  "Elysia",
  "TanStack Router",
  "TanStack Query",
  "Nitro",
  "Vite+",
  "Better Auth",
  "Drizzle",
  "Questpie",
];

const beliefs = [
  "Good defaults should remove decisions, not control.",
  "Types, database and API should never drift apart.",
  "The boundary between application and engine is a feature, not an implementation detail.",
];

const evolution = [
  { stage: "problem", desc: "Full-stack TypeScript assembly cost: sixteen decisions before the first feature." },
  { stage: "research", desc: "Twelve ecosystem studies — Nitro, Vite, TanStack, Elysia, Bun, Better Auth, Laravel, Questpie." },
  { stage: "constraints", desc: "Framework-owned APIs. Hidden engines. One grammar. Runtime flexibility." },
  { stage: "decisions", desc: "Twenty-one architecture decision records, each with consequences made explicit." },
  { stage: "primitives", desc: "Seventeen defineX factories across seventeen @kwiva/* packages." },
  { stage: "unified dx", desc: "One CLI, one config folder, auto-discovery — the v0.3 docset." },
  { stage: "next", desc: "Phased milestones — kernel, realtime + ops, ecosystem — toward a public 1.0." },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <>
      <title>About — Kwiva</title>
      <meta name="description" content="Why Kwiva exists: the philosophy, boundaries and design decisions behind a batteries-included TypeScript application framework." />

      <ScrollRail sections={railSections} />

      {/* ============================ HERO ============================ */}
      <section id="hero" className="kw-hero-glow relative isolate overflow-hidden border-b border-fd-border">
        <div className="kw-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_-10%,black,transparent)]" />
        <div className="kw-noise pointer-events-none absolute inset-0 -z-10" />
        <Parallax
          strength={18}
          className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[24rem] w-[36rem] -translate-x-1/2 rounded-full bg-kwiva-500/10 blur-3xl"
        />
        <div className="mx-auto max-w-3xl py-16 text-center lg:py-24">
          <Reveal>
            <Eyebrow className="justify-center">About — Kwiva</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 font-display font-expanded text-balance text-4xl font-bold leading-[1.06] tracking-tight text-fd-foreground sm:text-5xl lg:text-[3.2rem]">
              A framework should make architecture feel{" "}
              <span className="text-kwiva-600 dark:text-kwiva-400">obvious</span>.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-fd-muted-foreground">
              Kwiva exists because serious TypeScript applications deserve what mature ecosystems
              have: one coherent framework. This page is the reasoning — the philosophy, the
              boundaries and the decisions behind it.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fd-muted-foreground">
              <span>v0.3 · active development</span>
              <span className="text-fd-border">/</span>
              <span>21 decision records</span>
              <span className="text-fd-border">/</span>
              <span>12 research notes</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ 01 / WHY ============================ */}
      <section id="why" className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1fr_260px] lg:gap-14">
          <Reveal>
            <div className="space-y-5 text-[15.5px] leading-relaxed text-fd-muted-foreground">
              <p className="text-lg text-fd-foreground">
                Building a serious application on the modern stack means assembling it yourself:
                runtime, router, HTTP layer, ORM, validation, auth, queues, realtime, SSR,
                observability, deployment.
              </p>
              <p>
                Each choice is defensible. Together they are a tax — sixteen decisions and all the
                glue between them, before a single feature ships. The glue never disappears; it
                becomes the thing you maintain.
              </p>
              <p>
                Kwiva's premise is that a framework should provide coherent defaults and
                abstractions — <em className="text-fd-foreground">without preventing developers from
                extending the system</em>. Batteries included, never batteries forced.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-lg border border-dashed border-fd-border bg-fd-background p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                the assembly tax
              </p>
              <ul className="mt-3 space-y-1 font-mono text-[11.5px] text-fd-muted-foreground/80">
                {[
                  "runtime", "router", "http", "orm", "validation", "auth", "rbac",
                  "tenancy", "queue", "scheduler", "realtime", "ssr", "caching",
                  "observability", "deploy", "…and the glue",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="size-0.5 rounded-full bg-fd-border" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ 02 / PHILOSOPHY ============================ */}
      <section id="philosophy" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="02"
            kicker="Philosophy"
            title="Eight principles, each with a technical consequence."
            sub="Not mission statements — positions you can check against the code."
          />
          <Reveal>
            <ol className="divide-y divide-fd-border">
              {principles.map((p, i) => (
                <li key={p.statement} className="grid gap-2 py-6 sm:grid-cols-[40px_1fr] sm:gap-6">
                  <span className="font-mono text-[11px] text-kwiva-600 dark:text-kwiva-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display font-expanded-md text-lg font-bold text-fd-foreground">
                      {p.statement}
                    </h3>
                    <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-fd-muted-foreground">
                      {p.explanation}
                    </p>
                    <p className="mt-2.5 font-mono text-[11.5px] text-kwiva-700 dark:text-kwiva-300">
                      → {p.consequence}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ============================ 03 / BOUNDARY ============================ */}
      <section id="boundary" className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="03"
            kicker="The boundary"
            title="What Kwiva owns — and what it merely uses."
            sub="One rule protects all of it: the app depends only on the framework. App code never imports an engine or a reference by name."
          />
          <Reveal>
            <div className="kw-panel overflow-hidden rounded-lg border border-fd-border bg-fd-background">
              {boundaryLayers.map((layer, i) => (
                <div key={layer.label}>
                  {i === 1 ? (
                    <div className="relative border-t-2 border-kwiva-500 bg-kwiva-500/5">
                      <span className="absolute -top-2.5 left-4 bg-fd-background px-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-kwiva-600 dark:text-kwiva-400">
                        public api boundary
                      </span>
                    </div>
                  ) : i === 3 ? (
                    <div className="relative border-t border-dashed border-fd-border">
                      <span className="absolute -top-2 left-4 bg-fd-background px-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-fd-muted-foreground">
                        internal — sealed
                      </span>
                    </div>
                  ) : i > 0 ? (
                    <div className="border-t border-fd-border" />
                  ) : null}
                  <div
                    className="grid gap-1.5 px-5 py-4 sm:grid-cols-[220px_1fr_90px] sm:items-baseline"
                    style={{
                      backgroundColor: `color-mix(in oklab, var(--color-fd-secondary) ${i * 6}%, transparent)`,
                    }}
                  >
                    <p className="font-mono text-[12.5px] font-semibold text-fd-foreground">
                      {layer.label}
                    </p>
                    <p className="font-mono text-[11px] leading-relaxed text-fd-muted-foreground">
                      {layer.desc}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-fd-muted-foreground/60 sm:text-right">
                      {layer.tag}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <blockquote className="mx-auto mt-10 max-w-2xl border-l-2 border-kwiva-500 pl-5">
              <p className="kw-quote text-xl leading-snug text-fd-foreground/90">
                “The app depends only on the framework. The framework depends on engines and the oxc
                toolchain.”
              </p>
              <cite className="mt-2 block font-mono text-[11px] not-italic text-fd-muted-foreground">
                — the core architectural rule
              </cite>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ============================ 04 / DECISIONS ============================ */}
      <section id="decisions" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="04"
            kicker="Decisions"
            title="Why these choices."
            sub="Every major choice is recorded as an ADR — with context and consequences. These shape the framework most."
          />
          <Reveal>
            <ol className="divide-y divide-fd-border">
              {decisions.map((d) => (
                <li key={d.adr}>
                  <Link
                    href="/architecture/design-principles"
                    className="group grid gap-1.5 py-4 transition-colors hover:bg-fd-accent/30 sm:grid-cols-[110px_1fr_24px] sm:items-baseline sm:gap-5"
                  >
                    <span className={`font-mono text-[11.5px] ${ACC}`}>{d.adr}</span>
                    <span>
                      <span className="block text-[15px] font-semibold text-fd-foreground">
                        {d.title}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] leading-relaxed text-fd-muted-foreground">
                        {d.why}
                      </span>
                    </span>
                    <ArrowUpRight className="hidden size-4 text-fd-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-kwiva-500 sm:block" />
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center">
              <Link
                href="/architecture/design-principles"
                className="group inline-flex items-center gap-1.5 font-mono text-[12px] font-medium text-kwiva-600 transition-colors hover:text-kwiva-700 dark:text-kwiva-400 dark:hover:text-kwiva-300"
              >
                all 21 decision records
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================ 05 / DEFINE-X ============================ */}
      <section id="definex" className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="05"
            kicker="defineX"
            title="A language, not a collection of APIs."
            sub="Seventeen factories, one grammar. The convention is the product: reading app code should feel like reading a description of the product."
          />
          <Reveal>
            <CodeWindow
              title="src/app/models/post.ts"
              copy={`defineModel("posts", (f) => ({\n  id: f.id(),\n  title: f.string(),\n  status: f.enum("draft", "published"),\n  author: f.belongsTo(() => User),\n}), { timestamps: true })`}
            >
              <code>
                <span className={ACC}>export const</span> Post ={" "}
                <span className={ACC}>defineModel</span>(<span className={STR}>"posts"</span>, (f) =&gt; {"{"}
                {"\n"}  id: f.id(),
                {"\n"}  title: f.string(),
                {"\n"}  status: f.enum(<span className={STR}>"draft"</span>, <span className={STR}>"published"</span>),
                {"\n"}  author: f.belongsTo(() =&gt; User),
                {"\n"}
                {"}"}, {"{"} timestamps: <span className="text-fd-muted-foreground">true</span> {"}"});
              </code>
            </CodeWindow>
            <p className="mt-5 text-[14.5px] leading-relaxed text-fd-muted-foreground">
              No decorators. No classes. No registration files. A model is a value — which is why
              the framework can derive migrations, the REST API, the typed client, Studio, OpenAPI
              and MCP tools from it. The same grammar declares controllers, pages, jobs, policies
              and commands. Learn it once; it never changes shape.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================ 06 / INSPIRATION ============================ */}
      <section id="inspiration" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="06"
            kicker="Inspiration"
            title="Studied, not wrapped."
            sub="Kwiva draws on ecosystems that earned their patterns — then integrates those ideas into its own architecture."
          />
          <Reveal>
            <div className="flex flex-wrap justify-center gap-1.5">
              {inspirations.map((name) => (
                <span
                  key={name}
                  className="rounded-md border border-fd-border bg-fd-background px-3.5 py-1.5 font-mono text-[12px] text-fd-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-xl text-center text-[14.5px] leading-relaxed text-fd-muted-foreground">
              References shape API design and ship <span className="text-fd-foreground">zero</span>{" "}
              runtime code. Engines are sealed behind the framework and never imported by
              applications. Kwiva is not a wrapper around any of these projects — it owns its
              application-facing surface outright.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================ 07 / BELIEFS ============================ */}
      <section id="beliefs" className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl space-y-14">
          {beliefs.map((belief, i) => (
            <Reveal key={belief} delay={i * 60}>
              <blockquote className={`max-w-2xl ${i % 2 === 1 ? "ml-auto text-right" : ""}`}>
                <p className="kw-quote text-balance text-2xl leading-snug text-fd-foreground/90 sm:text-[1.9rem]">
                  “{belief}”
                </p>
                <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                  what we believe — {String(i + 1).padStart(2, "0")}
                </p>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ 08 / EVOLUTION ============================ */}
      <section id="evolution" className="border-y border-fd-border bg-fd-card/40 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="08"
            kicker="Evolution"
            title="How the architecture arrived here."
          />
          <Reveal>
            <ol className="relative space-y-0 border-l border-fd-border pl-0">
              {evolution.map((e, i) => (
                <li key={e.stage} className="relative grid gap-1 pb-7 pl-8 sm:grid-cols-[130px_1fr] sm:gap-6">
                  <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-fd-background bg-kwiva-500" />
                  <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-kwiva-700 dark:text-kwiva-300">
                    {e.stage}
                  </span>
                  <p className="max-w-xl text-[14px] leading-relaxed text-fd-muted-foreground">
                    {e.desc}
                  </p>
                  {i === evolution.length - 1 ? null : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ============================ 09 / DIRECTION ============================ */}
      <section id="direction" className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead
            n="09"
            kicker="Direction"
            title="Where this is going."
            sub="Kwiva is at v0.3, in active development — built in phases, each with a verifiable milestone."
          />
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  phase: "next",
                  title: "MVP kernel",
                  desc: "The full defineX surface — HTTP lifecycle, router + SSR, data hooks, auth, tenancy, Studio v0, oxc integration, node + bun presets.",
                },
                {
                  phase: "then",
                  title: "Realtime + ops",
                  desc: "Events and channels, queue transports with DLQ, tasks and schedule, cache tags, OTel observability, Studio v1, MCP v0.",
                },
                {
                  phase: "later",
                  title: "Ecosystem",
                  desc: "Modules and first-party packages, upgrade codemods, edge hardening, dev overlay — toward the public 1.0.",
                },
              ].map((p, i) => (
                <div
                  key={p.title}
                  className={`kw-panel relative rounded-lg border p-5 ${
                    i === 0 ? "border-kwiva-500/40 bg-fd-background" : "border-fd-border bg-fd-background"
                  }`}
                >
                  {i === 0 ? (
                    <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg bg-gradient-to-b from-kwiva-500 via-kwiva-500/40 to-transparent" />
                  ) : null}
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                      i === 0 ? "text-kwiva-600 dark:text-kwiva-400" : "text-fd-muted-foreground"
                    }`}
                  >
                    phase {i + 1} — {p.phase}
                  </p>
                  <h3 className="mt-2.5 font-display font-expanded-md text-base font-bold text-fd-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-fd-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-lg border border-dashed border-fd-border bg-fd-background p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-fd-muted-foreground">
                explicitly out, v1
              </p>
              <p className="mt-2 text-[13.5px] text-fd-muted-foreground">
                No visual drag-drop CMS. No hosted cloud. No native mobile. No non-TypeScript
                application languages. The scope is the framework.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section id="cta" className="border-t border-fd-border bg-fd-card/40 py-16 lg:py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display font-expanded text-balance text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
              Read the reasoning, then read the code.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-fd-muted-foreground">
              The documentation carries the same architecture this page describes — from{" "}
              <Kbd>defineX</Kbd> to deployment.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <Button
                href="/docs/getting-started"
                variant="primary"
                icon={<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              >
                Start the tutorial
              </Button>
              <Button href="/architecture" variant="secondary">
                Understand the architecture
              </Button>
              <Button
                href="https://github.com/kwiva/kwiva"
                variant="secondary"
                icon={<GithubMark className="size-4" />}
                iconPosition="leading"
              >
                GitHub
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
