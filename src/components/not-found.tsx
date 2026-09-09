import Link from "fumadocs-core/link";
import { Search, BookOpen, Database, Code2, ShieldCheck, Rocket, Layers, ArrowRight } from "lucide-react";

const popularPages = [
  { href: "/docs/getting-started", label: "Getting Started", description: "Install Kwiva and create your first project", icon: Rocket },
  { href: "/docs/core-concepts/definex", label: "The defineX Convention", description: "One grammar for every framework construct", icon: BookOpen },
  { href: "/docs/data/models", label: "Models", description: "The single source of truth for your data layer", icon: Database },
  { href: "/docs/http/controllers", label: "Controllers", description: "Define your typed API surface", icon: Code2 },
  { href: "/docs/auth", label: "Authentication", description: "Sessions, providers, and route protection", icon: ShieldCheck },
  { href: "/docs/deployment", label: "Deployment", description: "One codebase, many targets", icon: Layers },
];

export function NotFound() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-fd-border bg-fd-background">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-kwiva-500/20 blur-3xl" />

      <div className="relative flex flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-kwiva-600 dark:text-kwiva-400">404</p>

        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-4 max-w-md text-balance text-sm text-fd-muted-foreground">
          The page you’re looking for doesn’t exist, was moved, or has been renamed.
          Try searching the docs instead.
        </p>

        <form
          action="/docs"
          method="get"
          className="mt-8 flex w-full max-w-md items-center gap-2 rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm transition-colors focus-within:border-kwiva-500/60 focus-within:ring-2 focus-within:ring-kwiva-500/20"
        >
          <Search className="size-4 shrink-0 text-fd-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search the documentation…"
            aria-label="Search the documentation"
            className="w-full bg-transparent text-fd-foreground outline-none placeholder:text-fd-muted-foreground"
          />
          <kbd className="hidden shrink-0 items-center rounded-md border border-fd-border bg-fd-background px-1.5 py-0.5 font-mono text-[11px] text-fd-muted-foreground sm:inline-flex">
            ⌘ K
          </kbd>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex h-10 items-center gap-2 rounded-md bg-kwiva-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-kwiva-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500"
          >
            Back to homepage
          </Link>

          <Link
            href="/docs"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-fd-border bg-fd-background px-5 text-sm font-semibold text-fd-foreground transition-colors hover:border-kwiva-500/50 hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500"
          >
            Read the documentation
          </Link>
        </div>

        <div className="mt-14 w-full max-w-2xl text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-fd-muted-foreground">
            Popular pages
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {popularPages.map(({ href, label, description, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-start gap-3 rounded-lg border border-fd-border bg-fd-background p-3 transition-colors hover:border-kwiva-500/50 hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kwiva-500"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-fd-border bg-fd-background text-kwiva-600 dark:text-kwiva-400">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-medium text-fd-foreground">
                      {label}
                      <ArrowRight className="size-3.5 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-fd-muted-foreground">
                      {description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
