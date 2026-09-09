# Data 02 — Storage

**Status**: Baseline · **Updated**: 2026-09-08 · **Docset**: v0.3

File and object storage: uploads, generated artifacts, public assets. Laravel-disks-inspired surfaces over unstorage + Bun-native clients (hidden engines).

## Disks

```ts
// src/config/storage.ts
export default defineConfig('storage', {
  defaults: {
    public: { driver: 'local', root: 'public' },
    uploads: { driver: 'local', root: 'storage/uploads' },
    s3: {
      driver: 's3',
      bucket: 'acme-media',
      region: 'eu-west-1',
      env: { accessKey: 'S3_ACCESS_KEY', secret: 'S3_SECRET' },
    },
  },
})
```

## API

```ts
import { storage } from '@kwiva/core'

// put / get
const path = await storage.put('uploads/avatars', bytes, { disk: 'uploads', contentType: 'image/png' })
const file = await storage.get(path, { disk: 'uploads' })

// URLs
const url = storage.url(path, { disk: 's3' })                       // public CDN URL
const signed = await storage.signedUrl(path, { expiresIn: 3600 })   // time-limited

// manage
await storage.delete(path)
const { files, dirs } = await storage.list('uploads/avatars')
await storage.copy(path, 'backups/' + path)
```

- Tenant-scoped: paths are prefixed per tenant automatically (`storage/{tenantId}/...`).
- Metadata: `{ size, contentType, lastModified, etag }` returned from `stat(path)`.

## Upload flow (server-side)

```ts
c.post('/avatar', async ({ file, session }) => {
  const { filename, bytes, type } = await file()
  return storage.put(`avatars/${session.user.id}`, bytes, { contentType: type })
}, { file: { maxSize: '2mb', types: ['image/png', 'image/jpeg'] } })
```

Validation at the route; storage handles the write; the path is stored on the model.

## What each disk driver maps to

| Driver | Engine | Environments |
|---|---|---|
| `local` | unstorage fs driver | dev, node/bun server presets |
| `s3` | Bun S3 client / unstorage s3 | prod |
| `r2` | s3-compatible (Cloudflare R2) | edge deploys |
| `kv` | unstorage kv | edge-safe small artifacts |
| `memory` | unstorage memory | tests |

## Static assets

- `public/` served raw by the engine — build copies into `.output/public`.
- Hashed build assets (client chunks from rolldown) served with immutable cache headers.
- `kwiva build` emits a manifest mapping logical → hashed names for `assetUrl()`.

## Backups & exports (v1.x)

- `storage.dump(disk)` / `kwiva storage:sync s3 uploads` CLI.
- DB backup tasks pattern: `defineTask('db-backup')` → dump → `storage.put('backups/...', ...)`.

## Testing

- `storage.fake()` — in-memory disk swap; assert on stored paths/bytes (see `engineering/02`).
