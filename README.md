# @absolutejs/blog

Headless blog publishing for AbsoluteJS. The package owns post contracts,
publication metadata, feeds, sitemap routes, and browser hooks. Your
application owns every element and every style.

## Define a blog

```ts
import { createBlog, defineAuthor, definePost } from "@absolutejs/blog";

const author = defineAuthor({
  id: "alex-kahn",
  name: "Alex Kahn",
  role: "AbsoluteJS",
});

const post = definePost({
  author,
  description: "Why provider differences belong in typed data.",
  publishedAt: "2026-07-31",
  slug: "why-citra-typed-oauth",
  tags: ["OAuth", "TypeScript", "Citra"],
  title: "Why Citra: Typed OAuth Without Provider Classes",
});

export const blog = createBlog({
  posts: [post],
  site: {
    baseUrl: "https://absolutejs.com",
    description: "Engineering notes from AbsoluteJS.",
    name: "AbsoluteJS Blog",
    publisher: {
      name: "AbsoluteJS",
      url: "https://absolutejs.com",
    },
  },
});
```

`blog.all()` returns published posts newest first. Drafts stay out of public
lookups, feeds, and sitemap routes unless explicitly requested.

```ts
blog.get("why-citra-typed-oauth");
blog.byTag("TypeScript");
blog.relatedTo(post);
blog.sitemapRoutes();
blog.head(post);
```

`blog.head(post)` returns canonical, Open Graph, Twitter, article meta, and
`BlogPosting` JSON-LD values that can be passed to the AbsoluteJS `Head`
component.

## Feeds

Mount all three standard feed formats with the optional Elysia plugin:

```ts
import { blogFeeds } from "@absolutejs/blog/elysia";

new Elysia().use(blogFeeds(blog));
```

The defaults are:

- `/blog/rss.xml`
- `/blog/atom.xml`
- `/blog/feed.json`

The core package also exports `generateRssFeed`, `generateAtomFeed`, and
`generateJsonFeed` for applications that own their routes.

## Reading hooks

The React subpath contains hooks, not visual components:

```tsx
import {
  useActiveHeading,
  useReadingProgress,
  useReadingTime,
} from "@absolutejs/blog/react";

const articleRef = useRef<HTMLElement>(null);
const progress = useReadingProgress(articleRef);
const readingTime = useReadingTime(articleRef);
const activeHeading = useActiveHeading(articleRef, sectionIds);
```

Progress is measured against the article element instead of the entire
document, so a site header and footer do not distort it.

## License

Business Source License 1.1. The licensed work converts to Apache 2.0 on
July 31, 2030.
