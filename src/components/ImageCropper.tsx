import { createSignal, onMount, onCleanup, type Component } from "solid-js";
import Cropper from "cropperjs";
import { X, Check } from "lucide-solid";

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: Component<ImageCropperProps> = (props) => {
  let imageRef: HTMLImageElement | undefined;
  let cropper: Cropper | undefined;
  const [isProcessing, setIsProcessing] = createSignal(false);

  onMount(() => {
    if (!imageRef) return;

    cropper = new Cropper(imageRef, {
      aspectRatio: 1, // 正方形
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      checkOrientation: true,
    });
  });

  onCleanup(() => {
    cropper?.destroy();
  });

  const handleCrop = () => {
    if (!cropper) return;

    setIsProcessing(true);
    try {
      const canvas = cropper.getCroppedCanvas({
        width: 800,
        height: 800,
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      if (!canvas) {
        throw new Error("Canvas generation failed");
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              if (typeof result === "string") {
                props.onCrop(result);
              }
              setIsProcessing(false);
            };
            reader.onerror = () => {
              console.error("FileReader error");
              alert("画像の読み込みに失敗しました");
              setIsProcessing(false);
            };
            reader.readAsDataURL(blob);
          } else {
            console.error("Blob is null");
            alert("画像の変換に失敗しました");
            setIsProcessing(false);
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("Crop error:", error);
      alert("画像のクロップに失敗しました");
      setIsProcessing(false);
    }
  };

  return (
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div class="flex w-full max-w-3xl flex-col rounded-2xl bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-lg font-bold">画像をクロップ</h3>
          <button
            onClick={props.onCancel}
            class="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div class="mb-4 max-h-[60vh] overflow-hidden rounded-lg bg-gray-100">
          <img ref={imageRef} src={props.imageUrl} alt="Crop" class="max-w-full" />
        </div>

        <div class="flex gap-3">
          <button
            onClick={props.onCancel}
            class="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-gray-300 py-3 font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
          >
            <X size={18} />
            キャンセル
          </button>
          <button
            onClick={handleCrop}
            class="flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:bg-gray-300"
            disabled={isProcessing()}
          >
            <Check size={18} />
            {isProcessing() ? "処理中..." : "クロップ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
