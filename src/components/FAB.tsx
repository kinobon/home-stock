import type { Component } from "solid-js";
import { setView } from "../state/store";
import { Plus } from "lucide-solid";

const FAB: Component = () => {
  return (
    <button
      onClick={() => setView("editor")}
      class="fixed right-6 bottom-[88px] z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 md:bottom-6"
      aria-label="新規追加"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
};

export default FAB;
