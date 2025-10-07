import { createSignal, Show, type Component } from "solid-js";
import { state, setView, createItem, updateItem, setSelectedItem } from "../state/store";
import { compressImage } from "../utils/image";
import { Edit, Plus, X, Save, Image as ImageIcon, Loader2 } from "lucide-solid";
import QuantityStepper from "./QuantityStepper";

const EditorModal: Component = () => {
  const currentItem = () => state.items.find((item) => item.id === state.selectedItemId);

  const [name, setName] = createSignal(currentItem()?.name || "");
  const [quantity, setQuantity] = createSignal(currentItem()?.quantity || 0);
  const [memo, setMemo] = createSignal(currentItem()?.memo || "");
  const [photo, setPhoto] = createSignal(currentItem()?.photo || "");
  const [isProcessing, setIsProcessing] = createSignal(false);

  const handlePhotoChange = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch (error) {
      alert("画像の処理に失敗しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!name().trim()) {
      alert("名前を入力してください");
      return;
    }

    try {
      if (currentItem()) {
        await updateItem(currentItem()!.id, {
          name: name(),
          quantity: quantity(),
          memo: memo() || undefined,
          photo: photo() || undefined,
        });
      } else {
        await createItem(name(), quantity(), photo() || undefined, memo() || undefined);
      }
      handleClose();
    } catch (error) {
      alert("保存に失敗しました");
      console.error(error);
    }
  };

  const handleClose = () => {
    setSelectedItem(undefined);
    setView("list");
    setName("");
    setQuantity(0);
    setMemo("");
    setPhoto("");
  };

  return (
    <Show when={state.view === "editor"}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 class="mb-4 flex items-center gap-2 text-xl font-bold">
            {currentItem() ? (
              <>
                <Edit size={24} />
                編集
              </>
            ) : (
              <>
                <Plus size={24} />
                新規追加
              </>
            )}
          </h2>

          <div class="space-y-4">
            {/* 名前 */}
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">
                名前 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 transition-all focus:border-blue-500 focus:bg-white focus:shadow-md focus:outline-none"
                placeholder="例: 入浴剤(ゆず)"
              />
            </div>

            {/* 数量 */}
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">数量</label>
              <div class="flex justify-center">
                <QuantityStepper value={quantity()} onChange={setQuantity} min={0} />
              </div>
            </div>

            {/* メモ */}
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">メモ</label>
              <textarea
                value={memo()}
                onInput={(e) => setMemo(e.currentTarget.value)}
                class="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 transition-all focus:border-blue-500 focus:bg-white focus:shadow-md focus:outline-none"
                rows="3"
                placeholder="補足情報など"
              />
            </div>

            {/* 写真 */}
            <div>
              <label class="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                <ImageIcon size={16} />
                写真
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                disabled={isProcessing()}
              />
              <Show when={photo()}>
                <img src={photo()} alt="Preview" class="mt-2 h-32 w-full rounded object-cover" />
              </Show>
              <Show when={isProcessing()}>
                <p class="mt-2 flex items-center gap-1 text-sm text-gray-500">
                  <Loader2 size={16} class="animate-spin" />
                  画像を処理中...
                </p>
              </Show>
            </div>
          </div>

          {/* ボタン */}
          <div class="mt-6 flex gap-3">
            <button
              onClick={handleClose}
              class="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-gray-300 py-3 font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              <X size={18} />
              キャンセル
            </button>
            <button
              onClick={handleSave}
              class="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              disabled={isProcessing()}
            >
              <Save size={18} />
              保存
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default EditorModal;
