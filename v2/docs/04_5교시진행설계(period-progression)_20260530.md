---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# 5교시 진행 설계

## 1. 전체 구조

```typescript
interface PeriodConfig {
  period: number;
  label: string;
  subject: string;

  // 페이즈 타이밍
  lectureTime: number;   // MOVE 지속 시간 (s)
  watchTime: number;     // STOP 지속 시간 (s)
  suspChance: number;    // 의심 이벤트 확률

  // 엔티티
  taCount: number;       // 조교 수
  friendTypes: FriendType[];   // 'good' | 'sleeping' | 'snitch'
  friendUseCount: number;      // 친구 도움 총 횟수 (HUD 표시)

  // 출구 (단 하나)
  exitTile: TilePoint;
  exitLabel: string;     // HUD 출구 표시 (한국어)

  // 대사
  lectureLines: string[];
}
```

---

## 2. 교시별 상세 설정

### 1교시 — 알고리즘 입문 (튜토리얼)

```
난이도: ★☆☆☆☆
TA 수: 0개
친구: [sleeping, good] — sleeping 먼저 클릭해도 효과 없음 (스펙 경험)
친구 도움: 2/2
출구: 뒷문 (플레이어 근처) — 튜토리얼용
suspChance: 0%

lectureTime: 5.5s  watchTime: 1.8s
```

**특이사항**:
- 첫 번째 WATCH 전 튜토리얼 팝업: "교수님이 돌아봤어요! 멈추세요!"
- SLEEPING 친구 클릭 시 "zzzz..." 경험으로 친구 종류 인식

---

### 2교시 — 자료구조

```
난이도: ★★☆☆☆
TA 수: 1개 (오른쪽 아일 순찰)
친구: [good, sleeping]
친구 도움: 2/2
출구: 플레이어에서 더 먼 곳 (중간 문)
suspChance: 0%

lectureTime: 4.5s  watchTime: 2.1s
```

**특이사항**:
- 첫 TA 등장 — 시야 콘 시각적으로 보임 (yellow)
- "TA를 조심하세요!" 교시 입장 배너

---

### 3교시 — 동적 프로그래밍

```
난이도: ★★★☆☆
TA 수: 2개 (양쪽 아일 순찰)
친구: [good, sleeping, snitch]  ← SNITCH 첫 등장
친구 도움: 2/2
출구: 반대편 (교실 건너편)
suspChance: 0%

lectureTime: 3.8s  watchTime: 2.4s
```

**특이사항**:
- SNITCH 친구 도입 — 클릭 시 "교수님! 누가 나가려 해요!" 위험
- 2개 TA가 교차 순찰 → 동시에 시야가 교차하는 타이밍 파악 필요

---

### 4교시 — 그래프 이론

```
난이도: ★★★★☆
TA 수: 3개 (전체 아일 커버)
친구: [good, sleeping, snitch]
친구 도움: 2/2
출구: TA가 순찰하는 통로 근처
suspChance: 30%

lectureTime: 3.2s  watchTime: 2.6s
```

**특이사항**:
- 교수 special event (30%): "뒤에 학생, 어디 가요?" → 빨간 플래시 + WATCH 1.5배 연장
- 3 TA 순찰로 안전 이동 타이밍이 짧음

---

### 5교시 — 마지막 강의

```
난이도: ★★★★★
TA 수: 4개 (교실 전체 감시)
친구: [good, sleeping, snitch, snitch]  ← snitch 2명
친구 도움: 2/2 (snitch 실수 확률 높음)
출구: 교수 연단 근처 앞문 (교실 전체 가로질러야)
suspChance: 30%

lectureTime: 3.0s  watchTime: 2.4s
```

**특이사항**:
- 출구가 교수 바로 옆 — LECTURE 타이밍에만 접근 가능
- TA 4개가 전 구역 커버 → 친구 B타입(TA 질문 유도) 필수
- 4 TA 순찰이 빨라짐 (patrolSpeed +20%)

---

## 3. 동적 출구 시스템 (스펙 #2613)

> **원칙**: 라운드당 출구는 **단 하나**. 앞문과 뒷문이 동시에 열리지 않음.

| period | 출구 위치 | HUD 표시 | 이유 |
|--------|---------|---------|-----|
| 1 | 뒷문 (플레이어 근처) | "🚪 뒷문" | 튜토리얼 — 짧은 이동 |
| 2 | 중간 옆문 | "🚪 옆문" | 거리 늘어남 |
| 3 | 반대편 앞 측면문 | "🚪 앞 옆문" | 교실 가로질러야 |
| 4 | 뒷문 (TA 감시 중) | "🚪 뒷문⚠" | 타이밍 필요 |
| 5 | 앞문 (교수 옆) | "🚪 앞문!" | 최고 난이도 |

### 출구 타일 렌더링

```
활성 출구: 초록 문 + 반짝임(tween alpha 0.7↔1.0)
          HUD에 출구 방향 표시
비활성 문: 일반 벽으로 렌더 (출구 아님을 시각화)
```

---

## 4. TA 배치 패턴

| period | TA 수 | 배치 |
|--------|-------|------|
| 1 | 0 | 없음 |
| 2 | 1 | 오른쪽 아일 (row 4~14, col 17) |
| 3 | 2 | 양쪽 아일 (col 17 + col 1) |
| 4 | 3 | 양쪽 아일 + 중간 가로 (row 10) |
| 5 | 4 | 모든 주요 아일 커버 |

### TA 순찰 경로 예시 (2교시, 오른쪽 아일)

```typescript
const TA_PATROL_P2: TilePoint[] = [
  { x: 17, y: 4 },
  { x: 17, y: 8 },
  { x: 17, y: 12 },
  { x: 17, y: 8 },   // 왕복
];
```

---

## 5. 난이도 커브

```
       난이도
  ★★★★★ │                              ╔══╗
  ★★★★  │                       ╔═══╗╝  
  ★★★   │               ╔════╗╝       
  ★★    │        ╔═════╝               
  ★     │  ╔════╝                       
        └──1──────2──────3──────4──────5── 교시
```

| 요인 | 1→2 | 2→3 | 3→4 | 4→5 |
|---|---|---|---|---|
| lectureTime 감소 | -1.0s | -0.7s | -0.6s | -0.2s |
| TA 수 증가 | 0→1 | 1→2 | 2→3 | 3→4 |
| SNITCH 등장 | ✗ | ✗ | O | O (2명) |
| suspicion | ✗ | ✗ | ✗ | O (30%) |
| 출구 이동 거리 | 가까움 | 중간 | 멀음 | 중간 | 최대 |

---

## 6. 교시 클리어 / 실패 조건

### 클리어
- 플레이어가 해당 교시의 활성 EXIT 타일 도달

### 실패
- `watch/suspicion` 페이즈 중 이동 감지 (교수)
- TA 시야 콘에 플레이어 진입 (`visionState = 'detected'`)

### 특수 실패: SNITCH 이벤트
- SNITCH 클릭 시 즉시 게임오버 아님
- 교수 suspicion 강화 + WATCH 시간 연장 → 실패 확률 상승
