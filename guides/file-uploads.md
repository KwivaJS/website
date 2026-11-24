# How do I handle file uploads? (/guides/file-uploads)



# File Uploads [#file-uploads]

## Basic [#basic]

```ts title="src/app/http/controllers/uploads.ts"
export const UploadsController = defineController({
  prefix: "/api/uploads",
  routes(api) {
    api.post("/", async (ctx) => {
      const [file] = ctx.file("file");
      const result = await storage.put(file.name, await file.arrayBuffer(), {
        contentType: file.type,
      });
      return { key: result.key, url: storage.disk().url(result.key) };
    });
  },
});
```

## Validation [#validation]

* Use `contract` for shape
* Verify file type in `storage.put` options
* Size limits in browser (client-side, not server default)

## Storage [#storage]

See [Storage](/docs/data/storage) for setup.

> \[!TIP]
> Use `signedUrl` for image thumbnails + `assetUrl` for hashed assets.
