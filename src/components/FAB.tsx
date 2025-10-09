import { Show, type Component } from "solid-js";
import { useUIState } from "../context/UIStateContext";

const FAB: Component = () => {
  const [uiState] = useUIState();
  const fab = () => uiState.fab;

  return (
    <Show when={fab().visible}>
      <button
        onClick={fab().onClick}
        class="fixed right-6 z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
        style={{
          bottom: "calc(4rem + env(safe-area-inset-bottom) + 1rem)",
        }}
        aria-label="新規追加"
      >
        {fab().icon}
      </button>
    </Show>
  );
};

export default FAB;
