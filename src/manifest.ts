import { defineManifest } from "@absolutejs/manifest";
import { Type } from "@sinclair/typebox";

type BlogManifestSettings = {
  basePath?: string;
  baseUrl: string;
  description: string;
  language?: string;
  name: string;
  titleSuffix?: string;
};

export const manifest = defineManifest<BlogManifestSettings>()({
  contract: 2,
  identity: {
    accent: "#ff714b",
    category: "content",
    description:
      "Headless blog publishing primitives: typed authors and posts, deterministic registries, reading metrics, SEO metadata, RSS/Atom/JSON feeds, sitemap routes, Elysia feed endpoints, and React hooks without bundled visual components.",
    docsUrl: "https://github.com/absolutejs/blog",
    name: "@absolutejs/blog",
    tagline: "Publish a complete blog without surrendering the design.",
  },
  integration: {
    description:
      "The host supplies its typed posts and owns the renderer. The package wires the publication registry and outputs.",
    mode: "recipe",
  },
  settings: Type.Object({
    basePath: Type.Optional(
      Type.String({
        default: "/blog",
        description: "URL prefix used by the blog index and posts.",
        title: "Blog path",
      }),
    ),
    baseUrl: Type.String({
      description: "Public origin used for canonical post and feed URLs.",
      format: "uri",
      title: "Site URL",
    }),
    description: Type.String({
      description: "Description used by feed documents and blog metadata.",
      title: "Blog description",
    }),
    language: Type.Optional(
      Type.String({
        default: "en",
        description: "BCP 47 language code for feeds and metadata.",
        title: "Language",
      }),
    ),
    name: Type.String({
      description: "Public blog or site name.",
      title: "Blog name",
    }),
    titleSuffix: Type.Optional(
      Type.String({
        description: "Suffix appended to post document titles.",
        title: "Title suffix",
      }),
    ),
  }),
  wiring: [
    {
      description:
        "Define the site once and register typed post metadata without coupling content to a renderer.",
      id: "default",
      server: {
        code: "const blog = createBlog({ site: ${settings}, posts });",
        imports: [{ from: "@absolutejs/blog", names: ["createBlog"] }],
        placement: "module-scope",
      },
      title: "Create a headless blog registry",
    },
  ],
});
