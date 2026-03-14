"use client";

import { useVideoStore } from "@/store/useVideoStore";

export default function VideoPreview() {
  const { status, videoUrls, reset } = useVideoStore();

  if (status !== "completed" || videoUrls.length === 0) return null;

  const isBatch = videoUrls.length > 1;

  return (
    <div className="space-y-4">
      {videoUrls.map((url, i) => (
        <div key={i} className="space-y-2">
          {isBatch && (
            <p className="text-sm font-medium text-gray-300">
              영상 {i + 1} / {videoUrls.length}
            </p>
          )}
          <div className="rounded-lg overflow-hidden border border-gray-700 bg-black">
            <video
              src={url}
              controls
              autoPlay={i === 0}
              className="w-full max-h-[480px] object-contain"
            />
          </div>
          <a
            href={url}
            download={`veo-generated-${i + 1}-${Date.now()}.mp4`}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📥 {isBatch ? `영상 ${i + 1} 다운로드` : "MP4 다운로드"}
          </a>
        </div>
      ))}

      <button
        type="button"
        onClick={reset}
        className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        🔄 다시 생성
      </button>

      <p className="text-xs text-yellow-600 text-center">
        생성된 영상은 Google 서버에서 2일 후 삭제됩니다. 지금 다운로드하세요.
      </p>
    </div>
  );
}
