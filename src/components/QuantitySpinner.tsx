import { createMemo, type Component } from "solid-js";
import { Minus, Plus } from "lucide-solid";

interface QuantitySpinnerProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * QuantitySpinner - 在庫数量を増減するUIコンポーネント
 */
export const QuantitySpinner: Component<QuantitySpinnerProps> = (props) => {
  // クリックハンドラー
  const handleDecrement = () => {
    if (!props.disabled) {
      const newValue = Math.max(props.min ?? 0, props.value - 1);
      props.onChange(newValue);
    }
  };

  const handleIncrement = () => {
    if (!props.disabled) {
      const newValue = Math.min(props.max ?? Infinity, props.value + 1);
      props.onChange(newValue);
    }
  };

  // ボタンの無効化状態
  const isDecrementDisabled = createMemo(() => props.disabled || props.value <= (props.min ?? 0));
  const isIncrementDisabled = createMemo(
    () => props.disabled || (props.max !== undefined && props.value >= props.max)
  );

  // 入力フィールドの変更ハンドラ
  const handleInput = (e: Event) => {
    if (props.disabled) return;
    const value = (e.target as HTMLInputElement).value;
    let num = parseInt(value, 10);
    if (isNaN(num)) num = props.min ?? 0;
    if (props.min !== undefined) num = Math.max(props.min, num);
    if (props.max !== undefined) num = Math.min(props.max, num);
    props.onChange(num);
  };

  // フォーカスアウト時に空欄なら最小値に戻す
  const handleBlur = (e: Event) => {
    if (props.disabled) return;
    const value = (e.target as HTMLInputElement).value;
    if (value === "") {
      props.onChange(props.min ?? 0);
    }
  };

  return (
    <div class="inline-flex items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white">
      <input
        type="number"
        min={props.min}
        max={props.max}
        value={props.value}
        onInput={handleInput}
        onBlur={handleBlur}
        disabled={props.disabled}
        class="w-20 rounded-none border-0 px-4 py-2 text-center text-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
        aria-label="数量を直接入力"
      />
      <div class="w-px bg-gray-200" />
      <div class="flex flex-row gap-1">
        <button
          onClick={handleDecrement}
          disabled={isDecrementDisabled()}
          class="flex h-12 w-12 items-center justify-center rounded-none border-0 text-xl text-gray-700 transition-all hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300"
          aria-label="数量を減らす"
          tabIndex={-1}
        >
          <Minus size={24} strokeWidth={2.2} />
        </button>
        <button
          onClick={handleIncrement}
          disabled={isIncrementDisabled()}
          class="flex h-12 w-12 items-center justify-center rounded-none border-0 text-xl text-gray-700 transition-all hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300"
          aria-label="数量を増やす"
          tabIndex={-1}
        >
          <Plus size={24} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default QuantitySpinner;
