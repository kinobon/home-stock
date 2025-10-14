import { batch, createSignal, For, Show, type Component } from "solid-js";
import { state, createTag, updateTag, removeTag } from "../state/store";
import { Plus, Edit2, Trash2, Check, X, Tag as TagIcon } from "lucide-solid";

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

const TagManager: Component = () => {
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editingName, setEditingName] = createSignal("");
  const [editingColor, setEditingColor] = createSignal("");
  const [isCreating, setIsCreating] = createSignal(false);
  const [newTagName, setNewTagName] = createSignal("");
  const [newTagColor, setNewTagColor] = createSignal(DEFAULT_COLORS[0]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewTagName("");
    setNewTagColor(DEFAULT_COLORS[0]);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewTagName("");
  };

  const handleCreate = async () => {
    const name = newTagName().trim();
    if (!name) {
      alert("タグ名を入力してください");
      return;
    }

    try {
      await createTag(name, newTagColor());
      batch(() => {
        setIsCreating(false);
        setNewTagName("");
      });
    } catch (error) {
      console.error("Tag creation failed:", error);
      alert("タグの作成に失敗しました");
    }
  };

  const handleStartEdit = (id: string, name: string, color: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingColor(color);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async () => {
    const id = editingId();
    if (!id) return;

    const name = editingName().trim();
    if (!name) {
      alert("タグ名を入力してください");
      return;
    }

    try {
      await updateTag(id, name, editingColor());
      setEditingId(null);
    } catch (error) {
      console.error("Tag update failed:", error);
      alert("タグの更新に失敗しました");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`タグ「${name}」を削除しますか？\n\nこのタグを使用しているアイテムからも削除されます。`)) {
      return;
    }

    try {
      await removeTag(id);
    } catch (error) {
      console.error("Tag deletion failed:", error);
      alert("タグの削除に失敗しました");
    }
  };

  return (
    <div class="space-y-4">
      {/* 新規作成フォーム */}
      <Show
        when={isCreating()}
        fallback={
          <button
            onClick={handleStartCreate}
            class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
          >
            <Plus size={20} />
            新しいタグを作成
          </button>
        }
      >
        <div class="space-y-3 rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">タグ名</label>
            <input
              type="text"
              value={newTagName()}
              onInput={(e) => setNewTagName(e.currentTarget.value)}
              placeholder="例: 食品、日用品"
              class="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">色</label>
            <div class="grid grid-cols-8 gap-2">
              <For each={DEFAULT_COLORS}>
                {(color) => (
                  <button
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    class={`h-8 w-8 rounded-full transition-transform ${
                      newTagColor() === color ? "scale-110 ring-2 ring-blue-500 ring-offset-2" : ""
                    }`}
                    style={{ "background-color": color }}
                    aria-label={`Color ${color}`}
                  />
                )}
              </For>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              onClick={handleCreate}
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Check size={16} />
              作成
            </button>
            <button
              onClick={handleCancelCreate}
              class="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <X size={16} />
              キャンセル
            </button>
          </div>
        </div>
      </Show>

      {/* タグリスト */}
      <div class="space-y-2">
        <For
          each={state.tags}
          fallback={
            <div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <TagIcon size={48} class="mx-auto mb-3 text-gray-300" />
              <p class="text-sm text-gray-500">タグがありません</p>
              <p class="text-xs text-gray-400">上のボタンから新しいタグを作成できます</p>
            </div>
          }
        >
          {(tag) => {
            const isEditing = () => editingId() === tag.id;
            return (
              <Show
                when={isEditing()}
                fallback={
                  <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
                    <div
                      class="h-6 w-6 flex-shrink-0 rounded-full"
                      style={{ "background-color": tag.color }}
                    />
                    <span class="flex-1 font-medium text-gray-900">{tag.name}</span>
                    <button
                      onClick={() => handleStartEdit(tag.id, tag.name, tag.color)}
                      class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      aria-label="編集"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      class="rounded p-1 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600"
                      aria-label="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                }
              >
                <div class="space-y-3 rounded-lg border-2 border-blue-500 bg-blue-50 p-3">
                  <div>
                    <label class="mb-1 block text-xs font-medium text-gray-700">タグ名</label>
                    <input
                      type="text"
                      value={editingName()}
                      onInput={(e) => setEditingName(e.currentTarget.value)}
                      class="w-full rounded-lg border-2 border-gray-300 bg-white px-2 py-1 text-sm transition-all focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs font-medium text-gray-700">色</label>
                    <div class="grid grid-cols-8 gap-1.5">
                      <For each={DEFAULT_COLORS}>
                        {(color) => (
                          <button
                            type="button"
                            onClick={() => setEditingColor(color)}
                            class={`h-6 w-6 rounded-full transition-transform ${
                              editingColor() === color
                                ? "scale-110 ring-2 ring-blue-500 ring-offset-2"
                                : ""
                            }`}
                            style={{ "background-color": color }}
                            aria-label={`Color ${color}`}
                          />
                        )}
                      </For>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      class="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <Check size={14} />
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      class="flex flex-1 items-center justify-center gap-1 rounded-lg border-2 border-gray-300 bg-white py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <X size={14} />
                      キャンセル
                    </button>
                  </div>
                </div>
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default TagManager;
