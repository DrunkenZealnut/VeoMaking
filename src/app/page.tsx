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
    getTotalCostString,
    setStatus,
    setGeneration,
    setErrorMessage,
    addVideoUrl,
    clearVideoUrls,
    setBatchProgress,
    reset,
  } = useVideoStore();

  const cancelledRef = useRef(false);

  /** 단일 영상 생성 + 폴링 후 videoUrl 반환 */
  const generateSingleVideo = useCallback(
    async (
      prompt: string,
      imageData?: { base64: string; mimeType: string }
    ): Promise<string> => {
      // 1. 생성 요청
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
      if (data.error) throw new Error(data.error.message);

      setGeneration({
        operationName: data.operationName,
        done: false,
        startedAt: data.startedAt,
        keyIndex: data.keyIndex,
      });

      // 2. 폴링
      const keyParam =
        data.keyIndex != null ? `&keyIndex=${data.keyIndex}` : "";
      const pollStart = Date.now();

      return new Promise<string>((resolve, reject) => {
        const interval = setInterval(async () => {
          if (cancelledRef.current) {
            clearInterval(interval);
            reject(new Error("cancelled"));
            return;
          }

          if (Date.now() - pollStart > POLL_TIMEOUT) {
            clearInterval(interval);
            reject(
              new Error(
                "동영상 생성 시간이 초과되었습니다 (6분). 나중에 다시 시도해주세요."
              )
            );
            return;
          }

          try {
            const statusRes = await fetch(
              `/api/status?name=${encodeURIComponent(data.operationName)}${keyParam}`
            );
            const statusData = await statusRes.json();

            if (statusData.error) {
              clearInterval(interval);
              reject(new Error(statusData.error.message));
              return;
            }

            if (statusData.done) {
              clearInterval(interval);
              if (statusData.videoUri) {
                const downloadUrl = `/api/download?uri=${encodeURIComponent(statusData.videoUri)}${keyParam}`;
                resolve(downloadUrl);
              } else {
                reject(new Error("동영상 생성에 실패했습니다."));
              }
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, POLL_INTERVAL);
      });
    },
    [resolution, duration, aspectRatio, modelType, setGeneration]
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
    clearVideoUrls();
    cancelledRef.current = false;

    const imageCount = referenceImages.length;

    try {
      if (imageCount <= 1) {
        // 단일 생성 (이미지 0~1개)
        const imageData =
          imageCount === 1
            ? {
                base64: referenceImages[0].base64,
                mimeType: referenceImages[0].mimeType,
              }
            : undefined;

        setBatchProgress(null);
        setStatus("polling");
        const url = await generateSingleVideo(prompt, imageData);
        addVideoUrl(url);
        setStatus("completed");
      } else {
        // 배치 생성 (이미지 2개 이상 — 순서대로 순차 생성)
        setBatchProgress({ current: 1, total: imageCount });

        for (let i = 0; i < imageCount; i++) {
          if (cancelledRef.current) break;

          setBatchProgress({ current: i + 1, total: imageCount });
          setStatus("polling");

          try {
            const imageData = {
              base64: referenceImages[i].base64,
              mimeType: referenceImages[i].mimeType,
            };
            const url = await generateSingleVideo(prompt, imageData);
            addVideoUrl(url);
          } catch (err) {
            if (
              err instanceof Error &&
              err.message === "cancelled"
            ) {
              break;
            }
            // 개별 실패는 건너뛰고 계속 진행
            console.error(`이미지 ${i + 1} 생성 실패:`, err);
          }
        }

        setBatchProgress(null);

        // 결과 확인
        const { videoUrls } = useVideoStore.getState();
        if (videoUrls.length > 0) {
          setStatus("completed");
        } else {
          setStatus("error");
          setErrorMessage("모든 영상 생성에 실패했습니다.");
        }
      }
    } catch (err) {
      if (!(err instanceof Error && err.message === "cancelled")) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "요청 중 오류가 발생했습니다."
        );
      }
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
    clearVideoUrls,
    addVideoUrl,
    setBatchProgress,
    generateSingleVideo,
  ]);

  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    setBatchProgress(null);
    const { videoUrls } = useVideoStore.getState();
    if (videoUrls.length > 0) {
      setStatus("completed");
    } else {
      setStatus("idle");
    }
  }, [setStatus, setBatchProgress]);

  const isGenerating = status === "generating" || status === "polling";
  const isBatch = referenceImages.length > 1;
  const costStr = isBatch ? getTotalCostString() : getCostString();
  const unitCostStr = getCostString();

  return (
    <PasswordGate>
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">🎬 VeoMaking</h1>
        <span className="text-sm text-gray-400">
          예상 비용: {costStr}
          {isBatch && (
            <span className="text-xs text-gray-500">
              {" "}({unitCostStr} × {referenceImages.length})
            </span>
          )}
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

        {/* 생성 / 취소 버튼 */}
        {isGenerating ? (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-3 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-all"
          >
            ⏹ 생성 중단
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-3 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            {isBatch
              ? `🖼️ ${referenceImages.length}개 이미지로 순차 생성 (${costStr})`
              : referenceImages.length === 1
                ? `🖼️ Image-to-Video 생성하기 (${costStr})`
                : `🎬 동영상 생성하기 (${costStr})`}
          </button>
        )}

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
