import { useCallback, useEffect, useState } from "react";
import { getRandomPiece, useTetrisGrid } from "./useTetrisGrid";
import { useInterval } from "./useInterval";
import { EmptyCell, GridShape, Piece, PieceShape, SHAPES } from "../types";

enum TickSpeed {
  Normal = 500,
  Sliding = 100,
  Fast = 50,
}

export function useTetris() {
  const [score, setScore] = useState(0);
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

    let linesCleared = 0;
    for (let row = 0; row < newGrid.length; row++) {
      if (newGrid[row].every((cell) => cell !== EmptyCell.EMPTY)) {
        linesCleared++;
        newGrid.splice(row, 1);
      }
    }

    const newPiece = upcomingPiece as Piece;
    if (hasCollision(grid, SHAPES[newPiece].shape, 0, 3)) {
      setIsPlaying(false);
      setTickSpeed(null);
    } else {
      setTickSpeed(TickSpeed.Normal);
    }
    setUpcomingPiece(getRandomPiece());

    setScore(score + getPoints(linesCleared));
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
    score,
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
  return { grid: displayGrid, startGame, isPlaying, score, upcomingPiece };

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
          const gridRow = droppingRow + rowIndex;
          if (gridRow >= 0) {
            grid[gridRow][droppingCol + colIndex] = droppingPiece;
          }
        }
      });
    });
  }
}

export function hasCollision(
  grid: GridShape,
  droppingShape: PieceShape,
  droppingRow: number,
  droppingCol: number
): boolean {
  let collision = false;
  droppingShape.forEach((row: boolean[], rowIndex: number) => {
    row.forEach((isSet: boolean, colIndex: number) => {
      if (isSet) {
        const gridRow = droppingRow + rowIndex;
        if (
          gridRow >= grid.length ||
          droppingCol + colIndex < 0 ||
          droppingCol + colIndex >= grid[0].length ||
          (gridRow >= 0 &&
            grid[gridRow][droppingCol + colIndex] !== EmptyCell.EMPTY)
        ) {
          collision = true;
        }
      }
    });
  });
  return collision;
}

function getPoints(linesCleared: number) {
  switch (linesCleared) {
    case 0:
      return 0;
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      throw new Error("Invalid number of lines cleared");
  }
}
