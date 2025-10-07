import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Item } from "../types";

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
}

const DB_NAME = "home-stock-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<HomeStockDB> | null = null;

async function getDB(): Promise<IDBPDatabase<HomeStockDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<HomeStockDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const itemStore = db.createObjectStore("items", { keyPath: "id" });
      itemStore.createIndex("by-name", "name");
      itemStore.createIndex("by-quantity", "quantity");
      itemStore.createIndex("by-createdAt", "createdAt");
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
