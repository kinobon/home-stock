import { For, onMount, batch, createMemo, type Component } from "solid-js";
import { state, setCurrentTab } from "../state/store";
import { Package, Settings as SettingsIcon, Clock } from "lucide-solid";
import { useUIState } from "../context/UIStateContext";

const HistoryScreen: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();

  // 日付でグループ化されたログ
  const groupedLogs = createMemo(() => {
    const groups = new Map<string, typeof state.logs>();

    for (const log of state.logs) {
      const date = new Date(log.timestamp);
      const dateKey = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(log);
    }

    return Array.from(groups.entries()).map(([date, logs]) => ({
      date,
      logs,
    }));
  });

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

  return (
    <div class="mx-auto max-w-4xl pb-20">
      {state.logs.length === 0 ? (
        <div class="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <Clock size={64} class="mb-4 text-gray-300" />
          <p class="text-lg font-medium">履歴がありません</p>
          <p class="mt-2 text-sm">数量を変更すると履歴が記録されます</p>
        </div>
      ) : (
        <div class="flex flex-col">
          <For each={groupedLogs()}>
            {(group) => (
              <div class="mb-4">
                {/* 日付ヘッダー */}
                <div class="sticky top-0 z-10 bg-gray-100 px-4 py-2">
                  <h2 class="text-sm font-bold text-gray-700">{group.date}</h2>
                </div>

                {/* その日のログ一覧 */}
                <div class="bg-white">
                  <For each={group.logs}>
                    {(log) => {
                      if (log.delta === 0) {
                        return null;
                      }
                      return (
                        <div class="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
                          {/* 項目名 */}
                          <div class="flex-1">
                            <h3 class="text-base font-medium text-gray-900">{log.itemName}</h3>
                          </div>

                          {/* 変化量 */}
                          <div class="text-right">
                            <div
                              class={`text-lg font-bold ${
                                log.delta > 0
                                  ? "text-green-600"
                                  : log.delta < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {log.delta > 0 ? "+" : ""}
                              {log.delta}
                            </div>
                            <div class="text-xs text-gray-500">
                              {log.oldValue} → {log.newValue}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
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
