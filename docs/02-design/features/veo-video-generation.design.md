# Veo 3.1 동영상 생성 기능 Design Document

> **Summary**: Gemini API Veo 3.1 기반 동영상 생성 웹앱의 컴포넌트 설계, API 스펙, 프롬프트 UI 설계
>
> **Project**: VeoMaking
> **Author**: zealnutkim
> **Date**: 2026-03-13
> **Status**: Draft
> **Planning Doc**: [veo-video-generation.plan.md](../01-plan/features/veo-video-generation.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. 직관적인 프롬프트 작성 UI — Veo 3.1 프롬프트 가이드 기반 구조화된 입력 제공
2. 안전한 API Key 관리 — Next.js API Route를 통한 서버사이드 프록시
3. 원활한 비동기 UX — Long-Running Operation 폴링과 실시간 상태 피드백
4. 확장 가능한 구조 — 이미지-to-비디오, 비디오 확장 등 향후 기능 추가 용이

### 1.2 Design Principles

- **사용자 중심 프롬프트 UX**: 프롬프트 구성 요소(주제, 스타일, 카메라 등)를 가이드하는 UI 제공
- **서버-클라이언트 분리**: API Key와 SDK 호출은 서버에서만, 클라이언트는 순수 UI 역할
- **점진적 복잡성**: 기본 모드(텍스트만)와 고급 모드(세부 옵션) 분리

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ PromptBuilder│  │ VideoOptions │  │ GenerationStatus  │  │
│  │  - TextArea  │  │  - Resolution│  │  - Progress       │  │
│  │  - StylePick │  │  - Duration  │  │  - Timer          │  │
│  │  - CameraPick│  │  - Aspect    │  │  - Error          │  │
│  │  - AudioGuide│  │  - ModelType │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                    │              │
│  ┌──────▼─────────────────▼────────────────────▼──────────┐  │
│  │                   VideoPreview                          │  │
│  │  - Player  - Download  - Info                           │  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────┘
                             │ fetch
┌────────────────────────────▼─────────────────────────────────┐
│                    Next.js API Routes (Server)                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ POST         │  │ GET          │  │ GET               │  │
│  │ /api/generate│  │ /api/status/ │  │ /api/download/    │  │
│  │              │  │    [opId]    │  │    [fileUri]      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                    │              │
│  ┌──────▼─────────────────▼────────────────────▼──────────┐  │
│  │              veo-client.ts (@google/genai)              │  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼─────────────────────────────────┐
│              Google Gemini API (Veo 3.1)                      │
│  - generateVideos()                                          │
│  - operations.get()                                          │
│  - files.download()                                          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. 프롬프트 작성
   User → PromptBuilder (텍스트 + 스타일/카메라/오디오 조합)
       → VideoOptions (해상도/길이/화면비/모델)
       → "생성" 버튼 클릭

2. 생성 요청
   Client → POST /api/generate (prompt + config)
         → veo-client.ts → Gemini API generateVideos()
         → operationName 반환 → Client 저장

3. 상태 폴링
   Client → GET /api/status/[operationName] (10초 간격)
         → veo-client.ts → Gemini API operations.get()
         → { done: boolean, progress } 반환

4. 완료 & 다운로드
   done === true → Client에 videoUri 전달
                 → VideoPreview에서 재생
                 → GET /api/download/[encodedUri] → MP4 스트리밍
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| PromptBuilder | Zustand Store | 프롬프트 상태 관리 |
| VideoOptions | Zustand Store | 옵션 상태 관리 |
| GenerationStatus | Zustand Store | 생성 상태 추적 |
| VideoPreview | API Route (/download) | 영상 스트리밍 |
| API Routes | veo-client.ts | Gemini SDK 래핑 |
| veo-client.ts | @google/genai SDK | Veo 3.1 API 호출 |

---

## 3. Data Model

### 3.1 Type Definitions

```typescript
// === Domain Types (src/types/video.ts) ===

/** 해상도 옵션 */
type Resolution = "720p" | "1080p" | "4k";

/** 동영상 길이 (초) */
type Duration = "4" | "6" | "8";

/** 화면비 */
type AspectRatio = "16:9" | "9:16";

/** 모델 타입 */
type ModelType = "standard" | "fast";

/** 카메라 앵글 프리셋 */
type CameraAngle =
  | "aerial"        // 공중 촬영
  | "eye-level"     // 눈높이
  | "high-angle"    // 위에서 아래로
  | "low-angle"     // 로우 앵글
  | "pov"           // 시점 촬영
  | "dutch-angle";  // 기울어진 앵글

/** 카메라 움직임 프리셋 */
type CameraMotion =
  | "dolly"         // 돌리 샷
  | "tracking"      // 추적 샷
  | "zoom-in"       // 줌인
  | "zoom-out"      // 줌아웃
  | "pan"           // 패닝
  | "tilt"          // 틸트
  | "static"        // 고정
  | "handheld";     // 핸드헬드

/** 구도 프리셋 */
type Composition =
  | "wide-shot"           // 와이드 샷
  | "medium-shot"         // 미디엄 샷
  | "close-up"            // 클로즈업
  | "extreme-close-up"    // 익스트림 클로즈업
  | "two-shot"            // 투 샷
  | "over-the-shoulder";  // 오버 더 숄더

/** 영화 스타일 프리셋 */
type FilmStyle =
  | "cinematic"       // 시네마틱
  | "film-noir"       // 필름 누아르
  | "sci-fi"          // SF
  | "horror"          // 공포
  | "animation"       // 애니메이션
  | "documentary"     // 다큐멘터리
  | "vintage"         // 빈티지
  | "surreal"         // 초현실주의
  | "paper-cutout"    // 종이 컷아웃
  | "3d-cartoon";     // 3D 만화

/** 분위기/조명 프리셋 */
type Mood =
  | "warm"            // 따뜻한 색조
  | "cool-blue"       // 차가운 파란색
  | "natural-light"   // 자연광
  | "golden-hour"     // 골든 아워
  | "night"           // 야간
  | "neon"            // 네온
  | "dramatic"        // 드라마틱
  | "bright";         // 밝고 경쾌한

/** 프롬프트 구성 요소 */
interface PromptComponents {
  /** 메인 텍스트 프롬프트 (자유 입력) */
  mainPrompt: string;
  /** 카메라 앵글 (선택) */
  cameraAngle?: CameraAngle;
  /** 카메라 움직임 (선택) */
  cameraMotion?: CameraMotion;
  /** 구도 (선택) */
  composition?: Composition;
  /** 영화 스타일 (선택) */
  filmStyle?: FilmStyle;
  /** 분위기/조명 (선택) */
  mood?: Mood;
  /** 대화 텍스트 (선택) — 따옴표로 감싸서 전달 */
  dialogue?: string;
  /** 효과음 설명 (선택) */
  soundEffects?: string;
  /** 부정 프롬프트 (선택) — 제외할 요소 */
  negativePrompt?: string;
}

/** 동영상 생성 요청 */
interface VideoGenerateRequest {
  prompt: string;                // 조합된 최종 프롬프트
  resolution: Resolution;
  duration: Duration;
  aspectRatio: AspectRatio;
  modelType: ModelType;
  personGeneration?: "allow_all" | "allow_adult" | "dont_allow";
}

/** 생성 작업 상태 */
interface GenerationStatus {
  operationName: string;
  done: boolean;
  videoUri?: string;             // 완료 시 비디오 URI
  error?: string;                // 에러 발생 시
  startedAt: number;             // 요청 시작 시간 (ms)
}

/** 비용 계산 */
interface CostEstimate {
  duration: number;              // 초
  resolution: Resolution;
  modelType: ModelType;
  estimatedCost: number;         // USD
}
```

### 3.2 Zustand Store 구조

```typescript
// === Store (src/store/useVideoStore.ts) ===

interface VideoStore {
  // 프롬프트 구성
  promptComponents: PromptComponents;
  setPromptComponents: (components: Partial<PromptComponents>) => void;
  getComposedPrompt: () => string;    // 구성 요소를 하나의 문자열로 조합

  // 생성 옵션
  resolution: Resolution;
  duration: Duration;
  aspectRatio: AspectRatio;
  modelType: ModelType;
  setOption: (key: string, value: string) => void;

  // 생성 상태
  status: "idle" | "generating" | "polling" | "completed" | "error";
  generation: GenerationStatus | null;
  setGeneration: (gen: GenerationStatus | null) => void;

  // 결과
  videoUrl: string | null;       // 다운로드 가능한 프록시 URL
  setVideoUrl: (url: string | null) => void;

  // 비용
  getCostEstimate: () => CostEstimate;

  // 리셋
  reset: () => void;
}
```

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/generate` | 동영상 생성 요청 | Server-side API Key |
| GET | `/api/status/[operationName]` | 생성 상태 조회 | Server-side API Key |
| GET | `/api/download` | 생성된 영상 다운로드 | Server-side API Key |

### 4.2 Detailed Specification

#### `POST /api/generate`

동영상 생성을 시작하고 Operation ID를 반환합니다.

**Request:**
```json
{
  "prompt": "A cinematic shot of a majestic lion in the savannah at golden hour, dolly shot, wide shot",
  "resolution": "720p",
  "duration": "8",
  "aspectRatio": "16:9",
  "modelType": "standard",
  "personGeneration": "allow_all"
}
```

**Response (200 OK):**
```json
{
  "operationName": "operations/generate-video-xxxx-yyyy",
  "startedAt": 1710316800000
}
```

**Error Responses:**
- `400 Bad Request`: 프롬프트 누락 또는 잘못된 옵션
- `429 Too Many Requests`: API 요청 한도 초과
- `500 Internal Server Error`: Gemini API 호출 실패

**Server-side Logic:**
```typescript
// Pseudocode
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelId = modelType === "fast"
  ? "veo-3.1-fast-generate-preview"
  : "veo-3.1-generate-preview";

const operation = await client.models.generateVideos({
  model: modelId,
  prompt: body.prompt,
  config: {
    aspectRatio: body.aspectRatio,
    resolution: body.resolution,
    durationSeconds: body.duration,
    personGeneration: body.personGeneration,
  },
});

return { operationName: operation.name, startedAt: Date.now() };
```

---

#### `GET /api/status/[operationName]`

생성 작업의 현재 상태를 조회합니다.

**Response (200 OK — 진행 중):**
```json
{
  "done": false
}
```

**Response (200 OK — 완료):**
```json
{
  "done": true,
  "videoUri": "https://generativelanguage.googleapis.com/v1beta/files/xxx"
}
```

**Response (200 OK — 실패):**
```json
{
  "done": true,
  "error": "Video generation failed due to safety filter"
}
```

**Server-side Logic:**
```typescript
const operation = await client.operations.getVideosOperation({
  operation: { name: operationName },
});

if (operation.done) {
  const video = operation.response?.generatedVideos?.[0];
  if (video) {
    return { done: true, videoUri: video.video.uri };
  } else {
    return { done: true, error: "Generation failed" };
  }
}
return { done: false };
```

---

#### `GET /api/download?uri={encodedVideoUri}`

Gemini에서 생성된 영상을 프록시하여 클라이언트에 스트리밍합니다.

**Query Parameters:**
- `uri`: URL 인코딩된 Gemini 파일 URI

**Response:** MP4 바이너리 스트림 (`Content-Type: video/mp4`)

**Server-side Logic:**
```typescript
const file = { uri: decodeURIComponent(uri) };
const response = await client.files.download({ file });
// Stream response to client with proper headers
```

---

## 5. UI/UX Design

### 5.1 메인 화면 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  🎬 VeoMaking                              [비용: ~$3.20]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─── 프롬프트 빌더 ────────────────────────────────────┐   │
│  │                                                       │   │
│  │  [메인 프롬프트 텍스트 입력]                           │   │
│  │  "도시 야경 위를 나는 드론 영상, 네온 불빛이 반사..."  │   │
│  │                                                       │   │
│  │  ── 프롬프트 도우미 (접기/펼치기) ──────────────────   │   │
│  │  │                                                 │  │   │
│  │  │ 🎥 카메라    [aerial ▼] [dolly ▼] [wide-shot ▼] │  │   │
│  │  │ 🎬 스타일    [cinematic ▼]   🎨 분위기 [neon ▼]  │  │   │
│  │  │ 💬 대화      [대화 텍스트 입력...]               │  │   │
│  │  │ 🔊 효과음    [효과음 설명 입력...]               │  │   │
│  │  │ ⛔ 제외 요소  [제외할 요소 입력...]               │  │   │
│  │  │                                                 │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  [최종 프롬프트 미리보기]                              │   │
│  │  "Aerial dolly shot, wide-shot composition. A drone   │   │
│  │   flying over city nightscape with neon lights..."    │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─── 생성 옵션 ────────────────────────────────────────┐   │
│  │ 해상도: (720p) (1080p) (4K)                           │   │
│  │ 길이:   (4초)  (6초)   (8초)                          │   │
│  │ 화면비: (16:9) (9:16)                                 │   │
│  │ 모델:   (Standard ⭐) (Fast ⚡)                       │   │
│  │                                                       │   │
│  │ ⚠️ 1080p/4K는 8초만 가능합니다                         │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  [          🎬 동영상 생성하기 ($3.20)          ]            │
│                                                             │
│  ┌─── 생성 상태 / 결과 ─────────────────────────────────┐   │
│  │                                                       │   │
│  │  ⏳ 생성 중... (경과: 45초)                            │   │
│  │  ████████░░░░░░░░░░░░  예상 소요: 1~6분               │   │
│  │                                                       │   │
│  │  ── 또는 완료 시 ──                                   │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────┐              │   │
│  │  │                                     │              │   │
│  │  │          ▶ 비디오 플레이어            │              │   │
│  │  │                                     │              │   │
│  │  └─────────────────────────────────────┘              │   │
│  │                                                       │   │
│  │  [📥 MP4 다운로드]  [🔄 다시 생성]                     │   │
│  │  ⚠️ 생성된 영상은 2일 후 서버에서 삭제됩니다             │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SynthID 워터마크 포함 | Powered by Google Veo 3.1           │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 User Flow

```
메인 페이지 진입
    │
    ├─→ 1. 메인 프롬프트 텍스트 입력
    │
    ├─→ 2. (선택) 프롬프트 도우미 펼치기
    │       ├─ 카메라 앵글/움직임/구도 선택
    │       ├─ 스타일/분위기 선택
    │       ├─ 대화 텍스트 입력
    │       ├─ 효과음 설명 입력
    │       └─ 제외 요소 입력
    │
    ├─→ 3. 최종 프롬프트 미리보기 확인
    │
    ├─→ 4. 생성 옵션 설정 (해상도/길이/화면비/모델)
    │       └─ 비용 예측 자동 업데이트
    │
    ├─→ 5. "생성하기" 클릭
    │       ├─ 생성 중 상태 표시 (타이머 + 프로그레스)
    │       └─ 10초 간격 폴링
    │
    ├─→ 6. 완료 시 비디오 미리보기 자동 표시
    │
    └─→ 7. 다운로드 또는 다시 생성
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `PromptBuilder` | `src/components/PromptBuilder.tsx` | 메인 프롬프트 텍스트 입력 + 프롬프트 도우미 UI |
| `PromptHelper` | `src/components/PromptHelper.tsx` | 카메라/스타일/분위기/대화/효과음 선택 서브 패널 |
| `PromptPreview` | `src/components/PromptPreview.tsx` | 조합된 최종 프롬프트 미리보기 |
| `VideoOptions` | `src/components/VideoOptions.tsx` | 해상도/길이/화면비/모델 선택 |
| `CostDisplay` | `src/components/CostDisplay.tsx` | 예상 비용 표시 |
| `GenerateButton` | `src/components/GenerateButton.tsx` | 생성 버튼 + 비용 표시 |
| `GenerationStatus` | `src/components/GenerationStatus.tsx` | 생성 진행 상태 (타이머, 프로그레스 바) |
| `VideoPreview` | `src/components/VideoPreview.tsx` | 비디오 플레이어 + 다운로드 버튼 |

### 5.4 프롬프트 도우미 — 프리셋 데이터

Veo 3.1 공식 프롬프트 가이드 기반:

```typescript
// src/lib/prompt-presets.ts

export const CAMERA_ANGLES = [
  { value: "aerial", label: "공중 촬영", en: "aerial view" },
  { value: "eye-level", label: "눈높이", en: "eye-level shot" },
  { value: "high-angle", label: "하이 앵글", en: "high angle shot" },
  { value: "low-angle", label: "로우 앵글", en: "low angle shot" },
  { value: "pov", label: "시점 (POV)", en: "POV shot" },
  { value: "dutch-angle", label: "더치 앵글", en: "dutch angle" },
] as const;

export const CAMERA_MOTIONS = [
  { value: "dolly", label: "돌리 샷", en: "dolly shot" },
  { value: "tracking", label: "추적 샷", en: "tracking shot" },
  { value: "zoom-in", label: "줌인", en: "zoom in" },
  { value: "zoom-out", label: "줌아웃", en: "zoom out" },
  { value: "pan", label: "패닝", en: "slow pan" },
  { value: "tilt", label: "틸트", en: "tilt shot" },
  { value: "static", label: "고정", en: "static shot" },
  { value: "handheld", label: "핸드헬드", en: "handheld camera" },
] as const;

export const COMPOSITIONS = [
  { value: "wide-shot", label: "와이드 샷", en: "wide shot" },
  { value: "medium-shot", label: "미디엄 샷", en: "medium shot" },
  { value: "close-up", label: "클로즈업", en: "close-up" },
  { value: "extreme-close-up", label: "익스트림 클로즈업", en: "extreme close-up" },
  { value: "two-shot", label: "투 샷", en: "two shot" },
  { value: "over-the-shoulder", label: "오버 더 숄더", en: "over-the-shoulder shot" },
] as const;

export const FILM_STYLES = [
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
] as const;

export const MOODS = [
  { value: "warm", label: "따뜻한 색조", en: "warm tones" },
  { value: "cool-blue", label: "차가운 블루", en: "cool blue tones" },
  { value: "natural-light", label: "자연광", en: "natural lighting" },
  { value: "golden-hour", label: "골든 아워", en: "golden hour lighting" },
  { value: "night", label: "야간", en: "night scene" },
  { value: "neon", label: "네온", en: "neon lights" },
  { value: "dramatic", label: "드라마틱", en: "dramatic lighting" },
  { value: "bright", label: "밝고 경쾌", en: "bright and cheerful colors" },
] as const;

/** 비용 테이블 (USD per second) */
export const COST_TABLE = {
  standard: { "720p": 0.40, "1080p": 0.40, "4k": 0.60 },
  fast:     { "720p": 0.15, "1080p": 0.15, "4k": 0.35 },
} as const;
```

### 5.5 프롬프트 조합 로직

```typescript
// src/lib/compose-prompt.ts

/**
 * PromptComponents를 하나의 영어 프롬프트 문자열로 조합
 * Veo 3.1은 영어 프롬프트에서 최적 성능을 보임
 */
export function composePrompt(components: PromptComponents): string {
  const parts: string[] = [];

  // 1. 카메라 설정 (앞쪽에 배치)
  if (components.cameraAngle) {
    parts.push(findPresetEn(CAMERA_ANGLES, components.cameraAngle));
  }
  if (components.cameraMotion) {
    parts.push(findPresetEn(CAMERA_MOTIONS, components.cameraMotion));
  }
  if (components.composition) {
    parts.push(findPresetEn(COMPOSITIONS, components.composition));
  }

  // 2. 메인 프롬프트 (핵심)
  parts.push(components.mainPrompt);

  // 3. 스타일 & 분위기
  if (components.filmStyle) {
    parts.push(findPresetEn(FILM_STYLES, components.filmStyle));
  }
  if (components.mood) {
    parts.push(findPresetEn(MOODS, components.mood));
  }

  // 4. 대화 (따옴표로 감싸기)
  if (components.dialogue) {
    parts.push(`saying "${components.dialogue}"`);
  }

  // 5. 효과음
  if (components.soundEffects) {
    parts.push(`Sound: ${components.soundEffects}`);
  }

  return parts.filter(Boolean).join(". ") + ".";
}
```

### 5.6 옵션 제약 조건 UI 로직

```typescript
// 해상도-길이 연동 제약
const DURATION_CONSTRAINTS: Record<Resolution, Duration[]> = {
  "720p":  ["4", "6", "8"],    // 모든 길이 가능
  "1080p": ["8"],               // 8초만 가능
  "4k":    ["8"],               // 8초만 가능
};

// 해상도 변경 시 길이 자동 조정
function onResolutionChange(resolution: Resolution) {
  const allowed = DURATION_CONSTRAINTS[resolution];
  if (!allowed.includes(currentDuration)) {
    setDuration("8"); // 기본값으로 리셋
  }
}
```

---

## 6. Error Handling

### 6.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| 400 | 프롬프트를 입력해주세요 | 빈 프롬프트 | 입력 필드 포커스 + 안내 |
| 400 | 잘못된 옵션입니다 | 유효하지 않은 옵션 조합 | 옵션 UI 하이라이트 |
| 429 | 요청이 너무 많습니다 | API 속도 제한 | 재시도 타이머 표시 |
| 500 | 동영상 생성에 실패했습니다 | Gemini API 에러 | 에러 상세 + 재시도 버튼 |
| SAFETY | 안전 정책에 의해 차단되었습니다 | 안전 필터 | 프롬프트 수정 가이드 표시 |
| TIMEOUT | 생성 시간이 초과되었습니다 | 6분 초과 | 재시도 버튼 |

### 6.2 Error Response Format

```json
{
  "error": {
    "code": "GENERATION_FAILED",
    "message": "동영상 생성에 실패했습니다. 프롬프트를 수정하여 다시 시도해주세요.",
    "details": {
      "reason": "safety_filter",
      "suggestion": "부적절한 콘텐츠가 감지되었습니다."
    }
  }
}
```

---

## 7. Security Considerations

- [x] **API Key 서버 전용**: `GEMINI_API_KEY`는 환경변수로만 관리, 클라이언트에 절대 노출 금지
- [x] **API Route 프록시**: 모든 Gemini API 호출은 Next.js API Route를 통해서만 수행
- [x] **입력 검증**: 프롬프트 길이 제한 (1,024 토큰), 옵션 값 화이트리스트 검증
- [x] **Rate Limiting**: 동일 클라이언트 과도한 요청 방지 (향후 미들웨어 추가)
- [ ] HTTPS 강제 (배포 시)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| 수동 테스트 | 전체 생성 플로우 | 브라우저 |
| 수동 테스트 | 옵션 제약 조건 동작 | 브라우저 |
| 수동 테스트 | 에러 핸들링 시나리오 | 브라우저 DevTools |

### 8.2 Test Cases (Key)

- [ ] Happy path: 프롬프트 입력 → 옵션 선택 → 생성 → 미리보기 → 다운로드
- [ ] 프롬프트 도우미로 구성 → 최종 프롬프트 미리보기 정확성 확인
- [ ] 1080p 선택 시 길이가 자동으로 8초로 제한
- [ ] 빈 프롬프트 제출 시 에러 메시지 표시
- [ ] API 에러 시 사용자 친화적 에러 메시지 표시
- [ ] 생성 중 페이지 이탈 경고
- [ ] Fast 모델 vs Standard 모델 전환 시 비용 업데이트

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI 컴포넌트, 페이지 | `src/app/`, `src/components/` |
| **Application** | 프롬프트 조합, 비용 계산 로직 | `src/lib/compose-prompt.ts`, `src/lib/cost.ts` |
| **Domain** | 타입 정의, 프리셋 데이터 | `src/types/`, `src/lib/prompt-presets.ts` |
| **Infrastructure** | Veo API 클라이언트, API Routes | `src/lib/veo-client.ts`, `src/app/api/` |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| PromptBuilder, VideoOptions, VideoPreview | Presentation | `src/components/` |
| composePrompt(), getCostEstimate() | Application | `src/lib/` |
| PromptComponents, Resolution, etc. | Domain | `src/types/video.ts` |
| veo-client.ts, API Routes | Infrastructure | `src/lib/`, `src/app/api/` |

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (`PromptBuilder.tsx`) |
| File organization | `src/components/`, `src/lib/`, `src/types/`, `src/store/` |
| State management | Zustand store (`useVideoStore`) |
| Error handling | API Route에서 try-catch, 표준 에러 JSON 응답 |
| Prompt presets | `src/lib/prompt-presets.ts`에 const로 정의 |
| API Key | `GEMINI_API_KEY` 환경변수, 서버 전용 |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   ├── page.tsx                         # 메인 페이지
│   ├── layout.tsx                       # 루트 레이아웃
│   ├── globals.css                      # 글로벌 스타일
│   └── api/
│       ├── generate/route.ts            # POST — 동영상 생성
│       ├── status/[operationName]/route.ts  # GET — 상태 조회
│       └── download/route.ts            # GET — 영상 다운로드
├── components/
│   ├── PromptBuilder.tsx                # 프롬프트 입력 + 도우미
│   ├── PromptHelper.tsx                 # 카메라/스타일/분위기 선택
│   ├── PromptPreview.tsx                # 최종 프롬프트 미리보기
│   ├── VideoOptions.tsx                 # 해상도/길이/화면비/모델
│   ├── CostDisplay.tsx                  # 비용 표시
│   ├── GenerateButton.tsx               # 생성 버튼
│   ├── GenerationStatus.tsx             # 생성 상태 표시
│   └── VideoPreview.tsx                 # 비디오 플레이어 + 다운로드
├── lib/
│   ├── veo-client.ts                    # Gemini SDK 래핑 클라이언트
│   ├── prompt-presets.ts                # 프롬프트 프리셋 데이터
│   ├── compose-prompt.ts               # 프롬프트 조합 로직
│   └── cost.ts                          # 비용 계산 유틸리티
├── store/
│   └── useVideoStore.ts                 # Zustand 상태 관리
└── types/
    └── video.ts                         # 타입 정의
```

### 11.2 Implementation Order

1. [ ] **프로젝트 초기화**: Next.js + Tailwind + Zustand + @google/genai 설치
2. [ ] **타입 & 프리셋**: `src/types/video.ts`, `src/lib/prompt-presets.ts`
3. [ ] **Veo 클라이언트**: `src/lib/veo-client.ts` (Gemini SDK 래핑)
4. [ ] **API Routes**: generate, status, download 엔드포인트
5. [ ] **프롬프트 조합**: `src/lib/compose-prompt.ts`
6. [ ] **Zustand Store**: `src/store/useVideoStore.ts`
7. [ ] **UI 컴포넌트**: PromptBuilder → VideoOptions → GenerationStatus → VideoPreview
8. [ ] **메인 페이지 조립**: `src/app/page.tsx`
9. [ ] **비용 표시**: CostDisplay, GenerateButton에 비용 연동
10. [ ] **에러 핸들링 & 엣지 케이스**: 안전 필터, 타임아웃, 옵션 제약

### 11.3 Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@google/genai": "latest",
    "zustand": "^5"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "typescript": "^5",
    "@types/node": "^22",
    "@types/react": "^19"
  }
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | zealnutkim |
