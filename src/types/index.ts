export type ItemID = string; // nanoid()
export type Timestamp = number; // Date.now()

export interface Item {
  id: ItemID;
  name: string;
  quantity: number;
  photo?: string;
  memo?: string;
  tagIds?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order?: number; // 並び順
}

export type SortField = "name" | "quantity";
export type SortOrder = "asc" | "desc";

export interface Tag {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  tags: Tag[];
  logs: Log[];
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  tagFilterIds: string[];
  selectedItemId?: ItemID;
  view: "list" | "editor" | "counter";
  currentTab: "items" | "history" | "settings";
}

export interface ExportData {
  version: string;
  exportedAt: Timestamp;
  items: Item[];
  tags: Tag[];
  logs: Log[];
}
