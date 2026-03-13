import type {
  CameraAngle,
  CameraMotion,
  Composition,
  FilmStyle,
  FocusEffect,
  Mood,
} from "@/types/video";

interface Preset<T extends string> {
  value: T;
  label: string;
  en: string;
}

export const CAMERA_ANGLES: Preset<CameraAngle>[] = [
  { value: "aerial", label: "공중 촬영", en: "aerial view" },
  { value: "eye-level", label: "눈높이", en: "eye-level shot" },
  { value: "high-angle", label: "하이 앵글", en: "high angle shot" },
  { value: "low-angle", label: "로우 앵글", en: "low angle shot" },
  { value: "pov", label: "시점 (POV)", en: "POV shot" },
  { value: "dutch-angle", label: "더치 앵글", en: "dutch angle" },
];

export const CAMERA_MOTIONS: Preset<CameraMotion>[] = [
  { value: "dolly", label: "돌리 샷", en: "dolly shot" },
  { value: "tracking", label: "추적 샷", en: "tracking shot" },
  { value: "zoom-in", label: "줌인", en: "zoom in" },
  { value: "zoom-out", label: "줌아웃", en: "zoom out" },
  { value: "pan", label: "패닝", en: "slow pan" },
  { value: "tilt", label: "틸트", en: "tilt shot" },
  { value: "static", label: "고정", en: "static shot" },
  { value: "handheld", label: "핸드헬드", en: "handheld camera" },
];

export const COMPOSITIONS: Preset<Composition>[] = [
  { value: "wide-shot", label: "와이드 샷", en: "wide shot" },
  { value: "medium-shot", label: "미디엄 샷", en: "medium shot" },
  { value: "close-up", label: "클로즈업", en: "close-up" },
  {
    value: "extreme-close-up",
    label: "익스트림 클로즈업",
    en: "extreme close-up",
  },
  { value: "two-shot", label: "투 샷", en: "two shot" },
  {
    value: "over-the-shoulder",
    label: "오버 더 숄더",
    en: "over-the-shoulder shot",
  },
];

export const FOCUS_EFFECTS: Preset<FocusEffect>[] = [
  { value: "shallow-focus", label: "얕은 피사계 심도", en: "shallow depth of field" },
  { value: "deep-focus", label: "깊은 피사계 심도", en: "deep focus" },
  { value: "soft-focus", label: "소프트 포커스", en: "soft focus" },
  { value: "macro-lens", label: "매크로 렌즈", en: "macro lens close-up" },
  { value: "wide-angle", label: "광각 렌즈", en: "wide-angle lens" },
  { value: "telephoto", label: "망원 렌즈", en: "telephoto lens" },
  { value: "tilt-shift", label: "틸트 시프트", en: "tilt-shift miniature effect" },
  { value: "anamorphic", label: "아나모픽", en: "anamorphic lens flare" },
];

export const FILM_STYLES: Preset<FilmStyle>[] = [
  { value: "cinematic", label: "시네마틱", en: "cinematic" },
  { value: "film-noir", label: "필름 누아르", en: "film noir" },
  { value: "sci-fi", label: "SF", en: "sci-fi" },
  { value: "horror", label: "공포", en: "horror movie style" },
  { value: "animation", label: "애니메이션", en: "animation style" },
  { value: "documentary", label: "다큐멘터리", en: "documentary style" },
  { value: "vintage", label: "빈티지", en: "vintage film" },
  { value: "surreal", label: "초현실주의", en: "surrealism" },
  { value: "paper-cutout", label: "종이 컷아웃", en: "paper cutout animation" },
  { value: "3d-cartoon", label: "3D 만화", en: "3D cartoon style" },
];

export const MOODS: Preset<Mood>[] = [
  { value: "warm", label: "따뜻한 색조", en: "warm tones" },
  { value: "cool-blue", label: "차가운 블루", en: "cool blue tones" },
  { value: "natural-light", label: "자연광", en: "natural lighting" },
  { value: "golden-hour", label: "골든 아워", en: "golden hour lighting" },
  { value: "night", label: "야간", en: "night scene" },
  { value: "neon", label: "네온", en: "neon lights" },
  { value: "dramatic", label: "드라마틱", en: "dramatic lighting" },
  { value: "bright", label: "밝고 경쾌", en: "bright and cheerful colors" },
];

/** 비용 테이블 (USD per second) */
export const COST_TABLE: Record<string, Record<string, number>> = {
  standard: { "720p": 0.4, "1080p": 0.4, "4k": 0.6 },
  fast: { "720p": 0.15, "1080p": 0.15, "4k": 0.35 },
};

/** 해상도별 허용 가능한 길이 */
export const DURATION_CONSTRAINTS: Record<string, string[]> = {
  "720p": ["4", "6", "8"],
  "1080p": ["8"],
  "4k": ["8"],
};
