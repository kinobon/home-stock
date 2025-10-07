import { createMemo, type Component } from "solid-js";
import type { Item } from "../types";
import {
  incrementQuantity,
  decrementQuantity,
  removeItem,
  setSelectedItem,
  setView,
} from "../state/store";
import { useScrollDetection } from "../utils/scroll";
import { Edit, Trash2 } from "lucide-solid";
import QuantityStepper from "./QuantityStepper";

interface ItemCardProps {
  item: Item;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  // スクロール検出
  const isScrolling = useScrollDetection();

  const handleQuantityChange = (newValue: number) => {
    if (newValue > props.item.quantity) {
      incrementQuantity(props.item.id);
    } else if (newValue < props.item.quantity) {
      decrementQuantity(props.item.id);
    }
  };

  const handleEdit = () => {
    if (!isScrolling()) {
      setSelectedItem(props.item.id);
      setView("editor");
    }
  };

  const handleDelete = () => {
    if (isScrolling()) return;
    if (confirm(`「${props.item.name}」を削除しますか?`)) {
      removeItem(props.item.id);
    }
  };

  // ボタンの無効化状態
  const isDisabled = createMemo(() => isScrolling());

  return (
    <div class="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-xl">
      {props.item.photo && (
        <div class="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img src={props.item.photo} alt={props.item.name} class="h-full w-full object-cover" />
        </div>
      )}
      <div class="p-4">
        <h3 class="mb-1 text-xl font-medium text-gray-900">{props.item.name}</h3>
        {props.item.memo && (
          <p class="mb-4 text-sm leading-relaxed text-gray-600">{props.item.memo}</p>
        )}

        <div class="flex items-center justify-between gap-3">
          <QuantityStepper value={props.item.quantity} onChange={handleQuantityChange} min={0} />

          <div class="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={isDisabled()}
              class="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Edit size={16} />
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={isDisabled()}
              class="flex items-center justify-center rounded-full bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="削除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
