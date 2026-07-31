import { describe, expect, test } from "bun:test";
import {
  createBlog,
  defineAuthor,
  definePost,
  estimateReadingTime,
  generateAtomFeed,
  generateJsonFeed,
  generateRssFeed,
  textFromMarkup,
} from "../src";

const alex = defineAuthor({
  id: "alex-kahn",
  kind: "person",
  name: "Alex Kahn",
  role: "AbsoluteJS",
});

const first = definePost({
  author: alex,
  description: "The first typed post.",
  publishedAt: "2026-07-30",
  slug: "first-post",
  tags: ["TypeScript", "AbsoluteJS", "TypeScript"],
  title: "First post",
});

const second = definePost({
  author: alex,
  description: "The second typed post.",
  publishedAt: "2026-07-31",
  slug: "second-post",
  tags: ["AbsoluteJS"],
  title: "Second post",
  updatedAt: "2026-08-01",
});

const draft = definePost({
  author: alex,
  description: "Not public yet.",
  draft: true,
  publishedAt: "2026-08-02",
  slug: "future-post",
  title: "Future post",
});

const site = {
  baseUrl: "https://absolutejs.com/",
  description: "Engineering notes from AbsoluteJS.",
  name: "AbsoluteJS Blog",
  publisher: {
    name: "AbsoluteJS",
    url: "https://absolutejs.com",
  },
  twitterSite: "@absolute_js" as const,
};

describe("post definitions", () => {
  test("normalizes dates, defaults, and unique tags", () => {
    expect(first.publishedAt).toBe("2026-07-30T00:00:00.000Z");
    expect(first.draft).toBeFalse();
    expect(first.tags).toEqual(["TypeScript", "AbsoluteJS"]);
  });

  test("rejects invalid slugs and date ordering", () => {
    expect(() =>
      definePost({
        author: alex,
        description: "Invalid slug.",
        publishedAt: "2026-07-30",
        slug: "Not Valid",
        title: "Invalid",
      }),
    ).toThrow("Post slug");
    expect(() =>
      definePost({
        author: alex,
        description: "Invalid dates.",
        publishedAt: "2026-07-30",
        slug: "invalid-dates",
        title: "Invalid dates",
        updatedAt: "2026-07-29",
      }),
    ).toThrow("updatedAt");
  });
});

describe("blog registry", () => {
  const blog = createBlog({
    posts: [first, second, draft],
    site,
  });

  test("sorts newest first and hides drafts by default", () => {
    expect(blog.all().map((post) => post.slug)).toEqual([
      "second-post",
      "first-post",
    ]);
    expect(blog.get("future-post")).toBeUndefined();
    expect(blog.get("future-post", { includeDrafts: true })).toBe(draft);
  });

  test("returns tag matches, related posts, and sitemap paths", () => {
    expect(blog.byTag("TypeScript")).toEqual([first]);
    expect(blog.relatedTo(first)).toEqual([second]);
    expect(blog.sitemapRoutes()).toEqual([
      "/blog",
      "/blog/second-post",
      "/blog/first-post",
    ]);
  });

  test("produces AbsoluteJS-compatible article metadata", () => {
    const metadata = blog.head(second);

    expect(metadata.canonical).toBe("https://absolutejs.com/blog/second-post");
    expect(metadata.jsonLd["@type"]).toBe("BlogPosting");
    expect(metadata.jsonLd.dateModified).toBe("2026-08-01T00:00:00.000Z");
    expect(metadata.openGraph.type).toBe("article");
    expect(metadata.twitter.site).toBe("@absolute_js");
    expect(metadata.meta).toContainEqual({
      content: second.publishedAt,
      property: "article:published_time",
    });
  });

  test("rejects duplicate slugs", () => {
    expect(() => createBlog({ posts: [first, first], site })).toThrow(
      "Duplicate blog post slug",
    );
  });
});

describe("reading metrics", () => {
  test("removes markup and calculates a deterministic estimate", () => {
    expect(textFromMarkup("<p>Hello &amp; welcome.</p><style>no</style>")).toBe(
      "Hello & welcome.",
    );
    expect(
      estimateReadingTime("one two three four", {
        minimumMinutes: 0,
        wordsPerMinute: 2,
      }),
    ).toEqual({
      minutes: 2,
      text: "2 min read",
      words: 4,
      wordsPerMinute: 2,
    });
  });
});

describe("feeds", () => {
  const blog = createBlog({ posts: [first, second, draft], site });

  test("generates RSS and Atom without drafts", () => {
    const rss = generateRssFeed(blog.posts, blog.site);
    const atom = generateAtomFeed(blog.posts, blog.site);

    expect(rss).toContain("<title>Second post</title>");
    expect(rss).not.toContain("Future post");
    expect(atom).toContain("<id>https://absolutejs.com/blog/first-post</id>");
    expect(atom).not.toContain("Future post");
  });

  test("generates JSON Feed 1.1", () => {
    const feed = JSON.parse(generateJsonFeed(blog.posts, blog.site));

    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items).toHaveLength(2);
    expect(feed.items[0].date_modified).toBe("2026-08-01T00:00:00.000Z");
  });
});
