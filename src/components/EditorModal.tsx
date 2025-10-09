import { createSignal, createEffect, batch, Show, type Component } from "solid-js";
import {
  state,
  setView,
  createItem,
  updateItem,
  setSelectedItem,
  removeItem,
} from "../state/store";
import { compressImage } from "../utils/image";
import { X, Save, Image as ImageIcon, Loader2, Trash2 } from "lucide-solid";
import QuantitySpinner from "./QuantitySpinner";
import ImageCropper from "./ImageCropper";
import FullScreenModal from "./FullScreenModal";

const EditorModal: Component = () => {
  const currentItem = () => state.items.find((item) => item.id === state.selectedItemId);

  const [name, setName] = createSignal("");
  const [quantity, setQuantity] = createSignal(0);
  const [memo, setMemo] = createSignal("");
  const [photo, setPhoto] = createSignal("");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showCropper, setShowCropper] = createSignal(false);
  const [tempImageUrl, setTempImageUrl] = createSignal("");

  // モーダルが開かれたときに currentItem の値を反映
  createEffect(() => {
    if (state.view === "editor") {
      const item = currentItem();
      batch(() => {
        if (item) {
          setName(item.name);
          setQuantity(item.quantity);
          setMemo(item.memo || "");
          setPhoto(item.photo || "");
        } else {
          setName("");
          setQuantity(0);
          setMemo("");
          setPhoto("");
        }
      });
    }
  });

  const handlePhotoChange = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // 画像を読み込んでクロップモーダルを表示
    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImageUrl(event.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    // input をリセット
    input.value = "";
  };

  const handleCropComplete = async (croppedImage: string) => {
    setIsProcessing(true);
    setShowCropper(false);
    try {
      // Base64 を Blob に変換してから圧縮
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch (error) {
      alert("画像の処理に失敗しました");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setTempImageUrl("");
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageUrl("");
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
  };

  const handleDelete = () => {
    if (!currentItem()) return;
    if (confirm(`「${currentItem()!.name}」を削除しますか?`)) {
      removeItem(currentItem()!.id);
      handleClose();
    }
  };

  return (
    <>
      <FullScreenModal
        isOpen={state.view === "editor"}
        onClose={handleClose}
        title={currentItem() ? "編集" : "新規追加"}
        footer={
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <button
                onClick={handleClose}
                class="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-gray-300 py-3.5 font-medium text-gray-700 transition-all active:scale-95 md:py-3"
              >
                <X size={20} class="md:hidden" />
                <X size={18} class="hidden md:block" />
                キャンセル
              </button>
              <button
                onClick={handleSave}
                class="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 font-medium text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 md:py-3"
                disabled={isProcessing()}
              >
                <Save size={20} class="md:hidden" />
                <Save size={18} class="hidden md:block" />
                保存
              </button>
            </div>

            {/* 削除ボタン（編集時のみ表示） */}
            <Show when={currentItem()}>
              <button
                onClick={handleDelete}
                class="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-200 py-3.5 font-medium text-red-600 transition-all active:scale-95 md:py-3"
              >
                <Trash2 size={20} class="md:hidden" />
                <Trash2 size={18} class="hidden md:block" />
                削除
              </button>
            </Show>
          </div>
        }
      >
        {/* フォーム */}
        <div class="p-4 pb-0">
          <div class="space-y-5">
            {/* 名前 */}
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                名前 <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-base transition-all focus:border-blue-500 focus:bg-white focus:outline-none md:py-2.5 md:text-sm"
                placeholder="例: 入浴剤(ゆず)"
              />
            </div>

            {/* 数量 */}
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">数量</label>
              <div class="flex justify-center">
                <QuantitySpinner value={quantity()} onChange={setQuantity} min={0} />
              </div>
            </div>

            {/* メモ */}
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">メモ</label>
              <textarea
                value={memo()}
                onInput={(e) => setMemo(e.currentTarget.value)}
                class="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-base transition-all focus:border-blue-500 focus:bg-white focus:outline-none md:py-2.5 md:text-sm"
                rows="3"
                placeholder="補足情報など"
              />
            </div>

            {/* 写真 */}
            <div>
              <label class="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                <ImageIcon size={16} />
                写真
              </label>

              {/* 写真プレビュー枠（常に表示） */}
              <div class="mx-auto w-full max-w-xs">
                <div class="aspect-square w-full overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-50">
                  <Show
                    when={photo()}
                    fallback={
                      <div class="flex h-full w-full items-center justify-center text-gray-400">
                        <ImageIcon size={48} />
                      </div>
                    }
                  >
                    <img src={photo()} alt="Preview" class="h-full w-full object-cover" />
                  </Show>
                </div>
              </div>

              {/* ファイル選択ボタン */}
              <div class="mt-3 flex flex-col gap-2">
                <div class="flex items-center justify-center gap-2">
                  <label class="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      class="hidden"
                      disabled={isProcessing()}
                    />
                    <span class="flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95">
                      <ImageIcon size={16} />
                      {photo() ? "写真を変更" : "写真を選択"}
                    </span>
                  </label>

                  {/* 写真削除ボタン（写真がある場合のみ表示） */}
                  <Show when={photo()}>
                    <button
                      onClick={() => setPhoto("")}
                      class="flex items-center gap-1 rounded-full border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95"
                      type="button"
                    >
                      <X size={16} />
                      削除
                    </button>
                  </Show>
                </div>

                <Show when={isProcessing()}>
                  <p class="flex items-center justify-center gap-1 text-sm text-gray-500">
                    <Loader2 size={16} class="animate-spin" />
                    画像を処理中...
                  </p>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </FullScreenModal>

      {/* 画像クロッパー */}
      <Show when={showCropper()}>
        <ImageCropper
          imageUrl={tempImageUrl()}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      </Show>
    </>
  );
};

export default EditorModal;
