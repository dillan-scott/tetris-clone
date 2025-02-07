import Grid from "./components/Grid";
import { useTetris } from "./hooks/useTetris";
const App = () => {
  const { grid, startGame, isPlaying } = useTetris();
  return (
    <div className="App">
      <h1>Tetris</h1>
      <Grid currentGrid={grid} />
      <div className="controls">
        {isPlaying ? null : <button onClick={startGame}>Start</button>}
      </div>
    </div>
  );
};
export default App;
