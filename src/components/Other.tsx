import { batch, createSignal, onMount, Show, type Component } from "solid-js";
import { Settings as SettingsIcon, Tag as TagIcon, ChevronRight } from "lucide-solid";
import { setCurrentTab } from "../state/store";
import { useUIState } from "../context/UIStateContext";
import { Package, Clock, MoreHorizontal } from "lucide-solid";
import TagManager from "./TagManager";
import Settings from "./Settings";

type OtherView = "menu" | "tags" | "settings";

const Other: Component = () => {
  const [, { setHeader, setBottomNav, setFab }] = useUIState();
  const [currentView, setCurrentView] = createSignal<OtherView>("menu");

  onMount(() => {
    batch(() => {
      // UIステートの設定
      setHeader({
        title: "その他",
        visible: true,
      });

      setBottomNav({
        visible: true,
        currentTabKey: "other",
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
            key: "other",
            label: "その他",
            icon: <MoreHorizontal size={24} />,
            onClick: () => {
              // その他タブは既に選択済みなので何もしない
            },
          },
        ],
      });

      setFab({
        visible: false,
      });
    });
  });

  const handleNavigateToTags = () => {
    setCurrentView("tags");
    setHeader({
      title: "タグ管理",
      visible: true,
    });
  };

  const handleNavigateToSettings = () => {
    setCurrentView("settings");
    setHeader({
      title: "設定",
      visible: true,
    });
  };

  const handleBackToMenu = () => {
    setCurrentView("menu");
    setHeader({
      title: "その他",
      visible: true,
    });
  };

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <Show when={currentView() === "menu"}>
        <div class="space-y-4">
          {/* メニューリスト */}
          <section class="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200">
            <button
              onClick={handleNavigateToTags}
              class="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-gray-50"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <TagIcon size={20} class="text-blue-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">タグ管理</div>
                <div class="text-sm text-gray-500">タグの作成・編集・削除</div>
              </div>
              <ChevronRight size={20} class="text-gray-400" />
            </button>

            <button
              onClick={handleNavigateToSettings}
              class="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-gray-50"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <SettingsIcon size={20} class="text-gray-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">設定</div>
                <div class="text-sm text-gray-500">データ管理・アプリ情報</div>
              </div>
              <ChevronRight size={20} class="text-gray-400" />
            </button>
          </section>
        </div>
      </Show>

      <Show when={currentView() === "tags"}>
        <div class="space-y-4">
          <button
            onClick={handleBackToMenu}
            class="flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <TagManager />
        </div>
      </Show>

      <Show when={currentView() === "settings"}>
        <div class="space-y-4">
          <button
            onClick={handleBackToMenu}
            class="flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <Settings isSubView={true} />
        </div>
      </Show>
    </div>
  );
};

export default Other;
