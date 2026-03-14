"use client";

import { useVideoStore } from "@/store/useVideoStore";
import { useEffect, useState } from "react";

export default function GenerationStatus() {
  const { status, generation, errorMessage, batchProgress, videoUrls } =
    useVideoStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== "generating" && status !== "polling") {
      setElapsed(0);
      return;
    }

    const startTime = generation?.startedAt ?? Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, generation?.startedAt]);

  if (status === "idle" || status === "completed") return null;

  if (status === "error") {
    const isQuotaError =
      errorMessage?.includes("할당량") || errorMessage?.includes("quota");

    return (
      <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
        <p className="text-red-400 text-sm font-medium">
          {isQuotaError ? "API 할당량 초과" : "생성 실패"}
        </p>
        <p className="text-red-300 text-sm mt-1">
          {errorMessage ?? "알 수 없는 오류가 발생했습니다."}
        </p>
        {isQuotaError && (
          <div className="mt-3 space-y-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs underline block"
            >
              Google AI Studio에서 API 키 및 요금제 확인 →
            </a>
            <a
              href="https://ai.dev/rate-limit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs underline block"
            >
              현재 사용량 모니터링 →
            </a>
          </div>
        )}
        {/* 배치 중 일부 성공한 경우 안내 */}
        {videoUrls.length > 0 && (
          <p className="text-amber-400 text-xs mt-2">
            {videoUrls.length}개 영상이 이미 생성되었습니다. 아래에서 확인하세요.
          </p>
        )}
      </div>
    );
  }

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;

  const isBatch = batchProgress !== null;

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div>
          <p className="text-sm text-gray-300">
            {isBatch
              ? `이미지 ${batchProgress.current} / ${batchProgress.total} 영상 생성 중...`
              : "동영상 생성 중..."}
          </p>
          <p className="text-xs text-gray-500">
            경과: {timeStr} | 예상 소요: 1~6분
            {isBatch && ` (영상당)`}
          </p>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min((elapsed / 360) * 100, 95)}%`,
          }}
        />
      </div>

      {/* 배치 전체 진행률 */}
      {isBatch && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>전체 진행률</span>
            <span>
              {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${((batchProgress.current - 1) / batchProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
