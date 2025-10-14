import { For, createMemo, createSignal, onMount, onCleanup, type Component, batch } from "solid-js";
import {
  state,
  reorderItems,
  setCurrentTab,
  setSearchQuery,
  setSelectedItem,
  setView,
} from "../state/store";
import ItemCard from "./ItemCard";
import { Package, Plus, MoreHorizontal, Search, X, Clock } from "lucide-solid";
import { useUIState } from "../context/UIStateContext";

const ItemList: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();

  // 検索バーとカスタムコンテンツを動的に生成
  const searchBar = createMemo(() => (
    <div class="flex flex-col gap-2">
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
            key: "other",
            label: "その他",
            icon: <MoreHorizontal size={24} />,
            onClick: () => setCurrentTab("other"),
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
  const [draggedId, setDraggedId] = createSignal<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);
  let containerRef: HTMLDivElement | undefined;
  let itemListRef: HTMLDivElement | undefined;
  let scrollContainerRef: HTMLElement | null = null;
  let autoScrollInterval: number | undefined;

  onMount(() => {
    // 親のスクロールコンテナを探す
    if (containerRef) {
      let parent = containerRef.parentElement;
      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          scrollContainerRef = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }
  });

  onCleanup(() => {
    // コンポーネントのクリーンアップ時に自動スクロールを停止
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = undefined;
    }
  });

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

    // 常にカスタム並び順を使用
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return items;
  });

  // ドラッグ中の表示順序(視覚的フィードバック用)
  const displayItems = createMemo(() => {
    const items = filteredAndSortedItems();
    const dragId = draggedId();
    const overIdx = dragOverIndex();

    if (dragId === null || overIdx === null) {
      return items;
    }

    // ドラッグ中のアイテムのインデックスを取得
    const dragIdx = items.findIndex((item) => item.id === dragId);
    if (dragIdx === -1 || dragIdx === overIdx) {
      return items;
    }

    // ドラッグ中は仮の並び替えを表示
    const newOrder = [...items];
    const [removed] = newOrder.splice(dragIdx, 1);
    newOrder.splice(overIdx, 0, removed);
    return newOrder;
  });

  const handleDragStart = (index: number) => {
    const items = filteredAndSortedItems();
    setDraggedId(items[index].id);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    const dragId = draggedId();
    const overIdx = dragOverIndex();

    if (dragId !== null && overIdx !== null) {
      const items = filteredAndSortedItems();
      const dragIdx = items.findIndex((item) => item.id === dragId);

      if (dragIdx !== -1 && dragIdx !== overIdx) {
        const newOrder = [...items];
        const [removed] = newOrder.splice(dragIdx, 1);
        newOrder.splice(overIdx, 0, removed);

        const newOrderIds = newOrder.map((item) => item.id);
        reorderItems(newOrderIds);
      }
    }

    setDraggedId(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // タッチイベントハンドラー（つまみアイコン用）
  const handleHandleTouchStart = (index: number, e: TouchEvent) => {
    e.stopPropagation(); // イベント伝播を停止
    const items = filteredAndSortedItems();
    setDraggedId(items[index].id);
  };

  const handleHandleTouchMove = (e: TouchEvent) => {
    if (draggedId() === null) return;
    e.preventDefault(); // スクロール防止

    const touch = e.touches[0];
    if (!touch) return;

    // 自動スクロール処理
    if (scrollContainerRef) {
      const rect = scrollContainerRef.getBoundingClientRect();
      const scrollThreshold = 100; // 端から100pxの範囲で自動スクロール
      const scrollSpeed = 8; // スクロール速度

      // 上端に近い場合
      if (touch.clientY - rect.top < scrollThreshold) {
        if (!autoScrollInterval) {
          autoScrollInterval = window.setInterval(() => {
            if (scrollContainerRef && scrollContainerRef.scrollTop > 0) {
              scrollContainerRef.scrollTop -= scrollSpeed;
            }
          }, 16); // 約60fps
        }
      }
      // 下端に近い場合
      else if (rect.bottom - touch.clientY < scrollThreshold) {
        if (!autoScrollInterval) {
          autoScrollInterval = window.setInterval(() => {
            if (scrollContainerRef) {
              const maxScroll = scrollContainerRef.scrollHeight - scrollContainerRef.clientHeight;
              if (scrollContainerRef.scrollTop < maxScroll) {
                scrollContainerRef.scrollTop += scrollSpeed;
              }
            }
          }, 16);
        }
      }
      // 端から離れた場合は自動スクロール停止
      else {
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = undefined;
        }
      }
    }

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
    // 自動スクロール停止
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = undefined;
    }

    handleDragEnd();
  };

  return (
    <>
      <div ref={containerRef} class="mx-auto max-w-4xl pb-20">
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
          <div ref={itemListRef} class="flex flex-col border-t border-gray-200 bg-white">
            <For each={displayItems()}>
              {(item, index) => (
                <ItemCard
                  item={item}
                  index={index()}
                  isDragging={draggedId() === item.id}
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
    </>
  );
};

export default ItemList;
