import { type Component } from "solid-js";
import type { Item } from "../types";
import { setSelectedItem, setView } from "../state/store";

interface ItemCardProps {
  item: Item;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  const handleClick = () => {
    setSelectedItem(props.item.id);
    setView("editor");
  };

  return (
    <button
      onClick={handleClick}
      class="flex w-full items-center gap-3 border-b border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      {/* サムネイル画像（正方形クリップ） */}
      {props.item.photo ? (
        <div class="bg-gray-80 relative size-9 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={props.item.photo} alt={props.item.name} class="h-full w-full object-cover" />
        </div>
      ) : (
        <div class="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <span class="text-3xl">📦</span>
        </div>
      )}

      {/* 名前と所持数 */}
      <div class="flex flex-1 flex-col gap-1">
        <h3 class="text-base font-medium text-gray-900">{props.item.name}</h3>
        <p class="text-sm text-gray-600">所持数: {props.item.quantity}</p>
      </div>
    </button>
  );
};

export default ItemCard;
