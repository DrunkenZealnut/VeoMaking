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
  desc: string;
}

export const CAMERA_ANGLES: Preset<CameraAngle>[] = [
  { value: "aerial", label: "공중 촬영", en: "aerial view", desc: "드론이나 헬기에서 내려다보는 시점. 넓은 풍경이나 도시 전경에 적합합니다." },
  { value: "eye-level", label: "눈높이", en: "eye-level shot", desc: "사람의 눈높이에서 정면으로 촬영. 자연스럽고 친근한 느낌을 줍니다." },
  { value: "high-angle", label: "하이 앵글", en: "high angle shot", desc: "위에서 아래로 내려다보는 각도. 피사체를 작고 연약하게 표현합니다." },
  { value: "low-angle", label: "로우 앵글", en: "low angle shot", desc: "아래에서 위로 올려다보는 각도. 피사체를 크고 웅장하게 표현합니다." },
  { value: "pov", label: "시점 (POV)", en: "POV shot", desc: "캐릭터의 눈으로 직접 바라보는 1인칭 시점. 몰입감을 극대화합니다." },
  { value: "dutch-angle", label: "더치 앵글", en: "dutch angle", desc: "카메라를 기울여 촬영. 불안감, 긴장감, 혼란을 표현할 때 사용합니다." },
];

export const CAMERA_MOTIONS: Preset<CameraMotion>[] = [
  { value: "dolly", label: "돌리 샷", en: "dolly shot", desc: "카메라가 레일 위에서 피사체를 향해 전진 또는 후퇴합니다." },
  { value: "tracking", label: "추적 샷", en: "tracking shot", desc: "카메라가 움직이는 피사체를 따라가며 촬영합니다." },
  { value: "zoom-in", label: "줌인", en: "zoom in", desc: "렌즈 줌으로 피사체를 점차 확대합니다. 집중과 긴장감을 유도합니다." },
  { value: "zoom-out", label: "줌아웃", en: "zoom out", desc: "렌즈 줌으로 화면을 점차 넓힙니다. 전체 상황을 드러낼 때 사용합니다." },
  { value: "pan", label: "패닝", en: "slow pan", desc: "카메라가 좌우로 천천히 회전합니다. 넓은 공간을 훑어볼 때 적합합니다." },
  { value: "tilt", label: "틸트", en: "tilt shot", desc: "카메라가 위아래로 회전합니다. 건물이나 인물의 전체를 보여줄 때 사용합니다." },
  { value: "static", label: "고정", en: "static shot", desc: "카메라가 완전히 고정된 상태. 안정적이고 관찰적인 느낌을 줍니다." },
  { value: "handheld", label: "핸드헬드", en: "handheld camera", desc: "손에 들고 촬영한 듯한 흔들림. 현장감과 리얼리티를 더합니다." },
];

export const COMPOSITIONS: Preset<Composition>[] = [
  { value: "wide-shot", label: "와이드 샷", en: "wide shot", desc: "피사체와 주변 환경을 함께 넓게 담습니다. 장소와 분위기를 보여줍니다." },
  { value: "medium-shot", label: "미디엄 샷", en: "medium shot", desc: "인물의 허리 위를 담는 구도. 대화 장면에 가장 많이 사용됩니다." },
  { value: "close-up", label: "클로즈업", en: "close-up", desc: "얼굴이나 물체를 크게 담습니다. 감정과 디테일을 강조합니다." },
  { value: "extreme-close-up", label: "익스트림 클로즈업", en: "extreme close-up", desc: "눈동자, 입술 등 극단적으로 확대한 구도. 강렬한 감정 표현에 사용합니다." },
  { value: "two-shot", label: "투 샷", en: "two shot", desc: "두 인물을 한 화면에 함께 담는 구도. 관계와 상호작용을 보여줍니다." },
  { value: "over-the-shoulder", label: "오버 더 숄더", en: "over-the-shoulder shot", desc: "한 인물의 어깨 너머로 상대방을 촬영. 대화 장면의 시선 교환에 사용합니다." },
];

export const FOCUS_EFFECTS: Preset<FocusEffect>[] = [
  { value: "shallow-focus", label: "얕은 피사계 심도", en: "shallow depth of field", desc: "배경을 흐리게 하여 피사체만 선명하게 부각합니다. 인물 촬영에 많이 사용합니다." },
  { value: "deep-focus", label: "깊은 피사계 심도", en: "deep focus", desc: "전경과 배경 모두 선명하게 촬영합니다. 풍경이나 복잡한 장면에 적합합니다." },
  { value: "soft-focus", label: "소프트 포커스", en: "soft focus", desc: "전체적으로 부드럽고 몽환적인 느낌. 로맨틱하거나 꿈같은 분위기를 연출합니다." },
  { value: "macro-lens", label: "매크로 렌즈", en: "macro lens close-up", desc: "아주 가까운 거리에서 작은 피사체를 크게 촬영합니다. 꽃, 곤충 등에 적합합니다." },
  { value: "wide-angle", label: "광각 렌즈", en: "wide-angle lens", desc: "넓은 화각으로 공간감을 과장합니다. 풍경이나 실내 전경에 적합합니다." },
  { value: "telephoto", label: "망원 렌즈", en: "telephoto lens", desc: "멀리 있는 피사체를 가깝게 촬영합니다. 원근감을 압축하는 효과가 있습니다." },
  { value: "tilt-shift", label: "틸트 시프트", en: "tilt-shift miniature effect", desc: "실제 풍경을 미니어처처럼 보이게 합니다. 도시 풍경에 독특한 효과를 줍니다." },
  { value: "anamorphic", label: "아나모픽", en: "anamorphic lens flare", desc: "수평으로 퍼지는 렌즈 플레어 효과. 할리우드 영화 특유의 시네마틱 느낌을 줍니다." },
];

export const FILM_STYLES: Preset<FilmStyle>[] = [
  { value: "cinematic", label: "시네마틱", en: "cinematic", desc: "영화같은 색감과 구도. 넓은 화면비와 풍부한 색조로 전문적인 느낌을 줍니다." },
  { value: "film-noir", label: "필름 누아르", en: "film noir", desc: "흑백 또는 고대비의 어두운 톤. 미스터리, 범죄 장르의 고전적 스타일입니다." },
  { value: "sci-fi", label: "SF", en: "sci-fi", desc: "미래적이고 공상과학적인 비주얼. 네온, 홀로그램, 우주 등의 요소가 특징입니다." },
  { value: "horror", label: "공포", en: "horror movie style", desc: "어둡고 불안한 분위기. 그림자, 왜곡, 불규칙한 조명으로 공포감을 조성합니다." },
  { value: "animation", label: "애니메이션", en: "animation style", desc: "2D 또는 3D 애니메이션 스타일. 실사가 아닌 일러스트/카툰 느낌으로 표현합니다." },
  { value: "documentary", label: "다큐멘터리", en: "documentary style", desc: "사실적이고 관찰적인 촬영 스타일. 자연광과 핸드헬드 카메라의 현장감을 줍니다." },
  { value: "vintage", label: "빈티지", en: "vintage film", desc: "오래된 필름 느낌의 색감과 그레인. 레트로하고 향수적인 분위기를 연출합니다." },
  { value: "surreal", label: "초현실주의", en: "surrealism", desc: "현실을 왜곡한 꿈같은 이미지. 비현실적 공간과 오브제로 상상력을 자극합니다." },
  { value: "paper-cutout", label: "종이 컷아웃", en: "paper cutout animation", desc: "종이를 오려 만든 듯한 평면적 애니메이션. 독특하고 수공예적인 매력이 있습니다." },
  { value: "3d-cartoon", label: "3D 만화", en: "3D cartoon style", desc: "픽사/디즈니풍의 3D 캐릭터와 배경. 귀엽고 생동감 있는 표현에 적합합니다." },
];

export const MOODS: Preset<Mood>[] = [
  { value: "warm", label: "따뜻한 색조", en: "warm tones", desc: "오렌지, 레드 계열의 따뜻한 색감. 편안하고 포근한 분위기를 연출합니다." },
  { value: "cool-blue", label: "차가운 블루", en: "cool blue tones", desc: "푸른 계열의 차가운 색감. 고요하거나 차분한 분위기를 만들어냅니다." },
  { value: "natural-light", label: "자연광", en: "natural lighting", desc: "태양광 그대로의 자연스러운 조명. 사실적이고 깨끗한 영상에 적합합니다." },
  { value: "golden-hour", label: "골든 아워", en: "golden hour lighting", desc: "해 뜨거나 질 무렵의 황금빛 조명. 따뜻하고 로맨틱한 분위기의 대표적 시간대입니다." },
  { value: "night", label: "야간", en: "night scene", desc: "밤 시간대의 어두운 환경. 인공 조명, 달빛 등으로 야경 분위기를 연출합니다." },
  { value: "neon", label: "네온", en: "neon lights", desc: "형광 네온사인의 화려한 색상. 도심 야경이나 사이버펑크 분위기에 적합합니다." },
  { value: "dramatic", label: "드라마틱", en: "dramatic lighting", desc: "강한 명암 대비의 조명. 긴장감 있고 인상적인 장면을 만들어냅니다." },
  { value: "bright", label: "밝고 경쾌", en: "bright and cheerful colors", desc: "밝고 선명한 색상. 활기차고 긍정적인 분위기를 줍니다." },
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
