import { createSignal, onCleanup } from "solid-js";

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

/**
 * スクロール中かどうかを検出するフック
 * iOS でのボタン操作を最適化
 */
export function useScrollDetection(delay = 150) {
  const [isScrolling, setIsScrolling] = createSignal(false);
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    scrollTimer = setTimeout(() => {
      setIsScrolling(false);
      scrollTimer = null;
    }, delay);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("touchmove", handleScroll, { passive: true });

  onCleanup(() => {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("touchmove", handleScroll);
  });

  return isScrolling;
}

/**
 * ボタンクリックのデバウンス
 * 連打を防ぐ
 */
export function useDebounceClick(callback: () => void, delay = 300) {
  let lastClick = 0;
  let isProcessing = false;

  return () => {
    const now = performance.now();
    if (isProcessing || now - lastClick < delay) {
      return;
    }

    lastClick = now;
    isProcessing = true;

    // 非同期処理を待つ
    Promise.resolve(callback()).finally(() => {
      // 最小遅延を保証
      setTimeout(() => {
        isProcessing = false;
      }, delay);
    });
  };
}

/**
 * iOS Safari のタッチイベント最適化
 * タップ時の遅延を削減
 */
export function optimizeTouchEvents() {
  // タップハイライトを無効化
  const style = document.createElement("style");
  style.textContent = `
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
    button, a {
      touch-action: manipulation;
    }
  `;
  document.head.appendChild(style);

  onCleanup(() => {
    style.remove();
  });
}
