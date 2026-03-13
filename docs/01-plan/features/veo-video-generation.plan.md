# Veo 3.1 동영상 생성 기능 Planning Document

> **Summary**: Gemini API의 Veo 3.1 모델을 활용하여 텍스트/이미지 기반 동영상 생성 기능 구현
>
> **Project**: VeoMaking
> **Author**: zealnutkim
> **Date**: 2026-03-13
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 고품질 동영상 제작은 전문 장비와 기술이 필요하며, 시간과 비용이 많이 소요됨 |
| **Solution** | Google Gemini API의 Veo 3.1 모델을 활용하여 텍스트 프롬프트만으로 시네마틱 동영상을 자동 생성 |
| **Function/UX Effect** | 프롬프트 입력 → 비동기 생성 → 미리보기 → 다운로드의 직관적 워크플로우 제공 |
| **Core Value** | 누구나 텍스트만으로 전문가 수준의 동영상을 빠르게 생성할 수 있는 접근성 확보 |

---

## 1. Overview

### 1.1 Purpose

텍스트 프롬프트 또는 이미지를 입력으로 받아 Google의 Veo 3.1 AI 모델을 통해 고품질 시네마틱 동영상을 생성하는 웹 애플리케이션을 구축한다. 사용자는 복잡한 영상 편집 도구 없이도 프로페셔널한 동영상을 생성할 수 있다.

### 1.2 Background

- Google의 Veo 3.1은 최신 동영상 생성 AI 모델로, 720p~4K 해상도와 네이티브 오디오 생성을 지원
- Gemini API를 통해 프로그래밍 방식으로 접근 가능
- 텍스트-to-비디오, 이미지-to-비디오, 프레임 보간, 비디오 확장 등 다양한 생성 모드 지원
- 비동기 Long-Running Operation 패턴으로 동작하여 적절한 UX 설계가 필요

### 1.3 Related Documents

- Google Gemini API 공식 문서: Veo API Reference
- Veo 3.1 모델 가이드

---

## 2. Scope

### 2.1 In Scope

- [x] 텍스트-to-비디오 생성 (Text-to-Video)
- [x] 생성 옵션 설정 (해상도, 길이, 화면비)
- [x] 비동기 생성 상태 추적 및 폴링
- [x] 생성된 동영상 미리보기 및 다운로드
- [ ] 이미지-to-비디오 생성 (Image-to-Video)
- [ ] 프롬프트 히스토리 관리
- [ ] 생성 비용 예측 표시

### 2.2 Out of Scope

- 동영상 편집 기능 (트리밍, 필터 등)
- 사용자 인증 및 결제 시스템
- 비디오 확장(Extension) 기능 (향후 확장)
- 프레임 보간(Interpolation) 기능 (향후 확장)
- 레퍼런스 이미지 기반 생성 (향후 확장)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 텍스트 프롬프트 입력으로 동영상 생성 요청 | High | Pending |
| FR-02 | 해상도 선택 (720p / 1080p / 4K) | High | Pending |
| FR-03 | 동영상 길이 선택 (4초 / 6초 / 8초) | High | Pending |
| FR-04 | 화면비 선택 (16:9 / 9:16) | High | Pending |
| FR-05 | 생성 진행 상태 실시간 표시 (폴링) | High | Pending |
| FR-06 | 생성 완료 후 동영상 미리보기 | High | Pending |
| FR-07 | 생성된 동영상 MP4 다운로드 | High | Pending |
| FR-08 | 이미지 업로드를 통한 이미지-to-비디오 생성 | Medium | Pending |
| FR-09 | 프롬프트 히스토리 저장 및 재사용 | Medium | Pending |
| FR-10 | 생성 비용 예측 표시 (요금 안내) | Low | Pending |
| FR-11 | Fast 모델 vs Standard 모델 선택 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 폴링 간격 10초, UI 반응 < 200ms | 브라우저 DevTools |
| UX | 생성 대기 중 진행률/상태 피드백 제공 | 사용자 테스트 |
| Security | API Key 서버사이드 관리 (클라이언트 노출 금지) | 코드 리뷰 |
| Reliability | API 에러 시 사용자 친화적 에러 메시지 표시 | 에러 시나리오 테스트 |
| Cost | 요청당 비용 표시 (720p: $0.40/s ~ 4K: $0.60/s) | 요금표 기반 계산 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 텍스트 프롬프트로 동영상 생성 → 미리보기 → 다운로드 플로우 완성
- [ ] 해상도/길이/화면비 옵션이 정상 동작
- [ ] 생성 중 상태 표시 (로딩/진행률) 정상 동작
- [ ] API 에러 핸들링 및 사용자 피드백 구현
- [ ] 코드 리뷰 완료

### 4.2 Quality Criteria

- [ ] 주요 기능 수동 테스트 완료
- [ ] API Key가 클라이언트에 노출되지 않음
- [ ] 반응형 UI (모바일/데스크톱)
- [ ] 빌드 성공

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Veo 3.1 API 비용 과다 발생 | High | Medium | 요청 전 비용 예측 표시, 일일 사용량 제한 설정 |
| API 응답 지연 (최대 6분) | Medium | High | 진행 상태 UI, 백그라운드 폴링, 타임아웃 처리 |
| API Key 유출 위험 | High | Low | 서버사이드 API Route로 프록시, 환경변수 관리 |
| 생성 콘텐츠 안전성 필터 차단 | Medium | Medium | 사용자에게 가이드라인 안내, 에러 메시지 표시 |
| 생성 영상 2일 후 서버 삭제 | Medium | High | 즉시 다운로드 안내, 로컬 저장 유도 |
| Veo 3.1 Preview 모델 변경/중단 | High | Low | 모델 ID 설정 외부화, Veo 3/2 폴백 준비 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs, fullstack apps | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | **Next.js (App Router)** | API Routes로 서버사이드 API 프록시 구현, SSR/SSG 지원 |
| State Management | Context / Zustand / Redux | **Zustand** | 경량, 간단한 상태 관리에 적합 |
| API Client | fetch / axios / react-query | **fetch + Server Actions** | Next.js 네이티브 지원, 추가 의존성 최소화 |
| Styling | Tailwind / CSS Modules | **Tailwind CSS** | 빠른 UI 개발, 반응형 디자인 용이 |
| SDK | @google/genai / REST API | **@google/genai (Node.js)** | 공식 SDK, 타입 지원, 비동기 처리 편의성 |
| File Handling | Server-side / Client-side | **Server-side (API Route)** | API Key 보안, 파일 스트리밍 처리 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Folder Structure Preview:
┌─────────────────────────────────────────────────────┐
│ src/                                                │
│   app/                                              │
│     page.tsx                 # 메인 동영상 생성 페이지│
│     api/                                            │
│       generate/route.ts      # 동영상 생성 API       │
│       status/[id]/route.ts   # 생성 상태 조회 API    │
│       download/[id]/route.ts # 동영상 다운로드 API    │
│   components/                                       │
│     PromptInput.tsx          # 프롬프트 입력 컴포넌트 │
│     VideoOptions.tsx         # 옵션 선택 컴포넌트     │
│     VideoPreview.tsx         # 비디오 미리보기        │
│     GenerationStatus.tsx     # 생성 상태 표시         │
│   lib/                                              │
│     veo-client.ts            # Veo API 클라이언트     │
│     types.ts                 # 타입 정의              │
│   store/                                            │
│     useVideoStore.ts         # Zustand 상태 관리      │
└─────────────────────────────────────────────────────┘
```

### 6.4 API 통신 아키텍처

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐
│  Client  │────→│ Next.js API  │────→│ Gemini API     │
│  (React) │     │  Routes      │     │ (Veo 3.1)      │
│          │←────│ (Server-side)│←────│                │
└──────────┘     └──────────────┘     └────────────────┘

Flow:
1. Client → API Route: 프롬프트 + 옵션 전송
2. API Route → Gemini: generateVideos() 호출
3. Gemini → API Route: Operation ID 반환
4. Client → API Route: 상태 폴링 (10초 간격)
5. API Route → Gemini: Operation 상태 조회
6. 완료 시 Client → API Route → Gemini: 영상 다운로드
```

### 6.5 Veo 3.1 모델 사양 참고

| Feature | Specification |
|---------|--------------|
| Model ID | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` |
| 해상도 | 720p (기본), 1080p, 4K |
| 길이 | 4초, 6초, 8초 (1080p/4K는 8초만) |
| 화면비 | 16:9 (기본), 9:16 |
| 오디오 | 네이티브 생성 (대화, 효과음, 배경음) |
| 프레임레이트 | 24fps |
| 생성 시간 | 11초 ~ 6분 |
| 워터마크 | SynthID 자동 적용 |
| 비용 (Standard) | 720p/1080p: $0.40/초, 4K: $0.60/초 |
| 비용 (Fast) | 720p/1080p: $0.15/초, 4K: $0.35/초 |

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

Check which conventions already exist in the project:

- [ ] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] ESLint configuration (`.eslintrc.*`)
- [ ] Prettier configuration (`.prettierrc`)
- [ ] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | missing | 컴포넌트: PascalCase, 함수: camelCase, 파일: kebab-case | High |
| **Folder structure** | missing | Next.js App Router 구조 (위 6.3 참조) | High |
| **Import order** | missing | React → Next → 외부 라이브러리 → 내부 모듈 → 타입 | Medium |
| **Environment variables** | missing | GEMINI_API_KEY (서버 전용) | High |
| **Error handling** | missing | API Route에서 try-catch + 표준 에러 응답 형식 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `GEMINI_API_KEY` | Gemini API 인증 키 | Server Only | ☑ |

### 7.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | ☐ | `docs/01-plan/schema.md` | `/development-pipeline` |
| Phase 2 (Convention) | ☐ | `docs/01-plan/conventions.md` | `/development-pipeline` |

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`veo-video-generation.design.md`)
2. [ ] Next.js 프로젝트 초기화
3. [ ] Gemini API Key 발급 및 환경변수 설정
4. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | zealnutkim |
