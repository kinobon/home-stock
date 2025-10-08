import { type Component } from "solid-js";
import { Download, Upload, Trash2 } from "lucide-solid";
import { exportData, importData, clearAll } from "../state/store";

const Settings: Component = () => {
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `home-stock-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importData(text);
        alert("データをインポートしました");
      } catch (error) {
        alert("インポートに失敗しました");
        console.error(error);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
      clearAll();
      alert("すべてのデータを削除しました");
    }
  };

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <h1 class="mb-6 text-2xl font-bold text-gray-900">設定</h1>

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
