"use client";

import { useCallback, useRef, useState } from "react";
import { useVideoStore } from "@/store/useVideoStore";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB (영상은 더 클 수 있음)

export default function ImageUpload() {
  const { referenceImages, addReferenceImage, removeReferenceImage } =
    useVideoStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);

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
            // GAP-12: 같은 파일 재선택 가능하도록 input 값 초기화
            if (inputRef.current) inputRef.current.value = "";
          }}
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
      // "data:image/jpeg;base64,..." 형식에서 base64 부분만 추출
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EXTRACT_TIMEOUT_MS = 30_000; // 30초 타임아웃

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
      video.load(); // 리소스 해제
    };

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    // GAP-03: 타임아웃 — 30초 내 추출 실패 시 reject
    const timer = setTimeout(() => {
      settle(() => {
        cleanup();
        reject(new Error("영상 프레임 추출 시간이 초과되었습니다. (30초)"));
      });
    }, EXTRACT_TIMEOUT_MS);

    // GAP-04: { once: true }로 이벤트 리스너 자동 정리
    video.addEventListener("loadedmetadata", () => {
      // 마지막 프레임으로 이동 (끝에서 0.1초 전)
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
