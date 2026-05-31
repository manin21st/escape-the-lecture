---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# 엔티티 모델

## 1. 엔티티 목록

| 클래스 | 역할 | 비고 |
|---|---|---|
| Player | 플레이어 캐릭터 | 학생들 사이에 숨어 있음 |
| Professor | 교수 NPC | **연단 고정, 절대 순찰 없음** |
| TA (Teaching Assistant) | 조교 NPC | 주 스텔스 위협, 시야 콘 |
| GoodFriend | 선량한 친구 NPC | 교수/TA에게 질문 유도 |
| SleepingFriend | 졸린 친구 NPC | 클릭해도 효과 없음 |
| SnitchFriend | 고자질 친구 NPC | 클릭 시 위험 증가 |
| BackgroundNPC | 배경 학생 | 장식, 필기 bob 애니메이션 |
| DialogBubble | 말풍선 | Object Pool, 픽셀 RPG 스타일 |

---

## 2. Player

```typescript
class Player extends Phaser.GameObjects.Sprite {
  tileX: number;
  tileY: number;
  isMoving: boolean;
  dragPath: TilePoint[];
  speed: number = 160;         // px/s (살짝 chunky한 느낌)

  // 상태
  isCaught: boolean = false;
  isInGrace: boolean = false;  // STOP 전환 0.35s 유예

  update(dt: number): void;
  addPath(points: TilePoint[]): void;
  clearPath(): void;
  snapToTile(): void;
}
```

### 비주얼 방침 (스펙 #2611)

- 다른 학생 NPC와 **거의 동일한 외형** (은폐 느낌)
- 미세하게 구분: 배낭 색상, 머리 스타일
- 프레임 4개: 착석 / 걷기A / 걷기B / 잡힘
- 걷기는 **저프레임(8fps)** 으로 레트로 감각 유지

---

## 3. Professor

> **핵심 제약 (스펙 #2611)**: 교수는 연단 고정. 절대 순찰하지 않음.

```typescript
class Professor extends Phaser.GameObjects.Sprite {
  // 위치 고정 (period 5까지 연단)
  readonly tileX: number = 14;
  readonly tileY: number = 3;

  state: 'lecture' | 'watch' | 'suspicion' | 'caught';

  // 타이밍 (PeriodConfig에서 주입)
  lectureTime: number;   // MOVE 지속 시간
  watchTime: number;     // STOP 지속 시간

  update(dt: number): void;
}
```

### 교수 AI 상태 전이

```
lecture ──(lectureTime경과)──► watch
   ▲                              │
   └──────(watchTime경과)─────────┘
              │
         (WATCH 중 플레이어 이동)
              │
          suspicion (4교시+ only)
              │
         (계속 이동)
              │
          caught → 게임오버
```

### 교수 비주얼 (스펙 #2611)

```
외형: 안경 + 흰/회색 머리 + 검은 정장 (클래식 RPG NPC)
크기: 학생보다 약간 큰 픽셀 캐릭터
상태:
  lecture: 뒤돌아 PPT 봄
  watch:   앞을 봄 (학생 방향)
  suspicion: 앞을 봄 + 빨간 틴트 + 눈썹 강조
```

### 교수 대사 (한국어, RPG 말풍선)

```
강의 중:
  "이 부분 시험에 나옵니다"
  "집중해주세요"
  "다음 슬라이드로 넘어갈게요"
  "과제는 다음 주까지입니다"
  "뒤에서도 화면 잘 보이나요?"

의심 시:
  "뒤에 학생, 어디 가요?"
  "수업 중에 어딜 가요!"
  "잠깐, 거기 멈춰요!"
```

---

## 4. TA (Teaching Assistant) — 주 스텔스 위협

> **스펙 #2612~#2613**: 아일 순찰, 시야 콘 (yellow/orange/red), 플레이어 감지 시 게임오버.

```typescript
class TA extends Phaser.GameObjects.Sprite {
  tileX: number;
  tileY: number;

  // 순찰
  patrolPath: TilePoint[];
  patrolSpeed: number = 55;    // px/s
  facingAngle: number;         // 현재 바라보는 방향 (라디안)
  patrolIdx: number = 0;

  // 시야 콘
  visionRange: number = 4;     // 타일
  visionAngle: number = 90;    // 도
  visionState: 'normal' | 'suspicious' | 'detected';

  // 시야 콘 그래픽 (매 프레임 갱신)
  visionGraphic: Phaser.GameObjects.Graphics;

  update(dt: number): void;
  drawVisionCone(): void;
  checkPlayerInCone(player: Player): boolean;
}
```

### TA 시야 콘 색상

| 상태 | 색상 | 의미 |
|---|---|---|
| `normal` | 노란색 (0xffff44, alpha 0.22) | 순찰 중, 일반 시야 |
| `suspicious` | 주황색 (0xff9900, alpha 0.35) | 플레이어 근처 감지 |
| `detected` | 빨간색 (0xff3300, alpha 0.5) | 플레이어 직접 발견 → 게임오버 |

### TA 시야 콘 렌더링

```typescript
drawVisionCone(): void {
  const g = this.visionGraphic;
  g.clear();

  const color = this.visionState === 'normal'      ? 0xffff44
              : this.visionState === 'suspicious'   ? 0xff9900
              : 0xff3300;
  const alpha = this.visionState === 'normal'      ? 0.22
              : this.visionState === 'suspicious'   ? 0.35
              : 0.50;

  const range = this.visionRange * TILE;
  const halfAngle = (this.visionAngle / 2) * DEG_TO_RAD;

  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(this.x, this.y);

  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const a = this.facingAngle - halfAngle + (i / steps) * (this.visionAngle * DEG_TO_RAD);
    g.lineTo(this.x + Math.cos(a) * range, this.y + Math.sin(a) * range);
  }
  g.closePath();
  g.fillPath();
}
```

### TA 비주얼

```
외형: 교수보다 작고 젊음 (픽셀 RPG NPC 스타일)
      클립보드 들고 있음, 대학원생 느낌
크기: 학생 NPC와 동일
상태:
  순찰: 걷기 애니메이션 (8fps)
  의심: 눈 크게 + 말풍선 "어?"
  발견: 빨간 틴트 + 말풍선 "잡았다!"
```

---

## 5. Friend 시스템 (3종류, 스펙 #2613)

> 핵심: 친구는 **GOOD / SLEEPING / SNITCH** 3가지. 사용 횟수 제한.

### 5.1 GoodFriend

```typescript
class GoodFriend extends Phaser.GameObjects.Sprite {
  useCount: number;         // 남은 사용 횟수 (기본 2)
  isAvailable: boolean;

  // 클릭 시 랜덤으로 둘 중 하나:
  // A) 교수에게 질문 → professor LECTURE 모드 강제 (교수 방향 봄 차단)
  // B) 인근 TA에게 질문 → 해당 TA가 친구 쪽으로 이동 (통로 개방)
  onClick(): void;
}
```

**결과 A — 교수 질문**:
```
[친구 말풍선]: "교수님, 질문 있습니다!"
→ 교수가 친구 방향으로 돌아봄 (LECTURE 지속 시간 +3~5초)
→ MOVE 기회 확장
```

**결과 B — TA 질문**:
```
[친구 말풍선]: "조교님, 과제 어디에 내요?"
→ 가장 가까운 TA가 친구 쪽으로 3~4타일 이동
→ 해당 통로 일시 개방
```

### 5.2 SleepingFriend

```typescript
class SleepingFriend extends Phaser.GameObjects.Sprite {
  // 클릭해도 아무것도 안 일어남
  // 말풍선: "zzzz..."
  onClick(): void {
    this.showBubble("zzzz...");  // 효과 없음
  }
}
```

비주얼: 머리 숙임 + 작은 z 아이콘 반복 팝업

### 5.3 SnitchFriend

```typescript
class SnitchFriend extends Phaser.GameObjects.Sprite {
  // 클릭 시 교수에게 고자질
  // - 교수 suspicion 즉시 활성
  // - 다음 STOP 시간 +1.5배
  // - 4교시+ 빨간 플래시
  onClick(): void {
    this.showBubble("교수님! 누가 나가려 해요!");
    this.scene.phaseManager.triggerSnitchEvent();
  }
}
```

비주얼: 배신자 느낌 — 눈이 찡긋, 말풍선 빨간 테두리

### 5.4 친구 UI — 사용 횟수 표시

```
HUD에: 친구 도움 ❤️❤️ / 2
사용 시: ❤️🖤 / 2 → 1회 남음
전부 소진: 🖤🖤 / 0
```

---

## 6. DialogBubble (Object Pool)

픽셀 RPG 스타일 말풍선.

```typescript
class DialogBubble extends Phaser.GameObjects.Container {
  background: Phaser.GameObjects.Graphics;  // 픽셀 테두리 (rounded X, sharp corners)
  tail: Phaser.GameObjects.Graphics;        // 말풍선 꼬리 (아래 삼각형)
  text: Phaser.GameObjects.Text;            // VT323 or Press Start 2P

  show(x: number, y: number, text: string, style?: BubbleStyle): void;
  hide(): void;
  autoHide(ms: number): void;
}

interface BubbleStyle {
  borderColor: number;   // 기본: 0x4a2c1a (갈색)
  bgColor: number;       // 기본: 0xfff8e0 (양피지)
  fontSize: string;      // 기본: '14px'
  font: string;          // 'VT323' or 'Press Start 2P'
}
```

**픽셀 말풍선 렌더링 원칙**:
- 모서리: sharp (roundPixels 없음)
- 테두리: 2~3px 단색 픽셀 선
- 그림자: 없음 (레트로 스타일)
- 꼬리: 픽셀 삼각형 (3~4px 계단)
