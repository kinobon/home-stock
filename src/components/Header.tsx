import type { Component } from "solid-js";
import { state, setSearchQuery, setSortBy, toggleSortOrder, setView } from "../state/store";
import { Home, Search, Plus, ArrowUpDown } from "lucide-solid";

const Header: Component = () => {
  return (
    <header class="sticky top-0 z-10 bg-white shadow-md">
      <div class="mx-auto max-w-4xl px-4 py-3">
        <h1 class="mb-3 flex items-center gap-2 text-xl font-bold text-gray-800">
          <Home size={24} />
          備品管理
        </h1>

        <div class="flex flex-col gap-2">
          {/* 検索バー */}
          <div class="relative">
            <Search class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="検索..."
              value={state.searchQuery}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm transition-all focus:border-blue-500 focus:bg-white focus:shadow-md focus:outline-none"
            />
          </div>

          {/* コンパクトなツールバー */}
          <div class="flex flex-wrap items-center justify-between gap-2">
            {/* ソートグループ（セグメントボタン） */}
            <div class="inline-flex overflow-hidden rounded-lg bg-gray-100 shadow-sm">
              <button
                onClick={() => setSortBy("name")}
                class={`px-4 py-2 text-sm font-medium transition-colors ${
                  state.sortBy === "name"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                名前順
              </button>
              <button
                onClick={() => setSortBy("quantity")}
                class={`px-4 py-2 text-sm font-medium transition-colors ${
                  state.sortBy === "quantity"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                数量順
              </button>
              <button
                onClick={toggleSortOrder}
                class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                title={state.isAscending ? "昇順" : "降順"}
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* 新規追加ボタン */}
            <button
              onClick={() => {
                setView("editor");
              }}
              class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700"
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
