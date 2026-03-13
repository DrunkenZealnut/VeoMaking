"use client";

import { useVideoStore } from "@/store/useVideoStore";
import { DURATION_CONSTRAINTS } from "@/lib/prompt-presets";
import type { AspectRatio, Duration, ModelType, Resolution } from "@/types/video";

function OptionButton<T extends string>({
  value,
  current,
  onClick,
  disabled,
  children,
}: {
  value: T;
  current: T;
  onClick: (v: T) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const isActive = value === current;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-blue-600 text-white"
          : disabled
            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function VideoOptions() {
  const {
    resolution,
    duration,
    aspectRatio,
    modelType,
    setResolution,
    setDuration,
    setAspectRatio,
    setModelType,
  } = useVideoStore();

  const allowedDurations = DURATION_CONSTRAINTS[resolution] ?? ["8"];

  return (
    <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300">생성 옵션</h3>

      {/* 해상도 */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">해상도</label>
        <div className="flex gap-2">
          {(["720p", "1080p", "4k"] as Resolution[]).map((r) => (
            <OptionButton
              key={r}
              value={r}
              current={resolution}
              onClick={setResolution}
            >
              {r.toUpperCase()}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* 길이 */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">길이</label>
        <div className="flex gap-2">
          {(["4", "6", "8"] as Duration[]).map((d) => (
            <OptionButton
              key={d}
              value={d}
              current={duration}
              onClick={setDuration}
              disabled={!allowedDurations.includes(d)}
            >
              {d}초
            </OptionButton>
          ))}
        </div>
        {resolution !== "720p" && (
          <p className="text-xs text-yellow-500 mt-1">
            {resolution.toUpperCase()} 해상도는 8초만 지원됩니다.
          </p>
        )}
      </div>

      {/* 화면비 */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">화면비</label>
        <div className="flex gap-2">
          {(["16:9", "9:16"] as AspectRatio[]).map((a) => (
            <OptionButton
              key={a}
              value={a}
              current={aspectRatio}
              onClick={setAspectRatio}
            >
              {a} {a === "16:9" ? "가로" : "세로"}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* 모델 */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">모델</label>
        <div className="flex gap-2">
          {(["standard", "fast"] as ModelType[]).map((m) => (
            <OptionButton
              key={m}
              value={m}
              current={modelType}
              onClick={setModelType}
            >
              {m === "standard" ? "Standard ⭐" : "Fast ⚡"}
            </OptionButton>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {modelType === "standard"
            ? "높은 품질, 생성 시간 더 김"
            : "빠른 생성, 비용 절감"}
        </p>
      </div>
    </div>
  );
}
