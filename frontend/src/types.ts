export enum Block {
  I = "I",
  O = "O",
  T = "T",
  S = "S",
  Z = "Z",
  J = "J",
  L = "L",
}

export enum EmptyCell {
  EMPTY = "EMPTY",
}

export type CellOptions = Block | EmptyCell;

export type GridShape = CellOptions[][];
