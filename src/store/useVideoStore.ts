import { create } from "zustand";
import type {
  AspectRatio,
  Duration,
  GenerationStatus,
  ModelType,
  PromptComponents,
  ReferenceImage,
  Resolution,
} from "@/types/video";
import { composePrompt, enhancePrompt } from "@/lib/compose-prompt";
import { getCostEstimate, formatCost } from "@/lib/cost";

type Status = "idle" | "generating" | "polling" | "completed" | "error";

interface VideoStore {
  // 프롬프트
  promptComponents: PromptComponents;
  setPromptField: <K extends keyof PromptComponents>(
    key: K,
    value: PromptComponents[K]
  ) => void;
  getComposedPrompt: () => string;
  getEnhancedPrompt: () => string;
  useEnhanced: boolean;
  setUseEnhanced: (v: boolean) => void;

  // 옵션
  resolution: Resolution;
  duration: Duration;
  aspectRatio: AspectRatio;
  modelType: ModelType;
  setResolution: (r: Resolution) => void;
  setDuration: (d: Duration) => void;
  setAspectRatio: (a: AspectRatio) => void;
  setModelType: (m: ModelType) => void;

  // 생성 상태
  status: Status;
  setStatus: (s: Status) => void;
  generation: GenerationStatus | null;
  setGeneration: (g: GenerationStatus | null) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;

  // 결과
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;

  // 비용
  getCostString: () => string;
  getCostValue: () => number;

  // 참조 이미지 (Image-to-Video)
  referenceImages: ReferenceImage[];
  addReferenceImage: (img: ReferenceImage) => void;
  removeReferenceImage: (index: number) => void;
  clearReferenceImages: () => void;

  // 프롬프트 도우미 열기/닫기
  helperOpen: boolean;
  setHelperOpen: (open: boolean) => void;

  // 리셋
  reset: () => void;
}

const initialPrompt: PromptComponents = {
  mainPrompt: "",
  cameraAngle: undefined,
  cameraMotion: undefined,
  composition: undefined,
  focusEffect: undefined,
  filmStyle: undefined,
  mood: undefined,
  dialogue: undefined,
  soundEffects: undefined,
  negativePrompt: undefined,
};

export const useVideoStore = create<VideoStore>((set, get) => ({
  // 프롬프트
  promptComponents: { ...initialPrompt },
  setPromptField: (key, value) =>
    set((s) => ({
      promptComponents: { ...s.promptComponents, [key]: value },
    })),
  getComposedPrompt: () => {
    const state = get();
    return state.useEnhanced
      ? enhancePrompt(state.promptComponents)
      : composePrompt(state.promptComponents);
  },
  getEnhancedPrompt: () => enhancePrompt(get().promptComponents),
  useEnhanced: false,
  setUseEnhanced: (useEnhanced) => set({ useEnhanced }),

  // 옵션
  resolution: "720p",
  duration: "8",
  aspectRatio: "16:9",
  modelType: "standard",
  setResolution: (resolution) => {
    set({ resolution });
    // 1080p/4k는 8초만 지원
    if (resolution !== "720p") {
      set({ duration: "8" });
    }
  },
  setDuration: (duration) => set({ duration }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setModelType: (modelType) => set({ modelType }),

  // 생성 상태
  status: "idle",
  setStatus: (status) => set({ status }),
  generation: null,
  setGeneration: (generation) => set({ generation }),
  errorMessage: null,
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  // 결과
  videoUrl: null,
  setVideoUrl: (videoUrl) => set({ videoUrl }),

  // 비용
  getCostString: () => {
    const { resolution, duration, modelType } = get();
    const estimate = getCostEstimate(resolution, duration, modelType);
    return formatCost(estimate.estimatedCost);
  },
  getCostValue: () => {
    const { resolution, duration, modelType } = get();
    return getCostEstimate(resolution, duration, modelType).estimatedCost;
  },

  // 참조 이미지
  referenceImages: [],
  addReferenceImage: (img) =>
    set((s) => ({ referenceImages: [...s.referenceImages, img] })),
  removeReferenceImage: (index) =>
    set((s) => ({
      referenceImages: s.referenceImages.filter((_, i) => i !== index),
    })),
  clearReferenceImages: () => set({ referenceImages: [] }),

  // 프롬프트 도우미
  helperOpen: false,
  setHelperOpen: (helperOpen) => set({ helperOpen }),

  // 리셋
  reset: () =>
    set({
      promptComponents: { ...initialPrompt },
      resolution: "720p",
      duration: "8",
      aspectRatio: "16:9",
      modelType: "standard",
      status: "idle",
      generation: null,
      errorMessage: null,
      videoUrl: null,
      referenceImages: [],
      useEnhanced: false,
      helperOpen: false,
    }),
}));
