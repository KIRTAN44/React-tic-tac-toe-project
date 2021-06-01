import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Button from '@material-ui/core/Button';


const Square = props => (
  <button className={`${props.winnerClass} square`} onClick={props.onClick}>
    {props.value}
  </button>
);
  
class Board extends React.Component {
  createBoard(row, col) {
    const board = [];
    let cellCounter = 0;

    for (let i = 0; i < row; i += 1) {
      const columns = [];
      for (let j = 0; j < col; j += 1) {
        columns.push(this.renderSquare(cellCounter++));
      }
      board.push(<div key={i} className="board-row">{columns}</div>);
    }

    return board;
  }

  renderSquare(i) {
    const winnerClass =
      this.props.winnerSquares &&
      (this.props.winnerSquares[0] === i ||
        this.props.winnerSquares[1] === i ||
        this.props.winnerSquares[2] === i)
        ? 'square--green'
        : '';

    return (
      <Square
        winnerClass={winnerClass}
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return <div>{this.createBoard(3, 3)}</div>;
  }
}
  class Game extends React.Component {
    /**
     * Initial state of the game
     */
    initialize = () => {
      return {
        history: [
          {
            squares: Array(9).fill(null),
            location: {
              col: 0,
              row: 0
            },
            active: false,
            moveNumber: 0
          }
        ],
        xIsNext: true,
        stepNumber: 0,
        toggle: false
      };
    };
  
    state = this.initialize();
  
    reset = () => {
      this.setState(this.initialize());
    };
  
    jumpTo = step => {
      let history = this.state.history;
  
      history.forEach(item => {
        item.active = false;
      });
  
      history[step].active = true;
      this.setState({
        history: history,
        stepNumber: step,
        xIsNext: step % 2 === 0
      });
    };
  
    handleClick = i => {
      /**
       * If we jumped to some previous step, and then make
       * a new move from that point, we throw away all "future"
       * history that will now become irrelevant.
       *
       * slice(startingPoint, endPoint)
       *
       * startingPoint - Array index from where the "slicing" starts.
       * endPoint - All array indices less than endPoint will be included in "slicing"
       */
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      const columns = 3;
  
      /**
       * Calculate location of square when clicked
       */
      const col = Math.floor(i % columns) + 1;
      const row = Math.floor(i / columns) + 1;
  
      if (this.calculateWinner(squares) || squares[i]) {
        return;
      }
  
      squares[i] = this.state.xIsNext ? "X" : "O";
  
      /**
       * concat() method does not mutate the Array
       * unlike Array.push().
       */
      this.setState(prevState => ({
        history: history.concat([
          {
            squares: squares,
            location: {
              col: col,
              row: row
            },
            active: false,
            moveNumber: history.length
          }
        ]),
        xIsNext: !prevState.xIsNext,
        stepNumber: history.length
      }));
    };
  
    toggleMoves = () => {
      const toggle = !this.state.toggle;
      this.setState({
        toggle: toggle
      });
    };
  
    calculateWinner = (squares) => {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      let result = {
        status: "",
        win: {}
      };
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[a] === squares[c]
        ) {
          result = {
            status: "win",
            win: { player: squares[a], squares: [a, b, c] }
          };
          return result;
        }
      }
      let tempSq = squares.filter(item => item === null);
      if (tempSq.length === 0) {
        result = { status: "draw", win: {} };
        return result;
      }
      return null;
    };
  
    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const result = this.calculateWinner(current.squares);
      const gameStatus = result && result.status ? result.status : null;
  
      const moves = history.map((move, index) => {
        const desc = index ? "Go to move #" + index : "Go to game start";
  
        let active = "";
        if (move.active) {
          active = "active";
        } else {
          active = "normal";
        }
        return (
          <li key={index} style={{ paddingBottom:"10px"}}>
            <Button style={{ backgroundColor:"lightgreen"}}
              className={active}
              key={`${move.location.col}_${move.location.row}`}
              onClick={() => this.jumpTo(index)}
            >
              {`${desc} (${move.location.col}, ${move.location.row})`}
            </Button>
          </li>
        );
      });
  
      /**
       * If this.state.toggle is "true", sort in
       * "decending order" and vice versa.
       */
      moves.sort((a, b) => {
        if (this.state.toggle) {
          return b.key - a.key;
        } else {
          return a.key - b.key;
        }
      });
  
      let status;
  
      if (gameStatus === "win") {
        status = `Winner: ${result.win.player}`;
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
      return (
        <div>
        <div><h1>Let's play TIC-TAC-TOE!!!</h1></div>
        <div className="game">
          {/** If there is a draw, hide the game board and show 
            "Play again" button */
          gameStatus === "draw" ? (
            <div className="draw">
              <h2>Draw!</h2>
              <Button onClick={() => this.reset()} color="primary" variant="contained">Play again</Button>
            </div>
          ) : (
            /** Otherwise, show the game board */
            <div className="game-board">
              <Board
                squares={current.squares}
                winningSquares={gameStatus === "win" ? result.win.squares : []}
                onClick={(i, col, row) => this.handleClick(i, col, row)}
              />
              {/** Depending upon the state of the game, either show 
                "Play again" button or "Reset game" button */
              gameStatus === "win" ? (
                <div className="win">
                  <h2>{`"${result.win.player}" is winner!`}</h2>
                  <Button onClick={() => this.reset()} color="primary" variant="contained">Play again</Button>
                </div>
              ) : (
                <div>
                <br/>
                <div className="reset">
                  <Button onClick={() => this.reset()} color="primary" variant="contained">Reset game</Button>
                </div>
                </div>
              )}
            </div>
          )}
  
          <div className="game-info">
            <div>{status}</div>
            <br/>
            {/** Show the toggle button only if there are two or more moves to sort */
            history.length > 1 ? (
              <Button onClick={() => this.toggleMoves()} variant="contained">Toggle moves</Button>
            ) : (
              "Start a Game!!!"
            )}
            <ol>{moves}</ol>
          </div>
        </div>
        </div>
      );
    }
  }
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  