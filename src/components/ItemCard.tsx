import type { Component } from "solid-js";
import type { Item } from "../types";
import {
  incrementQuantity,
  decrementQuantity,
  removeItem,
  setSelectedItem,
  setView,
} from "../state/store";

interface ItemCardProps {
  item: Item;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  const handleEdit = () => {
    setSelectedItem(props.item.id);
    setView("editor");
  };

  const handleDelete = () => {
    if (confirm(`「${props.item.name}」を削除しますか?`)) {
      removeItem(props.item.id);
    }
  };

  return (
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {props.item.photo && (
        <img src={props.item.photo} alt={props.item.name} class="h-48 w-full object-cover" />
      )}
      <div class="p-4">
        <h3 class="mb-2 text-lg font-semibold text-gray-800">{props.item.name}</h3>
        {props.item.memo && <p class="mb-3 text-sm text-gray-600">{props.item.memo}</p>}

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              onClick={() => decrementQuantity(props.item.id)}
              class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 active:scale-95"
            >
              ➖
            </button>
            <span class="min-w-[3rem] text-center text-xl font-bold">{props.item.quantity}</span>
            <button
              onClick={() => incrementQuantity(props.item.id)}
              class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600 active:scale-95"
            >
              ➕
            </button>
          </div>

          <div class="flex gap-2">
            <button
              onClick={handleEdit}
              class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            >
              ✏️ 編集
            </button>
            <button
              onClick={handleDelete}
              class="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
            >
              🗑️ 削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
