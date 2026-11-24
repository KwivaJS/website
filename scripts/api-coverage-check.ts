#!/usr/bin/env bun
/**
 * API coverage check — compares documented API against Kwiva source.
 * Run: bun scripts/api-coverage-check.ts
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const KWIVA_ROOT = join(import.meta.dir, "..", "..", "kwivajs");
const DOCS_ROOT = join(import.meta.dir, "..");

function readPkg(pkg: string) {
  return JSON.parse(readFileSync(join(KWIVA_ROOT, "packages", pkg, "package.json"), "utf8"));
}

const packages = [
  "core", "data", "http", "ui", "client", "auth", "jobs", "events",
  "mail", "mcp", "search", "storage", "testing", "cli",
];

const missing: Array<{ pkg: string; symbol: string }> = [];
const versionMismatch: Array<{ pkg: string; doc: string; actual: string }> = [];
const staleLinks: string[] = [];

for (const pkg of packages) {
  const { name, version } = readPkg(pkg);
  const docPath = join(DOCS_ROOT, "content", "api", pkg + ".mdx");
  if (existsSync(docPath)) {
    const doc = readFileSync(docPath, "utf8");
    const m = doc.match(/\*\*Version:\*\* `([^`]+)`/);
    if (m && m[1] !== version) {
      versionMismatch.push({ pkg, doc: m[1], actual: version });
    }
  }
}

// Stale links (renamed/removed pages)
const stalePaths = ["react", "router", "queue", "config", "services"];
const allDocs: string[] = [];
const scan = (dir: string) => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = readFileSync(p, { encoding: "utf8" });
    void st;
  }
};
try {
  const rootDir = join(DOCS_ROOT, "content");
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".mdx")) allDocs.push(p);
    }
  };
  walk(rootDir);
} catch { /* no content dir */ }
for (const f of allDocs) {
  const content = readFileSync(f, "utf8");
  for (const stale of stalePaths) {
    if (content.includes(`/api/${stale}`) || content.includes(`api/${stale}.mdx`)) {
      staleLinks.push(`${f.replace(DOCS_ROOT + "\\", "")}: references removed/renamed api/${stale}`);
    }
  }
}

// Spot-check exports
const spotChecks: Array<[string, string[]]> = [
  ["core", ["defineApp", "defineConfig", "defineService", "afterResponse"]],
  ["data", ["defineModel", "restRoutes", "migrateGenerate"]],
  ["http", ["defineController", "defineContract", "toSSEResponse"]],
  ["ui", ["definePage", "streamPage", "hydrateApp"]],
  ["client", ["useResource", "connectRoute", "enableCachePersistence"]],
  ["auth", ["requireAuth", "definePolicy", "defineGate", "createPkcePair"]],
  ["jobs", ["defineJob", "defineTask", "dispatchBatch", "fakeQueue"]],
  ["events", ["defineEvent", "defineListener", "fakeEvents"]],
  ["mail", ["defineMail", "defineSmtpTransport", "markdownToHtml"]],
  ["mcp", ["defineMcpTool", "generateModelTools", "createMcpServerHandler"]],
  ["search", ["validateSearchConfig", "searchAcross"]],
  ["storage", ["validateStorageConfig", "assetUrl"]],
  ["testing", ["withApp", "createTestClient", "bootAppFromRoot"]],
  ["cli", ["defineCommand", "runMake"]],
];
for (const [pkg, syms] of spotChecks) {
  const docPath = join(DOCS_ROOT, "content", "api", pkg + ".mdx");
  if (!existsSync(docPath)) {
    missing.push({ pkg, symbol: "(page missing)" });
    continue;
  }
  const doc = readFileSync(docPath, "utf8");
  for (const s of syms) {
    if (!doc.includes(s)) missing.push({ pkg, symbol: s });
  }
}

console.log("=== API Coverage Check ===");
console.log(`Version mismatches: ${versionMismatch.length}`);
versionMismatch.forEach((v) => console.log(`  ${v.pkg}: docs say ${v.doc}, actual ${v.actual}`));
console.log(`Missing symbols in api/*.mdx: ${missing.length}`);
missing.forEach((m) => console.log(`  api/${m.pkg}.mdx — ${m.symbol}`));
console.log(`Stale links: ${staleLinks.length}`);
staleLinks.forEach((l) => console.log(`  ${l}`));
process.exit(missing.length + staleLinks.length > 0 ? 1 : 0);
