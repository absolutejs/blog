import { postUrl } from "./post";
import type { BlogFeedSet, BlogPost, BlogSite } from "./types";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const feedUpdatedAt = (posts: readonly BlogPost[]) =>
  posts.reduce((latest, post) => {
    const value = post.updatedAt ?? post.publishedAt;

    return value > latest ? value : latest;
  }, "1970-01-01T00:00:00.000Z");

export const generateRssFeed = (posts: readonly BlogPost[], site: BlogSite) => {
  const published = posts.filter((post) => !post.draft);
  const self = `${site.baseUrl}${site.feed.paths.rss}`;
  const items = published
    .map((post) => {
      const url = postUrl(post, site);

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
        `      <author>${escapeXml(post.author.name)}</author>`,
        ...post.tags.map(
          (tag) => `      <category>${escapeXml(tag)}</category>`,
        ),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)}</title>`,
    `    <link>${escapeXml(`${site.baseUrl}${site.basePath}`)}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <language>${escapeXml(site.language)}</language>`,
    `    <lastBuildDate>${new Date(feedUpdatedAt(published)).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>`,
    ...(site.feed.copyright === undefined
      ? []
      : [`    <copyright>${escapeXml(site.feed.copyright)}</copyright>`]),
    items,
    "  </channel>",
    "</rss>",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
};

export const generateAtomFeed = (
  posts: readonly BlogPost[],
  site: BlogSite,
) => {
  const published = posts.filter((post) => !post.draft);
  const self = `${site.baseUrl}${site.feed.paths.atom}`;
  const entries = published
    .map((post) => {
      const url = postUrl(post, site);

      return [
        "  <entry>",
        `    <title>${escapeXml(post.title)}</title>`,
        `    <id>${escapeXml(url)}</id>`,
        `    <link href="${escapeXml(url)}"/>`,
        `    <published>${post.publishedAt}</published>`,
        `    <updated>${post.updatedAt ?? post.publishedAt}</updated>`,
        `    <summary>${escapeXml(post.description)}</summary>`,
        "    <author>",
        `      <name>${escapeXml(post.author.name)}</name>`,
        ...(post.author.url === undefined
          ? []
          : [`      <uri>${escapeXml(post.author.url)}</uri>`]),
        "    </author>",
        ...post.tags.map((tag) => `    <category term="${escapeXml(tag)}"/>`),
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(site.name)}</title>`,
    `  <id>${escapeXml(`${site.baseUrl}${site.basePath}`)}</id>`,
    `  <link href="${escapeXml(self)}" rel="self"/>`,
    `  <link href="${escapeXml(`${site.baseUrl}${site.basePath}`)}"/>`,
    `  <updated>${feedUpdatedAt(published)}</updated>`,
    `  <subtitle>${escapeXml(site.description)}</subtitle>`,
    entries,
    "</feed>",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
};

export const generateJsonFeed = (posts: readonly BlogPost[], site: BlogSite) =>
  JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: site.name,
      home_page_url: `${site.baseUrl}${site.basePath}`,
      feed_url: `${site.baseUrl}${site.feed.paths.json}`,
      description: site.description,
      language: site.language,
      items: posts
        .filter((post) => !post.draft)
        .map((post) => {
          const url = postUrl(post, site);

          return {
            id: url,
            url,
            title: post.title,
            summary: post.description,
            date_published: post.publishedAt,
            ...(post.updatedAt === undefined
              ? {}
              : { date_modified: post.updatedAt }),
            authors: [
              {
                name: post.author.name,
                ...(post.author.url === undefined
                  ? {}
                  : { url: post.author.url }),
                ...(post.author.avatarUrl === undefined
                  ? {}
                  : { avatar: post.author.avatarUrl }),
              },
            ],
            tags: [...post.tags],
            ...(post.image === undefined ? {} : { image: post.image.url }),
          };
        }),
    },
    null,
    2,
  );

export const generateBlogFeeds = (
  posts: readonly BlogPost[],
  site: BlogSite,
): BlogFeedSet => ({
  atom: generateAtomFeed(posts, site),
  json: generateJsonFeed(posts, site),
  rss: generateRssFeed(posts, site),
});
