"use client";

import { useCallback, useRef } from "react";
import { useVideoStore } from "@/store/useVideoStore";
import PromptBuilder from "@/components/PromptBuilder";
import ImageUpload from "@/components/ImageUpload";
import VideoOptions from "@/components/VideoOptions";
import GenerationStatus from "@/components/GenerationStatus";
import VideoPreview from "@/components/VideoPreview";
import ActionSuggestions from "@/components/ActionSuggestions";
import PasswordGate from "@/components/PasswordGate";

const POLL_INTERVAL = 10_000; // 10초
const POLL_TIMEOUT = 6 * 60 * 1000; // 6분

export default function Home() {
  const {
    status,
    getComposedPrompt,
    resolution,
    duration,
    aspectRatio,
    modelType,
    referenceImages,
    getCostString,
    setStatus,
    setGeneration,
    setErrorMessage,
    setVideoUrl,
    reset,
  } = useVideoStore();

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (operationName: string, keyIndex?: number) => {
      setStatus("polling");
      pollStartRef.current = Date.now();

      const keyParam = keyIndex != null ? `&keyIndex=${keyIndex}` : "";

      pollingRef.current = setInterval(async () => {
        // Gap Fix: 6분 타임아웃
        if (Date.now() - pollStartRef.current > POLL_TIMEOUT) {
          stopPolling();
          setStatus("error");
          setErrorMessage(
            "동영상 생성 시간이 초과되었습니다 (6분). 나중에 다시 시도해주세요."
          );
          return;
        }

        try {
          const res = await fetch(
            `/api/status?name=${encodeURIComponent(operationName)}${keyParam}`
          );
          const data = await res.json();

          if (data.error) {
            stopPolling();
            setStatus("error");
            setErrorMessage(data.error.message);
            return;
          }

          if (data.done) {
            stopPolling();

            if (data.videoUri) {
              const downloadUrl = `/api/download?uri=${encodeURIComponent(data.videoUri)}${keyParam}`;
              setVideoUrl(downloadUrl);
              setStatus("completed");
            } else if (data.error) {
              setStatus("error");
              setErrorMessage(data.error);
            }
          }
        } catch {
          stopPolling();
          setStatus("error");
          setErrorMessage("상태 확인 중 오류가 발생했습니다.");
        }
      }, POLL_INTERVAL);
    },
    [setStatus, setErrorMessage, setVideoUrl, stopPolling]
  );

  const handleGenerate = useCallback(async () => {
    const prompt = getComposedPrompt();
    if (!prompt.trim()) {
      setErrorMessage("프롬프트를 입력해주세요.");
      setStatus("error");
      return;
    }

    if (prompt.length > 4096) {
      setErrorMessage(`프롬프트가 너무 깁니다. (${prompt.length}/4096자)`);
      setStatus("error");
      return;
    }

    setStatus("generating");
    setErrorMessage(null);
    setVideoUrl(null);

    try {
      // 이미지가 있으면 첫 번째 이미지를 사용 (Veo는 단일 참조 이미지 지원)
      const imageData =
        referenceImages.length > 0
          ? {
              base64: referenceImages[0].base64,
              mimeType: referenceImages[0].mimeType,
            }
          : undefined;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          resolution,
          duration,
          aspectRatio,
          modelType,
          image: imageData,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setStatus("error");
        setErrorMessage(data.error.message);
        return;
      }

      setGeneration({
        operationName: data.operationName,
        done: false,
        startedAt: data.startedAt,
        keyIndex: data.keyIndex,
      });

      startPolling(data.operationName, data.keyIndex);
    } catch {
      setStatus("error");
      setErrorMessage("요청 중 오류가 발생했습니다.");
    }
  }, [
    getComposedPrompt,
    resolution,
    duration,
    aspectRatio,
    modelType,
    referenceImages,
    setStatus,
    setErrorMessage,
    setVideoUrl,
    setGeneration,
    startPolling,
  ]);

  const isGenerating = status === "generating" || status === "polling";
  const costStr = getCostString();

  return (
    <PasswordGate>
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">🎬 VeoMaking</h1>
        <span className="text-sm text-gray-400">
          예상 비용: {costStr}
        </span>
      </header>

      <div className="space-y-6">
        {/* 프롬프트 빌더 */}
        <PromptBuilder />

        {/* 참조 이미지 업로드 (Image-to-Video) */}
        <ImageUpload />

        {/* 이미지 첨부 시 액션 제안 */}
        <ActionSuggestions />

        {/* 생성 옵션 */}
        <VideoOptions />

        {/* 생성 버튼 */}
        <button
          type="button"
          onClick={isGenerating ? undefined : handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
            isGenerating
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isGenerating
            ? "생성 중..."
            : referenceImages.length > 0
              ? `🖼️ Image-to-Video 생성하기 (${costStr})`
              : `🎬 동영상 생성하기 (${costStr})`}
        </button>

        {/* 생성 상태 */}
        <GenerationStatus />

        {/* 비디오 미리보기 */}
        <VideoPreview />

        {/* 에러 후 다시 시도 */}
        {status === "error" && (
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorMessage(null);
            }}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>

      {/* 푸터 */}
      <footer className="mt-12 pt-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          SynthID 워터마크 포함 | Powered by Google Veo 3.1
        </p>
      </footer>
    </div>
    </PasswordGate>
  );
}
