import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square key={i}
                value = {this.props.squares[i]}
                onClick = {() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let grid = [];
        let row;
        let index = 0;

        for(let i = 1; i <= 3; i++) {
            row = [];

            for(let j = 1; j <= 3; j++) {
                row.push(this.renderSquare(index))
                index++;
            }

            grid.push(<div key={'row' + i} className="board-row">{row}</div>)
        }
        return (
            <div>
                {grid}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,
            stepNumber: 0,
            ordering: 'desc'
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const order = this.state.ordering;
        const current = history[(order === 'desc' ? history.length - 1 : 0)];
        const squares = current.squares.slice();

        if(calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = (this.state.xIsNext) ? 'X' : 'O';

        if(this.state.ordering === 'desc') {
            this.setState({
                history: history.concat([{
                    squares: squares
                }]),
                xIsNext: !this.state.xIsNext,
                stepNumber: history.length
            });
        } else {
            this.setState({
                history: [{squares: squares}].concat(history),
                xIsNext: !this.state.xIsNext,
                stepNumber: history.length
            });
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    toggleOrder() {
        let ordering = 'desc';
        
        if(this.state.ordering === 'desc') {
            ordering = 'asc';
        }
        
        this.setState({
            history: this.state.history.reverse(),
            ordering: ordering
        });
    }

    render() {
        const history = this.state.history;
        const stepNum = this.state.stepNumber;
        const order = this.state.ordering;
        const current = history[(order === 'desc' ? stepNum : 0)];
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => { // step = element, move = index
            const currentSquares = history[move];
            const previousSquares = move ? history[move - 1] : null;
            const lastMove = getLastMove(previousSquares, currentSquares);
            const moveNum = history.length - move;
            const desc = move ?
                'Go to move #' + (order === 'desc' ? move : moveNum) :
                'Go to game start';
            const coords = move ?
                '(column ' + lastMove.x + ', row ' + lastMove.y + ')' :
                '';
            const boldStyle = ((order === 'asc' && move === 1) || (order === 'desc' && move === stepNum)) ? {fontWeight: 'bold'} : {};

            return (
                <li style={boldStyle} key={move}>
                    <button style={boldStyle} onClick={() => this.jumpTo(move)}>{desc}</button>
                    <span style={{'paddingLeft': '10px'}}>{coords}</span>
                </li>
            );
        });

        let status;

        if(winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.toggleOrder()}>Toggle Ordering</button>
                    <span style={{'paddingLeft': '10px'}}>{(this.state.ordering === 'desc') ? 'Oldest to Newest' : 'Newest to Oldest'}</span>
                    <ol>{moves}</ol>
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

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];

        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }

    return null;
}

function getLastMove(previous, current) {
    if(!previous) {
        return previous;
    }

    for(let x = 0; x < previous.squares.length; x++) {
        if(previous.squares[x] !== current.squares[x]) {
            return {
                x: x % 3 + 1,
                y: Math.ceil((x + 1) / 3)
            };
        }
    }
}
