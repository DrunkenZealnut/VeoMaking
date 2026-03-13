import type { PromptComponents } from "@/types/video";
import {
  CAMERA_ANGLES,
  CAMERA_MOTIONS,
  COMPOSITIONS,
  FOCUS_EFFECTS,
  FILM_STYLES,
  MOODS,
} from "./prompt-presets";

function findEn<T extends string>(
  presets: { value: T; en: string }[],
  value: T | undefined
): string | null {
  if (!value) return null;
  return presets.find((p) => p.value === value)?.en ?? null;
}

/**
 * PromptComponents를 하나의 영어 프롬프트 문자열로 조합.
 * Veo 3.1은 영어 프롬프트에서 최적 성능을 발휘.
 */
export function composePrompt(components: PromptComponents): string {
  const parts: string[] = [];

  // 1. 카메라 설정 (앞쪽 배치)
  const angle = findEn(CAMERA_ANGLES, components.cameraAngle);
  if (angle) parts.push(angle);

  const motion = findEn(CAMERA_MOTIONS, components.cameraMotion);
  if (motion) parts.push(motion);

  const comp = findEn(COMPOSITIONS, components.composition);
  if (comp) parts.push(comp);

  // 2. 포커스/렌즈 효과
  const focus = findEn(FOCUS_EFFECTS, components.focusEffect);
  if (focus) parts.push(focus);

  // 3. 메인 프롬프트 (핵심)
  if (components.mainPrompt.trim()) {
    parts.push(components.mainPrompt.trim());
  }

  // 4. 스타일 & 분위기
  const style = findEn(FILM_STYLES, components.filmStyle);
  if (style) parts.push(style);

  const mood = findEn(MOODS, components.mood);
  if (mood) parts.push(mood);

  // 5. 대화 (따옴표로 감싸기)
  if (components.dialogue?.trim()) {
    parts.push(`saying "${components.dialogue.trim()}"`);
  }

  // 6. 효과음
  if (components.soundEffects?.trim()) {
    parts.push(`Sound: ${components.soundEffects.trim()}`);
  }

  const result = parts.filter(Boolean).join(". ");
  return result ? result + "." : "";
}

/**
 * 사용자의 간단한 프롬프트를 Veo에 최적화된 설명적 프롬프트로 자동 보완.
 * - 주제/동작을 분석하여 더 구체적인 영상 용어 추가
 * - 선택된 프리셋 옵션들을 자연스럽게 통합
 */
export function enhancePrompt(components: PromptComponents): string {
  const main = components.mainPrompt.trim();
  if (!main) return "";

  const parts: string[] = [];

  // 카메라/구도를 자연스럽게 묶어서 배치
  const cameraParts: string[] = [];
  const angle = findEn(CAMERA_ANGLES, components.cameraAngle);
  const motion = findEn(CAMERA_MOTIONS, components.cameraMotion);
  const comp = findEn(COMPOSITIONS, components.composition);
  const focus = findEn(FOCUS_EFFECTS, components.focusEffect);

  if (comp) cameraParts.push(comp);
  if (angle) cameraParts.push(angle);
  if (focus) cameraParts.push(`with ${focus}`);
  if (motion) cameraParts.push(motion);

  if (cameraParts.length > 0) {
    parts.push(cameraParts.join(", "));
  }

  // 메인 프롬프트: 설명적 수식어 보강
  let enhanced = main;

  // 인물/초상화 관련 키워드 감지 → 포트레이트 보강
  const portraitKeywords = [
    "얼굴", "인물", "사람", "초상", "portrait", "face", "person",
    "여자", "남자", "아이", "노인",
  ];
  const hasPortrait = portraitKeywords.some((kw) =>
    main.toLowerCase().includes(kw)
  );
  if (hasPortrait && !main.toLowerCase().includes("portrait")) {
    enhanced = `cinematic portrait of ${enhanced}, detailed facial features, expressive eyes`;
  }

  // 풍경 관련 키워드 감지 → 풍경 보강
  const landscapeKeywords = [
    "풍경", "도시", "바다", "산", "숲", "자연", "하늘",
    "landscape", "city", "ocean", "mountain", "forest",
  ];
  const hasLandscape = landscapeKeywords.some((kw) =>
    main.toLowerCase().includes(kw)
  );
  if (hasLandscape && !hasPortrait) {
    enhanced = `${enhanced}, sweeping vista, rich details`;
  }

  // 동물 관련 키워드 감지 → 동물 보강
  const animalKeywords = [
    "강아지", "고양이", "동물", "새", "물고기",
    "dog", "cat", "animal", "bird", "fish",
  ];
  const hasAnimal = animalKeywords.some((kw) =>
    main.toLowerCase().includes(kw)
  );
  if (hasAnimal && !hasPortrait) {
    enhanced = `${enhanced}, natural behavior, vivid details`;
  }

  parts.push(enhanced);

  // 스타일 & 분위기
  const styleParts: string[] = [];
  const style = findEn(FILM_STYLES, components.filmStyle);
  const mood = findEn(MOODS, components.mood);
  if (style) styleParts.push(`${style} style`);
  if (mood) styleParts.push(mood);
  if (styleParts.length > 0) {
    parts.push(styleParts.join(", "));
  }

  // 대화
  if (components.dialogue?.trim()) {
    parts.push(`The subject says "${components.dialogue.trim()}"`);
  }

  // 효과음
  if (components.soundEffects?.trim()) {
    parts.push(`Ambient sound: ${components.soundEffects.trim()}`);
  }

  // 네거티브 프롬프트를 "without" 형태로 추가
  if (components.negativePrompt?.trim()) {
    parts.push(`Without: ${components.negativePrompt.trim()}`);
  }

  // 공통 품질 보강
  parts.push("high quality, professional cinematography, 4K resolution");

  return parts.join(". ") + ".";
}
