import { generateAtomFeed, generateJsonFeed, generateRssFeed } from "./feeds";
import { defineBlogSite, postPath } from "./post";
import { toBlogHeadMetadata } from "./seo";
import type { BlogPost, BlogPostQuery, BlogSiteInput } from "./types";

const newestFirst = (left: BlogPost, right: BlogPost) =>
  new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();

export const createBlog = <const Posts extends readonly BlogPost[]>(input: {
  posts: Posts;
  site: BlogSiteInput;
}) => {
  const site = defineBlogSite(input.site);
  const slugs = new Set<string>();

  for (const post of input.posts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate blog post slug "${post.slug}"`);
    }
    slugs.add(post.slug);
  }

  const posts = Object.freeze([...input.posts].sort(newestFirst));
  const visible = ({ includeDrafts = false }: BlogPostQuery = {}) =>
    includeDrafts ? posts : posts.filter((post) => !post.draft);
  const get = (slug: string, query?: BlogPostQuery) =>
    visible(query).find((post) => post.slug === slug);

  return Object.freeze({
    all: visible,
    byTag: (tag: string, query?: BlogPostQuery) =>
      visible(query).filter((post) => post.tags.includes(tag)),
    feeds: () => ({
      atom: generateAtomFeed(posts, site),
      json: generateJsonFeed(posts, site),
      rss: generateRssFeed(posts, site),
    }),
    get,
    head: (post: BlogPost) => toBlogHeadMetadata(post, site),
    posts,
    relatedTo: (
      postOrSlug: BlogPost | string,
      options: BlogPostQuery & { limit?: number } = {},
    ) => {
      const post =
        typeof postOrSlug === "string"
          ? get(postOrSlug, { includeDrafts: options.includeDrafts })
          : postOrSlug;
      if (post === undefined) return [];

      const tags = new Set(post.tags);

      return visible(options)
        .filter((candidate) => candidate.slug !== post.slug)
        .map((candidate) => ({
          post: candidate,
          score:
            candidate.tags.filter((tag) => tags.has(tag)).length * 2 +
            (candidate.author.id === post.author.id ? 1 : 0),
        }))
        .filter(({ score }) => score > 0)
        .sort(
          (left, right) =>
            right.score - left.score || newestFirst(left.post, right.post),
        )
        .slice(0, options.limit ?? 3)
        .map(({ post: candidate }) => candidate);
    },
    site,
    sitemapRoutes: (query?: BlogPostQuery) => [
      site.basePath,
      ...visible(query).map((post) => postPath(post, site)),
    ],
  });
};

export type Blog = ReturnType<typeof createBlog>;
