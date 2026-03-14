"use client";

import { useVideoStore } from "@/store/useVideoStore";

export default function VideoPreview() {
  const { status, videoUrl, reset } = useVideoStore();

  if (status !== "completed" || !videoUrl) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-gray-700 bg-black">
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full max-h-[480px] object-contain"
        />
      </div>

      <div className="flex gap-3">
        <a
          href={videoUrl}
          download={`veo-generated-${Date.now()}.mp4`}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          📥 MP4 다운로드
        </a>
        <button
          type="button"
          onClick={reset}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          🔄 다시 생성
        </button>
      </div>

      <p className="text-xs text-yellow-600 text-center">
        생성된 영상은 Google 서버에서 2일 후 삭제됩니다. 지금 다운로드하세요.
      </p>
    </div>
  );
}
