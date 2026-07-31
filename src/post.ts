import type {
  BlogAuthor,
  BlogAuthorInput,
  BlogPost,
  BlogPostInput,
  BlogSite,
  BlogSiteInput,
} from "./types";

const IDENTIFIER_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const requireText = (value: string, label: string) => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} must not be empty`);
  }

  return normalized;
};

const normalizeDate = (value: Date | string, label: string) => {
  const date =
    value instanceof Date
      ? new Date(value)
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00.000Z`)
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date`);
  }

  return date.toISOString();
};

const normalizeBaseUrl = (value: string) => {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Blog baseUrl must use HTTP or HTTPS");
  }
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/$/, "");
};

const normalizePath = <Path extends `/${string}`>(
  value: Path,
  label: string,
) => {
  if (value.includes("?") || value.includes("#")) {
    throw new Error(`${label} must not include a query string or hash`);
  }

  const normalized = `/${value.replace(/^\/+|\/+$/g, "")}` as Path;

  return String(normalized) === "/" ? ("/" as Path) : normalized;
};

export const defineAuthor = <const Author extends BlogAuthorInput>(
  input: Author,
) => {
  const id = requireText(input.id, "Author id");
  if (!IDENTIFIER_PATTERN.test(id)) {
    throw new Error(
      "Author id must contain lowercase letters, numbers, and single hyphens",
    );
  }

  return Object.freeze({
    ...input,
    id,
    kind: input.kind ?? "person",
    name: requireText(input.name, "Author name"),
  }) as Readonly<Author & BlogAuthor>;
};

export const definePost = <
  const Slug extends string,
  const Author extends BlogAuthor,
>(
  input: BlogPostInput<Slug, Author>,
): Readonly<BlogPost<Slug, Author>> => {
  const slug = requireText(input.slug, "Post slug");
  if (!IDENTIFIER_PATTERN.test(slug)) {
    throw new Error(
      "Post slug must contain lowercase letters, numbers, and single hyphens",
    );
  }

  const publishedAt = normalizeDate(input.publishedAt, "publishedAt");
  const updatedAt =
    input.updatedAt === undefined
      ? undefined
      : normalizeDate(input.updatedAt, "updatedAt");

  if (
    updatedAt !== undefined &&
    new Date(updatedAt).getTime() < new Date(publishedAt).getTime()
  ) {
    throw new Error("updatedAt must not be earlier than publishedAt");
  }

  const tags = [
    ...new Set(
      (input.tags ?? [])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  ];
  const {
    draft: _draft,
    publishedAt: _publishedAt,
    tags: _tags,
    updatedAt: _updatedAt,
    ...post
  } = input;

  return Object.freeze({
    ...post,
    author: input.author,
    description: requireText(input.description, "Post description"),
    draft: input.draft ?? false,
    publishedAt,
    slug: slug as Slug,
    tags: Object.freeze(tags),
    title: requireText(input.title, "Post title"),
    ...(updatedAt === undefined ? {} : { updatedAt }),
  });
};

export const defineBlogSite = (input: BlogSiteInput): BlogSite => {
  const basePath = normalizePath(input.basePath ?? "/blog", "basePath");
  const feedBase = basePath === "/" ? "" : basePath;

  return Object.freeze({
    ...input,
    basePath,
    baseUrl: normalizeBaseUrl(input.baseUrl),
    description: requireText(input.description, "Blog description"),
    feed: Object.freeze({
      ...input.feed,
      paths: Object.freeze({
        atom: normalizePath(
          input.feed?.paths?.atom ?? `${feedBase}/atom.xml`,
          "Atom feed path",
        ),
        json: normalizePath(
          input.feed?.paths?.json ?? `${feedBase}/feed.json`,
          "JSON feed path",
        ),
        rss: normalizePath(
          input.feed?.paths?.rss ?? `${feedBase}/rss.xml`,
          "RSS feed path",
        ),
      }),
    }),
    language: input.language ?? "en",
    name: requireText(input.name, "Blog name"),
    titleSuffix: input.titleSuffix ?? input.name,
  });
};

export const postPath = (post: BlogPost, site: BlogSite) =>
  `${site.basePath === "/" ? "" : site.basePath}/${post.slug}`;

export const postUrl = (post: BlogPost, site: BlogSite) =>
  post.canonicalUrl ?? `${site.baseUrl}${postPath(post, site)}`;
