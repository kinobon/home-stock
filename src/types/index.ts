export type ItemID = string; // nanoid()
export type Timestamp = number; // Date.now()

export interface Item {
  id: ItemID;
  name: string;
  quantity: number;
  photo?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AppState {
  items: Item[];
  searchQuery: string;
  sortBy: "name" | "quantity";
  isAscending: boolean;
  selectedItemId?: ItemID;
  view: "list" | "editor";
}

export interface ExportData {
  version: string;
  exportedAt: Timestamp;
  items: Item[];
}
