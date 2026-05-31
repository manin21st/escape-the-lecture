---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# 요구사항 종합 및 Phase 4 (구현) 준비

## 1. 사용자 스펙 (#2611~#2613) 전체 반영 현황

### #2611 — 레트로 픽셀 게임 방향 ✅

| 요구사항 | 반영 문서 | 반영 내용 |
|---|---|---|
| 픽셀 퍼펙트 렌더링 | 02_픽셀퍼펙트렌더설정 | pixelArt:true, NEAREST 필터, CSS image-rendering |
| 뭉개짐/블러/글로우 없음 | 02, 07 | antialias:false, roundPixels, 모던 효과 금지 |
| chunky 픽셀 이동 | 03 엔티티모델 | speed=160, 8fps 저프레임 walk |
| RPG 픽셀 UI (sharp corners) | 05, 07 | RetroButton, 픽셀 테두리, 모서리 sharp |
| 픽셀 폰트만 사용 | 06 에셋계획 | Press Start 2P + Galmuri11 (한글) + VT323 |
| Stardew/Pokemon/Harvest Moon 분위기 | 06 에셋계획 | Sprout Lands 팩 + 따뜻한 우드 팔레트 |
| 다크/네온/사이버펑크 금지 | 06 팔레트 | 베이지+브라운+크림 계열만 |
| 대학 강의실 즉시 인식 | 04, 맵 | 연단+PPT+긴 책상+20+ NPC 배치 |
| 교수: 클래식 RPG NPC 스타일 | 03, 06 | 안경+회색머리+검은정장, 연단 고정 |
| 학생 20+ 명 | 03 BackgroundNPC | NPC_SEATS 20개 좌석 |
| 플레이어 학생 속에 숨음 | 03 Player | 거의 동일한 외형, 미세 구분 |

### #2611 — 교수 시스템 ✅

| 요구사항 | 반영 내용 |
|---|---|
| LECTURE MODE: PPT 봄 → MOVE | 05 PhaseManager 'lecture' 상태 |
| WATCH MODE: 학생 봄 → STOP | 05 PhaseManager 'watch' 상태 |
| WATCH 중 이동 → GAME OVER | 03 Player.isInGrace, 05 PhaseManager |
| RPG 말풍선 (픽셀 테두리+꼬리) | 03 DialogBubble, 05 대사 |
| 한국어 대사 목록 | 05 PROF_LINES (한국어 확정) |
| 교수 연단 고정 (순찰 없음) | 03 Professor (readonly tileX/tileY) |

### #2612~#2613 — TA 시스템 ✅

| 요구사항 | 반영 내용 |
|---|---|
| 클립보드 든 조교 외형 | 03 TA 비주얼 |
| 아일 순찰 | 04 TA 배치, 05 updatePatrol |
| 시야 콘 (노란/주황/빨간) | 03 drawVisionCone, 05 checkPlayerInCone |
| 콘이 이동 방향으로 회전 | 05 updateFacingAngle |
| 플레이어 감지 → GAME OVER | 03 visionState='detected' |

### #2613 — 친구 시스템 ✅

| 요구사항 | 반영 내용 |
|---|---|
| GOOD FRIEND: 교수에게 질문 | 05 GoodFriend 행동 A |
| GOOD FRIEND: TA에게 질문 | 05 GoodFriend 행동 B |
| SLEEPING FRIEND: 효과 없음 | 03 SleepingFriend |
| SNITCH FRIEND: 위험 증가 | 03 SnitchFriend, 05 triggerSnitchEvent |
| 사용 횟수 제한 (2/2) | 03 GoodFriend.useCount, 05 HUD |
| 전략적 사용 요소 | 04 친구 종류 미공개 (클릭해야 앎) |

### #2613 — 동적 출구 + 5교시 ✅

| 요구사항 | 반영 내용 |
|---|---|
| 라운드당 출구 1개만 | 04 동적 출구 시스템 |
| P1: 가까운 출구 (튜토리얼) | 04 1교시 설정 |
| P2: 1 TA 등장 | 04 taCount=1 |
| P3: 2 TA, 반대편 출구 | 04 taCount=2 |
| P4: 3 TA, TA 감시 구역 출구 | 04 taCount=3, suspChance=30% |
| P5: 4 TA, 교수 연단 옆 출구 | 04 taCount=4, exitFront |
| 특별 이벤트 "뒤에 학생 어디가요?" | 05 교수 suspicion 대사 |

---

## 2. 결정사항 반영 현황

| 결정 | 내용 | 반영 문서 |
|---|---|---|
| URL 교체 | escape-the-lecture.axenior.kr v1→v2 | 07 기술스택 배포 섹션 |
| 에셋 | 오픈소스 픽셀 팩 (Sprout Lands + LPC) | 06 에셋계획 |
| 언어 | 한국어 기본, 영어 토글 추후 | 05 PROF_LINES, 07 i18n 구조 |

---

## 3. v1 vs v2 핵심 차이

| 항목 | v1 | v2 |
|---|---|---|
| 교수 AI | 타이머만 (순찰 없음) | 동일 (연단 고정 확인됨) |
| TA | 없음 | 1~4명, 시야 콘, 아일 순찰 |
| 친구 | 1종류 (1회 사용) | 3종류 (GOOD/SLEEPING/SNITCH), 2회 제한 |
| 출구 | period 5에만 앞문 | 매 교시마다 다른 출구 1개 |
| UI | HTML DOM + Gowun Dodum | 픽셀 RPG UI + Press Start 2P/Galmuri11 |
| 에셋 | 100% 런타임 생성 | 오픈소스 팩 + 런타임 생성 혼용 |
| 코드 구조 | 단일 index.html 1,480줄 | TypeScript 모듈 분리 |
| 배포 | (GitHub Pages 미사용) | escape-the-lecture.axenior.kr |

---

## 4. Phase 4 구현 순서 (P0 → P3)

### P0 — 게임 동작 최소 조건 (우선 구현)

```
1. Bun + Phaser 3.88 + TypeScript 프로젝트 초기화
2. BootScene + PreloadScene (텍스처 1회 로드)
3. TitleScene (레트로 픽셀 UI)
4. GameScene period=1: 타일맵 + 플레이어 드래그
5. 교수 lecture/watch AI (연단 고정)
6. MOVE/STOP 페이즈 + 게임오버/클리어 기본
```

### P1 — 5교시 + 출구 시스템

```
7. PeriodConfig 5교시 데이터 작성
8. 동적 출구 시스템 (교시별 단일 출구)
9. PeriodTransitionScene
10. ResultScene
```

### P2 — TA + 친구 시스템

```
11. TA 엔티티 + 시야 콘 렌더링
12. TA 순찰 경로 (period 2~5)
13. GoodFriend (A타입+B타입) + SleepingFriend + SnitchFriend
14. 친구 도움 카운터 HUD
```

### P3 — 레트로 완성도

```
15. Sprout Lands / LPC 에셋 교체 (런타임 → 파일)
16. Galmuri11 한국어 픽셀 폰트 적용
17. 픽셀 RPG 말풍선 고도화
18. 튜토리얼 팝업 (1교시)
19. 교수 특별 이벤트 "뒤에 학생 어디가요?"
20. 서빙 스크립트 + PM2 + Traefik 배포
```

---

## 5. Phase 4 진입 체크리스트

- [x] 사용자 스펙 (#2611~#2613) 수신 및 반영
- [x] URL 결정: escape-the-lecture.axenior.kr 교체
- [x] 에셋 결정: 오픈소스 픽셀 팩 (Sprout Lands + LPC)
- [x] 언어 결정: 한국어 기본
- [x] 교수 순찰 없음 확정
- [x] 친구 3종 확정 (GOOD/SLEEPING/SNITCH)
- [x] TA 시야 콘 방향 확정
- [x] 동적 출구 (라운드당 1개) 확정
- [ ] **사용자 GO 사인** ← 이 한 가지만 남음

---

## 6. 예상 작업량

| Phase | 주요 내용 | 예상 워커 |
|---|---|---|
| P0 | 프로젝트 초기화 + 1교시 기본 | 2명 × 2시간 |
| P1 | 5교시 + 출구 시스템 | 3명 × 2시간 |
| P2 | TA 시야 콘 + 친구 3종 | 3명 × 2시간 |
| P3 | 에셋 교체 + 완성도 | 2명 × 2시간 |
| E2E | 전체 시나리오 테스트 | 1명 × 1시간 |

**총 예상**: ~10~11 워커-시간
