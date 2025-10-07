import { For, createMemo, type Component } from "solid-js";
import { state } from "../state/store";
import ItemCard from "./ItemCard";
import { Package, Plus } from "lucide-solid";

const ItemList: Component = () => {
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
    items.sort((a, b) => {
      let comparison = 0;
      if (state.sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "ja");
      } else if (state.sortBy === "quantity") {
        comparison = a.quantity - b.quantity;
      }
      return state.isAscending ? comparison : -comparison;
    });

    return items;
  });

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
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={filteredAndSortedItems()}>{(item) => <ItemCard item={item} />}</For>
        </div>
      )}
    </div>
  );
};

export default ItemList;
