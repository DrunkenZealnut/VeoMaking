import type { ReferenceImage } from "@/types/video";

/**
 * 복수 참조 이미지를 하나의 필름스트립 이미지로 합성한다.
 * 이미지들을 순서대로 가로로 배치하며, 사이에 구분선을 넣는다.
 * Veo API는 참조 이미지 1장만 지원하므로, 이 합성 이미지를 단일 참조로 전달한다.
 */
export async function combineImages(
  images: ReferenceImage[]
): Promise<{ base64: string; mimeType: string }> {
  if (images.length === 0) {
    throw new Error("합성할 이미지가 없습니다.");
  }
  if (images.length === 1) {
    return { base64: images[0].base64, mimeType: images[0].mimeType };
  }

  // 1. 모든 이미지를 HTMLImageElement로 로드
  const loaded = await Promise.all(images.map((img) => loadImage(img)));

  // 2. 레이아웃 계산 — 가로 배치 (필름스트립)
  const GAP = 4; // 이미지 사이 간격 (px)
  const TARGET_HEIGHT = 720; // 통일 높이

  // 각 이미지를 TARGET_HEIGHT에 맞춰 스케일링
  const scaled = loaded.map((el) => {
    const scale = TARGET_HEIGHT / el.naturalHeight;
    return {
      el,
      width: Math.round(el.naturalWidth * scale),
      height: TARGET_HEIGHT,
    };
  });

  const totalWidth =
    scaled.reduce((sum, s) => sum + s.width, 0) +
    GAP * (scaled.length - 1);

  // 3. 캔버스에 그리기
  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context 생성 실패");

  // 배경 (검정)
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, totalWidth, TARGET_HEIGHT);

  let x = 0;
  for (let i = 0; i < scaled.length; i++) {
    const { el, width, height } = scaled[i];
    ctx.drawImage(el, x, 0, width, height);

    // 순서 번호 표시
    const label = `${i + 1}`;
    const fontSize = Math.max(24, TARGET_HEIGHT * 0.05);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x, 0, fontSize * 1.6, fontSize * 1.6);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + fontSize * 0.8, fontSize * 0.8);

    x += width;

    // 구분선
    if (i < scaled.length - 1) {
      ctx.fillStyle = "#333";
      ctx.fillRect(x, 0, GAP, TARGET_HEIGHT);
      x += GAP;
    }
  }

  // 4. base64 추출
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];

  return { base64, mimeType: "image/png" };
}

function loadImage(ref: ReferenceImage): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${ref.name}`));
    // previewUrl이 data URL이면 직접 사용, blob URL이면 그대로 사용
    img.src = ref.previewUrl;
  });
}
