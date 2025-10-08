import { type Component, type JSX, Show, createEffect } from "solid-js";
import { createSignal } from "solid-js";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
  title?: string;
}

const BottomSheet: Component<BottomSheetProps> = (props) => {
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

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={shouldRender()}>
      <div
        class={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${
          isAnimating() ? "bg-black/50" : "bg-black/0"
        }`}
        onClick={handleBackdropClick}
      >
        <div
          class={`w-full max-w-4xl bg-white transition-transform duration-300 ease-out md:rounded-t-3xl ${
            isAnimating() ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ "max-height": "90vh" }}
        >
          {/* ヘッダー（タイトルがある場合） */}
          <Show when={props.title}>
            <div class="border-b border-gray-200 p-3 px-4">
              <h2 class="text-lg font-bold text-gray-900">{props.title}</h2>
            </div>
          </Show>

          {/* コンテンツ */}
          <div class="overflow-y-auto">{props.children}</div>
        </div>
      </div>
    </Show>
  );
};

export default BottomSheet;
