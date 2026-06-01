import Phaser from 'phaser';
import { PAL } from '../constants';

// Student/player/TA sprite: 24×32
const SW = 24;
const SH = 32;

// Professor sprite: 32×48 (reference: gray hair, glasses, black suit)
const PW = 32;
const PH = 48;

function drawStudent(
  g: Phaser.GameObjects.Graphics,
  skin: number,
  hair: number,
  body: number,
  pants: number,
): void {
  // Shoes
  g.fillStyle(0x1a1209);
  g.fillRect(4, 28, 7, 4);
  g.fillRect(13, 28, 7, 4);

  // Pants/legs
  g.fillStyle(pants);
  g.fillRect(5, 21, 5, 9);
  g.fillRect(14, 21, 5, 9);

  // Body
  g.fillStyle(body);
  g.fillRect(5, 12, 14, 10);

  // Arms
  g.fillStyle(body);
  g.fillRect(2, 12, 4, 9);
  g.fillRect(18, 12, 4, 9);

  // Hands
  g.fillStyle(skin);
  g.fillRect(2, 20, 4, 3);
  g.fillRect(18, 20, 4, 3);

  // Neck
  g.fillStyle(skin);
  g.fillRect(10, 9, 4, 4);

  // Head
  g.fillStyle(skin);
  g.fillRect(7, 3, 10, 8);

  // Hair
  g.fillStyle(hair);
  g.fillRect(7, 2, 10, 4);
  g.fillRect(6, 3, 2, 5);
  g.fillRect(18, 3, 2, 5);

  // Eyes
  g.fillStyle(0x2c1a0a);
  g.fillRect(9, 7, 2, 2);
  g.fillRect(13, 7, 2, 2);
}

function drawProfessor(g: Phaser.GameObjects.Graphics): void {
  const skin     = PAL.profSkin;  // 0xf0c89c
  const hairLt   = 0xb8b8b8;     // silver-gray
  const hairDk   = 0x888888;     // darker gray
  const suit     = 0x2c2c3a;     // dark navy/black suit
  const shirt    = 0xf8f8f0;     // white shirt
  const tie      = 0x882233;     // dark red tie

  // Shoes
  g.fillStyle(0x111111);
  g.fillRect(9, 44, 8, 4);
  g.fillRect(16, 44, 8, 4);

  // Pants
  g.fillStyle(suit);
  g.fillRect(9, 34, 6, 12);
  g.fillRect(17, 34, 6, 12);

  // Belt
  g.fillStyle(0x111111);
  g.fillRect(9, 33, 14, 2);

  // Suit jacket — body
  g.fillStyle(suit);
  g.fillRect(5, 20, 22, 14);

  // White shirt center strip
  g.fillStyle(shirt);
  g.fillRect(13, 20, 6, 13);

  // Lapels cover shirt at sides
  g.fillStyle(suit);
  g.fillRect(5, 20, 8, 8);
  g.fillRect(19, 20, 8, 8);

  // Tie
  g.fillStyle(tie);
  g.fillRect(14, 22, 4, 10);
  g.fillRect(13, 22, 6, 2); // knot

  // Arms
  g.fillStyle(suit);
  g.fillRect(2, 20, 5, 13);
  g.fillRect(25, 20, 5, 13);

  // Cuffs (white)
  g.fillStyle(shirt);
  g.fillRect(2, 31, 5, 2);
  g.fillRect(25, 31, 5, 2);

  // Hands
  g.fillStyle(skin);
  g.fillRect(2, 33, 5, 4);
  g.fillRect(25, 33, 5, 4);

  // Collar (white)
  g.fillStyle(shirt);
  g.fillRect(12, 17, 8, 5);

  // Neck
  g.fillStyle(skin);
  g.fillRect(13, 17, 6, 4);

  // Face
  g.fillStyle(skin);
  g.fillRect(9, 7, 14, 11);

  // Ears
  g.fillStyle(skin);
  g.fillRect(7, 10, 3, 5);
  g.fillRect(22, 10, 3, 5);

  // Hair top (silver)
  g.fillStyle(hairLt);
  g.fillRect(9, 3, 14, 6);

  // Hair sides
  g.fillStyle(hairLt);
  g.fillRect(8, 7, 3, 6);
  g.fillRect(21, 7, 3, 6);

  // Hair darker highlight
  g.fillStyle(hairDk);
  g.fillRect(10, 3, 12, 3);

  // Glasses — black frames
  g.fillStyle(0x1a1a1a);
  g.fillRect(10, 10, 5, 5);  // left frame
  g.fillRect(17, 10, 5, 5);  // right frame
  g.fillRect(15, 12, 2, 2);  // bridge

  // Glass lenses (slightly blue tint)
  g.fillStyle(0xd8e8f0);
  g.fillRect(11, 11, 3, 3);
  g.fillRect(18, 11, 3, 3);

  // Eyes through glasses
  g.fillStyle(0x2c1a0a);
  g.fillRect(11, 12, 2, 2);
  g.fillRect(18, 12, 2, 2);

  // Mouth (neutral line)
  g.fillStyle(0x9a6050);
  g.fillRect(12, 16, 8, 1);
}

export function generateCharTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ add: false });

  // --- BACKGROUND NPC (generic student) ---
  g.clear();
  drawStudent(g, PAL.npcSkin, 0x6b4423, 0x8888aa, 0x6666aa);
  g.generateTexture('npc', SW, SH);

  // --- PLAYER (green backpack + red cap) ---
  g.clear();
  drawStudent(g, PAL.npcSkin, 0x4a2c1a, 0x5577aa, 0x4455aa);
  // Green backpack on left side
  g.fillStyle(PAL.playerBag);
  g.fillRect(1, 11, 5, 10);
  g.fillStyle(0x4a8a3a);
  g.fillRect(1, 11, 5, 1); // strap top
  g.fillRect(1, 20, 5, 1); // strap bottom
  // Red cap (covers hair area)
  g.fillStyle(0xcc2244);
  g.fillRect(7, 0, 10, 5);  // cap crown
  g.fillRect(5, 4, 14, 2);  // cap brim (wider than head)
  g.fillStyle(0x991133);
  g.fillRect(5, 5, 14, 1);  // brim underside shadow
  g.generateTexture('player', SW, SH);

  // --- PROFESSOR (32×48, gray hair, glasses, black suit) ---
  g.clear();
  drawProfessor(g);
  g.generateTexture('professor', PW, PH);

  // --- TA (teal hoodie, clipboard) ---
  g.clear();
  drawStudent(g, PAL.profSkin, 0x2c1a0a, PAL.taHoodie, 0x2c3a5a);
  // Clipboard (right side)
  g.fillStyle(0xd4a574);
  g.fillRect(19, 10, 6, 9);
  g.fillStyle(0xf0f0e0);
  g.fillRect(20, 12, 4, 1);
  g.fillRect(20, 14, 4, 1);
  g.fillRect(20, 16, 3, 1);
  g.fillStyle(0x4a2c1a);
  g.strokeRect(19, 10, 6, 9);
  g.generateTexture('ta', SW, SH);

  // --- GOOD FRIEND (warm orange hair, heart badge) ---
  g.clear();
  drawStudent(g, PAL.npcSkin, 0xcc6622, 0x4466aa, 0x334488);
  g.fillStyle(PAL.friendHeart);
  g.fillRect(5, 13, 3, 3);
  g.fillRect(6, 12, 2, 2);
  g.generateTexture('friend_good', SW, SH);

  // --- SLEEPING FRIEND (Z bubbles) ---
  g.clear();
  drawStudent(g, PAL.npcSkin, 0x8888aa, 0x667788, 0x556677);
  // Head drooped slightly
  g.fillStyle(PAL.npcSkin);
  g.fillRect(7, 9, 10, 3); // cheek on desk effect
  g.fillStyle(0xffffff);
  g.fillRect(19, 4, 4, 4);
  g.fillRect(21, 1, 3, 3);
  g.fillStyle(0x888888);
  g.fillRect(20, 5, 2, 2);
  g.fillRect(22, 2, 1, 1);
  g.generateTexture('friend_sleeping', SW, SH);

  // --- SNITCH FRIEND (red tones, angry brows) ---
  g.clear();
  drawStudent(g, 0xffb8a0, 0xcc2222, 0xaa3333, 0x882222);
  // Angry brows
  g.fillStyle(0x882222);
  g.fillRect(9, 5, 3, 1);
  g.fillRect(13, 6, 3, 1);
  // Small angry mouth
  g.fillStyle(0x662222);
  g.fillRect(10, 9, 4, 1);
  g.generateTexture('friend_snitch', SW, SH);

  g.destroy();
}
