import { batch, createMemo, createSignal, For, Show, onMount, type Component } from "solid-js";
import {
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Package,
  Clock,
  Tag as TagIcon,
  Plus,
} from "lucide-solid";
import {
  state,
  exportData,
  importData,
  clearAll,
  setCurrentTab,
  createTag,
  removeTag,
} from "../state/store";
import { useUIState } from "../context/UIStateContext";

const Settings: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();
  const [newTagName, setNewTagName] = createSignal("");
  const [isTagSaving, setIsTagSaving] = createSignal(false);

  const sortedTags = createMemo(() =>
    [...state.tags].sort((a, b) => a.name.localeCompare(b.name, "ja"))
  );

  const tagUsage = createMemo(() => {
    const counts = new Map<string, number>();
    for (const item of state.items) {
      for (const tagId of item.tagIds ?? []) {
        counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
      }
    }
    return counts;
  });

  onMount(() => {
    batch(() => {
      // UIステートの設定
      setHeader({
        title: "設定",
        visible: true,
      });

      setBottomNav({
        visible: true,
        currentTabKey: "settings", // 現在のタブを設定
        tabs: [
          {
            key: "items",
            label: "備品一覧",
            icon: <Package size={24} />,
            onClick: () => setCurrentTab("items"),
          },
          {
            key: "history",
            label: "履歴",
            icon: <Clock size={24} />,
            onClick: () => setCurrentTab("history"),
          },
          {
            key: "settings",
            label: "設定",
            icon: <SettingsIcon size={24} />,
            onClick: () => {
              // 設定タブは既に選択済みなので何もしない
            },
          },
        ],
      });

      setFab({
        visible: false,
      });
    });
  });
  const handleCreateTag = async (event: SubmitEvent) => {
    event.preventDefault();
    if (isTagSaving()) return;

    const trimmed = newTagName().trim();
    if (!trimmed) {
      alert("タグ名を入力してください");
      return;
    }

    if (state.tags.some((tag) => tag.name === trimmed)) {
      alert("同じ名前のタグが既に存在します");
      return;
    }

    try {
      setIsTagSaving(true);
      await createTag(trimmed);
      setNewTagName("");
    } catch (error) {
      console.error("Failed to create tag:", error);
      alert("タグの作成に失敗しました");
    } finally {
      setIsTagSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const tag = state.tags.find((t) => t.id === tagId);
    if (!tag) return;

    const usageCount = tagUsage().get(tagId) ?? 0;
    const confirmMessage =
      usageCount > 0
        ? `タグ「${tag.name}」を削除しますか？\n${usageCount}件のアイテムからタグが外れます。`
        : `タグ「${tag.name}」を削除しますか？`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await removeTag(tagId);
    } catch (error) {
      console.error("Failed to remove tag:", error);
      alert("タグの削除に失敗しました");
    }
  };
  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      a.href = url;
      a.download = `home-stock-backup-${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        alert("✅ エクスポートが完了しました");
      }, 100);
    } catch (error) {
      console.error("Export failed:", error);
      alert("❌ エクスポートに失敗しました");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 確認ダイアログ
      if (!confirm("インポートすると現在のデータがすべて上書きされます。\n続行しますか？")) {
        return;
      }

      try {
        const text = await file.text();
        await importData(text);
        alert("✅ データをインポートしました\n\nページをリロードします");
        // リロードして最新のデータを表示
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        const errorMessage = error instanceof Error ? error.message : "不明なエラー";
        alert(`❌ インポートに失敗しました\n\n${errorMessage}`);
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "すべてのデータを削除しますか？\n\n・すべてのアイテム\n・すべての履歴\n\nこの操作は取り消せません。"
      )
    ) {
      return;
    }

    // 2回目の確認
    if (!confirm("本当に削除しますか？")) {
      return;
    }

    try {
      await clearAll();
      alert("✅ すべてのデータを削除しました");
    } catch (error) {
      console.error("Clear all failed:", error);
      alert("❌ データの削除に失敗しました");
    }
  };

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <div class="space-y-4">
        {/* タグ管理 */}
        <section class="rounded-lg border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-200 p-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <TagIcon size={20} class="text-blue-600" />
            </div>
            <h2 class="font-semibold text-gray-900">タグ管理</h2>
          </div>
          <div class="space-y-4 p-4">
            <form class="flex flex-col gap-2 sm:flex-row" onSubmit={handleCreateTag}>
              <div class="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-400 focus-within:bg-white">
                <Plus size={18} class="text-blue-600" />
                <input
                  type="text"
                  value={newTagName()}
                  onInput={(e) => setNewTagName(e.currentTarget.value)}
                  placeholder="タグ名を入力"
                  class="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                class="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={isTagSaving()}
              >
                タグを追加
              </button>
            </form>

            <Show
              when={sortedTags().length > 0}
              fallback={
                <p class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                  まだタグがありません。上のフォームから作成できます。
                </p>
              }
            >
              <ul class="space-y-2">
                <For each={sortedTags()}>
                  {(tag) => {
                    const usageCount = tagUsage().get(tag.id) ?? 0;
                    return (
                      <li class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                        <div>
                          <div class="font-medium text-gray-900">{tag.name}</div>
                          <div class="text-xs text-gray-500">
                            {usageCount}
                            件のアイテム
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag.id)}
                          class="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95"
                        >
                          <Trash2 size={14} />
                          削除
                        </button>
                      </li>
                    );
                  }}
                </For>
              </ul>
            </Show>
          </div>
        </section>

        {/* データバックアップ */}
        <section class="rounded-lg border border-gray-200 bg-white">
          <div class="border-b border-gray-200 p-4">
            <h2 class="font-semibold text-gray-900">データ管理</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <button
              onClick={handleExport}
              class="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-gray-50"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Download size={20} class="text-green-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">エクスポート</div>
                <div class="text-sm text-gray-500">データをJSONファイルで保存</div>
              </div>
            </button>

            <button
              onClick={handleImport}
              class="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-gray-50"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Upload size={20} class="text-blue-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">インポート</div>
                <div class="text-sm text-gray-500">JSONファイルから復元</div>
              </div>
            </button>
          </div>
        </section>

        {/* 危険な操作 */}
        <section class="rounded-lg border border-red-200 bg-white">
          <div class="border-b border-red-200 p-4">
            <h2 class="font-semibold text-red-600">危険な操作</h2>
          </div>
          <button
            onClick={handleClearAll}
            class="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-red-50"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} class="text-red-600" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-red-600">すべてのデータを削除</div>
              <div class="text-sm text-red-500">この操作は取り消せません</div>
            </div>
          </button>
        </section>

        {/* アプリ情報 */}
        <section class="rounded-lg border border-gray-200 bg-white p-4">
          <h2 class="mb-3 font-semibold text-gray-900">アプリ情報</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-600">バージョン</dt>
              <dd class="font-medium text-gray-900">{__GIT_HASH__}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">ライセンス</dt>
              <dd class="font-medium text-gray-900">MIT</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};

export default Settings;
