"use client";

import { useCallback, useRef, useState } from "react";
import { useVideoStore } from "@/store/useVideoStore";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

export default function ImageUpload() {
  const {
    referenceImages,
    addReferenceImage,
    removeReferenceImage,
    reorderReferenceImage,
  } = useVideoStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      for (const file of Array.from(files)) {
        const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
        const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
          alert(
            `지원하지 않는 형식입니다: ${file.name}\n(이미지: JPEG, PNG, WebP / 영상: MP4, WebM, MOV)`
          );
          continue;
        }

        if (isImage && file.size > MAX_FILE_SIZE) {
          alert(`파일이 너무 큽니다: ${file.name}\n(이미지 최대 20MB)`);
          continue;
        }
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          alert(`파일이 너무 큽니다: ${file.name}\n(영상 최대 200MB)`);
          continue;
        }

        if (isVideo) {
          setExtracting(true);
          try {
            const { base64, previewUrl } = await extractLastFrame(file);
            addReferenceImage({
              base64,
              mimeType: "image/png",
              name: `${file.name} (마지막 프레임)`,
              previewUrl,
            });
          } catch {
            alert(
              `영상의 마지막 프레임을 추출할 수 없습니다: ${file.name}\n브라우저가 지원하는 형식인지 확인해주세요.`
            );
          } finally {
            setExtracting(false);
          }
        } else {
          const base64 = await fileToBase64(file);
          const previewUrl = URL.createObjectURL(file);
          addReferenceImage({
            base64,
            mimeType: file.type,
            name: file.name,
            previewUrl,
          });
        }
      }
    },
    [addReferenceImage]
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      // 파일 드롭인 경우에만 처리 (이미지 재정렬 드래그가 아닐 때)
      if (e.dataTransfer.files.length > 0 && dragIndex === null) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles, dragIndex]
  );

  // 이미지 재정렬 드래그 핸들러
  const handleImageDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleImageDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderReferenceImage(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleImageDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        참조 이미지 (Image-to-Video, 선택사항)
      </label>

      {/* 파일 드롭 영역 */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-800/30 transition-colors ${extracting ? "pointer-events-none opacity-60" : ""}`}
      >
        {extracting ? (
          <span className="text-blue-400 text-sm animate-pulse">
            🎬 영상에서 마지막 프레임을 추출하는 중...
          </span>
        ) : (
          <span className="text-gray-400 text-sm">
            🖼️ 이미지 또는 영상을 드래그하거나 클릭하여 업로드 (JPEG, PNG, WebP, MP4, WebM, MOV)
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>

      {/* 이미지 미리보기 + 순서 번호 + 드래그 재정렬 */}
      {referenceImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {referenceImages.map((img, i) => (
            <div
              key={`${img.name}-${i}`}
              draggable={referenceImages.length > 1}
              onDragStart={() => handleImageDragStart(i)}
              onDragOver={(e) => handleImageDragOver(e, i)}
              onDrop={(e) => handleImageDrop(e, i)}
              onDragEnd={handleImageDragEnd}
              className={`relative group transition-all ${
                referenceImages.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
              } ${dragIndex === i ? "opacity-40 scale-95" : ""} ${
                dragOverIndex === i ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900" : ""
              }`}
            >
              <img
                src={img.previewUrl}
                alt={img.name}
                className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                draggable={false}
              />
              {/* 순서 번호 */}
              <span className="absolute top-0 left-0 w-5 h-5 bg-blue-600 text-white rounded-tl-lg rounded-br-lg text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (img.previewUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(img.previewUrl);
                  }
                  removeReferenceImage(i);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {referenceImages.length > 1 && (
        <p className="text-xs text-blue-400">
          📋 {referenceImages.length}개 이미지가 순서대로 하나의 영상에 반영됩니다. 드래그하여 순서를 변경할 수 있습니다.
        </p>
      )}

      <p className="text-xs text-gray-500">
        💡 영상을 첨부하면 마지막 프레임이 자동 추출되어 첫 화면으로 설정됩니다.
      </p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EXTRACT_TIMEOUT_MS = 30_000;

function extractLastFrame(
  file: File
): Promise<{ base64: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      settle(() => {
        cleanup();
        reject(new Error("영상 프레임 추출 시간이 초과되었습니다. (30초)"));
      });
    }, EXTRACT_TIMEOUT_MS);

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.max(0, video.duration - 0.1);
    }, { once: true });

    video.addEventListener("seeked", () => {
      settle(() => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            cleanup();
            reject(new Error("Canvas context 생성 실패"));
            return;
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/png");
          const base64 = dataUrl.split(",")[1];
          const previewUrl = dataUrl;
          cleanup();
          resolve({ base64, previewUrl });
        } catch (err) {
          cleanup();
          reject(err);
        }
      });
    }, { once: true });

    video.addEventListener("error", () => {
      settle(() => {
        cleanup();
        reject(new Error("영상 로드 실패"));
      });
    }, { once: true });
  });
}
