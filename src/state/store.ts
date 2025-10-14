import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";
import type { Item, AppState, Log, Tag } from "../types";
import {
  getAllItems,
  saveItem,
  deleteItem,
  clearAllItems,
  getAllLogs,
  saveLog,
  clearAllLogs,
  getAllTags,
  saveTag,
  deleteTag,
  clearAllTags,
} from "./db";

const initialState: AppState = {
  items: [],
  logs: [],
  tags: [],
  searchQuery: "",
  selectedItemId: undefined,
  view: "list",
  currentTab: "items",
};

export const [state, setState] = createStore<AppState>(initialState);

// 初期化: IndexedDB からデータをロード
export async function initializeStore() {
  const items = await getAllItems();
  const logs = await getAllLogs();
  const tags = await getAllTags();

  // 既存データのマイグレーション: confirmedValueを削除
  const migratedItems = items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmedValue, ...rest } = item as Item & { confirmedValue?: number };
    return rest as Item;
  });

  // マイグレーションが必要な場合は保存
  for (let i = 0; i < items.length; i++) {
    if ("confirmedValue" in items[i]) {
      await saveItem(migratedItems[i]);
    }
  }

  setState("items", migratedItems);
  setState("logs", logs);
  setState("tags", tags);
}

// アイテム作成
export async function createItem(
  name: string,
  quantity: number,
  photo?: string,
  memo?: string,
  tagIds?: string[]
) {
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
    tagIds,
    createdAt: now,
    updatedAt: now,
    order: maxOrder + 1, // 最後に追加
  };

  await saveItem(newItem);
  setState("items", (items) => [...items, newItem]);

  // 数量が0でない場合はログを記録（0から初期値への変更）
  if (quantity !== 0) {
    await addOrUpdateLog(newItem.id, newItem.name, 0, quantity);
  }

  return newItem;
}

// アイテム更新
export async function updateItem(
  id: string,
  updates: Partial<Omit<Item, "id" | "createdAt" | "updatedAt">>
) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const oldItem = state.items[index];
  // SolidJSのプロキシオブジェクトは後で変更されるので、必要な値を事前にコピー
  const oldQuantity = oldItem.quantity;
  const oldName = oldItem.name;
  const oldId = oldItem.id;

  const updatedItem: Item = {
    ...oldItem,
    ...updates,
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);

  // 数量が変更された場合はログを記録
  if (updates.quantity !== undefined && updates.quantity !== oldQuantity) {
    await addOrUpdateLog(oldId, oldName, oldQuantity, updates.quantity);
  }
}

// ログの追加または更新（同じ日・同じアイテムは統合）
async function addOrUpdateLog(
  itemId: string,
  itemName: string,
  oldValue: number,
  newValue: number
) {
  const now = new Date();
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // 今日の同じアイテムのログを探す
  const existingLogIndex = state.logs.findIndex((log) => {
    const logDate = log.timestamp.split("T")[0];
    return log.itemId === itemId && logDate === today;
  });

  if (existingLogIndex !== -1) {
    // 既存のログを更新
    const existingLog = state.logs[existingLogIndex];
    const updatedLog: Log = {
      ...existingLog,
      newValue: newValue,
      delta: newValue - existingLog.oldValue,
      timestamp: now.toISOString(),
    };

    // IndexedDBとstateを更新
    await saveLog(updatedLog);
    setState("logs", existingLogIndex, updatedLog);
  } else {
    // 新規ログを作成
    const newLog: Log = {
      id: crypto.randomUUID(),
      itemId,
      itemName,
      oldValue,
      newValue,
      delta: newValue - oldValue,
      timestamp: now.toISOString(),
    };

    await saveLog(newLog);
    setState("logs", (logs) => [newLog, ...logs]);
  }
}

// 数量増減（ログ記録付き）
export async function incrementQuantity(id: string) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const item = state.items[index];
  const oldQuantity = item.quantity;
  const newQuantity = oldQuantity + 1;

  const updatedItem: Item = {
    ...item,
    quantity: newQuantity,
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);

  // ログを記録（統合）
  await addOrUpdateLog(item.id, item.name, oldQuantity, newQuantity);
}

export async function decrementQuantity(id: string) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const item = state.items[index];
  const oldQuantity = item.quantity;
  if (oldQuantity <= 0) return;

  const newQuantity = oldQuantity - 1;

  const updatedItem: Item = {
    ...item,
    quantity: newQuantity,
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);

  // ログを記録（統合）
  await addOrUpdateLog(item.id, item.name, oldQuantity, newQuantity);
}

// アイテム削除
export async function removeItem(id: string) {
  await deleteItem(id);
  setState("items", (items) => items.filter((item) => item.id !== id));
}

// すべてクリア
export async function clearAll() {
  await clearAllItems();
  await clearAllLogs();
  await clearAllTags();
  setState("items", []);
  setState("logs", []);
  setState("tags", []);
}

// タグ管理
export async function createTag(name: string, color: string) {
  const now = Date.now();
  const newTag: Tag = {
    id: nanoid(),
    name,
    color,
    createdAt: now,
  };

  await saveTag(newTag);
  setState("tags", (tags) => [...tags, newTag].sort((a, b) => a.name.localeCompare(b.name)));
  return newTag;
}

export async function updateTag(id: string, name: string, color: string) {
  const index = state.tags.findIndex((tag) => tag.id === id);
  if (index === -1) return;

  const updatedTag: Tag = {
    ...state.tags[index],
    name,
    color,
  };

  await saveTag(updatedTag);
  setState("tags", (tags) =>
    tags.map((tag) => (tag.id === id ? updatedTag : tag)).sort((a, b) => a.name.localeCompare(b.name))
  );
}

export async function removeTag(id: string) {
  await deleteTag(id);
  setState("tags", (tags) => tags.filter((tag) => tag.id !== id));

  // タグが削除された場合、そのタグを持つアイテムからタグIDを削除
  const itemsWithTag = state.items.filter((item) => item.tagIds?.includes(id));
  for (const item of itemsWithTag) {
    const updatedTagIds = item.tagIds?.filter((tagId) => tagId !== id);
    await updateItem(item.id, { tagIds: updatedTagIds });
  }
}

// UI State
export function setSearchQuery(query: string) {
  setState("searchQuery", query);
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
}

export function setSelectedItem(id?: string) {
  setState("selectedItemId", id);
}

export function setView(view: "list" | "editor" | "counter") {
  setState("view", view);
}

export function setCurrentTab(tab: "items" | "history" | "settings" | "other") {
  setState("currentTab", tab);
}

// エクスポート/インポート
export function exportData(): string {
  const exportData = {
    version: "4.0.0", // タグ追加のため4.0.0に
    exportedAt: Date.now(),
    items: state.items,
    logs: state.logs,
    tags: state.tags,
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
      throw new Error("items は配列である必要があります");
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

    // ログのバリデーション（ログがある場合）
    if (data.logs !== undefined) {
      if (!Array.isArray(data.logs)) {
        throw new Error("logs は配列である必要があります");
      }
    }

    // タグのバリデーション（タグがある場合）
    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        throw new Error("tags は配列である必要があります");
      }
    }

    // データベースをクリアしてインポート
    await clearAllItems();
    await clearAllLogs();
    await clearAllTags();

    // アイテムをインポート
    for (const item of data.items) {
      // confirmedValueがある場合は削除（旧バージョンとの互換性）
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmedValue, ...cleanItem } = item as Item & { confirmedValue?: number };
      await saveItem(cleanItem);
    }

    // ログをインポート
    if (data.logs && Array.isArray(data.logs)) {
      for (const log of data.logs) {
        await saveLog(log);
      }
      setState("logs", data.logs);
    } else {
      setState("logs", []);
    }

    // タグをインポート
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        await saveTag(tag);
      }
      setState("tags", data.tags);
    } else {
      setState("tags", []);
    }

    // ステートを更新
    setState(
      "items",
      data.items.map((item: Item & { confirmedValue?: number }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmedValue, ...cleanItem } = item;
        return cleanItem;
      })
    );
  } catch (error) {
    console.error("Import failed:", error);
    if (error instanceof SyntaxError) {
      throw new Error("無効なJSON形式です");
    }
    throw error;
  }
}
