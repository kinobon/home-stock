import { onCleanup } from "solid-js";

/**
 * iOS Safari でのスクロール高頻度発火に対するデバウンス対策
 * requestAnimationFrame ベースで最適化
 */
export function useIOSScrollDebounce(callback: () => void, delay = 100) {
  let ticking = false;
  let lastCall = 0;

  const handler = () => {
    const now = performance.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", handler, { passive: true });

  onCleanup(() => {
    window.removeEventListener("scroll", handler);
  });

  return () => {
    window.removeEventListener("scroll", handler);
  };
}
