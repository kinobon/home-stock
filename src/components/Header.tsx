import type { Component } from "solid-js";
import {
  state,
  setSearchQuery,
  setSortBy,
  toggleSortOrder,
  exportData,
  setView,
} from "../state/store";
import { Home, Search, Download, Plus, ArrowUpDown } from "lucide-solid";

const Header: Component = () => {
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `home-stock-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="mx-auto max-w-4xl px-4 py-4">
        <h1 class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Home size={28} />
          備品管理
        </h1>

        <div class="flex flex-col gap-3">
          {/* 検索バー */}
          <div class="relative">
            <Search class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="検索..."
              value={state.searchQuery}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ソート・アクションボタン */}
          <div class="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy("name")}
              class={`rounded px-3 py-1.5 text-sm ${
                state.sortBy === "name" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              名前順
            </button>
            <button
              onClick={() => setSortBy("quantity")}
              class={`rounded px-3 py-1.5 text-sm ${
                state.sortBy === "quantity" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              数量順
            </button>
            <button
              onClick={toggleSortOrder}
              class="flex items-center gap-1 rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700"
            >
              <ArrowUpDown size={16} />
              {state.isAscending ? "昇順" : "降順"}
            </button>
            <button
              onClick={handleExport}
              class="ml-auto flex items-center gap-1 rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
            >
              <Download size={16} />
              エクスポート
            </button>
            <button
              onClick={() => {
                setView("editor");
              }}
              class="flex items-center gap-1 rounded bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600"
            >
              <Plus size={16} />
              新規追加
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
