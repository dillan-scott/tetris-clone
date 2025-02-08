import Grid from "./components/Grid";
import { UpcomingBlock } from "./components/UpcomingBlock";
import { useTetris } from "./hooks/useTetris";
import { Piece } from "./types";
const App = () => {
  const { grid, startGame, isPlaying, score, upcomingPiece } = useTetris();
  return (
    <>
      <div className="app">
        <h1>Tetris</h1>
        <Grid currentGrid={grid} />
        <div className="controls">
          <h2>Score: {score}</h2>
          {isPlaying ? (
            <UpcomingBlock upcomingPiece={upcomingPiece as Piece} />
          ) : (
            <button onClick={startGame}>New Game</button>
          )}
        </div>
      </div>
    </>
  );
};
export default App;
