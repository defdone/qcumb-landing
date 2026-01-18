import { useEffect } from "react";

export function useScrollRestoration(key: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const y = parseInt(stored, 10);
      if (!Number.isNaN(y)) {
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
    }

    const onScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);
}
