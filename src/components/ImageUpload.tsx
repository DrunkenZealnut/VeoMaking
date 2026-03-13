"use client";

import { useCallback, useRef } from "react";
import { useVideoStore } from "@/store/useVideoStore";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function ImageUpload() {
  const { referenceImages, addReferenceImage, removeReferenceImage } =
    useVideoStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          alert(`지원하지 않는 형식입니다: ${file.name}\n(JPEG, PNG, WebP만 가능)`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          alert(`파일이 너무 큽니다: ${file.name}\n(최대 20MB)`);
          continue;
        }

        const base64 = await fileToBase64(file);
        const previewUrl = URL.createObjectURL(file);

        addReferenceImage({
          base64,
          mimeType: file.type,
          name: file.name,
          previewUrl,
        });
      }
    },
    [addReferenceImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        참조 이미지 (Image-to-Video, 선택사항)
      </label>

      {/* 드롭 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-800/30 transition-colors"
      >
        <span className="text-gray-400 text-sm">
          🖼️ 이미지를 드래그하거나 클릭하여 업로드 (JPEG, PNG, WebP)
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* 이미지 미리보기 */}
      {referenceImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {referenceImages.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img.previewUrl}
                alt={img.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-600"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  URL.revokeObjectURL(img.previewUrl);
                  removeReferenceImage(i);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
              {i === 0 && referenceImages.length > 1 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-blue-600/80 text-white rounded-b-lg">
                  사용됨
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {referenceImages.length > 1 && (
        <p className="text-xs text-amber-400">
          Veo 3.1은 첫 번째 이미지만 참조 이미지로 사용합니다.
        </p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:image/jpeg;base64,..." 형식에서 base64 부분만 추출
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
