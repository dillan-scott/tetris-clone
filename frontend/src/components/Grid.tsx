import { GridShape } from "../types";
import Cell from "./Cell";
interface Props {
  currentGrid: GridShape;
}

function Grid({ currentGrid }: Props) {
  return (
    <div className="grid">
      {currentGrid.map((row, rowIndex) => (
        <div className="row" key={`${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} type={cell} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Grid;
