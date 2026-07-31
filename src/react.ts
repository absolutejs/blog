import { useEffect, useState, type RefObject } from "react";
import { estimateReadingTime } from "./reading";
import type { ReadingTime, ReadingTimeOptions } from "./types";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const useReadingProgress = (
  articleRef: RefObject<HTMLElement | null>,
) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number | undefined;

    const update = () => {
      frame = undefined;
      const article = articleRef.current;
      if (article === null) {
        setProgress(0);

        return;
      }

      const top = article.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, article.offsetHeight - window.innerHeight);
      setProgress(clamp((window.scrollY - top) / distance));
    };
    const schedule = () => {
      if (frame === undefined) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [articleRef]);

  return progress;
};

export const useReadingTime = (
  articleRef: RefObject<HTMLElement | null>,
  options: ReadingTimeOptions = {},
) => {
  const [readingTime, setReadingTime] = useState<ReadingTime | null>(null);
  const minimumMinutes = options.minimumMinutes;
  const wordsPerMinute = options.wordsPerMinute;

  useEffect(() => {
    const article = articleRef.current;
    if (article === null) {
      setReadingTime(null);

      return;
    }

    const update = () =>
      setReadingTime(
        estimateReadingTime(article.innerText, {
          minimumMinutes,
          wordsPerMinute,
        }),
      );
    const observer = new MutationObserver(update);

    update();
    observer.observe(article, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [articleRef, minimumMinutes, wordsPerMinute]);

  return readingTime;
};

export const useActiveHeading = (
  articleRef: RefObject<HTMLElement | null>,
  headingIds: readonly string[],
  offset = 120,
) => {
  const [activeHeading, setActiveHeading] = useState<string>();
  const ids = headingIds.join("\u0000");

  useEffect(() => {
    const article = articleRef.current;
    if (article === null || headingIds.length === 0) {
      setActiveHeading(undefined);

      return;
    }

    let frame: number | undefined;
    const headings = headingIds
      .map((id) => article.querySelector<HTMLElement>(`#${CSS.escape(id)}`))
      .filter((heading): heading is HTMLElement => heading !== null);
    const update = () => {
      frame = undefined;
      const current =
        headings
          .filter((heading) => heading.getBoundingClientRect().top <= offset)
          .at(-1) ?? headings[0];
      setActiveHeading(current?.id);
    };
    const schedule = () => {
      if (frame === undefined) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [articleRef, ids, offset]);

  return activeHeading;
};
