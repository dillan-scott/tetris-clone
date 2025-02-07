import { useCallback, useState } from "react";
import { getRandomPiece, useTetrisGrid } from "./useTetrisGrid";
import { useInterval } from "./useInterval";
import { EmptyCell, GridShape, Piece, PieceShape } from "../types";

export function useTetris() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<number | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [upcomingPieces, setUpcomingPieces] = useState<Piece[]>([]);
  const [
    { grid, droppingRow, droppingCol, droppingPiece, droppingShape },
    dispatchGridState,
  ] = useTetrisGrid();

  const startGame = useCallback(() => {
    setUpcomingPieces([getRandomPiece(), getRandomPiece(), getRandomPiece()]);
    setIsPlaying(true);
    setTickSpeed(750);
    dispatchGridState({ type: "start" });
  }, [dispatchGridState]);

  const commitPosition = useCallback(() => {
    if (!hasCollision(grid, droppingShape, droppingRow + 1, droppingCol)) {
      setIsCommitting(false);
      setTickSpeed(750);
      return;
    }
    const newGrid = structuredClone(grid) as GridShape;
    addPieceToGrid(
      newGrid,
      droppingPiece,
      droppingShape,
      droppingRow,
      droppingCol
    );

    const newUpcomingPieces = structuredClone(upcomingPieces) as Piece[];
    const newPiece = newUpcomingPieces.pop() as Piece;
    newUpcomingPieces.unshift(getRandomPiece());

    setTickSpeed(750);
    dispatchGridState({ type: "lock", newGrid, newPiece });
    setIsCommitting(false);
  }, [
    dispatchGridState,
    droppingCol,
    droppingPiece,
    droppingRow,
    droppingShape,
    grid,
    upcomingPieces,
  ]);

  const gameTick = useCallback(() => {
    if (isCommitting) {
      commitPosition();
    } else if (
      hasCollision(grid, droppingShape, droppingRow + 1, droppingCol)
    ) {
      setTickSpeed(100);
      setIsCommitting(true);
    } else {
      dispatchGridState({ type: "drop" });
    }
  }, [
    commitPosition,
    dispatchGridState,
    droppingCol,
    droppingRow,
    droppingShape,
    grid,
    isCommitting,
  ]);

  useInterval(() => {
    if (!isPlaying) {
      return;
    }
    gameTick();
  }, tickSpeed);

  const displayGrid = structuredClone(grid) as GridShape;
  if (isPlaying) {
    addPieceToGrid(
      displayGrid,
      droppingPiece,
      droppingShape,
      droppingRow,
      droppingCol
    );
  }
  return { grid: displayGrid, startGame, isPlaying };

  function addPieceToGrid(
    grid: GridShape,
    droppingPiece: Piece,
    droppingShape: PieceShape,
    droppingRow: number,
    droppingCol: number
  ) {
    droppingShape
      .filter((row) => row.some((isSet) => isSet))
      .forEach((row: boolean[], rowIndex: number) => {
        row.forEach((isSet: boolean, colIndex: number) => {
          if (isSet) {
            grid[droppingRow + rowIndex][droppingCol + colIndex] =
              droppingPiece;
          }
        });
      });
  }
}

export function hasCollision(
  grid: GridShape,
  currentShape: PieceShape,
  row: number,
  col: number
): boolean {
  let collision = false;
  currentShape
    .filter((row) => row.some((isSet) => isSet))
    .forEach((shapeRow: boolean[], rowIndex: number) => {
      shapeRow.forEach((isSet: boolean, colIndex: number) => {
        if (
          isSet &&
          (row + rowIndex >= grid.length ||
            col + colIndex >= grid[0].length ||
            col + colIndex < 0 ||
            grid[row + rowIndex][col + colIndex] !== EmptyCell.EMPTY)
        ) {
          collision = true;
        }
      });
    });
  return collision;
}
