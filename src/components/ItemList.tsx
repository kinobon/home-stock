import { For, createMemo, createSignal, onMount, onCleanup, Show, type Component } from "solid-js";
import { Portal } from "solid-js/web";
import { state, reorderItems, setView, setCurrentTab } from "../state/store";
import ItemCard from "./ItemCard";
import { Package, Plus, Settings as SettingsIcon } from "lucide-solid";
import { useUIState } from "../context/UIStateContext";

const ItemList: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();

  onMount(() => {
    // UIステートの設定
    setHeader({
      title: "備品管理",
      visible: true,
    });

    setBottomNav({
      visible: true,
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
      onClick: () => setView("editor"),
    });
  });
  const [draggedIndex, setDraggedIndex] = createSignal<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);
  const [dragPosition, setDragPosition] = createSignal<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = createSignal<number>(0);
  const [containerLeft, setContainerLeft] = createSignal<number>(0);
  let containerRef: HTMLDivElement | undefined;
  let itemListRef: HTMLDivElement | undefined;
  let scrollContainerRef: HTMLElement | null = null;
  let autoScrollInterval: number | undefined;

  onMount(() => {
    // 親のスクロールコンテナを探す
    if (containerRef) {
      // アイテムリストの実際の幅と位置を取得
      if (itemListRef) {
        const rect = itemListRef.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerLeft(rect.left);
      }

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

    // ドラッグ開始時にコンテナの幅と位置を取得
    if (itemListRef) {
      const rect = itemListRef.getBoundingClientRect();
      setContainerWidth(rect.width);
      setContainerLeft(rect.left);
    }

    const touch = e.touches[0];
    if (touch) {
      setDragPosition({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleHandleTouchMove = (e: TouchEvent) => {
    if (!state.isEditMode || draggedIndex() === null) return;
    e.preventDefault(); // スクロール防止

    const touch = e.touches[0];
    if (!touch) return;

    // ドラッグ位置を更新
    setDragPosition({ x: touch.clientX, y: touch.clientY });

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
    if (!state.isEditMode) return;

    // 自動スクロール停止
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = undefined;
    }

    // ドラッグ位置をクリア
    setDragPosition(null);

    handleDragEnd();
  };

  return (
    <>
      <div ref={containerRef} class="mx-auto max-w-4xl">
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

      {/* ドラッグ中のゴースト要素 */}
      <Show when={draggedIndex() !== null && dragPosition() && containerWidth() > 0}>
        <Portal>
          <div
            class="pointer-events-none fixed z-50"
            style={{
              left: `${containerLeft()}px`,
              top: `${dragPosition()!.y}px`,
              width: `${containerWidth()}px`,
              transform: "translateY(-50%)",
              "box-shadow":
                "0 -8px 15px -3px rgba(0, 0, 0, 0.06), 0 8px 15px -3px rgba(0, 0, 0, 0.06), 0 -2px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div class="opacity-90">
              <ItemCard
                item={filteredAndSortedItems()[draggedIndex()!]}
                index={draggedIndex()!}
                isDraggable={true}
                isDragging={false}
                isDragOver={false}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDragEnd={() => {}}
                onDragLeave={() => {}}
                onHandleTouchStart={() => {}}
                onHandleTouchMove={() => {}}
                onHandleTouchEnd={() => {}}
              />
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
};

export default ItemList;
