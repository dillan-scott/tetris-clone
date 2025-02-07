import Grid from "./components/Grid";
import { EmptyCell } from "./types";

const grid = Array(20)
  .fill(null)
  .map(() => Array(10).fill(EmptyCell.EMPTY));

const App = () => {
  return (
    <div className="App">
      <h1>Tetris</h1>
      <Grid currentGrid={grid} />
    </div>
  );
};
export default App;
