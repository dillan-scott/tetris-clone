export enum Piece {
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

export type CellOptions = Piece | EmptyCell;

export type GridShape = CellOptions[][];

export type PieceShape = boolean[][];

type ShapesObj = {
  [key in Piece]: {
    shape: PieceShape;
  };
};

export const SHAPES: ShapesObj = {
  I: {
    shape: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
  },
  J: {
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false],
    ],
  },
  L: {
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false],
    ],
  },
  O: {
    shape: [
      [false, true, true, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
  },
  S: {
    shape: [
      [false, true, true],
      [true, true, false],
      [false, false, false],
    ],
  },
  T: {
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
  },
  Z: {
    shape: [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ],
  },
};
