---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# v1 분석 및 약점 정리

## 1. v1 구조 개요

v1은 단일 `index.html` 파일(~1,480줄)에 모든 로직을 담은 Phaser 3.60 게임이다.

| 항목 | v1 현황 |
|---|---|
| 파일 구성 | index.html 1개 (HTML + CSS + JS 혼합) |
| 캔버스 크기 | 640×512 (20×16 타일, TILE=32) |
| 씬 구성 | TitleScene, GameScene 2개 |
| 타일맵 | 런타임 2D 배열 (buildGrid 함수) |
| 텍스처 | 100% 런타임 Graphics 생성 (외부 에셋 0) |
| 입력 방식 | 드래그 (Bresenham 직선 보간) |
| NPC | 교수, 친구(2교시+), 학생 배경 NPC 20명 |
| 교시 수 | 5교시 (period 1~5) |
| 페이즈 | move / stop / distract / suspicion |

---

## 2. 게임플레이 흐름

```
[TitleScene] → [GameScene period=1]
                  │
                  ├─ enterMovePhase()   MOVE 상태 (교수 PPT 봄)
                  │    └─ 드래그로 이동 가능
                  ├─ enterStopPhase()   STOP 상태 (교수 돌아봄)
                  │    └─ gracePeriod=0.35s 이후 이동 시 즉시 게임오버
                  ├─ enterDistractPhase()  CHANCE 상태 (친구 질문)
                  │    └─ moveTime * 1.4 동안 안전 이동 가능
                  └─ suspicion          STOP 강화판 (빨간 플래시)
```

### 페이즈 타이밍 (5교시 진행)

| period | moveTime | stopTime | suspChance | 친구 | 출구 |
|--------|---------|---------|-----------|-----|-----|
| 1 | 5.5s | 1.8s | 0% | X | 뒤 |
| 2 | 4.5s | 2.1s | 0% | O | 뒤 |
| 3 | 3.8s | 2.4s | 0% | O | 뒤 |
| 4 | 3.2s | 2.6s | 30% | O | 뒤 |
| 5 | 3.0s | 2.4s | 30% | O | 앞 |

---

## 3. 핵심 시스템 분석

### 3.1 입력 & 이동

- `pointerdown` → dragPath 수집 시작
- `pointermove` → Bresenham 알고리즘으로 타일 경로 보간
- `update()` → dragPath 큐에서 1타일씩 소비, speed=170px/s
- **문제**: 이동 중 STOP 전환 시 즉시 게임오버 (grace 0.35s 있음)

### 3.2 교수 AI

- 상태머신: move → stop/suspicion → move (단순 타이머)
- 교수는 항상 같은 위치 (row 3, col 14 고정)
- 시각: profBack (PPT 봄) / profFront (학생 봄) / profAngry (의심)
- **문제**: 교수가 이동하지 않음, 예측 가능, 패턴이 단순

### 3.3 친구 시스템

- 2교시부터 등장, 한 번만 사용 가능 (`friendUsedThisPeriod`)
- 클릭 → DISTRACT 페이즈 진입 (MOVE 페이즈 중에만 활성)
- **문제**: 1회 제한, 쿨다운 없음(실제론 1회 제한이 cooldown), 친구 대화 없음

### 3.4 텍스처 시스템

- `generateTextures()` → GameScene.create() 마다 모든 텍스처 재생성
- Graphics 객체 destroy() 후 재사용
- **문제**: 씬 전환마다 메모리 재생성, Phaser TextureManager 캐시 미활용

---

## 4. v1 약점 목록

### 4-A. 아키텍처

| # | 약점 | 영향 |
|---|---|---|
| A1 | 단일 HTML 파일 — 1,480줄 스파게티 | 유지보수 불가, 기능 추가 어려움 |
| A2 | 씬 분리 없음 (BootScene, PreloadScene 없음) | 에셋 로딩 타이밍 불안정 |
| A3 | 텍스처 씬별 재생성 | 교시 전환마다 GC 압박 |
| A4 | 전역 상수 혼재 (TILE, COLS, ROWS, PAL 등) | 모듈화 시 충돌 가능성 |
| A5 | DOM 직접 조작 (getElementById) Phaser 내부에서 | React/Vue 혼합 시 충돌 |

### 4-B. 게임플레이

| # | 약점 | 영향 |
|---|---|---|
| B1 | 교수가 고정 위치 — 패턴 암기 가능 | 반복 플레이 시 재미 하락 |
| B2 | 친구 1회 사용 — 전략성 부족 | "그냥 1교시 클리어하고 2교시에 써" |
| B3 | 조교(TA) 없음 — 교수 외 위협 없음 | 4~5교시 긴장감 부족 |
| B4 | 5교시만 출구 이동 (나머지 뒷문 고정) | 후반부에만 레이아웃 변화 |
| B5 | 의심(suspicion) 시 체크 없음 — 이미 자리에 있으면 무조건 통과 | 위협감 없음 |
| B6 | 점수/업적 없음 | 재플레이 동기 없음 |
| B7 | 이동 경로 예측 불가 (드래그만) | 모바일에서 조작 어려움 |

### 4-C. 시각/UX

| # | 약점 | 영향 |
|---|---|---|
| C1 | 픽셀 퍼펙트 렌더 설정 부분적 (`pixelArt: true` 있으나 CSS image-rendering 미흡) | HiDPI에서 흐릿함 가능 |
| C2 | 화면 비율 고정 (640×512) — 반응형 없음 | 모바일/세로 화면 불가 |
| C3 | 캐릭터 스프라이트 단순 (1 포즈) | 움직임 느낌 없음 (bob만 있음) |
| C4 | 사운드 없음 | 몰입도 제한 |
| C5 | 교수 대화 bubble 크기 고정 — 긴 텍스트 클리핑 | 한국어 문장에서 overflow 가능 |

### 4-D. 코드 품질

| # | 약점 | 영향 |
|---|---|---|
| D1 | update() 내 로직 비분리 — 5개 함수 연쇄 호출 | 프로파일링 어려움 |
| D2 | tileLine (Bresenham) 이동 중 벽 관통 가능성 | 코너 케이스에서 버그 |
| D3 | dragPath에 중복 타일 삽입 가능성 | 플레이어가 같은 타일에서 흔들림 |
| D4 | 모든 NPC tween이 create()에서 한번에 생성 | 씬이 커지면 tween 수 폭증 |

---

## 5. v2 대응 방향 (스펙 #2611~#2613 기반)

| v1 약점 | v2 해결 |
|---|---|
| A1 단일 HTML | TypeScript 모듈 분리 (14개 파일) |
| A2 씬 분리 없음 | Boot → Preload → Title → Game → Result 6개 씬 |
| A3 텍스처 재생성 | PreloadScene 1회 생성 + TextureManager 캐시 |
| B1 교수 고정 예측 | **유지** — 스펙 #2611이 "교수 연단 고정, 순찰 없음" 명시 |
| B2 친구 1종 1회 | GOOD/SLEEPING/SNITCH 3종, 2회 사용 제한 |
| B3 조교 없음 | TA 1~4명 (교시별), 시야 콘, 아일 순찰 |
| B4 출구 고정 | 동적 출구 (교시마다 다른 위치 1개) |
| C1 픽셀 퍼펙트 부분적 | BootScene에서 완전 초기화 (doc 02 참조) |
| C3 캐릭터 1포즈 | 4프레임 스프라이트 (idle/walkA/walkB/caught) |
| C5 말풍선 고정 크기 | 9-slice 픽셀 말풍선 (자동 크기 조정) |
| D1 로직 분리 없음 | PhaseManager/InputSystem/VisionSystem 분리 |

---

## 6. 배포 현황 변경 (결정사항)

| 항목 | v1 | v2 |
|---|---|---|
| 도메인 | (GitHub Pages, 비공개) | **escape-the-lecture.axenior.kr** |
| 서빙 방식 | 정적 HTML | PM2 + Bun 서버 |
| Traefik 연결 | 없음 | 기존 router 재사용, service만 새 포트로 |
| v1 보존 | - | v1 코드는 git 브랜치로 보존, 운영 도메인은 v2로 교체 |

**Traefik 변경 범위**: `bhsong-services.yml` 내 `escape-the-lecture` service의 `url`만 변경 (새 PM2 포트, 제안: 5075).
