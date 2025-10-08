import type { Component } from "solid-js";
import { setSelectedItem, setView } from "../state/store";
import type { Item } from "../types";
import { GripVertical } from "lucide-solid";

interface ItemCardProps {
  item: Item;
  isDraggable: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  const handleClick = () => {
    if (props.isDraggable) return; // 編集モード中はクリック無効
    setSelectedItem(props.item.id);
    setView("editor");
  };

  return (
    <div
      draggable={props.isDraggable}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDragEnd={props.onDragEnd}
      onDragLeave={props.onDragLeave}
      class={`flex w-full items-center gap-3 border-b border-gray-200 bg-white transition-all ${
        props.isDragging ? "opacity-50" : ""
      } ${props.isDragOver ? "border-t-4 border-t-blue-500" : ""}`}
    >
      {/* ドラッグハンドル（編集モード時のみ表示） */}
      {props.isDraggable && (
        <div class="flex h-full items-center px-2 text-gray-400">
          <GripVertical size={20} />
        </div>
      )}

      {/* アイテム本体（クリック可能） */}
      <button
        onClick={handleClick}
        disabled={props.isDraggable}
        class={`flex flex-1 items-center gap-3 py-3 pr-3 text-left transition-colors ${
          props.isDraggable ? "cursor-move" : "hover:bg-gray-50 active:bg-gray-100"
        } ${!props.isDraggable ? "pl-3" : ""}`}
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
    </div>
  );
};

export default ItemCard;
