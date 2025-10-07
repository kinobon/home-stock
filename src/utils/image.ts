import imageCompression from "browser-image-compression";

/**
 * 画像を圧縮してBase64文字列に変換
 * @param file - 圧縮する画像ファイル
 * @returns Base64エンコードされた画像文字列
 */
export async function compressImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.5, // 最大0.5MB
    maxWidthOrHeight: 800, // 最大幅/高さ
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await fileToBase64(compressedFile);
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
}

/**
 * FileをBase64文字列に変換
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
