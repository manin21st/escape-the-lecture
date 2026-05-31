---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# 픽셀 퍼펙트 렌더 설정

## 1. 목표

| 항목 | 목표 |
|---|---|
| 기준 해상도 | 640×512 (20×16 타일, TILE=32) |
| 배율 | 정수 배율만 허용 (1×, 2×, 3×) |
| HiDPI | devicePixelRatio 반영 없이 integer scale |
| 안티앨리어싱 | 완전 비활성 |
| 텍스처 필터 | NEAREST (픽셀 경계 선명) |

---

## 2. Phaser 게임 설정

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 512,
  backgroundColor: '#f5ebd6',
  pixelArt: true,           // roundPixels + NEAREST 필터 자동 적용
  antialias: false,
  render: {
    antialias: false,
    antialiasGL: false,
    pixelArt: true,
    roundPixels: true,
    powerPreference: 'default',
  },
  scale: {
    mode: Phaser.Scale.FIT,          // 컨테이너에 맞게 확대
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 512,
    // 정수 배율로 스냅 (선택)
    // zoom: Phaser.Scale.MAX_ZOOM,  // 브라우저 창 크기에 맞는 최대 정수배
  },
  scene: [BootScene, PreloadScene, TitleScene, GameScene, PeriodTransitionScene, ResultScene],
};
```

---

## 3. BootScene 픽셀 퍼펙트 초기화

```typescript
class BootScene extends Phaser.Scene {
  create() {
    // WebGL 텍스처 필터를 NEAREST로 강제
    if (this.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      // 기존 텍스처 + 미래 텍스처 모두 NEAREST
      this.renderer.on('setgameobjectblendmode', () => {});
      // Global texture filter — Phaser 3.60+
      this.textures.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // CSS image-rendering 강제 (canvas 요소에 직접)
    const canvas = this.sys.game.canvas;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = 'crisp-edges'; // Firefox fallback

    this.scene.start('PreloadScene');
  }
}
```

---

## 4. 스프라이트 배치 규칙

픽셀 퍼펙트를 유지하려면 게임 오브젝트 좌표가 정수여야 한다.

```typescript
// 올바른 방법
sprite.setPosition(Math.round(x), Math.round(y));

// Phaser roundPixels가 켜져 있어도 tween 보간값이 소수일 수 있음
// update()에서 위치 보정:
player.x = Math.round(player.x);
player.y = Math.round(player.y);
```

### 타일 좌표 → 픽셀 좌표 변환

```typescript
const TILE = 32;

function tileToPixel(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * TILE + TILE / 2,   // 타일 중심
    y: tileY * TILE + TILE / 2,
  };
}
```

---

## 5. 런타임 Graphics vs. 스프라이트시트 비교

v1은 모든 텍스처를 Phaser `Graphics`로 런타임 생성했다. v2에서는 두 가지를 혼용한다.

| 방식 | 사용 시기 | 장점 | 단점 |
|---|---|---|---|
| 런타임 Graphics | 타일맵 (floor, wall, desk 등) | 코드만으로 해상도 무관 | 씬 초기화 시간 |
| 스프라이트시트 (PNG) | 캐릭터, 아이템 | 애니메이션 프레임 가능 | 별도 파일 필요 |

**v2 결정**: 타일 텍스처는 런타임 생성 유지 (외부 에셋 최소화), 캐릭터는 스프라이트시트 or 런타임 생성 (에셋 계획 문서 참조).

---

## 6. 화면 크기별 스케일 동작

| 브라우저 창 | scale.mode=FIT 동작 | 배율 예시 |
|---|---|---|
| 640×512 | 1× | 정확히 원본 |
| 1280×1024 | 2× | 정수 배율 유지 |
| 1920×1080 | ~1.9×(비정수) | FIT이면 비정수도 허용 |

**정수 배율만 강제하려면** `zoom: Phaser.Scale.MAX_ZOOM` 사용 또는 커스텀 resize 리스너에서 `Math.floor` 적용.

```typescript
// 커스텀 정수 배율 강제
this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
  const intZoom = Math.max(1, Math.floor(
    Math.min(window.innerWidth / 640, window.innerHeight / 512)
  ));
  this.scale.setZoom(intZoom);
});
```
