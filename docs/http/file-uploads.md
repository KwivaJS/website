# File Uploads (/docs/http/file-uploads)



# File Uploads [#file-uploads]

## `ctx.file()` [#ctxfile]

```ts title="src/app/http/controllers/avatars.ts"
api.post("/", async (ctx) => {
  const [file] = ctx.file("avatar"); // Array<UploadedFile>
  if (!file) throw new Error("missing file");
  const { key } = await storage.put(file.name, await file.arrayBuffer(), { contentType: file.type });
  return { key, url: storage.disk().url(key) };
});
```

`UploadedFile` — has `name`, `type`, `size`, `arrayBuffer()`, `text()`, `stream()`, `blob()`.

## Validation [#validation]

* `ctx.file()` throws if missing (NOT\_FOUND/BAD\_REQUEST).
* Field-level: `contentType` regex, `size` max — via input contract.

## `storage` integration [#storage-integration]

See [File Storage](/docs/data/storage).

## `@kwiva/client` uploads [#kwivaclient-uploads]

`useUpload(routeId)` — multipart via FormData, or direct object from `client.Files.put(...)`.

## Example — `storage:put` endpoint [#example--storageput-endpoint]

```ts title="src/app/http/controllers/storage-files.ts"
export const StorageFilesController = defineController({
  prefix: "/api/files",
  routes(api) {
    api.post("/", async (ctx) => {
      const [file] = ctx.file("file");
      const put = await storage.signedUploadUrl(file.name, { expiresIn: 60_000, maxSize: 10_000_000 });
      return put;
    }, { name: "upload-url", input: { file: FileContract } });
  },
});
```

> \[!TIP]
> For large files, use presigned URLs directly from the browser/CLI.
