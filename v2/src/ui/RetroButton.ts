import Phaser from 'phaser';
import { PAL, FONTS } from '../constants';

export class RetroButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    w = 160,
    h = 36,
    color = PAL.moveGreen,
  ) {
    super(scene, x, y);

    this.bg = scene.add.graphics();
    this.drawButton(color, w, h);

    this.label = scene.add.text(0, 0, text, {
      fontFamily: FONTS.body,
      fontSize: '13px',
      color: '#fff8e0',
    }).setOrigin(0.5);

    this.add([this.bg, this.label]);
    scene.add.existing(this);

    this.setSize(w, h).setInteractive({ cursor: 'pointer' });

    this.on('pointerover',  () => this.bg.setAlpha(0.85));
    this.on('pointerout',   () => this.bg.setAlpha(1));
    this.on('pointerdown',  () => this.setScale(0.96));
    this.on('pointerup',    () => this.setScale(1));
  }

  private drawButton(color: number, w: number, h: number): void {
    const hw = w / 2;
    const hh = h / 2;
    const g = this.bg;
    g.clear();
    // Fill
    g.fillStyle(color);
    g.fillRect(-hw, -hh, w, h);
    // Border
    g.lineStyle(3, PAL.uiBorder);
    g.strokeRect(-hw, -hh, w, h);
    // Pixel shadow (bottom-right)
    g.lineStyle(2, 0x2a1a0a);
    g.lineBetween(hw - 1, -hh + 2, hw - 1, hh - 1);
    g.lineBetween(-hw + 2, hh - 1, hw - 1, hh - 1);
  }
}
