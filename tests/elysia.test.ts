import { describe, expect, test } from "bun:test";
import { createBlog, defineAuthor, definePost } from "../src";
import { blogFeeds } from "../src/elysia";

const blog = createBlog({
  posts: [
    definePost({
      author: defineAuthor({
        id: "absolutejs",
        kind: "organization",
        name: "AbsoluteJS",
      }),
      description: "A feed test.",
      publishedAt: "2026-07-31",
      slug: "feed-test",
      title: "Feed test",
    }),
  ],
  site: {
    baseUrl: "https://absolutejs.com",
    description: "AbsoluteJS posts.",
    name: "AbsoluteJS Blog",
  },
});

describe("Elysia feed plugin", () => {
  const app = blogFeeds(blog, {
    atom: "/blog/atom.xml",
    json: "/blog/feed.json",
    rss: "/blog/rss.xml",
  });

  test.each([
    ["/blog/rss.xml", "application/rss+xml"],
    ["/blog/atom.xml", "application/atom+xml"],
    ["/blog/feed.json", "application/feed+json"],
  ])("serves %s with its feed content type", async (path, contentType) => {
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(contentType);
    expect(await response.text()).toContain("Feed test");
  });
});
