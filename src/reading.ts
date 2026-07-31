import type { ReadingTime, ReadingTimeOptions } from "./types";

const DEFAULT_WORDS_PER_MINUTE = 225;
const DEFAULT_MINIMUM_MINUTES = 1;

export const textFromMarkup = (value: string) =>
  value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(
      /&(?:nbsp|amp|lt|gt|quot|#39|apos);/gi,
      (entity) =>
        ({
          "&#39;": "'",
          "&amp;": "&",
          "&apos;": "'",
          "&gt;": ">",
          "&lt;": "<",
          "&nbsp;": " ",
          "&quot;": '"',
        })[entity.toLowerCase()] ?? " ",
    )
    .replace(/\s+/g, " ")
    .trim();

export const countWords = (value: string) => {
  const text = textFromMarkup(value);
  if (text.length === 0) return 0;

  if (typeof Intl.Segmenter === "function") {
    const segments = new Intl.Segmenter(undefined, {
      granularity: "word",
    }).segment(text);

    return Array.from(segments).filter((segment) => segment.isWordLike).length;
  }

  return text.split(/\s+/u).length;
};

export const estimateReadingTime = (
  value: string,
  options: ReadingTimeOptions = {},
): ReadingTime => {
  const wordsPerMinute = options.wordsPerMinute ?? DEFAULT_WORDS_PER_MINUTE;
  const minimumMinutes = options.minimumMinutes ?? DEFAULT_MINIMUM_MINUTES;

  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new Error("wordsPerMinute must be greater than zero");
  }
  if (!Number.isInteger(minimumMinutes) || minimumMinutes < 0) {
    throw new Error("minimumMinutes must be a non-negative integer");
  }

  const words = countWords(value);
  const minutes = Math.max(minimumMinutes, Math.ceil(words / wordsPerMinute));

  return {
    minutes,
    text: `${minutes} min read`,
    words,
    wordsPerMinute,
  };
};
