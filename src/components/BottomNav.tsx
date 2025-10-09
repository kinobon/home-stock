import { Show, type Component, For } from "solid-js";
import { useUIState } from "../context/UIStateContext";

const BottomNav: Component = () => {
  const [uiState] = useUIState();
  const nav = () => uiState.bottomNav;

  return (
    <Show when={nav().visible}>
      <nav class="border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div class="flex h-16">
          <For each={nav().tabs}>
            {(tab) => {
              const isActive = () => nav().currentTabKey === tab.key;
              return (
                <button
                  onClick={tab.onClick}
                  class={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                    isActive() ? "text-blue-600" : "text-gray-500 active:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  <span class="text-xs font-medium">{tab.label}</span>
                </button>
              );
            }}
          </For>
        </div>
      </nav>
    </Show>
  );
};

export default BottomNav;
