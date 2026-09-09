import { defineConfig, getPressContext } from "fumapress";
import { fumadocsMdx } from "fumapress/adapters/mdx";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { CodeBlock, Pre, CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from "fumadocs-ui/components/codeblock";
import { File, Folder, Files } from "fumadocs-ui/components/files";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from "fumadocs-ui/components/tabs";
import { metaSchema, pageSchema, blogPageSchema, blogMetaSchema } from "fumapress/adapters/mdx/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { blogPlugin } from "fumapress/plugins/blog";
import { llmsPlugin } from "fumapress/plugins/llms.txt";
import { sitemapPlugin } from "fumapress/plugins/sitemap";
import { robotsPlugin } from "fumapress/plugins/robots";
import { rssPlugin } from "fumapress/plugins/rss";
import { flexsearchPlugin } from "fumapress/plugins/flexsearch";
import { takumiPlugin } from "fumapress/plugins/takumi";
import { feedbackPlugin } from "@fumapress/feedback";
import { linkValidationPlugin } from "fumapress/plugins/link-validation";
import { aiPlugin, mcpPlugin } from "@fumapress/ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createNotebookLayoutPage } from "fumapress/layouts/notebook";
import { createGlassLayoutPage } from "fumapress/layouts/glass";
import { createHomeLayout } from "fumapress/layouts/home";
import { NotFound } from "./src/components/not-found";
import { BookIcon, CompassIcon, LayersIcon, BlocksIcon, RssIcon, RocketIcon } from "lucide-react";

// Content collections
const docs = defineDocs({
  dir: "content/docs",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const guides = defineDocs({
  dir: "content/guides",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const architecture = defineDocs({
  dir: "content/architecture",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const apiRef = defineDocs({
  dir: "content/api",
  docs: {
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const blog = defineDocs({
  dir: "content/blog",
  docs: {
    async: true,
    schema: blogPageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: blogMetaSchema,
  },
});

const NotebookLayout = createNotebookLayoutPage<typeof config.$context>();

const GlassLayout = createGlassLayoutPage<typeof config.$context>();

export const HomeLayout = createHomeLayout<typeof config.$context>({});

const config = defineConfig({
  preset: false,
  content: {
    docs: docs.toFumadocsSource({ baseDir: "docs" }),
    guides: guides.toFumadocsSource({ baseDir: "guides" }),
    architecture: architecture.toFumadocsSource({ baseDir: "architecture" }),
    api: apiRef.toFumadocsSource({ baseDir: "api" }),
    blog: blog.toFumadocsSource({ baseDir: "blog" }),
  },
  site: {
    name: "Kwiva",
    // baseUrl: process.env.DEV ? "http://localhost:4000" : "https://kwiva.js.org",
    git: {
      user: "KwivaJS",
      repo: "kwiva",
      branch: "main",
    },
  },
  defaultLayoutProps: {
    nav: {
      title: (
        <span className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Kwiva logo"
            width={24}
            height={24}
            className="size-6 rounded-md"
          />
          <span className="font-semibold">Kwiva</span>
        </span>
      ),
    },
    githubUrl: "https://github.com/kwivajs/kwiva",
    links: [
      {
        url: "/docs",
        text: "Documentation",
        icon: <BookIcon />,
        active: "nested-url",
        on: "nav",
      },
      {
        url: "/guides",
        text: "Guides",
        icon: <CompassIcon />,
        active: "nested-url",
        on: "nav",
      },
      {
        url: "/architecture",
        text: "Architecture",
        icon: <LayersIcon />,
        active: "nested-url",
        on: "nav",
      },
      {
        url: "/api",
        text: "API",
        icon: <BlocksIcon />,
        active: "nested-url",
        on: "nav",
      },
      {
        url: "/blog",
        text: "Blog",
        icon: <RssIcon />,
        active: "nested-url",
        on: "nav",
      },
      {
        url: "/docs/getting-started",
        text: "Get Started",
        type: "button",
        icon: <RocketIcon />,
        on: "nav",
      },
    ],
  },
  renderPage: (props) =>
    props.page.type === "api" ? <NotebookLayout {...props} /> : <GlassLayout {...props} />,
  renderNotFound: async (opts) => (
    <HomeLayout lang={opts.lang}>
      <div className="py-6">
        <NotFound />
      </div>
    </HomeLayout>
  ),
  meta: {
    root() {
      return (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta property="og:image" content={`${this.siteConfig.baseUrl}/logo.png`} />
        </>
      );
    },
    page(page) {
      const title = page.data.title ? `${page.data.title} — Kwiva` : "Kwiva";
      const description =
        page.data.description ||
        "Kwiva is the batteries-included TypeScript framework that replaces your stack — models, APIs, auth, frontend, jobs, realtime, and deployment in one project.";

      return (
        <>
          <meta name="description" content={description} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta property="og:type" content={page.type === "blog" ? "article" : "website"} />
        </>
      );
    },
  },
})
  .adapters(
    fumadocsMdx({
      getMdxComponents: async function (page) {
        return {
          ...defaultMdxComponents,
          a: createRelativeLink(await this.getLoader(), page),
          Accordion,
          Accordions,
          CodeBlock,
          Pre,
          CodeBlockTab,
          CodeBlockTabs,
          CodeBlockTabsList,
          CodeBlockTabsTrigger,
          File,
          Folder,
          Files,
          Step,
          Steps,
          Tab,
          Tabs,
          TabsContent,
          TabsList,
          TabsTrigger,
        };
      },
    })
  )
  .plugins(
    sitemapPlugin(),
    robotsPlugin(),
    rssPlugin(),
    flexsearchPlugin(),
    takumiPlugin(),
    llmsPlugin({
      autoRedirect: true,
    })
  )
  .plugins(feedbackPlugin({}))
  .plugins(
    linkValidationPlugin({
      report: "json",
    })
  )
  .plugins(mcpPlugin())
  .plugins(
    aiPlugin({
      model: createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      }).chat("openrouter/free"),
      systemPrompt:
        "You are Kwiva Assistant, an AI helper for the Kwiva framework documentation. " +
        "Kwiva is the batteries-included TypeScript framework that replaces your stack — " +
        "models, APIs, auth, frontend, jobs, realtime, and deployment in one project. " +
        "Answer questions using the official documentation.",
    })
  );

export default config.plugins(
  blogPlugin({
    layouts: {
      layout: HomeLayout,
    },
  })
);

export { getPressContext };
