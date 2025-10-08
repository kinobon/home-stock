import { onMount, Show, type Component } from "solid-js";
import { createSignal, createEffect } from "solid-js";
import { state, initializeStore } from "./state/store";
import Header from "./components/Header";
import ItemList from "./components/ItemList";
import EditorModal from "./components/EditorModal";
import BottomNav from "./components/BottomNav";
import Settings from "./components/Settings";
import FAB from "./components/FAB";
import { useIOSScrollDebounce, optimizeTouchEvents } from "./utils/scroll";
import { tabTransition } from "./utils/transition";

const App: Component = () => {
  const [prevTabIndex, setPrevTabIndex] = createSignal(0);
  const [currentTabIndex, setCurrentTabIndex] = createSignal(0);

  // タブ名からインデックスへのマッピング
  const getTabIndex = (tab: string) => {
    return tab === "items" ? 0 : 1;
  };

  // タブ変更を検知してインデックスを更新
  createEffect(() => {
    const newIndex = getTabIndex(state.currentTab);
    setPrevTabIndex(currentTabIndex());
    setCurrentTabIndex(newIndex);
  });

  // トランジション適用用のref
  const applyTransition = (el: HTMLDivElement) => {
    createEffect(() => {
      // タブが変更されたらトランジションを適用
      // state.currentTabを読み取ることで依存関係を確立
      void state.currentTab;
      tabTransition(el, prevTabIndex(), currentTabIndex(), 300);
    });
  };

  onMount(async () => {
    // IndexedDB からデータをロード
    await initializeStore();

    // iOS タッチイベント最適化
    optimizeTouchEvents();

    // iOS スクロールデバウンス対策
    useIOSScrollDebounce(() => {
      // スクロール中の最適化処理
      // 必要に応じてここでリアクティブシステムの更新を制御
    }, 100);
  });

  return (
    <div class="flex h-dvh flex-col overflow-hidden bg-gray-50">
      {/* ヘッダーは備品一覧タブのみ表示 */}
      <Show when={state.currentTab === "items"}>
        <Header />
      </Show>

      {/* タブコンテンツ（スクロール可能エリア） */}
      <div ref={applyTransition} class="flex-1 overflow-y-auto overscroll-contain">
        <Show when={state.currentTab === "items"}>
          <ItemList />
        </Show>
        <Show when={state.currentTab === "settings"}>
          <Settings />
        </Show>
      </div>

      {/* FAB（備品一覧タブのみ表示） */}
      <Show when={state.currentTab === "items"}>
        <FAB />
      </Show>

      {/* モーダル */}
      <EditorModal />

      {/* ボトムナビゲーション */}
      <BottomNav />
    </div>
  );
};

export default App;
