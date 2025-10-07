import { onMount, type Component } from "solid-js";
import { initializeStore } from "./state/store";
import Header from "./components/Header";
import ItemList from "./components/ItemList";
import EditorModal from "./components/EditorModal";
import { useIOSScrollDebounce } from "./utils/scroll";

const App: Component = () => {
  onMount(async () => {
    // IndexedDB からデータをロード
    await initializeStore();

    // iOS スクロールデバウンス対策
    useIOSScrollDebounce(() => {
      // スクロール中の最適化処理
      // 必要に応じてここでリアクティブシステムの更新を制御
    }, 100);
  });

  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      <ItemList />
      <EditorModal />
    </div>
  );
};

export default App;
