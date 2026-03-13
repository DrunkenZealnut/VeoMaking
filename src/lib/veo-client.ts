import { GoogleGenAI } from "@google/genai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

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

export async function generateVideo(params: GenerateVideoParams) {
  const client = getClient();
  const modelId =
    params.modelType === "fast"
      ? "veo-3.1-fast-generate-preview"
      : "veo-3.1-generate-preview";

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

  // Image-to-Video: 참조 이미지가 있으면 추가
  if (params.image) {
    requestBody.image = {
      imageBytes: params.image.imageBytes,
      mimeType: params.image.mimeType,
    };
  }

  const operation = await client.models.generateVideos(requestBody);

  return { operationName: operation.name };
}

export async function getOperationStatus(operationName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");

  // REST API를 직접 호출하여 타입 문제 회피
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

/**
 * Gemini API에서 동영상을 다운로드하기 위한 URL을 구성합니다.
 * @google/genai의 files.download는 파일을 직접 저장하므로,
 * 대신 REST API를 통해 직접 다운로드합니다.
 */
export function getDownloadUrl(videoUri: string): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  // videoUri는 이미 전체 URL 형태이므로 API Key만 추가
  const separator = videoUri.includes("?") ? "&" : "?";
  return `${videoUri}${separator}key=${apiKey}&alt=media`;
}
