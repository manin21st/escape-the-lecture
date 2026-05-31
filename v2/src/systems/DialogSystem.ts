import Phaser from 'phaser';
import { PAL, FONTS } from '../constants';
import type { BubbleStyle } from '../types';

const DEFAULT_STYLE: Required<BubbleStyle> = {
  borderColor: PAL.uiBorder,
  bgColor:     PAL.uiInner,
  fontSize:    '13px',
  font:        FONTS.body,
  tailDir:     'down',
};

class DialogBubble {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private killTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.bg = scene.add.graphics();
    this.label = scene.add.text(0, 0, '', {
      fontFamily: FONTS.body,
      fontSize: '13px',
      color: '#2c1a0a',
      wordWrap: { width: 160 },
    }).setOrigin(0.5);

    this.container = scene.add.container(0, 0, [this.bg, this.label]).setDepth(100).setVisible(false);
  }

  show(x: number, y: number, text: string, style: BubbleStyle = {}, duration = 2500): void {
    const s = { ...DEFAULT_STYLE, ...style };
    this.label.setStyle({ fontFamily: s.font, fontSize: s.fontSize, color: '#2c1a0a' });
    this.label.setText(text);

    const w = Math.max(this.label.width + 20, 80);
    const h = this.label.height + 14;
    const hx = -w / 2;
    const hy = -h;

    this.bg.clear();
    this.bg.fillStyle(s.bgColor, 1);
    this.bg.fillRect(hx, hy, w, h);
    this.bg.lineStyle(2, s.borderColor);
    this.bg.strokeRect(hx, hy, w, h);
    // Tail
    this.bg.fillStyle(s.bgColor, 1);
    this.bg.fillTriangle(
      -4, 0,
       4, 0,
       0, 6,
    );
    this.bg.lineStyle(2, s.borderColor);
    this.bg.strokeTriangle(-4, 0, 4, 0, 0, 6);

    this.label.setPosition(0, hy + h / 2);
    this.container.setPosition(x, y).setVisible(true);

    if (this.killTimer) { this.killTimer.remove(); this.killTimer = null; }
    this.killTimer = this.container.scene.time.delayedCall(duration, () => this.hide());
  }

  hide(): void {
    this.container.setVisible(false);
    this.killTimer = null;
  }

  get isAvailable(): boolean {
    return !this.container.visible;
  }

  destroy(): void {
    this.container.destroy();
  }
}

export class DialogSystem {
  private pool: DialogBubble[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    for (let i = 0; i < 6; i++) {
      this.pool.push(new DialogBubble(scene));
    }
  }

  show(x: number, y: number, text: string, style: BubbleStyle = {}, duration = 2500): void {
    const bubble = this.pool.find(b => b.isAvailable) ?? this.pool[0];
    bubble.show(x, y, text, style, duration);
  }

  destroy(): void {
    for (const b of this.pool) b.destroy();
  }
}
