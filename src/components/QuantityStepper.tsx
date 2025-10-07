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
    <div class="flex items-center gap-2">
      <button
        onClick={handleDecrement}
        disabled={isDecrementDisabled()}
        class="flex items-center justify-center rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="数量を減らす"
      >
        <Minus size={18} />
      </button>
      <span class="min-w-[3rem] text-center text-xl font-bold" aria-live="polite">
        {props.value}
      </span>
      <button
        onClick={handleIncrement}
        disabled={isIncrementDisabled()}
        class="flex items-center justify-center rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="数量を増やす"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default QuantityStepper;
