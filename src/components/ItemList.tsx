import { For, Show, createMemo, onMount, type Component, batch } from "solid-js";
import {
  state,
  setCurrentTab,
  setSearchQuery,
  setSelectedItem,
  setSortField,
  setSortOrder,
  toggleTagFilter,
  clearTagFilters,
  setView,
} from "../state/store";
import ItemCard from "./ItemCard";
import {
  Package,
  Plus,
  Settings as SettingsIcon,
  Search,
  X,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-solid";
import { useUIState } from "../context/UIStateContext";
import type { SortField } from "../types";
import { TagButton } from "./TagChip";

const ItemList: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "name", label: "名前" },
    { value: "quantity", label: "数量" },
  ];

  const toggleSortOrder = () => {
    setSortOrder(state.sortOrder === "asc" ? "desc" : "asc");
  };

  // 検索バーとカスタムコンテンツを動的に生成
  const searchBar = createMemo(() => (
    <div class="flex flex-col gap-3">
      {/* 検索バー */}
      <div class="relative">
        <Search class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="検索..."
          value={state.searchQuery}
          onInput={(e) => {
            setSearchQuery(e.currentTarget.value);
          }}
          class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-10 pl-10 text-sm transition-all focus:border-blue-500 focus:bg-white focus:shadow-md focus:outline-none"
        />
        {state.searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="検索をクリア"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold tracking-wide text-gray-500 uppercase">並び替え</span>
        <select
          value={state.sortField}
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          onChange={(e) => setSortField(e.currentTarget.value as SortField)}
        >
          <For each={sortOptions}>
            {(option) => <option value={option.value}>{option.label}</option>}
          </For>
        </select>
        <button
          type="button"
          onClick={toggleSortOrder}
          class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 focus:outline-none"
          aria-label={`並び替えを${state.sortOrder === "asc" ? "降順" : "昇順"}に切り替え`}
        >
          {state.sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span>{state.sortOrder === "asc" ? "昇順" : "降順"}</span>
        </button>
      </div>

      <Show when={state.tags.length > 0}>
        <div class="flex flex-col gap-2">
          <span class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            タグ絞り込み
          </span>

          <div class="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pr-2 pb-2 [scrollbar-gutter:stable_both-edges]">
            <button
              type="button"
              onClick={clearTagFilters}
              disabled={state.tagFilterIds.length === 0}
              class="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              全解除
            </button>
            <For each={state.tags}>
              {(tag) => {
                const isActive = () => state.tagFilterIds.includes(tag.id);
                return (
                  <TagButton
                    label={tag.name}
                    active={isActive}
                    onClick={() => toggleTagFilter(tag.id)}
                    variant="filter"
                  />
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  ));

  onMount(() => {
    batch(() => {
      // UIステートの設定
      setHeader({
        title: "備品管理",
        visible: true,
        customContent: searchBar(),
      });

      setBottomNav({
        visible: true,
        currentTabKey: "items", // 現在のタブを設定
        tabs: [
          {
            key: "items",
            label: "備品一覧",
            icon: <Package size={24} />,
            onClick: () => {
              // タブは既に選択済みなので何もしない
            },
          },
          {
            key: "history",
            label: "履歴",
            icon: <Clock size={24} />,
            onClick: () => setCurrentTab("history"),
          },
          {
            key: "settings",
            label: "設定",
            icon: <SettingsIcon size={24} />,
            onClick: () => setCurrentTab("settings"),
          },
        ],
      });

      setFab({
        visible: true,
        icon: <Plus size={28} strokeWidth={2.5} />,
        onClick: () => {
          setSelectedItem(undefined);
          setView("editor");
        },
      });
    });
  });

  const filteredAndSortedItems = createMemo(() => {
    const query = state.searchQuery.trim().toLowerCase();
    const tagNameMap = new Map(state.tags.map((tag) => [tag.id, tag.name.toLowerCase()]));
    const sortField = state.sortField;
    const sortOrder = state.sortOrder;
    const activeTagFilters = state.tagFilterIds;

    const filtered = state.items.filter((item) => {
      const matchesQuery = (() => {
        if (!query) return true;
        const nameMatch = item.name.toLowerCase().includes(query);
        const memoMatch = item.memo?.toLowerCase().includes(query) ?? false;
        const tagMatch = (item.tagIds ?? []).some((tagId) => {
          const tagName = tagNameMap.get(tagId);
          return tagName ? tagName.includes(query) : false;
        });
        return nameMatch || memoMatch || tagMatch;
      })();

      if (!matchesQuery) {
        return false;
      }

      if (activeTagFilters.length === 0) {
        return true;
      }

      const itemTagIds = item.tagIds ?? [];
      return activeTagFilters.every((filterId) => itemTagIds.includes(filterId));
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      } else if (sortField === "quantity") {
        comparison = a.quantity - b.quantity;
      }

      if (comparison === 0) {
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  });

  return (
    <div class="mx-auto max-w-4xl pb-20">
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
          <For each={filteredAndSortedItems()}>{(item) => <ItemCard item={item} />}</For>
        </div>
      )}
    </div>
  );
};

export default ItemList;
