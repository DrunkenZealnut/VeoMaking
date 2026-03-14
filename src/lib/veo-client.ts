import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES_PER_KEY = 2;
const BASE_DELAY_MS = 2000;

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class RateLimitError extends Error {
  retryAfterMs: number;
  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

// ─── API Key Manager ───────────────────────────────────

function getApiKeys(): string[] {
  // GEMINI_API_KEYS (쉼표 구분) 우선, 없으면 GEMINI_API_KEY 단일 키
  const multiKeys = process.env.GEMINI_API_KEYS;
  if (multiKeys) {
    const keys = multiKeys
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k && k !== "your-api-key-here");
    if (keys.length > 0) return keys;
  }

  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey && singleKey !== "your-api-key-here") {
    return [singleKey];
  }

  throw new Error(
    "GEMINI_API_KEYS 또는 GEMINI_API_KEY 환경변수가 설정되지 않았습니다."
  );
}

function getApiKey(index?: number): string {
  const keys = getApiKeys();
  const i = index ?? 0;
  if (i < 0 || i >= keys.length) {
    return keys[0];
  }
  return keys[i];
}

function getClient(keyIndex?: number): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey(keyIndex) });
}

// ─── Error Detection ───────────────────────────────────

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("429") ||
      msg.includes("resource_exhausted") ||
      msg.includes("rate limit") ||
      msg.includes("quota")
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Video Generation ──────────────────────────────────

export interface GenerateVideoParams {
  prompt: string;
  resolution: string;
  duration: string;
  aspectRatio: string;
  modelType: "standard" | "fast";
  personGeneration?: string;
  image?: {
    imageBytes: string;
    mimeType: string;
  };
}

export async function generateVideo(
  params: GenerateVideoParams
): Promise<{ operationName: string; keyIndex: number }> {
  const keys = getApiKeys();
  const totalKeys = keys.length;

  const modelId =
    params.modelType === "fast"
      ? "veo-3.1-fast-generate-preview"
      : "veo-3.1-generate-preview";

  // 모든 키를 순회하며 시도
  for (let keyIdx = 0; keyIdx < totalKeys; keyIdx++) {
    const client = new GoogleGenAI({ apiKey: keys[keyIdx] });

    const requestBody: Parameters<typeof client.models.generateVideos>[0] = {
      model: modelId,
      prompt: params.prompt,
      config: {
        aspectRatio: params.aspectRatio,
        resolution: params.resolution,
        durationSeconds: parseInt(params.duration),
        ...(params.personGeneration
          ? {
              personGeneration: params.personGeneration as
                | "allow_adult"
                | "dont_allow",
            }
          : {}),
      },
    };

    if (params.image) {
      requestBody.image = {
        imageBytes: params.image.imageBytes,
        mimeType: params.image.mimeType,
      };
    }

    // 키당 재시도
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_KEY; attempt++) {
      try {
        const operation = await client.models.generateVideos(requestBody);
        console.log(
          `Video generation started with key ${keyIdx + 1}/${totalKeys}`
        );
        return { operationName: operation.name!, keyIndex: keyIdx };
      } catch (error) {
        if (isRateLimitError(error)) {
          // 마지막 재시도가 아니면 딜레이 후 같은 키로 재시도
          if (attempt < MAX_RETRIES_PER_KEY) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(
              `Key ${keyIdx + 1}: rate limit, retry ${attempt + 1}/${MAX_RETRIES_PER_KEY} after ${delay}ms`
            );
            await sleep(delay);
            continue;
          }

          // 이 키는 실패 → 다음 키가 있으면 전환
          if (keyIdx < totalKeys - 1) {
            console.warn(
              `Key ${keyIdx + 1} exhausted, switching to key ${keyIdx + 2}/${totalKeys}`
            );
            break; // 다음 keyIdx로
          }

          // 모든 키 소진
          throw new QuotaExceededError(
            `등록된 ${totalKeys}개 API 키가 모두 할당량을 초과했습니다. Google AI Studio에서 요금제를 확인해주세요.`
          );
        }

        // Rate Limit이 아닌 에러는 즉시 throw
        throw error;
      }
    }
  }

  throw new QuotaExceededError(
    `등록된 ${totalKeys}개 API 키가 모두 할당량을 초과했습니다.`
  );
}

// ─── Operation Status ──────────────────────────────────

export async function getOperationStatus(
  operationName: string,
  keyIndex?: number
) {
  const apiKey = getApiKey(keyIndex);

  const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;
  const res = await fetch(url, {
    headers: { "x-goog-api-key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Operation 상태 조회 실패: ${res.status}`);
  }

  const data = await res.json();

  if (data.done) {
    const videoUri =
      data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (videoUri) {
      return { done: true as const, videoUri: videoUri as string };
    }
    return { done: true as const, error: "동영상 생성에 실패했습니다." };
  }

  return { done: false as const };
}

// ─── Download URL ──────────────────────────────────────

export function getDownloadUrl(videoUri: string, keyIndex?: number): string {
  const apiKey = getApiKey(keyIndex);
  const separator = videoUri.includes("?") ? "&" : "?";
  return `${videoUri}${separator}key=${apiKey}&alt=media`;
}
