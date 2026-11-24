# File Storage (/docs/data/storage)



# File Storage [#file-storage]

`@kwiva/storage` — S3-compatible disks API over Files SDK (sealed engine).

## Config — `src/config/storage.ts` [#config--srcconfigstoragets]

```ts
export default defineConfig({
  default: "local",
  disks: {
    local: { driver: "local", root: "./storage/app", publicUrl: null },
    s3: { driver: "s3", options: { bucket, region, prefix: "uploads" } },
  },
  tenant: { scoped: true, prefix: "tenants" },
});
```

Drivers: `"local" | "memory" | "s3" | "gcs" | "azure" | "vercel-blob"` (STORAGE\_DRIVERS).

## Storage facade [#storage-facade]

```ts
import { storage } from "@kwiva/storage";

await storage.put("avatar.png", file.arrayBuffer(), { contentType: "image/png" });
const data = await storage.get("avatar.png");
await storage.delete("avatar.png");
await storage.list({ prefix: "uploads" });
```

## Disk (tenant-scoped) [#disk-tenant-scoped]

`storage.disk("local")` — same API. `storage.disk("s3").file("a.txt").url()` — public URL helper.

## Signed URLs [#signed-urls]

* `storage.signedUrl("file.pdf", { expiresIn: 60_000 })` — GET url
* `storage.signedUploadUrl("uploads/x.bin", { expiresIn: 60_000, contentType })` — returns `{url, method, headers?}`

## Assets (hashed manifest) [#assets-hashed-manifest]

`assetUrl("./my.svg", { baseUrl })` — resolves via `public/assets-manifest.json` or `KWIVA_ASSET_MANIFEST`.

## Fakes (tests) [#fakes-tests]

```ts
const fake = storage.fake();
fake.assertUploaded(disk, key);
fake.assertMissing(disk, key);
```

## Errors [#errors]

`StorageError` codes: `STORAGE_NOT_FOUND`, `STORAGE_CONFLICT`, `STORAGE_INVALID`, `STORAGE_UNAVAILABLE`, `STORAGE_TENANT_REQUIRED`.
