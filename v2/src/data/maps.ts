import { TILE, COLS, ROWS } from '../constants';
import type { TileType, TilePoint } from '../types';

const F = 0 as TileType; // FLOOR
const W = 1 as TileType; // WALL
const D = 2 as TileType; // DESK
const A = 3 as TileType; // AISLE
const E = 4 as TileType; // EXIT
const P = 5 as TileType; // PODIUM
const B = 6 as TileType; // BLACKBOARD

// 20×16 classroom layout
// Desk cols: 3, 5, 9, 11, 15, 17  (three 2-column blocks)
// Desk rows: 5, 6, 8, 9, 11, 12   (three 2-row pairs)
// Aisle cols: 1, 7, 13, 18
const DESK_ROWS = new Set([5, 6, 8, 9, 11, 12]);
const DESK_COLS = new Set([3, 5, 9, 11, 15, 17]);
const AISLE_COLS = new Set([1, 7, 13, 18]);

function getTile(r: number, c: number): TileType {
  if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return W;
  if (r === 1) return B;
  if (r <= 3) {
    if (r === 2 && c === 9) return P;
    return F;
  }
  if (r >= 14) return F;
  if (AISLE_COLS.has(c)) return A;
  if (DESK_ROWS.has(r) && DESK_COLS.has(c)) return D;
  return F;
}

function buildBaseGrid(): TileType[][] {
  const grid: TileType[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: TileType[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(getTile(r, c));
    }
    grid.push(row);
  }
  return grid;
}

export function buildGrid(exitTile: TilePoint): TileType[][] {
  const grid = buildBaseGrid();
  grid[exitTile.y][exitTile.x] = E;
  return grid;
}

export function isWalkable(grid: TileType[][], x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  const t = grid[y][x];
  return t === F || t === A || t === E;
}

// All desk tile positions (NPC seats)
export const SEAT_POSITIONS: TilePoint[] = [
  { x: 3,  y: 5  }, { x: 5,  y: 5  }, { x: 9,  y: 5  }, { x: 11, y: 5  }, { x: 15, y: 5  }, { x: 17, y: 5  },
  { x: 3,  y: 6  }, { x: 5,  y: 6  }, { x: 9,  y: 6  }, { x: 11, y: 6  }, { x: 15, y: 6  }, { x: 17, y: 6  },
  { x: 3,  y: 8  }, { x: 5,  y: 8  }, { x: 9,  y: 8  }, { x: 11, y: 8  }, { x: 15, y: 8  }, { x: 17, y: 8  },
  { x: 3,  y: 9  }, { x: 5,  y: 9  }, { x: 9,  y: 9  }, { x: 11, y: 9  }, { x: 15, y: 9  }, { x: 17, y: 9  },
  { x: 3,  y: 11 }, { x: 5,  y: 11 }, { x: 9,  y: 11 }, { x: 11, y: 11 }, { x: 15, y: 11 }, { x: 17, y: 11 },
  { x: 3,  y: 12 }, { x: 5,  y: 12 }, { x: 9,  y: 12 }, { x: 11, y: 12 }, { x: 15, y: 12 }, { x: 17, y: 12 },
];

// Player start — left aisle, middle row
export const PLAYER_START: TilePoint = { x: 1, y: 9 };

// Friend seats per period (valid DESK tiles)
export const FRIEND_SEATS: Record<number, TilePoint[]> = {
  1: [{ x: 3,  y: 6  }, { x: 11, y: 9  }],
  2: [{ x: 5,  y: 9  }, { x: 15, y: 12 }],
  3: [{ x: 3,  y: 12 }, { x: 9,  y: 5  }, { x: 17, y: 9  }],
  4: [{ x: 5,  y: 6  }, { x: 11, y: 12 }, { x: 3,  y: 8  }],
  5: [{ x: 9,  y: 11 }, { x: 15, y: 6  }, { x: 17, y: 12 }, { x: 5,  y: 8  }],
};

// TA patrol paths — use aisle cols
export const TA_PATROL_PATHS: Record<number, TilePoint[][]> = {
  1: [],
  2: [
    [{ x: 18, y: 5 }, { x: 18, y: 12 }, { x: 18, y: 5 }],
  ],
  3: [
    [{ x: 18, y: 5  }, { x: 18, y: 12 }, { x: 18, y: 5  }],
    [{ x: 1,  y: 12 }, { x: 1,  y: 5  }, { x: 1,  y: 12 }],
  ],
  4: [
    [{ x: 18, y: 5  }, { x: 18, y: 12 }, { x: 18, y: 5  }],
    [{ x: 1,  y: 12 }, { x: 1,  y: 5  }, { x: 1,  y: 12 }],
    [{ x: 7,  y: 5  }, { x: 7,  y: 12 }, { x: 7,  y: 5  }],
  ],
  5: [
    [{ x: 18, y: 5  }, { x: 18, y: 12 }, { x: 18, y: 5  }],
    [{ x: 1,  y: 12 }, { x: 1,  y: 5  }, { x: 1,  y: 12 }],
    [{ x: 7,  y: 5  }, { x: 7,  y: 12 }, { x: 7,  y: 5  }],
    [{ x: 13, y: 5  }, { x: 13, y: 12 }, { x: 13, y: 5  }],
  ],
};
