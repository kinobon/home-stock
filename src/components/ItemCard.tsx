import { createMemo, createSignal, type Component } from "solid-js";
import type { Item } from "../types";
import {
  incrementQuantity,
  decrementQuantity,
  removeItem,
  setSelectedItem,
  setView,
} from "../state/store";
import { useScrollDetection } from "../utils/scroll";
import { MoreVertical, Edit, Trash2 } from "lucide-solid";
import QuantityStepper from "./QuantityStepper";

interface ItemCardProps {
  item: Item;
}

const ItemCard: Component<ItemCardProps> = (props) => {
  // メニューの開閉状態
  const [showMenu, setShowMenu] = createSignal(false);

  // スクロール検出（編集・削除ボタン用）
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
      setShowMenu(false);
      setSelectedItem(props.item.id);
      setView("editor");
    }
  };

  const handleDelete = () => {
    if (isScrolling()) return;
    if (confirm(`「${props.item.name}」を削除しますか?`)) {
      setShowMenu(false);
      removeItem(props.item.id);
    }
  };

  // ボタンの無効化状態
  const isDisabled = createMemo(() => isScrolling());

  return (
    <div class="relative flex items-center gap-3 rounded-lg bg-white p-3 shadow-md transition-all duration-200 hover:shadow-xl">
      {/* サムネイル画像（正方形クリップ） */}
      {props.item.photo ? (
        <div class="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img src={props.item.photo} alt={props.item.name} class="h-full w-full object-cover" />
        </div>
      ) : (
        <div class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <span class="text-3xl">📦</span>
        </div>
      )}

      {/* 名前とカウンター */}
      <div class="flex flex-1 flex-col gap-2">
        <h3 class="text-lg font-medium text-gray-900">{props.item.name}</h3>
        <QuantityStepper value={props.item.quantity} onChange={handleQuantityChange} min={0} />
      </div>

      {/* 三点メニューボタン */}
      <button
        onClick={() => setShowMenu(!showMenu())}
        disabled={isDisabled()}
        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="メニュー"
      >
        <MoreVertical size={20} class="text-gray-600" />
      </button>

      {/* ドロップダウンメニュー */}
      {showMenu() && (
        <>
          {/* 背景オーバーレイ */}
          <div class="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          {/* メニュー内容 */}
          <div class="absolute top-12 right-2 z-20 w-32 overflow-hidden rounded-lg bg-white shadow-xl">
            <button
              onClick={handleEdit}
              disabled={isDisabled()}
              class="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Edit size={16} />
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={isDisabled()}
              class="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={16} />
              削除
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemCard;
