import { batch, onMount, type Component } from "solid-js";
import { Download, Upload, Trash2, Settings as SettingsIcon, Package, Clock } from "lucide-solid";
import { exportData, importData, clearAll, setCurrentTab } from "../state/store";
import { useUIState } from "../context/UIStateContext";

interface SettingsProps {
  isSubView?: boolean;
}

const Settings: Component<SettingsProps> = (props) => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();

  onMount(() => {
    // サブビューとして使われる場合はUIステートを設定しない
    if (props.isSubView) return;

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
    <div class={props.isSubView ? "space-y-4" : "mx-auto max-w-4xl px-4 py-6"}>
      <div class="space-y-4">
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
