import { Show, type Component } from "solid-js";
import { Home } from "lucide-solid";
import { useUIState } from "../context/UIStateContext";

const Header: Component = () => {
  const [uiState] = useUIState();
  const header = () => uiState.header;

  return (
    <Show when={header().visible}>
      <header class="z-10 border-b border-gray-200 bg-white">
        <div class="mx-auto max-w-4xl px-4 py-3">
          <h1 class="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Home size={24} />
            {header().title || "備品管理"}
          </h1>
          {header().customContent && <div class="mt-3">{header().customContent}</div>}
        </div>
      </header>
    </Show>
  );
};

export default Header;
