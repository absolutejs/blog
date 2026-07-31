import { Elysia } from "elysia";
import type { Blog } from "./registry";
import type { BlogFeedPaths } from "./types";

const feedResponse = (body: string, contentType: string) =>
  new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Type": `${contentType}; charset=utf-8`,
    },
  });

export const blogFeeds = <const Paths extends BlogFeedPaths>(
  blog: Blog,
  paths: Paths,
) => {
  const feeds = blog.feeds();

  return new Elysia({ name: "@absolutejs/blog/feeds" })
    .get(paths.rss, () => feedResponse(feeds.rss, "application/rss+xml"))
    .get(paths.atom, () => feedResponse(feeds.atom, "application/atom+xml"))
    .get(paths.json, () => feedResponse(feeds.json, "application/feed+json"));
};
