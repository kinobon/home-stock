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
    <header class="sticky top-0 z-10 bg-white shadow-md">
      <div class="mx-auto max-w-4xl px-4 py-5">
        <h1 class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Home size={28} />
          備品管理
        </h1>

        <div class="flex flex-col gap-3">
          {/* 検索バー */}
          <div class="relative">
            <Search class="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="検索..."
              value={state.searchQuery}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full rounded-full border border-gray-300 bg-gray-50 py-3 pr-4 pl-12 transition-all focus:border-blue-500 focus:bg-white focus:shadow-md focus:outline-none"
            />
          </div>

          {/* ソート・アクションボタン */}
          <div class="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy("name")}
              class={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                state.sortBy === "name"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              名前順
            </button>
            <button
              onClick={() => setSortBy("quantity")}
              class={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                state.sortBy === "quantity"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              数量順
            </button>
            <button
              onClick={toggleSortOrder}
              class="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200"
            >
              <ArrowUpDown size={16} />
              {state.isAscending ? "昇順" : "降順"}
            </button>
            <button
              onClick={handleExport}
              class="ml-auto flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg"
            >
              <Download size={16} />
              エクスポート
            </button>
            <button
              onClick={() => {
                setView("editor");
              }}
              class="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
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
