import type { Component } from "solid-js";
import {
  setSelectedItem,
  setView,
  incrementQuantity,
  decrementQuantity,
  removeItem,
} from "../state/store";
import type { Item } from "../types";
import { GripVertical, Minus, Plus, Trash2 } from "lucide-solid";

interface ItemCardProps {
  item: Item;
  index: number;
  isDraggable: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  onHandleTouchStart: (e: TouchEvent) => void;
  onHandleTouchMove: (e: TouchEvent) => void;
  onHandleTouchEnd: () => void;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  const handleClick = () => {
    if (props.isDraggable) return; // 編集モード中はクリック無効
    setSelectedItem(props.item.id);
    setView("editor");
  };

  const handleIncrement = (e: MouseEvent) => {
    e.stopPropagation();
    incrementQuantity(props.item.id);
  };

  const handleDecrement = (e: MouseEvent) => {
    e.stopPropagation();
    decrementQuantity(props.item.id);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (confirm(`「${props.item.name}」を削除しますか？`)) {
      removeItem(props.item.id);
    }
  };

  return (
    <div
      data-item-index={props.index}
      draggable={props.isDraggable}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDragEnd={props.onDragEnd}
      onDragLeave={props.onDragLeave}
      class={"flex w-full items-center gap-3 border-b border-gray-200 bg-white transition-all"}
    >
      {/* サムネイル画像 */}
      <button
        onClick={handleClick}
        disabled={props.isDraggable}
        class={`flex-shrink-0 p-3 transition-opacity ${
          props.isDraggable ? "" : "hover:opacity-80 active:opacity-60"
        }`}
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
        onClick={handleClick}
        disabled={props.isDraggable}
        class={`flex-1 text-left transition-colors ${
          props.isDraggable ? "" : "hover:text-blue-600 active:text-blue-700"
        }`}
      >
        <h3 class="text-base font-medium text-gray-900">{props.item.name}</h3>
      </button>

      {/* 数量コントロール */}
      {!props.isDraggable && (
        <div class="flex items-center gap-2 pr-3">
          <button
            onClick={handleDecrement}
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300"
            disabled={props.item.quantity === 0}
          >
            <Minus size={16} />
          </button>
          <div class="flex flex-col items-center">
            <span class="w-8 text-center text-sm font-medium text-gray-900">
              {props.item.quantity}
            </span>
            <span class="text-[0.62rem] text-gray-600">所持数</span>
          </div>
          <button
            onClick={handleIncrement}
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* ドラッグハンドル（編集モード時のみ表示・右側） */}
      {props.isDraggable && (
        <>
          {/* 削除ボタン */}
          <button
            onClick={handleDelete}
            class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 active:bg-red-300"
          >
            <Trash2 size={18} />
          </button>

          {/* ドラッグハンドル */}
          <div
            class="flex h-full cursor-grab touch-none items-center px-3 text-gray-400 active:cursor-grabbing"
            onTouchStart={props.onHandleTouchStart}
            onTouchMove={props.onHandleTouchMove}
            onTouchEnd={props.onHandleTouchEnd}
          >
            <GripVertical size={20} />
          </div>
        </>
      )}
    </div>
  );
};

export default ItemCard;
