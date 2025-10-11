export type ItemID = string; // nanoid()
export type Timestamp = number; // Date.now()

export interface Item {
  id: ItemID;
  name: string;
  quantity: number;
  confirmedValue: number; // 確定済み数量
  photo?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order?: number; // 並び順
}

export interface Log {
  id: string; // UUID
  itemId: string;
  itemName: string;
  delta: number; // 増減数
  newValue: number; // 変更後の数量
  timestamp: string; // ISO8601形式
  type: "purchase" | "consume"; // 購入 or 消費
}

export interface AppState {
  items: Item[];
  logs: Log[];
  searchQuery: string;
  sortBy: "name" | "quantity" | "custom";
  isAscending: boolean;
  selectedItemId?: ItemID;
  view: "list" | "editor" | "counter";
  currentTab: "items" | "history" | "settings";
  isEditMode: boolean;
}

export interface ExportData {
  version: string;
  exportedAt: Timestamp;
  items: Item[];
}
