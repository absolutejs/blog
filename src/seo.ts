import { postUrl } from "./post";
import type { BlogHeadMetadata, BlogPost, BlogSite } from "./types";

const localeFromLanguage = (language: string) =>
  language.includes("-") ? language.replace("-", "_") : `${language}_US`;

export const toBlogHeadMetadata = (
  post: BlogPost,
  site: BlogSite,
): BlogHeadMetadata => {
  const canonical = postUrl(post, site);
  const image = post.image?.url;
  const title = `${post.title} | ${site.titleSuffix}`;
  const creator =
    post.author.kind === "person" &&
    post.author.url?.startsWith("https://x.com/")
      ? (`@${post.author.url.split("/").at(-1)}` as `@${string}`)
      : undefined;
  const author = {
    "@type":
      post.author.kind === "organization"
        ? ("Organization" as const)
        : ("Person" as const),
    name: post.author.name,
    ...(post.author.url === undefined ? {} : { url: post.author.url }),
    ...(post.author.avatarUrl === undefined
      ? {}
      : { image: post.author.avatarUrl }),
    ...(post.author.kind !== "person" || post.author.role === undefined
      ? {}
      : { jobTitle: post.author.role }),
  };
  const meta: BlogHeadMetadata["meta"] = [
    { content: post.author.name, name: "author" },
    { content: post.publishedAt, property: "article:published_time" },
    ...post.tags.map((tag) => ({
      content: tag,
      property: "article:tag",
    })),
  ];

  if (post.updatedAt !== undefined) {
    meta.push({
      content: post.updatedAt,
      property: "article:modified_time",
    });
  }

  return {
    canonical,
    description: post.description,
    jsonLd: {
      "@type": "BlogPosting",
      author,
      datePublished: post.publishedAt,
      ...(post.updatedAt === undefined ? {} : { dateModified: post.updatedAt }),
      description: post.description,
      headline: post.title,
      ...(image === undefined ? {} : { image }),
      ...(post.tags.length === 0 ? {} : { keywords: [...post.tags] }),
      mainEntityOfPage: canonical,
      ...(site.publisher === undefined
        ? {}
        : {
            publisher: {
              "@type": "Organization" as const,
              name: site.publisher.name,
              ...(site.publisher.url === undefined
                ? {}
                : { url: site.publisher.url }),
              ...(site.publisher.logoUrl === undefined
                ? {}
                : { logo: site.publisher.logoUrl }),
            },
          }),
    },
    meta,
    openGraph: {
      description: post.description,
      ...(image === undefined
        ? {}
        : {
            image,
            imageAlt: post.image?.alt,
            imageHeight: post.image?.height,
            imageWidth: post.image?.width,
          }),
      locale: localeFromLanguage(site.language),
      siteName: site.name,
      title: post.title,
      type: "article",
      url: canonical,
    },
    title,
    twitter: {
      card: image === undefined ? "summary" : "summary_large_image",
      ...(creator === undefined ? {} : { creator }),
      description: post.description,
      ...(image === undefined ? {} : { image, imageAlt: post.image?.alt }),
      ...(site.twitterSite === undefined ? {} : { site: site.twitterSite }),
      title: post.title,
    },
  };
};
