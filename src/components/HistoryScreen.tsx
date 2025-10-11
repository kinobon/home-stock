import { For, onMount, batch, type Component } from "solid-js";
import { state, setCurrentTab } from "../state/store";
import { Package, Settings as SettingsIcon, Clock } from "lucide-solid";
import { useUIState } from "../context/UIStateContext";

const HistoryScreen: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();

  onMount(() => {
    batch(() => {
      setHeader({
        title: "履歴",
        visible: true,
      });

      setBottomNav({
        visible: true,
        currentTabKey: "history",
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
            onClick: () => {
              // 既に選択済み
            },
          },
          {
            key: "settings",
            label: "設定",
            icon: <SettingsIcon size={24} />,
            onClick: () => setCurrentTab("settings"),
          },
        ],
      });

      setFab({
        visible: false,
      });
    });
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div class="mx-auto max-w-4xl pb-20">
      {state.logs.length === 0 ? (
        <div class="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <Clock size={64} class="mb-4 text-gray-300" />
          <p class="text-lg font-medium">履歴がありません</p>
          <p class="mt-2 text-sm">数量を変更して「確定」すると履歴が記録されます</p>
        </div>
      ) : (
        <div class="flex flex-col bg-white">
          <For each={state.logs}>
            {(log) => (
              <div class="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
                {/* 項目名 */}
                <div class="flex-1">
                  <h3 class="text-base font-medium text-gray-900">{log.itemName}</h3>
                  <p class="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                </div>

                {/* 変化量 */}
                <div
                  class={`text-lg font-bold ${log.delta > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {log.delta > 0 ? "+" : ""}
                  {log.delta}枚
                </div>

                {/* ラベル */}
                <div
                  class={`rounded-full px-3 py-1 text-xs font-medium ${
                    log.type === "purchase"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {log.type === "purchase" ? "購入" : "消費"}
                </div>
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
