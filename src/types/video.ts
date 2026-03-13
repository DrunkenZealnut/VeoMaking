/** 해상도 옵션 */
export type Resolution = "720p" | "1080p" | "4k";

/** 동영상 길이 (초) */
export type Duration = "4" | "6" | "8";

/** 화면비 */
export type AspectRatio = "16:9" | "9:16";

/** 모델 타입 */
export type ModelType = "standard" | "fast";

/** 카메라 앵글 프리셋 */
export type CameraAngle =
  | "aerial"
  | "eye-level"
  | "high-angle"
  | "low-angle"
  | "pov"
  | "dutch-angle";

/** 카메라 움직임 프리셋 */
export type CameraMotion =
  | "dolly"
  | "tracking"
  | "zoom-in"
  | "zoom-out"
  | "pan"
  | "tilt"
  | "static"
  | "handheld";

/** 구도 프리셋 */
export type Composition =
  | "wide-shot"
  | "medium-shot"
  | "close-up"
  | "extreme-close-up"
  | "two-shot"
  | "over-the-shoulder";

/** 영화 스타일 프리셋 */
export type FilmStyle =
  | "cinematic"
  | "film-noir"
  | "sci-fi"
  | "horror"
  | "animation"
  | "documentary"
  | "vintage"
  | "surreal"
  | "paper-cutout"
  | "3d-cartoon";

/** 포커스/렌즈 효과 프리셋 */
export type FocusEffect =
  | "shallow-focus"
  | "deep-focus"
  | "soft-focus"
  | "macro-lens"
  | "wide-angle"
  | "telephoto"
  | "tilt-shift"
  | "anamorphic";

/** 분위기/조명 프리셋 */
export type Mood =
  | "warm"
  | "cool-blue"
  | "natural-light"
  | "golden-hour"
  | "night"
  | "neon"
  | "dramatic"
  | "bright";

/** 프롬프트 구성 요소 */
export interface PromptComponents {
  mainPrompt: string;
  cameraAngle?: CameraAngle;
  cameraMotion?: CameraMotion;
  composition?: Composition;
  focusEffect?: FocusEffect;
  filmStyle?: FilmStyle;
  mood?: Mood;
  dialogue?: string;
  soundEffects?: string;
  negativePrompt?: string;
}

/** 동영상 생성 요청 */
export interface VideoGenerateRequest {
  prompt: string;
  resolution: Resolution;
  duration: Duration;
  aspectRatio: AspectRatio;
  modelType: ModelType;
  personGeneration?: "allow_all" | "allow_adult" | "dont_allow";
}

/** 생성 작업 상태 */
export interface GenerationStatus {
  operationName: string;
  done: boolean;
  videoUri?: string;
  error?: string;
  startedAt: number;
}

/** 비용 계산 */
export interface CostEstimate {
  duration: number;
  resolution: Resolution;
  modelType: ModelType;
  estimatedCost: number;
}

/** 참조 이미지 데이터 (Image-to-Video) */
export interface ReferenceImage {
  base64: string;
  mimeType: string;
  name: string;
  previewUrl: string;
}

/** API 에러 응답 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
