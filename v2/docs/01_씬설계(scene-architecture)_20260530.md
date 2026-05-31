---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# 씬 아키텍처 설계

## 1. 씬 목록

v2는 6개 씬으로 구성한다.

```
BootScene
  └─ PreloadScene
       └─ TitleScene
            └─ GameScene (period 1~5)
                 ├─ PeriodTransitionScene (교시 사이)
                 └─ GameOverScene / WinScene
```

| 씬 이름 | 역할 | v1 대비 |
|---|---|---|
| BootScene | 기본 설정, 해상도/픽셀 퍼펙트 초기화 | 신규 |
| PreloadScene | 스프라이트시트·JSON 에셋 로드 + 로딩 UI | 신규 |
| TitleScene | 타이틀 화면 | 개선 |
| GameScene | 메인 게임 (교시별 재사용) | 개선 |
| PeriodTransitionScene | 교시 전환 컷씬 (2~3초) | 신규 |
| ResultScene | 최종 클리어 / 게임오버 공통 결과 화면 | 신규 |

---

## 2. 씬 상세 설명

### BootScene

```typescript
// 역할: 최초 1회 실행. 게임 전역 설정.
class BootScene extends Phaser.Scene {
  preload() {
    // 로딩 화면용 최소 에셋 (progress bar 배경)
  }
  create() {
    // 픽셀 퍼펙트 렌더러 설정
    // 스케일 매니저 초기화
    this.scene.start('PreloadScene');
  }
}
```

**책임**:
- `game.renderer.pipelines` 픽셀 퍼펙트 설정
- `ScaleManager` 모드 설정 (FIT or ENVELOP)
- 전역 레지스트리 초기화 (`this.registry.set(...)`)

---

### PreloadScene

```typescript
class PreloadScene extends Phaser.Scene {
  preload() {
    // 스프라이트시트 로드
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
    // ... 기타 에셋
    // 로딩 진행 바
    const bar = this.add.rectangle(...);
    this.load.on('progress', (v) => bar.setScale(v, 1));
  }
  create() {
    // 애니메이션 정의 (전역 캐시)
    this.anims.create({ key: 'player_walk', ... });
    this.scene.start('TitleScene');
  }
}
```

**책임**:
- 모든 에셋 로드 (스프라이트시트, 오디오, JSON 맵)
- Phaser `AnimationManager`에 애니메이션 등록
- 진행 바 UI

---

### GameScene

단일 씬이 period 1~5를 재사용한다 (`scene.restart({ period: N })`).

**서브시스템 구성**:

```
GameScene
  ├─ MapSystem       — 타일맵 + 충돌 레이어
  ├─ EntityManager   — 플레이어, 교수, 조교, 친구, NPC 풀
  ├─ PhaseManager    — move/stop/distract/suspicion/alert 상태머신
  ├─ InputSystem     — 드래그 + 터치 처리
  ├─ HUDPlugin       — 상단/하단 HUD (Phaser DOM Scene)
  └─ DialogSystem    — 말풍선 풀 (Object Pool)
```

---

### PeriodTransitionScene

교시 클리어 후 2초 컷씬. 다음 교시 분위기 예고.

- 클리어 텍스트 + 간단 카드뉴스 스타일 미리보기
- `this.scene.start('GameScene', { period: N + 1 })` 로 이동

---

### ResultScene

게임오버 / 최종 승리 공통 화면.

- 스탯: 클리어 교시 수, 재시도 횟수, 소요 시간
- 버튼: 다시 도전 / 타이틀로 / SNS 공유 (URL)

---

## 3. 씬 전환 다이어그램

```
BootScene ──► PreloadScene ──► TitleScene
                                   │
                            [강의실 입장 버튼]
                                   │
                              GameScene(p=1)
                               │       │
                             WIN     FAIL
                               │       │
                     PeriodTransition  ResultScene(fail)
                               │
                         GameScene(p=2)
                               ...
                         GameScene(p=5)
                               │ WIN
                         ResultScene(clear)
```

---

## 4. 씬 간 데이터 전달

Phaser Registry를 사용해 전역 게임 상태를 공유한다.

```typescript
// 등록 (BootScene)
this.registry.set('gameState', {
  period: 1,
  totalRetries: 0,
  clearedPeriods: [],
  startTime: 0,
});

// 읽기 (모든 씬)
const state = this.registry.get('gameState');

// 씬 시작 인자 (일회성)
this.scene.start('GameScene', { period: 3 });
```
