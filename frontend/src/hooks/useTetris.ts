import { useCallback, useEffect, useState } from "react";
import { getRandomPiece, useTetrisGrid } from "./useTetrisGrid";
import { useInterval } from "./useInterval";
import { EmptyCell, GridShape, Piece, PieceShape } from "../types";

enum TickSpeed {
  Normal = 500,
  Sliding = 100,
  Fast = 50,
}

export function useTetris() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [upcomingPiece, setUpcomingPiece] = useState<Piece | null>(null);
  const [
    { grid, droppingRow, droppingCol, droppingPiece, droppingShape },
    dispatchGridState,
  ] = useTetrisGrid();

  const startGame = useCallback(() => {
    setUpcomingPiece(getRandomPiece());
    setIsPlaying(true);
    setTickSpeed(TickSpeed.Normal);
    dispatchGridState({ type: "start" });
  }, [dispatchGridState]);

  const commitPosition = useCallback(() => {
    if (!hasCollision(grid, droppingShape, droppingRow + 1, droppingCol)) {
      setIsCommitting(false);
      setTickSpeed(TickSpeed.Normal);
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

    const newPiece = upcomingPiece;
    setUpcomingPiece(getRandomPiece());

    setTickSpeed(TickSpeed.Normal);
    setIsCommitting(false);
    dispatchGridState({ type: "lock", newGrid, newPiece: newPiece! });
  }, [
    dispatchGridState,
    droppingCol,
    droppingPiece,
    droppingRow,
    droppingShape,
    grid,
    upcomingPiece,
  ]);

  const gameTick = useCallback(() => {
    if (isCommitting) {
      commitPosition();
    } else if (
      hasCollision(grid, droppingShape, droppingRow + 1, droppingCol)
    ) {
      setTickSpeed(TickSpeed.Sliding);
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

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let isPressingLeft = false;
    let isPressingRight = false;
    let moveIntervalID: number | undefined;

    const updateMovementInterval = () => {
      clearInterval(moveIntervalID);
      dispatchGridState({ type: "move", isPressingLeft, isPressingRight });
      moveIntervalID = setInterval(() => {
        dispatchGridState({ type: "move", isPressingLeft, isPressingRight });
      }, 100);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === "ArrowDown") {
        setTickSpeed(TickSpeed.Fast);
      }
      if (event.key === "ArrowRight") {
        isPressingRight = true;
        updateMovementInterval();
      }
      if (event.key === "ArrowLeft") {
        isPressingLeft = true;
        updateMovementInterval();
      }
      if (event.key === "x") {
        dispatchGridState({
          type: "move",
          isRotating: true,
          isClockwise: true,
        });
      }
      if (event.key === "z") {
        dispatchGridState({
          type: "move",
          isRotating: true,
          isClockwise: false,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        setTickSpeed(TickSpeed.Normal);
      }
      if (event.key === "ArrowRight") {
        isPressingRight = false;
        updateMovementInterval();
      }
      if (event.key === "ArrowLeft") {
        isPressingLeft = false;
        updateMovementInterval();
      }
      if (event.key === "x") {
        dispatchGridState({ type: "move", isRotating: false });
      }
      if (event.key === "z") {
        dispatchGridState({ type: "move", isRotating: false });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      setTickSpeed(TickSpeed.Normal);
    };
  }, [dispatchGridState, isPlaying]);

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
    droppingShape.forEach((row: boolean[], rowIndex: number) => {
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
          grid[droppingRow + rowIndex][droppingCol + colIndex] = droppingPiece;
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
  currentShape.forEach((shapeRow: boolean[], rowIndex: number) => {
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
