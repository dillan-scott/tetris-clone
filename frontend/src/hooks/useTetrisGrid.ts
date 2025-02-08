import { useReducer } from "react";
import { EmptyCell, GridShape, Piece, PieceShape, SHAPES } from "../types";
import { hasCollision } from "./useTetris";

export type GridState = {
  grid: GridShape;
  droppingRow: number;
  droppingCol: number;
  droppingPiece: Piece;
  droppingShape: PieceShape;
};

export function useTetrisGrid() {
  const [state, dispatch] = useReducer(
    gridReducer,
    {
      grid: [],
      droppingRow: 0,
      droppingCol: 0,
      droppingPiece: Piece.I,
      droppingShape: SHAPES.I.shape,
    },
    (emptyState) => {
      const state = {
        ...emptyState,
        grid: getEmptyGrid(),
      };
      return state;
    }
  );
  return [state, dispatch] as const;
}

export function getEmptyGrid(): GridShape {
  return Array(21)
    .fill(null)
    .map(() => Array(10).fill(EmptyCell.EMPTY));
}

export function getRandomPiece(): Piece {
  return Object.values(Piece)[
    Math.floor(Math.random() * Object.values(Piece).length)
  ];
}

function rotateShape(shape: PieceShape, isClockwise: boolean): PieceShape {
  const n = shape.length;
  if (n !== shape[0].length) {
    return shape;
  }
  const rotated = Array(n)
    .fill(null)
    .map(() => Array(n).fill(false));

  if (isClockwise) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        rotated[x][n - y - 1] = shape[y][x];
      }
    }
  } else {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        rotated[n - x - 1][y] = shape[y][x];
      }
    }
  }

  return rotated;
}

type Action = {
  type: "start" | "drop" | "lock" | "move";
  newGrid?: GridShape;
  newPiece?: Piece;
  isRotating?: boolean;
  isPressingRight?: boolean;
  isPressingLeft?: boolean;
  isClockwise?: boolean;
};

function gridReducer(state: GridState, action: Action): GridState {
  const newState = { ...state };
  switch (action.type) {
    case "start": {
      const firstPiece = getRandomPiece();
      return {
        grid: getEmptyGrid(),
        droppingRow: 0,
        droppingCol: 3,
        droppingPiece: firstPiece,
        droppingShape: SHAPES[firstPiece].shape,
      };
    }
    case "drop":
      newState.droppingRow++;
      break;
    case "lock":
      console.log("locking");
      return {
        grid: action.newGrid!,
        droppingRow: 0,
        droppingCol: 3,
        droppingPiece: action.newPiece!,
        droppingShape: SHAPES[action.newPiece!].shape,
      };
    case "move": {
      const rotatedShape = action.isRotating
        ? rotateShape(newState.droppingShape, action.isClockwise!)
        : newState.droppingShape;

      let colOffset = action.isPressingRight ? 1 : 0;
      colOffset = action.isPressingLeft ? -1 : colOffset;

      const newCol = newState.droppingCol + colOffset;

      if (
        !hasCollision(newState.grid, rotatedShape, newState.droppingRow, newCol)
      ) {
        newState.droppingCol = newCol;
        newState.droppingShape = rotatedShape;
      }
      break;
    }
    default: {
      const unhandledType: never = action.type;
      throw new Error(`Unhandled action type: ${unhandledType}`);
    }
  }

  return newState;
}
