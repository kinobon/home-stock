/**
 * ページ遷移アニメーション用のディレクティブ
 */

export type TransitionType = "fade" | "slide-left" | "slide-right";

interface TransitionOptions {
  type?: TransitionType;
  duration?: number;
  easing?: string;
}

/**
 * フェードイン トランジション
 */
export function fadeIn(el: HTMLElement, duration = 300, easing = "ease-out") {
  el.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration,
    easing,
    fill: "forwards",
  });
}

/**
 * スライドイン トランジション（左から）
 */
export function slideInLeft(el: HTMLElement, duration = 300, easing = "ease-out") {
  el.animate(
    [
      { opacity: 0, transform: "translateX(-20px)" },
      { opacity: 1, transform: "translateX(0)" },
    ],
    {
      duration,
      easing,
      fill: "forwards",
    }
  );
}

/**
 * スライドイン トランジション（右から）
 */
export function slideInRight(el: HTMLElement, duration = 300, easing = "ease-out") {
  el.animate(
    [
      { opacity: 0, transform: "translateX(20px)" },
      { opacity: 1, transform: "translateX(0)" },
    ],
    {
      duration,
      easing,
      fill: "forwards",
    }
  );
}

/**
 * 汎用トランジションディレクティブ
 * 使い方: <div use:transition={{ type: 'fade', duration: 400 }}>
 */
export function transition(el: HTMLElement, options: TransitionOptions = {}) {
  const { type = "fade", duration = 300, easing = "ease-out" } = options;

  switch (type) {
    case "slide-left":
      slideInLeft(el, duration, easing);
      break;
    case "slide-right":
      slideInRight(el, duration, easing);
      break;
    case "fade":
    default:
      fadeIn(el, duration, easing);
      break;
  }
}

/**
 * タブ切り替え用のトランジション
 * 前のタブのインデックスと現在のタブのインデックスから方向を判定
 */
export function tabTransition(
  el: HTMLElement,
  prevIndex: number,
  currentIndex: number,
  duration = 300
) {
  const isForward = currentIndex > prevIndex;
  const type = isForward ? "slide-left" : "slide-right";
  transition(el, { type, duration, easing: "ease-out" });
}
