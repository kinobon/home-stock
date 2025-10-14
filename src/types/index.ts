export type ItemID = string; // nanoid()
export type Timestamp = number; // Date.now()
export type TagID = string; // nanoid()

export interface Tag {
  id: TagID;
  name: string;
  color: string;
  createdAt: Timestamp;
}

export interface Item {
  id: ItemID;
  name: string;
  quantity: number;
  photo?: string;
  memo?: string;
  tagIds?: TagID[]; // タグID配列
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order?: number; // 並び順
}

export interface Log {
  id: string; // UUID
  itemId: string;
  itemName: string;
  oldValue: number; // 変更前の数量
  newValue: number; // 変更後の数量
  delta: number; // 増減数
  timestamp: string; // ISO8601形式
}

export interface AppState {
  items: Item[];
  logs: Log[];
  tags: Tag[];
  searchQuery: string;
  selectedItemId?: ItemID;
  view: "list" | "editor" | "counter";
  currentTab: "items" | "history" | "settings" | "other";
}

export interface ExportData {
  version: string;
  exportedAt: Timestamp;
  items: Item[];
  logs: Log[];
  tags: Tag[];
}
