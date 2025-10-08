import { type Component, type JSX, Show, createEffect } from "solid-js";
import { createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
  title: string;
  footer?: JSX.Element;
}

const FullScreenModal: Component<FullScreenModalProps> = (props) => {
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [shouldRender, setShouldRender] = createSignal(false);

  createEffect(() => {
    if (props.isOpen) {
      setShouldRender(true);
      // 次のフレームでアニメーション開始
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // アニメーション終了後に DOM から削除
      setTimeout(() => {
        setShouldRender(false);
      }, 300); // transition duration と同じ
    }
  });

  return (
    <Show when={shouldRender()}>
      <Portal>
        <div
          class={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-out ${
            isAnimating() ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* ヘッダー */}
          <div class="flex items-center gap-3 border-b border-gray-200 p-4">
            <button
              onClick={props.onClose}
              class="rounded-full p-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
            <h2 class="text-lg font-bold text-gray-900">{props.title}</h2>
          </div>

          {/* コンテンツ（スクロール可能） */}
          <div class="flex-1 overflow-y-auto">{props.children}</div>

          {/* フッター（固定） */}
          <Show when={props.footer}>
            <div class="border-t border-gray-200 bg-white p-4">{props.footer}</div>
          </Show>
        </div>
      </Portal>
    </Show>
  );
};

export default FullScreenModal;
