"use client";

import { useState, useRef, useEffect } from "react";
import { useVideoStore } from "@/store/useVideoStore";
import {
  CAMERA_ANGLES,
  CAMERA_MOTIONS,
  COMPOSITIONS,
  FOCUS_EFFECTS,
  FILM_STYLES,
  MOODS,
} from "@/lib/prompt-presets";

function PresetSelect<T extends string>({
  label,
  icon,
  presets,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  presets: { value: T; label: string; desc: string }[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = value
    ? presets.find((p) => p.value === value)?.label ?? "선택 안 함"
    : "선택 안 함";

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setHoveredDesc(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      <span className="text-sm w-6 text-center">{icon}</span>
      <label className="text-sm text-gray-400 w-20 shrink-0">{label}</label>

      <div className="relative flex-1">
        {/* 트리거 버튼 */}
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            setHoveredDesc(null);
          }}
          className={`w-full text-left bg-gray-700 text-sm rounded px-2 py-1.5 border focus:outline-none flex items-center justify-between ${
            open
              ? "border-blue-500 text-white"
              : value
                ? "border-gray-600 text-white"
                : "border-gray-600 text-gray-400"
          }`}
        >
          <span className="truncate">{selectedLabel}</span>
          <span
            className={`text-[10px] text-gray-500 ml-1 transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        {/* 드롭다운 메뉴 */}
        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
            {/* 선택 안 함 */}
            <button
              type="button"
              onMouseEnter={() => setHoveredDesc(null)}
              onClick={() => {
                onChange(undefined);
                setOpen(false);
                setHoveredDesc(null);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors ${
                !value ? "text-blue-400" : "text-gray-400"
              }`}
            >
              선택 안 함
            </button>

            {presets.map((p) => (
              <button
                key={p.value}
                type="button"
                onMouseEnter={() => setHoveredDesc(p.desc)}
                onMouseLeave={() => setHoveredDesc(null)}
                onClick={() => {
                  onChange(p.value);
                  setOpen(false);
                  setHoveredDesc(null);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors ${
                  p.value === value ? "text-blue-400 bg-gray-600/50" : "text-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}

            {/* 호버 시 말풍선 */}
            {hoveredDesc && (
              <div className="border-t border-gray-600 px-3 py-2 bg-gray-800">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {hoveredDesc}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromptHelper() {
  const { promptComponents, setPromptField } = useVideoStore();

  return (
    <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      {/* 카메라 설정 */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">
          카메라 위치 & 모션
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PresetSelect
            label="앵글"
            icon="📐"
            presets={CAMERA_ANGLES}
            value={promptComponents.cameraAngle}
            onChange={(v) => setPromptField("cameraAngle", v)}
          />
          <PresetSelect
            label="움직임"
            icon="🎥"
            presets={CAMERA_MOTIONS}
            value={promptComponents.cameraMotion}
            onChange={(v) => setPromptField("cameraMotion", v)}
          />
        </div>
      </div>

      {/* 구도 & 렌즈 */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">
          구도 & 포커스/렌즈
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PresetSelect
            label="구도"
            icon="🖼"
            presets={COMPOSITIONS}
            value={promptComponents.composition}
            onChange={(v) => setPromptField("composition", v)}
          />
          <PresetSelect
            label="렌즈"
            icon="🔍"
            presets={FOCUS_EFFECTS}
            value={promptComponents.focusEffect}
            onChange={(v) => setPromptField("focusEffect", v)}
          />
        </div>
      </div>

      {/* 스타일 & 분위기 */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">
          스타일 & 분위기
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PresetSelect
            label="스타일"
            icon="🎬"
            presets={FILM_STYLES}
            value={promptComponents.filmStyle}
            onChange={(v) => setPromptField("filmStyle", v)}
          />
          <PresetSelect
            label="분위기"
            icon="🎨"
            presets={MOODS}
            value={promptComponents.mood}
            onChange={(v) => setPromptField("mood", v)}
          />
        </div>
      </div>

      {/* 오디오 & 네거티브 */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">
          오디오 & 제외 요소
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-sm w-6 text-center mt-1.5">💬</span>
            <div className="flex-1">
              <label className="text-sm text-gray-400">대화 / 나레이션</label>
              <input
                type="text"
                placeholder='영어 권장 — 예: "This is the secret code" he whispers'
                value={promptComponents.dialogue ?? ""}
                onChange={(e) =>
                  setPromptField("dialogue", e.target.value || undefined)
                }
                className="w-full mt-1 bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-sm w-6 text-center mt-1.5">🔊</span>
            <div className="flex-1">
              <label className="text-sm text-gray-400">효과음 / 배경음</label>
              <input
                type="text"
                placeholder="예: ocean waves crashing, wind howling, engine roar"
                value={promptComponents.soundEffects ?? ""}
                onChange={(e) =>
                  setPromptField("soundEffects", e.target.value || undefined)
                }
                className="w-full mt-1 bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-sm w-6 text-center mt-1.5">⛔</span>
            <div className="flex-1">
              <label className="text-sm text-gray-400">
                제외 요소 (네거티브)
              </label>
              <input
                type="text"
                placeholder="예: blurry, distorted, text, watermark"
                value={promptComponents.negativePrompt ?? ""}
                onChange={(e) =>
                  setPromptField("negativePrompt", e.target.value || undefined)
                }
                className="w-full mt-1 bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
