"use client";

import { useVideoStore } from "@/store/useVideoStore";
import { composePrompt, enhancePrompt } from "@/lib/compose-prompt";
import PromptHelper from "./PromptHelper";

const PROMPT_TIPS = [
  { icon: "🎯", text: "주제: 사물, 인물, 동물, 풍경 등 핵심 피사체를 구체적으로" },
  { icon: "🏃", text: "동작: 걷기, 달리기, 날기 등 피사체의 행동을 명시" },
  { icon: "🎨", text: "스타일: 시네마틱, SF, 다큐멘터리 등 크리에이티브 방향" },
  { icon: "💡", text: "팁: 형용사와 부사로 구체적 묘사 (golden, slowly, gently)" },
];

export default function PromptBuilder() {
  const {
    promptComponents,
    setPromptField,
    getComposedPrompt,
    helperOpen,
    setHelperOpen,
    useEnhanced,
    setUseEnhanced,
  } = useVideoStore();

  const composedPrompt = composePrompt(promptComponents);
  const enhancedPromptText = enhancePrompt(promptComponents);
  const activePrompt = useEnhanced ? enhancedPromptText : composedPrompt;
  const charCount = activePrompt.length;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            프롬프트
          </label>
          <span
            className={`text-xs ${charCount > 4096 ? "text-red-400" : charCount > 3500 ? "text-amber-400" : "text-gray-500"}`}
          >
            {charCount > 0 ? `${charCount}/4096` : ""}
          </span>
        </div>
        <textarea
          value={promptComponents.mainPrompt}
          onChange={(e) => setPromptField("mainPrompt", e.target.value)}
          placeholder={
            "영어 프롬프트 권장 — 주제 + 동작 + 스타일을 포함하세요\n" +
            "예: A golden retriever puppy running through a sunlit meadow, chasing butterflies, cinematic slow motion\n" +
            "예: Aerial drone shot of a neon-lit cyberpunk city at night, flying between skyscrapers, rain falling"
          }
          rows={4}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none placeholder:text-gray-500 placeholder:text-sm"
        />
      </div>

      {/* 프롬프트 작성 가이드 */}
      {!promptComponents.mainPrompt.trim() && (
        <div className="grid grid-cols-2 gap-2">
          {PROMPT_TIPS.map((tip) => (
            <div
              key={tip.icon}
              className="flex items-start gap-1.5 text-xs text-gray-500 bg-gray-800/30 rounded px-2 py-1.5"
            >
              <span>{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* 도우미 & 자동 보완 토글 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setHelperOpen(!helperOpen)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span
            className={`transform transition-transform ${helperOpen ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          프롬프트 도우미 (카메라, 렌즈, 스타일, 오디오)
        </button>

        {promptComponents.mainPrompt.trim() && (
          <button
            type="button"
            onClick={() => setUseEnhanced(!useEnhanced)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              useEnhanced
                ? "bg-purple-600/20 border-purple-500 text-purple-300"
                : "bg-gray-700/50 border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-300"
            }`}
          >
            {useEnhanced ? "✨ 자동 보완 ON" : "✨ 자동 보완"}
          </button>
        )}
      </div>

      {helperOpen && <PromptHelper />}

      {/* 최종 프롬프트 미리보기 */}
      {activePrompt && (
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">
              {useEnhanced ? "✨ 자동 보완된 프롬프트" : "최종 프롬프트 미리보기"}
            </p>
            {useEnhanced && composedPrompt && (
              <button
                type="button"
                onClick={() => setUseEnhanced(false)}
                className="text-[10px] text-gray-500 hover:text-gray-400"
              >
                원본 보기
              </button>
            )}
          </div>
          <p className="text-sm text-gray-300 font-mono break-words">
            {activePrompt}
          </p>
        </div>
      )}
    </div>
  );
}
