import { type Component } from "solid-js";
import { state, setCurrentTab } from "../state/store";
import { Package, Settings } from "lucide-solid";

const BottomNav: Component = () => {
  return (
    <nav class="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white">
      <div class="flex h-16">
        <button
          onClick={() => setCurrentTab("items")}
          class={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
            state.currentTab === "items" ? "text-blue-600" : "text-gray-500 active:bg-gray-100"
          }`}
        >
          <Package size={24} />
          <span class="text-xs font-medium">備品一覧</span>
        </button>

        <button
          onClick={() => setCurrentTab("settings")}
          class={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
            state.currentTab === "settings" ? "text-blue-600" : "text-gray-500 active:bg-gray-100"
          }`}
        >
          <Settings size={24} />
          <span class="text-xs font-medium">設定</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
