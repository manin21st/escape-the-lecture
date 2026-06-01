import Phaser from 'phaser';
import { TILE, PAL } from '../constants';
import type { FriendType, TilePoint } from '../types';
import type { DialogSystem } from '../systems/DialogSystem';
import type { PhaseManager } from '../systems/PhaseManager';
import { DIALOGS } from '../data/dialogs';

export class Friend {
  sprite: Phaser.GameObjects.Image;
  readonly type: FriendType;
  readonly tile: TilePoint;
  useCount: number;

  private scene: Phaser.Scene;
  private hitzone: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, tile: TilePoint, type: FriendType, useCount: number) {
    this.scene = scene;
    this.tile = tile;
    this.type = type;
    this.useCount = useCount;

    const textureKey = type === 'good' ? 'friend_good'
      : type === 'sleeping' ? 'friend_sleeping'
      : 'friend_snitch';

    this.sprite = scene.add.image(
      tile.x * TILE + TILE / 2,
      tile.y * TILE + TILE / 2,
      textureKey,
    ).setDepth(18);

    // Invisible click zone
    this.hitzone = scene.add.rectangle(
      tile.x * TILE + TILE / 2,
      tile.y * TILE + TILE / 2,
      TILE,
      TILE,
      0x000000,
      0,
    ).setDepth(50).setInteractive({ cursor: 'pointer' });
  }

  onClick(
    dialogs: DialogSystem,
    phase: PhaseManager,
    tas: import('./TA').TA[],
    profSprite: Phaser.GameObjects.Image,
    onSnitchEvent: () => void,
    onDecrease: () => void,
  ): void {
    if (this.useCount <= 0) {
      dialogs.show(this.sprite.x, this.sprite.y - 24, DIALOGS.friend.no_uses[0]);
      return;
    }

    this.useCount--;
    onDecrease();

    if (this.type === 'sleeping') {
      const line = DIALOGS.friend.sleeping[Math.floor(Math.random() * DIALOGS.friend.sleeping.length)];
      dialogs.show(this.sprite.x, this.sprite.y - 24, line, { bgColor: 0xd0d8e0 });
      return;
    }

    if (this.type === 'snitch') {
      const line = DIALOGS.friend.snitch[Math.floor(Math.random() * DIALOGS.friend.snitch.length)];
      dialogs.show(this.sprite.x, this.sprite.y - 24, line, { borderColor: PAL.friendSnitch });
      for (const ta of this.getSameAisleTAs(tas)) ta.boostSuspicion(4);
      onSnitchEvent();
      return;
    }

    // Good friend: pause same-aisle TAs; fall back to prof distract if none
    const sameAisleTAs = this.getSameAisleTAs(tas);
    if (sameAisleTAs.length > 0) {
      this.pauseSameAisleTAs(sameAisleTAs, dialogs);
    } else {
      this.doProfDistract(dialogs, phase, profSprite);
    }
  }

  private doProfDistract(
    dialogs: DialogSystem,
    phase: PhaseManager,
    profSprite: Phaser.GameObjects.Image,
  ): void {
    const line = DIALOGS.friend.good_prof[Math.floor(Math.random() * DIALOGS.friend.good_prof.length)];
    dialogs.show(this.sprite.x, this.sprite.y - 24, line);
    phase.forceLecture(4 + Math.random() * 2);
    const profLine = DIALOGS.prof.question[Math.floor(Math.random() * DIALOGS.prof.question.length)];
    this.scene.time.delayedCall(400, () =>
      dialogs.show(profSprite.x, profSprite.y - 28, profLine));
  }

  private getSameAisleTAs(tas: import('./TA').TA[]): import('./TA').TA[] {
    const x = this.tile.x;
    const aisleXs = x <= 6 ? [1, 7] : x <= 12 ? [7, 13] : [13, 18];
    return tas.filter(ta => aisleXs.includes(ta.aisleX));
  }

  private pauseSameAisleTAs(
    sameAisleTAs: import('./TA').TA[],
    dialogs: DialogSystem,
  ): void {
    const line = DIALOGS.friend.good_ta[Math.floor(Math.random() * DIALOGS.friend.good_ta.length)];
    dialogs.show(this.sprite.x, this.sprite.y - 24, line);
    for (const ta of sameAisleTAs) ta.pause(4);
  }

  setOnClick(
    dialogs: DialogSystem,
    phase: PhaseManager,
    tas: import('./TA').TA[],
    profSprite: Phaser.GameObjects.Image,
    onSnitchEvent: () => void,
    onDecrease: () => void,
  ): void {
    this.hitzone.on('pointerdown', () =>
      this.onClick(dialogs, phase, tas, profSprite, onSnitchEvent, onDecrease));
  }

  destroy(): void {
    this.sprite.destroy();
    this.hitzone.destroy();
  }
}
