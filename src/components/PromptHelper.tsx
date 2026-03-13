"use client";

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
  presets: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-6 text-center">{icon}</span>
      <label className="text-sm text-gray-400 w-20 shrink-0">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? (e.target.value as T) : undefined)
        }
        className="flex-1 bg-gray-700 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none"
      >
        <option value="">선택 안 함</option>
        {presets.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
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
