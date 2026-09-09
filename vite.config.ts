import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import press from "fumapress/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { remarkMdxFiles } from "fumadocs-core/mdx-plugins/remark-mdx-files";

export default defineConfig({
  plugins: [
    press(),
    fumadocsMdx({
      globalOptions: {
        mdxOptions: {
          remarkPlugins: [remarkMdxFiles],
        },
      },
    }),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ["@vercel/oidc", "lucide-react"],
  },
});
