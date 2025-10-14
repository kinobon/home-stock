import { For, type Component } from "solid-js";
import { state } from "../state/store";
import { X } from "lucide-solid";

interface TagSelectorProps {
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}

const TagSelector: Component<TagSelectorProps> = (props) => {
  const isTagSelected = (tagId: string) => props.selectedTagIds.includes(tagId);

  return (
    <div class="space-y-2">
      <For
        each={state.tags}
        fallback={<p class="text-sm text-gray-500">タグがありません</p>}
      >
        {(tag) => {
          const selected = () => isTagSelected(tag.id);
          return (
            <button
              type="button"
              onClick={() => props.onToggleTag(tag.id)}
              class={`flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                selected()
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div class="flex items-center gap-2">
                <div
                  class="h-4 w-4 rounded-full"
                  style={{ "background-color": tag.color }}
                />
                <span class={selected() ? "font-medium text-blue-900" : "text-gray-700"}>
                  {tag.name}
                </span>
              </div>
              {selected() && <X size={16} class="text-blue-600" />}
            </button>
          );
        }}
      </For>
    </div>
  );
};

export default TagSelector;
