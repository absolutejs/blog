import { Elysia } from "elysia";
import type { Blog } from "./registry";

const feedResponse = (body: string, contentType: string) =>
  new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Type": `${contentType}; charset=utf-8`,
    },
  });

export const blogFeeds = (blog: Blog) => {
  const feeds = blog.feeds();

  return new Elysia({ name: "@absolutejs/blog/feeds" })
    .get(blog.site.feed.paths.rss, () =>
      feedResponse(feeds.rss, "application/rss+xml"),
    )
    .get(blog.site.feed.paths.atom, () =>
      feedResponse(feeds.atom, "application/atom+xml"),
    )
    .get(blog.site.feed.paths.json, () =>
      feedResponse(feeds.json, "application/feed+json"),
    );
};
