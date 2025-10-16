import { For, Show, createMemo, type Component } from "solid-js";
import {
  state,
  setSelectedItem,
  setView,
  incrementQuantity,
  decrementQuantity,
} from "../state/store";
import type { Item } from "../types";
import { Minus, Plus } from "lucide-solid";
import { TagBadge } from "./TagChip";

interface ItemCardProps {
  item: Item;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  const openItemEditor = () => {
    setSelectedItem(props.item.id);
    setView("editor");
  };

  const tagNames = createMemo(() => {
    const tagMap = new Map(state.tags.map((tag) => [tag.id, tag.name]));
    return (props.item.tagIds ?? [])
      .map((tagId) => tagMap.get(tagId))
      .filter((name): name is string => typeof name === "string");
  });

  const handleIncrement = (e: MouseEvent) => {
    e.stopPropagation();
    incrementQuantity(props.item.id);
  };

  const handleDecrement = (e: MouseEvent) => {
    e.stopPropagation();
    decrementQuantity(props.item.id);
  };

  return (
    <div class="flex min-h-[3.5rem] w-full items-center gap-2 border-b border-gray-200 bg-white px-1">
      {/* サムネイル画像 */}
      <button
        onClick={openItemEditor}
        class="flex-shrink-0 px-3 transition-opacity hover:opacity-80 active:opacity-60"
      >
        {props.item.photo ? (
          <div class="relative size-10 overflow-hidden rounded-lg bg-gray-100">
            <img src={props.item.photo} alt={props.item.name} class="h-full w-full object-cover" />
          </div>
        ) : (
          <div class="flex size-10 items-center justify-center rounded-lg bg-gray-100">
            <span class="text-2xl">📦</span>
          </div>
        )}
      </button>

      {/* 名前 */}
      <button
        onClick={openItemEditor}
        class="flex-1 text-left transition-colors hover:text-blue-600 active:text-blue-700"
      >
        <div class="flex flex-col">
          <h3 class="text-base font-medium text-gray-900">{props.item.name}</h3>
          <Show when={tagNames().length > 0}>
            <div class="mt-1 flex flex-wrap gap-1">
              <For each={tagNames()}>{(name) => <TagBadge label={name} />}</For>
            </div>
          </Show>
        </div>
      </button>

      {/* 数量コントロールと差分表示 */}
      <div class="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          class={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            props.item.quantity === 0
              ? "cursor-not-allowed bg-gray-100 text-gray-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
          } `}
          disabled={props.item.quantity === 0}
        >
          <Minus size={16} />
        </button>
        <div class="flex flex-col items-center">
          <span
            class={`w-8 text-center text-sm font-medium ${
              props.item.quantity === 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {props.item.quantity}
          </span>
          <span class="text-[0.62rem] text-gray-600">数量</span>
        </div>
        <button
          onClick={handleIncrement}
          class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
