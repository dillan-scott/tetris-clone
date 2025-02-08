import { Piece, SHAPES } from "../types";

interface Props {
  upcomingPiece: Piece | null;
}

export function UpcomingBlock({ upcomingPiece }: Props) {
  if (!upcomingPiece) {
    return null;
  }

  return (
    <div className="upcoming">
      {SHAPES[upcomingPiece].shape.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="row">
            {row.map((isSet, cellIndex) => {
              const cellClass = isSet ? upcomingPiece : "hidden";
              return (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  className={`cell ${cellClass}`}
                ></div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
