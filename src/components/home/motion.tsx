"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Shared scroll channel                                               */
/* ------------------------------------------------------------------ */
/*
 * ScrollRail and Parallax both need to react to scroll position. Giving
 * each instance its own `window.addEventListener("scroll", ...)` means N
 * consumers on a page cost N listeners, each firing on every scroll
 * event — the classic cause of scroll-jank on content-heavy pages.
 *
 * Instead, every consumer subscribes to this single module-level
 * channel. The first subscriber attaches one passive scroll/resize
 * listener; the last unsubscribe removes it. Each listener call is
 * coalesced onto a single requestAnimationFrame, so a burst of scroll
 * events collapses into at most one layout read + paint per frame
 * regardless of how many components are listening.
 */
type ScrollListener = () => void;

const listeners = new Set<ScrollListener>();
let rafHandle: number | null = null;

function flush() {
  rafHandle = null;
  for (const listener of listeners) listener();
}

function schedule() {
  if (rafHandle === null) rafHandle = requestAnimationFrame(flush);
}

function subscribeToScroll(listener: ScrollListener): () => void {
  if (typeof window === "undefined") return () => {};
  if (listeners.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    }
  };
}

/* ------------------------------------------------------------------ */
/* prefers-reduced-motion                                              */
/* ------------------------------------------------------------------ */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ------------------------------------------------------------------ */
/* Architecture rail — the homepage's signature interaction             */
/* ------------------------------------------------------------------ */
/*
 * A vertical progress axis pinned to the left viewport edge (xl+ only).
 * It does three things at once, which is why it earns its place as the
 * one deliberate piece of "extra" motion on the page rather than a
 * decorative add-on:
 *
 *   1. Reading progress — the fill height reflects how far through the
 *      document the visitor has scrolled.
 *   2. Scrollspy — the nearest section's tick brightens as it becomes
 *      current, giving the numbered sections (00, 01, 02…) a live
 *      "you are here" marker instead of being purely decorative labels.
 *   3. Jump navigation — each tick is a real, keyboard-operable button
 *      that scrolls to its section, so it is also the fastest way to
 *      skim the page's architecture without scrolling through it.
 *
 * Tick positions are measured against each section's actual offsetTop
 * rather than spaced evenly, so the rail is a faithful (if compressed)
 * map of the page rather than an evenly-spaced decoration.
 */

export interface RailSection {
  id: string;
  label: string;
}

export function ScrollRail({ sections }: { sections: RailSection[] }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [tickOffsets, setTickOffsets] = useState<number[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  // Measure each section's position along the scrollable range once on
  // mount and on resize (layout-affecting, so not part of the per-frame
  // scroll channel).
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setTickOffsets(
        sections.map((s) => {
          const el = document.getElementById(s.id);
          return el ? Math.min(1, Math.max(0, el.offsetTop / max)) : 0;
        })
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [sections]);

  // Reading progress, via the shared scroll channel.
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    return subscribeToScroll(update);
  }, []);

  // Scrollspy, via a single IntersectionObserver watching every section.
  // A narrow band near the top of the viewport ("current reading line")
  // is what counts as active — the last section (in document order) to
  // cross that band is the one the visitor is reading.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const isVisible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible.set(entry.target.id, entry.isIntersecting);
        }
        const current = sections.map((s) => s.id).filter((id) => isVisible.get(id));
        if (current.length > 0) setActiveId(current[current.length - 1] as string);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Section progress"
      className="fixed inset-y-0 left-5 z-30 hidden py-28 xl:flex"
    >
      <div
        className="kw-rail-track"
        style={{ "--rail-progress": progress } as CSSProperties}
      >
        <div className="kw-rail-fill" />
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(s.id)}
            data-active={activeId === s.id}
            aria-current={activeId === s.id ? "true" : undefined}
            aria-label={s.label}
            className="kw-rail-tick"
            style={{ top: `${(tickOffsets[i] ?? i / Math.max(1, sections.length - 1)) * 100}%` }}
          >
            <span className="kw-rail-dot" aria-hidden="true" />
            <span className="kw-rail-tick-label">{s.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax — decorative background motion only                        */
/* ------------------------------------------------------------------ */
/*
 * Restrained (small `strength`, translateY only) and strictly for
 * decorative background layers: it always renders with aria-hidden and
 * should never wrap content a screen reader or reduced-motion visitor
 * needs. Disabled outright — not just slowed — when reduced motion is
 * requested, since the effect adds nothing functional.
 */

export function Parallax({
  children,
  strength = 14,
  className = "",
}: {
  /** Optional — Parallax is just as often a standalone decorative blob, styled entirely via `className`. */
  children?: ReactNode;
  /** Maximum translateY in pixels as the element crosses the viewport. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const elementMid = rect.top + rect.height / 2;
      const viewportMid = window.innerHeight / 2;
      const offset = ((elementMid - viewportMid) / window.innerHeight) * strength;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };
    update();
    return subscribeToScroll(update);
  }, [reducedMotion, strength]);

  return (
    <div
      ref={ref}
      data-parallax="true"
      aria-hidden="true"
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
