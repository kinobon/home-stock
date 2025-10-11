import { For, createMemo, type Component } from "solid-js";
import { state, setView, confirmAllQuantities, updateItem } from "../state/store";
import { Minus, Plus, ArrowLeft } from "lucide-solid";

const CounterScreen: Component = () => {
  const handleBack = () => {
    setView("list");
  };

  const handleConfirm = async () => {
    await confirmAllQuantities();
    setView("list");
  };

  // 差分のある項目をチェック
  const hasDiff = createMemo(() => {
    return state.items.some((item) => item.quantity !== item.confirmedValue);
  });

  return (
    <div class="flex h-full flex-col bg-gray-50">
      {/* ヘッダー */}
      <header class="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={handleBack}
          class="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
          aria-label="戻る"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 class="text-lg font-bold text-gray-900">数量調整</h1>
      </header>

      {/* アイテムリスト */}
      <div class="flex-1 overflow-y-auto pb-24">
        <div class="mx-auto max-w-4xl">
          <For each={state.items}>
            {(item) => {
              const diff = () => item.quantity - item.confirmedValue;
              const diffColor = () => {
                const d = diff();
                if (d > 0) return "text-green-600";
                if (d < 0) return "text-red-600";
                return "text-transparent"; // レイアウト維持のため透明
              };

              return (
                <div class="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4">
                  {/* アイコン + 項目名 */}
                  <div class="flex flex-1 items-center gap-3">
                    {item.photo ? (
                      <div class="relative size-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img src={item.photo} alt={item.name} class="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div class="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <span class="text-2xl">📦</span>
                      </div>
                    )}
                    <h3 class="text-base font-medium text-gray-900">{item.name}</h3>
                  </div>

                  {/* カウンター操作部 */}
                  <div class="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (item.quantity > 0) {
                          updateItem(item.id, { quantity: item.quantity - 1 });
                        }
                      }}
                      disabled={item.quantity === 0}
                      class={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        item.quantity === 0
                          ? "cursor-not-allowed bg-gray-100 text-gray-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
                      }`}
                    >
                      <Minus size={16} />
                    </button>

                    <div class="flex flex-col items-center">
                      <span class="w-12 text-center text-base font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <span class="text-xs text-gray-600">枚数</span>
                    </div>

                    <button
                      onClick={() => {
                        updateItem(item.id, { quantity: item.quantity + 1 });
                      }}
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>

                    {/* 差分表示 */}
                    <div class={`min-w-[3rem] text-center text-sm font-medium ${diffColor()}`}>
                      {diff() !== 0 ? `${diff() > 0 ? "+" : ""}${diff()}` : ""}
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* 確定ボタン */}
      <div
        class="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white p-4 shadow-lg"
        style={{
          "padding-bottom": "calc(1rem + env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={handleConfirm}
          disabled={!hasDiff()}
          class={`w-full rounded-lg py-3 text-base font-bold shadow-md transition-all ${
            hasDiff()
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          確定
        </button>
      </div>
    </div>
  );
};

export default CounterScreen;
