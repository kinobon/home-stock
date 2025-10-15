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
  deleteTag as deleteTagFromDB,
  clearAllTags,
} from "./db";

const initialState: AppState = {
  items: [],
  tags: [],
  logs: [],
  searchQuery: "",
  selectedItemId: undefined,
  view: "list",
  currentTab: "items",
};

export const [state, setState] = createStore<AppState>(initialState);

function sanitizeTagIds(tagIds?: string[]): string[] {
  if (!Array.isArray(tagIds)) return [];
  const validIds = new Set(state.tags.map((tag) => tag.id));
  const unique: string[] = [];
  for (const id of tagIds) {
    if (typeof id !== "string") continue;
    if (!validIds.has(id)) continue;
    if (unique.includes(id)) continue;
    unique.push(id);
  }
  return unique;
}

// 初期化: IndexedDB からデータをロード
export async function initializeStore() {
  const items = await getAllItems();
  const logs = await getAllLogs();
  const tags = await getAllTags();

  // 既存データのマイグレーション: confirmedValueを削除
  const migratedItems = items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmedValue, tagIds, ...rest } = item as Item & {
      confirmedValue?: number;
      tagIds?: string[];
    };
    return {
      ...rest,
      tagIds: Array.isArray(tagIds) ? tagIds : [],
    } as Item;
  });

  // マイグレーションが必要な場合は保存
  for (let i = 0; i < items.length; i++) {
    const originalItem = items[i] as Item & { confirmedValue?: number; tagIds?: string[] };
    if ("confirmedValue" in originalItem || !Array.isArray(originalItem.tagIds)) {
      await saveItem(migratedItems[i]);
    }
  }

  setState("items", migratedItems);
  setState("tags", tags);
  setState("logs", logs);
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
  const validTagIds = sanitizeTagIds(tagIds);

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
    tagIds: validTagIds,
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

  const sanitizedUpdates: Partial<Omit<Item, "id" | "createdAt" | "updatedAt">> = {
    ...updates,
  };
  if (updates.tagIds !== undefined) {
    sanitizedUpdates.tagIds = sanitizeTagIds(updates.tagIds);
  }

  const updatedItem: Item = {
    ...oldItem,
    ...sanitizedUpdates,
    tagIds:
      sanitizedUpdates.tagIds !== undefined
        ? sanitizedUpdates.tagIds
        : Array.isArray(oldItem.tagIds)
          ? [...oldItem.tagIds]
          : [],
    updatedAt: Date.now(),
  };

  await saveItem(updatedItem);
  setState("items", index, updatedItem);

  // 数量が変更された場合はログを記録
  if (updates.quantity !== undefined && updates.quantity !== oldQuantity) {
    await addOrUpdateLog(oldId, oldName, oldQuantity, updates.quantity);
  }
}

export async function createTag(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("タグ名を入力してください");
  }

  const now = Date.now();
  const newTag: Tag = {
    id: nanoid(),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
  };

  await saveTag(newTag);
  setState("tags", (tags) => [...tags, newTag]);
  return newTag;
}

export async function updateTag(id: string, name: string) {
  const index = state.tags.findIndex((tag) => tag.id === id);
  if (index === -1) return;

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("タグ名を入力してください");
  }

  const oldTag = state.tags[index];
  const updatedTag: Tag = {
    ...oldTag,
    name: trimmed,
    updatedAt: Date.now(),
  };

  await saveTag(updatedTag);
  setState("tags", index, updatedTag);
}

export async function removeTag(id: string) {
  await deleteTagFromDB(id);
  setState("tags", (tags) => tags.filter((tag) => tag.id !== id));

  const itemsUsingTag = state.items.filter((item) => item.tagIds?.includes(id));
  if (itemsUsingTag.length === 0) {
    return;
  }

  const updatedItems = itemsUsingTag.map((item) => {
    const nextTagIds = (item.tagIds ?? []).filter((tagId) => tagId !== id);
    return {
      ...item,
      tagIds: nextTagIds,
      updatedAt: Date.now(),
    };
  });

  await Promise.all(updatedItems.map((item) => saveItem(item)));

  const updatedMap = new Map(updatedItems.map((item) => [item.id, item] as const));
  setState("items", (items) => items.map((item) => updatedMap.get(item.id) ?? item));
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
  setState("tags", []);
  setState("logs", []);
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

export function setCurrentTab(tab: "items" | "history" | "settings") {
  setState("currentTab", tab);
}

// エクスポート/インポート
export function exportData(): string {
  const exportData = {
    version: "4.0.0", // タグ対応のため4.0.0に
    exportedAt: Date.now(),
    items: state.items.map((item) => ({
      ...item,
      tagIds: Array.isArray(item.tagIds) ? item.tagIds : [],
    })),
    tags: state.tags,
    logs: state.logs,
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

    // タグのバリデーション
    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        throw new Error("tags は配列である必要があります");
      }
    }

    const importedTagsMap = new Map<string, Tag>();
    if (Array.isArray(data.tags)) {
      for (const rawTag of data.tags as Tag[]) {
        if (!rawTag.id || typeof rawTag.id !== "string") {
          throw new Error("タグに有効な id がありません");
        }
        if (!rawTag.name || typeof rawTag.name !== "string") {
          throw new Error("タグに有効な name がありません");
        }
        const now = Date.now();
        const cleanedTag: Tag = {
          id: rawTag.id,
          name: rawTag.name,
          createdAt: typeof rawTag.createdAt === "number" ? rawTag.createdAt : now,
          updatedAt: typeof rawTag.updatedAt === "number" ? rawTag.updatedAt : now,
        };
        importedTagsMap.set(cleanedTag.id, cleanedTag);
      }
    }

    const importedTags = Array.from(importedTagsMap.values());
    const validTagIds = new Set(importedTagsMap.keys());

    const importedItems = data.items.map((item: Item & { confirmedValue?: number }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmedValue, ...rest } = item;
      const sanitizedTagIds: string[] = [];
      if (Array.isArray(item.tagIds)) {
        for (const tagId of item.tagIds) {
          if (typeof tagId !== "string") continue;
          if (!validTagIds.has(tagId)) continue;
          if (sanitizedTagIds.includes(tagId)) continue;
          sanitizedTagIds.push(tagId);
        }
      }
      return {
        ...rest,
        tagIds: sanitizedTagIds,
      };
    });

    // データベースをクリアしてインポート
    await clearAllItems();
    await clearAllLogs();
    await clearAllTags();

    // タグをインポート
    for (const tag of importedTags) {
      await saveTag(tag);
    }

    // アイテムをインポート
    for (const item of importedItems) {
      await saveItem(item);
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

    // ステートを更新
    setState("tags", importedTags);
    setState("items", importedItems);
  } catch (error) {
    console.error("Import failed:", error);
    if (error instanceof SyntaxError) {
      throw new Error("無効なJSON形式です");
    }
    throw error;
  }
}
