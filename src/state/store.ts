import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";
import type { Item, AppState } from "../types";
import { getAllItems, saveItem, deleteItem, clearAllItems } from "./db";

const initialState: AppState = {
  items: [],
  searchQuery: "",
  sortBy: "name",
  isAscending: true,
  selectedItemId: undefined,
  view: "list",
  currentTab: "items",
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
  const newItem: Item = {
    id: nanoid(),
    name,
    quantity,
    photo,
    memo,
    createdAt: now,
    updatedAt: now,
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

export function setSortBy(sortBy: "name" | "quantity") {
  setState("sortBy", sortBy);
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
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid data format");
    }

    await clearAllItems();
    for (const item of data.items) {
      await saveItem(item);
    }
    setState("items", data.items);
  } catch (error) {
    console.error("Import failed:", error);
    throw error;
  }
}
