import { For, createMemo, createSignal, type Component } from "solid-js";
import { state, reorderItems } from "../state/store";
import ItemCard from "./ItemCard";
import { Package, Plus } from "lucide-solid";

const ItemList: Component = () => {
  const [draggedIndex, setDraggedIndex] = createSignal<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);

  const filteredAndSortedItems = createMemo(() => {
    let items = [...state.items];

    // 検索フィルター
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) || item.memo?.toLowerCase().includes(query)
      );
    }

    // ソート
    if (state.sortBy === "custom") {
      // カスタム並び順（ドラッグ&ドロップ後）
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else if (state.sortBy === "name") {
      items.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, "ja");
        return state.isAscending ? comparison : -comparison;
      });
    } else if (state.sortBy === "quantity") {
      items.sort((a, b) => {
        const comparison = a.quantity - b.quantity;
        return state.isAscending ? comparison : -comparison;
      });
    }

    return items;
  });

  // ドラッグ中の表示順序（視覚的フィードバック用）
  const displayItems = createMemo(() => {
    const items = filteredAndSortedItems();
    const dragIdx = draggedIndex();
    const overIdx = dragOverIndex();

    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      return items;
    }

    // ドラッグ中は仮の並び替えを表示
    const newOrder = [...items];
    const [removed] = newOrder.splice(dragIdx, 1);
    newOrder.splice(overIdx, 0, removed);
    return newOrder;
  });

  const handleDragStart = (index: number) => {
    if (!state.isEditMode) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    if (!state.isEditMode) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (!state.isEditMode) return;
    const dragIdx = draggedIndex();
    const overIdx = dragOverIndex();

    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const items = filteredAndSortedItems();
      const newOrder = [...items];
      const [removed] = newOrder.splice(dragIdx, 1);
      newOrder.splice(overIdx, 0, removed);

      const newOrderIds = newOrder.map((item) => item.id);
      reorderItems(newOrderIds);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    if (!state.isEditMode) return;
    setDragOverIndex(null);
  };

  // タッチイベントハンドラー（つまみアイコン用）
  const handleHandleTouchStart = (index: number, e: TouchEvent) => {
    if (!state.isEditMode) return;
    e.stopPropagation(); // イベント伝播を停止
    setDraggedIndex(index);
  };

  const handleHandleTouchMove = (e: TouchEvent) => {
    if (!state.isEditMode || draggedIndex() === null) return;
    e.preventDefault(); // スクロール防止

    const touch = e.touches[0];
    if (!touch) return;

    // タッチ位置から該当する要素を取得
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    // 最も近いItemCard要素を探す
    const itemCard = element.closest("[data-item-index]");
    if (itemCard) {
      const index = parseInt(itemCard.getAttribute("data-item-index") || "-1");
      if (index >= 0) {
        setDragOverIndex(index);
      }
    }
  };

  const handleHandleTouchEnd = () => {
    if (!state.isEditMode) return;
    handleDragEnd();
  };

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      {filteredAndSortedItems().length === 0 ? (
        <div class="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <Package size={64} class="mb-4 text-gray-300" />
          <p class="text-lg font-medium">アイテムがありません</p>
          <p class="mt-2 flex items-center gap-1 text-sm">
            <Plus size={16} />
            「新規追加」から備品を登録してください
          </p>
        </div>
      ) : (
        <div class="flex flex-col border-t border-gray-200 bg-white">
          <For each={displayItems()}>
            {(item, index) => (
              <ItemCard
                item={item}
                index={index()}
                isDraggable={state.isEditMode}
                isDragging={draggedIndex() === index()}
                isDragOver={false}
                onDragStart={() => handleDragStart(index())}
                onDragOver={(e) => handleDragOver(e, index())}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onHandleTouchStart={(e) => handleHandleTouchStart(index(), e)}
                onHandleTouchMove={handleHandleTouchMove}
                onHandleTouchEnd={handleHandleTouchEnd}
              />
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default ItemList;
