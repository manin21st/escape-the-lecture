---
project: escape-the-lecture-v2
type: spec
created: 2026-05-30
updated: 2026-05-30
status: accepted
---

# 기술 스택 및 프로젝트 구조

## 1. 기술 스택

| 항목 | v1 | v2 | 이유 |
|---|---|---|---|
| 런타임 | 단일 HTML CDN | Bun + TypeScript | 모듈화, 타입 안전성 |
| 게임 엔진 | Phaser 3.60 (CDN) | Phaser 3.88 (npm) | 최신 버전 |
| 번들러 | 없음 | Bun bundler | 설치 불필요, 빠름 |
| 언어 | JavaScript | TypeScript 5.x | 인터페이스/enum 활용 |
| 픽셀 폰트 | Gowun Dodum (제거) | Press Start 2P + **Neo 둥근모고딕** + Galmuri11 | 레트로 픽셀 전용, 한글 지원 |
| 배포 | (미운영) | **escape-the-lecture.axenior.kr** (v1 교체) | Traefik 기존 도메인 재사용 |

---

## 2. 디렉토리 구조

```
escape-the-lecture-v2/
├─ docs/                      ← 설계 문서
├─ src/
│   ├─ main.ts                ← Phaser.Game config
│   ├─ constants.ts           ← TILE, COLS, ROWS, PAL_V2, FONTS
│   ├─ types.ts               ← TilePoint, Phase, PeriodConfig, FriendType
│   │
│   ├─ scenes/
│   │   ├─ BootScene.ts
│   │   ├─ PreloadScene.ts
│   │   ├─ TitleScene.ts
│   │   ├─ GameScene.ts
│   │   ├─ PeriodTransitionScene.ts
│   │   └─ ResultScene.ts
│   │
│   ├─ entities/
│   │   ├─ Player.ts
│   │   ├─ Professor.ts
│   │   ├─ TA.ts
│   │   ├─ friends/
│   │   │   ├─ GoodFriend.ts
│   │   │   ├─ SleepingFriend.ts
│   │   │   └─ SnitchFriend.ts
│   │   ├─ BackgroundNPC.ts
│   │   └─ EntityManager.ts
│   │
│   ├─ systems/
│   │   ├─ PhaseManager.ts    ← lecture/watch/suspicion 상태머신
│   │   ├─ InputSystem.ts     ← 드래그 + Bresenham
│   │   ├─ MapSystem.ts       ← 타일맵 빌드
│   │   ├─ DialogSystem.ts    ← 픽셀 말풍선 Object Pool
│   │   └─ VisionSystem.ts    ← TA 시야 콘 판정
│   │
│   ├─ textures/
│   │   ├─ generateTiles.ts   ← 타일 텍스처 런타임 생성
│   │   └─ generateChars.ts   ← 캐릭터 텍스처 런타임 생성 (fallback)
│   │
│   ├─ data/
│   │   ├─ periods.ts         ← PeriodConfig 1~5교시
│   │   ├─ dialogs.ts         ← 한국어 대사 (교수/친구/TA)
│   │   └─ maps.ts            ← buildGrid, 교시별 출구 위치
│   │
│   └─ ui/
│       ├─ HUD.ts             ← 상단/하단 HUD (레트로 픽셀 스타일)
│       ├─ TutorialPopup.ts   ← 1교시 튜토리얼
│       └─ RetroButton.ts     ← 픽셀 버튼 컴포넌트
│
├─ public/
│   └─ index.html
├─ assets/                    ← 오픈소스 픽셀 팩 (다운로드 후)
│   ├─ sprout-lands/
│   ├─ lpc-characters/
│   └─ fonts/galmuri/
├─ package.json
├─ tsconfig.json
├─ build.ts
└─ README.md
```

---

## 3. Phaser 게임 설정 (main.ts)

```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { PeriodTransitionScene } from './scenes/PeriodTransitionScene';
import { ResultScene } from './scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 512,
  backgroundColor: '#d8b88a',
  pixelArt: true,          // roundPixels + NEAREST 필터
  antialias: false,
  render: {
    antialias: false,
    antialiasGL: false,
    pixelArt: true,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 512,
  },
  scene: [BootScene, PreloadScene, TitleScene, GameScene, PeriodTransitionScene, ResultScene],
  parent: 'game-container',
};

new Phaser.Game(config);
```

---

## 4. 레트로 UI 원칙 (스펙 #2611)

> **금지**: 모던 그라디언트, rounded corners, blur, glow, 박스섀도우, 애니메이션 ease curves  
> **필수**: sharp corners, pixel borders, 픽셀 폰트, 레트로 버튼

```typescript
// RetroButton.ts — 픽셀 버튼 기본 스타일
class RetroButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, label: string) {
    super(scene, x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(0x6ba85a);
    bg.fillRect(-60, -14, 120, 28);             // sharp rectangle (no round)
    bg.lineStyle(3, 0x4a2c1a);
    bg.strokeRect(-60, -14, 120, 28);           // pixel border

    // 픽셀 그림자 (오른쪽+아래 2px 어두운 선)
    bg.lineStyle(2, 0x2a1a0a);
    bg.lineBetween(60, -12, 60, 14);            // 오른쪽
    bg.lineBetween(-58, 14, 60, 14);            // 아래

    const text = scene.add.text(0, 0, label, {
      fontFamily: "'Press Start 2P'",
      fontSize: '10px',
      color: '#fff8e0',
    }).setOrigin(0.5);

    this.add([bg, text]);
  }
}
```

---

## 5. 배포 설정

### 5.1 결정사항 (사장님 확정)

> v2가 **escape-the-lecture.axenior.kr** 자리를 교체.  
> v1 (index.html) 은 사라지고 v2 dist/가 서빙됨.

### 5.2 Traefik 설정

기존 `/docker/traefik/dynamic/bhsong-services.yml`에 이미 있는 `escape-the-lecture` 라우터를 새 PM2 서비스로 연결.

```yaml
# 기존 entry 수정 (새 PM2 포트로 변경)
http:
  routers:
    escape-the-lecture:
      rule: "Host(`escape-the-lecture.axenior.kr`)"
      service: escape-the-lecture
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt

  services:
    escape-the-lecture:
      loadBalancer:
        servers:
          - url: "http://localhost:<NEW_PORT>"  # v2 PM2 포트 (결정 필요, 5075 제안)
```

### 5.3 PM2 설정 (ecosystem.config.cjs)

```javascript
module.exports = {
  apps: [{
    name: 'escape-the-lecture-v2',
    script: 'bun',
    args: 'run serve',
    cwd: '/home/deploy/escape-the-lecture-v2',
    env: { PORT: 5075, NODE_ENV: 'production' },
    autorestart: true,
    watch: false,
  }],
};
```

### 5.4 정적 서빙 (serve.ts)

```typescript
// dist/ 정적 파일 서빙
Bun.serve({
  port: process.env.PORT ?? 5075,
  fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(`./dist${path}`);
    return new Response(file);
  },
});
```

### 5.5 빌드 & 배포 순서

```bash
# 1. 빌드
cd /home/deploy/escape-the-lecture-v2
bun run build

# 2. PM2 시작
pm2 start ecosystem.config.cjs
pm2 save

# 3. Traefik dynamic config 수정 (포트 변경)
# /docker/traefik/dynamic/bhsong-services.yml 수정
# (Traefik은 파일 변경 감지 후 자동 reload)

# 4. 확인
curl -I https://escape-the-lecture.axenior.kr
```

---

## 6. 언어 설정

**기본: 한국어** (스펙 결정사항)  
추후: 영어 토글 (i18n 인프라만 준비, 구현은 Phase 5)

```typescript
// data/dialogs.ts 구조
export const DIALOGS: Record<Language, DialogData> = {
  ko: {
    prof_lecture: ["이 부분 시험에 나옵니다", "집중해주세요", ...],
    prof_watch:   [...],
    friend_good:  ["교수님, 질문 있습니다!", ...],
    friend_snitch:["교수님! 누가 나가려 해요!", ...],
    hud_move:     "이동",
    hud_stop:     "정지!",
    hud_exit:     "출구",
    hud_friend:   "친구 도움",
    // ...
  },
  en: {
    // Phase 5에서 채움 (구조만 미리 준비)
  },
};

export type Language = 'ko' | 'en';
export let currentLanguage: Language = 'ko';
```
