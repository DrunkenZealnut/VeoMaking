import type { CostEstimate, Duration, ModelType, Resolution } from "@/types/video";
import { COST_TABLE } from "./prompt-presets";

export function getCostEstimate(
  resolution: Resolution,
  duration: Duration,
  modelType: ModelType
): CostEstimate {
  const perSecond = COST_TABLE[modelType]?.[resolution] ?? 0.4;
  const seconds = parseInt(duration);
  return {
    duration: seconds,
    resolution,
    modelType,
    estimatedCost: perSecond * seconds,
  };
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}
