import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";
import type { Item, AppState } from "../types";
import { getAllItems, saveItem, deleteItem, clearAllItems } from "./db";

const initialState: AppState = {
  items: [],
  searchQuery: "",
  sortBy: "custom",
  isAscending: true,
  selectedItemId: undefined,
  view: "list",
  currentTab: "items",
  isEditMode: false,
};

export const [state, setState] = createStore<AppState>(initialState);

// 初期化: IndexedDB からデータをロード
export async function initializeStore() {
  const items = await getAllItems();
  setState("items", items);
}

// アイテム作成
export async function createItem(name: string, quantity: number, photo?: string, memo?: string) {
  const now = Date.now();

  // 現在の最大order値を取得
  const maxOrder = state.items.reduce((max, item) => {
    return Math.max(max, item.order ?? 0);
  }, -1);

  const newItem: Item = {
    id: nanoid(),
    name,
    quantity,
    photo,
    memo,
    createdAt: now,
    updatedAt: now,
    order: maxOrder + 1, // 最後に追加
  };

  await saveItem(newItem);
  setState("items", (items) => [...items, newItem]);
  return newItem;
}

// アイテム更新
export async function updateItem(
  id: string,
  updates: Partial<Omit<Item, "id" | "createdAt" | "updatedAt">>
) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const updatedItem: Item = {
    ...state.items[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);
}

// 数量増減
export async function incrementQuantity(id: string) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const updatedItem: Item = {
    ...state.items[index],
    quantity: state.items[index].quantity + 1,
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);
}

export async function decrementQuantity(id: string) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const currentQuantity = state.items[index].quantity;
  if (currentQuantity <= 0) return;

  const updatedItem: Item = {
    ...state.items[index],
    quantity: currentQuantity - 1,
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);
}

// アイテム削除
export async function removeItem(id: string) {
  await deleteItem(id);
  setState("items", (items) => items.filter((item) => item.id !== id));
}

// すべてクリア
export async function clearAll() {
  await clearAllItems();
  setState("items", []);
}

// UI State
export function setSearchQuery(query: string) {
  setState("searchQuery", query);
}

export function setSortBy(sortBy: "name" | "quantity" | "custom") {
  setState("sortBy", sortBy);
}

export function setEditMode(isEditMode: boolean) {
  setState("isEditMode", isEditMode);
}

export function reorderItems(newOrder: string[]) {
  // 新しい順序でアイテムを並び替え
  const itemsMap = new Map(state.items.map((item) => [item.id, item]));
  const reorderedItems = newOrder
    .map((id) => itemsMap.get(id))
    .filter((item): item is Item => item !== undefined)
    .map((item, index) => ({ ...item, order: index, updatedAt: Date.now() }));

  // IndexedDBに保存
  reorderedItems.forEach((item) => saveItem(item));
  setState("items", reorderedItems);

  // カスタムソートモードに切り替え
  setState("sortBy", "custom");
}

export function toggleSortOrder() {
  setState("isAscending", (prev) => !prev);
}

export function setSelectedItem(id?: string) {
  setState("selectedItemId", id);
}

export function setView(view: "list" | "editor") {
  setState("view", view);
}

export function setCurrentTab(tab: "items" | "settings") {
  setState("currentTab", tab);
}

// エクスポート/インポート
export function exportData(): string {
  const exportData = {
    version: "1.0.0",
    exportedAt: Date.now(),
    items: state.items,
  };
  return JSON.stringify(exportData, null, 2);
}

export async function importData(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);

    // バリデーション
    if (!data || typeof data !== "object") {
      throw new Error("無効なデータ形式です");
    }

    if (!data.items) {
      throw new Error("items フィールドが見つかりません");
    }

    if (!Array.isArray(data.items)) {
      throw new Error("items フィールドは配列である必要があります");
    }

    // 各アイテムの基本的なバリデーション
    for (const item of data.items) {
      if (!item.id || typeof item.id !== "string") {
        throw new Error("アイテムに有効な id がありません");
      }
      if (!item.name || typeof item.name !== "string") {
        throw new Error("アイテムに有効な name がありません");
      }
      if (typeof item.quantity !== "number") {
        throw new Error("アイテムに有効な quantity がありません");
      }
    }

    console.log(`[importData] Validated ${data.items.length} items`);

    await clearAllItems();
    for (const item of data.items) {
      await saveItem(item);
    }
    setState("items", data.items);
    console.log("[importData] Import completed successfully");
  } catch (error) {
    console.error("[importData] Import failed:", error);
    if (error instanceof SyntaxError) {
      throw new Error("無効なJSON形式です");
    }
    throw error;
  }
}
