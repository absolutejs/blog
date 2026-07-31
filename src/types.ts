export type BlogAuthorKind = "organization" | "person";

export type BlogAuthor = {
  avatarUrl?: string;
  id: string;
  kind: BlogAuthorKind;
  name: string;
  role?: string;
  url?: string;
};

export type BlogAuthorInput = Omit<BlogAuthor, "kind"> & {
  kind?: BlogAuthorKind;
};

export type BlogPostInput<
  Slug extends string = string,
  Author extends BlogAuthor = BlogAuthor,
> = {
  author: Author;
  canonicalUrl?: string;
  description: string;
  draft?: boolean;
  image?: {
    alt: string;
    height?: number;
    url: string;
    width?: number;
  };
  publishedAt: Date | string;
  slug: Slug;
  sourceUrl?: string;
  tags?: readonly string[];
  title: string;
  updatedAt?: Date | string;
};

export type BlogPost<
  Slug extends string = string,
  Author extends BlogAuthor = BlogAuthor,
> = Omit<
  BlogPostInput<Slug, Author>,
  "draft" | "publishedAt" | "tags" | "updatedAt"
> & {
  draft: boolean;
  publishedAt: string;
  tags: readonly string[];
  updatedAt?: string;
};

export type BlogPublisher = {
  logoUrl?: string;
  name: string;
  url?: string;
};

export type BlogSiteInput = {
  basePath?: `/${string}`;
  baseUrl: string;
  description: string;
  feed?: {
    copyright?: string;
    paths?: {
      atom?: `/${string}`;
      json?: `/${string}`;
      rss?: `/${string}`;
    };
  };
  language?: string;
  name: string;
  publisher?: BlogPublisher;
  titleSuffix?: string;
  twitterSite?: `@${string}`;
};

export type BlogSite = Omit<
  BlogSiteInput,
  "basePath" | "feed" | "language" | "titleSuffix"
> & {
  basePath: `/${string}`;
  feed: {
    copyright?: string;
    paths: {
      atom: `/${string}`;
      json: `/${string}`;
      rss: `/${string}`;
    };
  };
  language: string;
  titleSuffix: string;
};

export type BlogPostQuery = {
  includeDrafts?: boolean;
};

export type BlogHeadMetadata = {
  canonical: string;
  description: string;
  jsonLd: {
    "@type": "BlogPosting";
    author: {
      "@type": "Organization" | "Person";
      image?: string;
      jobTitle?: string;
      name: string;
      url?: string;
    };
    dateModified?: string;
    datePublished: string;
    description: string;
    headline: string;
    image?: string;
    keywords?: string[];
    mainEntityOfPage: string;
    publisher?: {
      "@type": "Organization";
      logo?: string;
      name: string;
      url?: string;
    };
  };
  meta: Array<{
    content: string;
    name?: string;
    property?: string;
  }>;
  openGraph: {
    description: string;
    image?: string;
    imageAlt?: string;
    imageHeight?: number;
    imageWidth?: number;
    locale: string;
    siteName: string;
    title: string;
    type: "article";
    url: string;
  };
  title: string;
  twitter: {
    card: "summary" | "summary_large_image";
    creator?: `@${string}`;
    description: string;
    image?: string;
    imageAlt?: string;
    site?: `@${string}`;
    title: string;
  };
};

export type ReadingTime = {
  minutes: number;
  text: string;
  words: number;
  wordsPerMinute: number;
};

export type ReadingTimeOptions = {
  minimumMinutes?: number;
  wordsPerMinute?: number;
};

export type BlogFeedSet = {
  atom: string;
  json: string;
  rss: string;
};

export type BlogFeedPaths = {
  atom: `/${string}`;
  json: `/${string}`;
  rss: `/${string}`;
};
