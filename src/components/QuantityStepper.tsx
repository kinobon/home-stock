import { createMemo, type Component } from "solid-js";
import { Minus, Plus } from "lucide-solid";
import { useDebounceClick, useScrollDetection } from "../utils/scroll";

interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * QuantityStepper - 在庫数量を増減するUIコンポーネント
 *
 * iOS最適化:
 * - スクロール中は自動的に無効化
 * - デバウンス処理で連打を防止
 * - パフォーマンスを考慮した実装
 */
export const QuantityStepper: Component<QuantityStepperProps> = (props) => {
  // スクロール検出
  const isScrolling = useScrollDetection();

  // デバウンス付きクリックハンドラー
  const handleDecrement = useDebounceClick(() => {
    if (!isScrolling() && !props.disabled) {
      const newValue = Math.max(props.min ?? 0, props.value - 1);
      props.onChange(newValue);
    }
  }, 300);

  const handleIncrement = useDebounceClick(() => {
    if (!isScrolling() && !props.disabled) {
      const newValue = Math.min(props.max ?? Infinity, props.value + 1);
      props.onChange(newValue);
    }
  }, 300);

  // ボタンの無効化状態
  const isDisabled = createMemo(() => isScrolling() || props.disabled);
  const isDecrementDisabled = createMemo(() => isDisabled() || props.value <= (props.min ?? 0));
  const isIncrementDisabled = createMemo(
    () => isDisabled() || (props.max !== undefined && props.value >= props.max)
  );

  return (
    <div class="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
      <button
        onClick={handleDecrement}
        disabled={isDecrementDisabled()}
        class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
        aria-label="数量を減らす"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>
      <span
        class="min-w-[3rem] px-2 text-center text-lg font-semibold text-gray-900"
        aria-live="polite"
      >
        {props.value}
      </span>
      <button
        onClick={handleIncrement}
        disabled={isIncrementDisabled()}
        class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
        aria-label="数量を増やす"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QuantityStepper;
