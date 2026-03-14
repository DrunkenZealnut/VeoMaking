"use client";

import { useVideoStore } from "@/store/useVideoStore";

interface ActionPreset {
  label: string;
  prompt: string;
}

interface ActionCategory {
  title: string;
  icon: string;
  presets: ActionPreset[];
}

const ACTION_CATEGORIES: ActionCategory[] = [
  {
    title: "피사체 동작",
    icon: "🏃",
    presets: [
      {
        label: "살짝 움직이기",
        prompt:
          "The subject gently moves, with subtle natural motion and lifelike breathing",
      },
      {
        label: "걸어가기",
        prompt:
          "The subject starts walking forward naturally, with realistic body movement",
      },
      {
        label: "돌아보기",
        prompt:
          "The subject slowly turns around to face the camera with a natural expression",
      },
      {
        label: "미소 짓기",
        prompt:
          "The subject gradually breaks into a warm, genuine smile",
      },
    ],
  },
  {
    title: "카메라 움직임",
    icon: "🎥",
    presets: [
      {
        label: "천천히 줌인",
        prompt:
          "Slow cinematic zoom in, gradually revealing fine details of the subject",
      },
      {
        label: "줌아웃 & 공개",
        prompt:
          "Camera slowly zooms out to reveal the full environment surrounding the subject",
      },
      {
        label: "360도 회전",
        prompt:
          "Camera orbits around the subject in a smooth 360-degree rotation",
      },
      {
        label: "드론 상승",
        prompt:
          "Aerial drone shot rising upward, gradually revealing the landscape below",
      },
    ],
  },
  {
    title: "분위기 변화",
    icon: "🌅",
    presets: [
      {
        label: "낮에서 밤으로",
        prompt:
          "Time-lapse transition from bright daylight to starry night sky, with changing ambient lighting",
      },
      {
        label: "봄이 오다",
        prompt:
          "Flowers bloom and green leaves unfurl as spring arrives, with warm sunlight",
      },
      {
        label: "비가 내리기 시작",
        prompt:
          "Rain begins to fall gently, creating ripples and reflections on surfaces",
      },
      {
        label: "바람이 불다",
        prompt:
          "A gentle breeze picks up, swaying hair and clothes with natural wind motion",
      },
    ],
  },
  {
    title: "특수 효과",
    icon: "✨",
    presets: [
      {
        label: "파티클 효과",
        prompt:
          "Magical glowing particles float and swirl around the subject, sparkling with light",
      },
      {
        label: "슬로우 모션",
        prompt:
          "Ultra slow motion capture, every detail visible in dramatic slow-mo",
      },
      {
        label: "연기 & 안개",
        prompt:
          "Atmospheric fog and mist slowly roll in, creating a mysterious mood",
      },
      {
        label: "물 위 반사",
        prompt:
          "Reflective water surface beneath the subject, with gentle rippling reflections",
      },
    ],
  },
];

export default function ActionSuggestions() {
  const { referenceImages, promptComponents, setPromptField } =
    useVideoStore();

  if (referenceImages.length === 0) return null;

  const handleSelect = (prompt: string) => {
    const current = promptComponents.mainPrompt.trim();
    if (current) {
      // 기존 프롬프트가 있으면 뒤에 추가
      setPromptField("mainPrompt", `${current}. ${prompt}`);
    } else {
      setPromptField("mainPrompt", prompt);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-300">
        이미지를 어떻게 움직일까요?
      </p>
      <div className="space-y-2">
        {ACTION_CATEGORIES.map((category) => (
          <div key={category.title}>
            <p className="text-xs text-gray-500 mb-1.5">
              {category.icon} {category.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {category.presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelect(preset.prompt)}
                  className="px-2.5 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-blue-500 hover:text-blue-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
