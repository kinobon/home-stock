import { onMount, Show, type Component } from "solid-js";
import { state, initializeStore } from "./state/store";
import Header from "./components/Header";
import ItemList from "./components/ItemList";
import EditorModal from "./components/EditorModal";
import BottomNav from "./components/BottomNav";
import Settings from "./components/Settings";
import FAB from "./components/FAB";
import { useIOSScrollDebounce, optimizeTouchEvents } from "./utils/scroll";

const App: Component = () => {
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
    <div class="min-h-screen bg-gray-50 pb-16">
      {/* ヘッダーは備品一覧タブのみ表示 */}
      <Show when={state.currentTab === "items"}>
        <Header />
      </Show>

      {/* タブコンテンツ */}
      <Show when={state.currentTab === "items"}>
        <ItemList />
      </Show>
      <Show when={state.currentTab === "settings"}>
        <Settings />
      </Show>

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
