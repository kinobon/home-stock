import { createEffect } from "solid-js";

/**
 * 要素のテキストコンテンツをフェードアニメーション付きで切り替える
 */
export function useFadeText(el: HTMLElement | undefined, signal: () => string, duration = 300) {
  if (!el) return;
  let current = signal();

  createEffect(() => {
    const next = signal();
    if (next === current) return;

    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration }).finished.then(() => {
      el.textContent = next;
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
      current = next;
    });
  });
}

/**
 * 要素の内容をフェードアニメーション付きで切り替える（子要素ごと）
 */
export function useFadeContent(el: HTMLElement | undefined, signal: () => unknown, duration = 300) {
  if (!el) return;
  let current = signal();

  createEffect(() => {
    const next = signal();
    if (next === current) return;

    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration }).finished.then(() => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
      current = next;
    });
  });
}

/**
 * タブ切り替え時のフェードアニメーション
 */
export function useFadeSwitch(el: HTMLElement | undefined, signal: () => string, duration = 300) {
  if (!el) return;
  let current = signal();

  createEffect(() => {
    const next = signal();
    if (next === current) return;

    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration }).finished.then(() => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
      current = next;
    });
  });
}
