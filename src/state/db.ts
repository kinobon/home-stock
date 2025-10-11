import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Item, Log } from "../types";

interface HomeStockDB extends DBSchema {
  items: {
    key: string;
    value: Item;
    indexes: {
      "by-name": string;
      "by-quantity": number;
      "by-createdAt": number;
    };
  };
  logs: {
    key: string;
    value: Log;
    indexes: {
      "by-timestamp": string;
      "by-itemId": string;
    };
  };
}

const DB_NAME = "home-stock-db";
const DB_VERSION = 2; // ログテーブル追加のためバージョンアップ

let dbInstance: IDBPDatabase<HomeStockDB> | null = null;

async function getDB(): Promise<IDBPDatabase<HomeStockDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<HomeStockDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // バージョン1: itemsストア作成
      if (oldVersion < 1) {
        const itemStore = db.createObjectStore("items", { keyPath: "id" });
        itemStore.createIndex("by-name", "name");
        itemStore.createIndex("by-quantity", "quantity");
        itemStore.createIndex("by-createdAt", "createdAt");
      }

      // バージョン2: logsストア作成
      if (oldVersion < 2) {
        const logStore = db.createObjectStore("logs", { keyPath: "id" });
        logStore.createIndex("by-timestamp", "timestamp");
        logStore.createIndex("by-itemId", "itemId");
      }
    },
  });

  return dbInstance;
}

export async function getAllItems(): Promise<Item[]> {
  const db = await getDB();
  return db.getAll("items");
}

export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDB();
  return db.get("items", id);
}

export async function saveItem(item: Item): Promise<void> {
  const db = await getDB();
  await db.put("items", item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("items", id);
}

export async function clearAllItems(): Promise<void> {
  const db = await getDB();
  await db.clear("items");
}

// ログ関連の関数
export async function getAllLogs(): Promise<Log[]> {
  const db = await getDB();
  const logs = await db.getAll("logs");
  // タイムスタンプの降順（新しい順）でソート
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function saveLog(log: Log): Promise<void> {
  const db = await getDB();
  await db.put("logs", log);
}

export async function saveLogs(logs: Log[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("logs", "readwrite");
  await Promise.all(logs.map((log) => tx.store.put(log)));
  await tx.done;
}

export async function clearAllLogs(): Promise<void> {
  const db = await getDB();
  await db.clear("logs");
}
