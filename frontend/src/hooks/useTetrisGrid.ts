import { useReducer } from "react";
import { EmptyCell, GridShape, Piece, PieceShape, SHAPES } from "../types";

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
  return Array(20)
    .fill(null)
    .map(() => Array(10).fill(EmptyCell.EMPTY));
}

export function getRandomPiece(): Piece {
  return Object.values(Piece)[
    Math.floor(Math.random() * Object.values(Piece).length)
  ];
}

type Action = {
  type: "start" | "drop" | "lock" | "move";
  newGrid?: GridShape;
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
      return {
        grid: action.newGrid ?? state.grid,
        droppingRow: 0,
        droppingCol: 3,
        droppingPiece: state.droppingPiece,
        droppingShape: state.droppingShape,
      };
    case "move":
      // TODO: Implement move
      return state;
    default: {
      const unhandledType: never = action.type;
      throw new Error(`Unhandled action type: ${unhandledType}`);
    }
  }

  return newState;
}
