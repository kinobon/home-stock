import type { Component } from "solid-js";
import { state, setSearchQuery, setSortBy, toggleSortOrder, setEditMode } from "../state/store";
import { Home, Search, ArrowUpDown, Edit3, Check } from "lucide-solid";

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
                class={`px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  state.sortBy === "name"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                名前順
              </button>
              <button
                onClick={() => setSortBy("quantity")}
                class={`px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  state.sortBy === "quantity"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                数量順
              </button>
              <button
                onClick={() => setSortBy("custom")}
                class={`px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  state.sortBy === "custom"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                カスタム
              </button>
              <button
                onClick={toggleSortOrder}
                disabled={state.sortBy === "custom"}
                class={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors sm:text-sm ${
                  state.sortBy === "custom"
                    ? "cursor-not-allowed text-gray-400"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                title={state.isAscending ? "昇順" : "降順"}
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* 右側ボタングループ */}
            {/* 編集モード切り替えボタン（カスタムソート時のみ表示） */}
            {state.sortBy === "custom" && (
              <button
                onClick={() => setEditMode(!state.isEditMode)}
                class={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all ${
                  state.isEditMode
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {state.isEditMode ? (
                  <>
                    <Check size={16} />
                    完了
                  </>
                ) : (
                  <>
                    <Edit3 size={16} />
                    並び替え
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
