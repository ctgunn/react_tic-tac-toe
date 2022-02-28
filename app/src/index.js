import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            style={!!props.winner && props.winner.includes(props.index) ? {'fontSize': '28px'} : {}}
            onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winner={this.props.winner}
                index={i}/>
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
        let  history;
        const order = this.state.ordering;

        if(order === 'asc') {
            history = this.state.history.slice(this.state.stepNumber, this.state.history.length);
        } else {
            history = this.state.history.slice(0, this.state.stepNumber + 1);
        }

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
                stepNumber: 0
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
        let order = 'desc';
        let stepNum = this.state.history.length - 1;
        
        if(this.state.ordering === 'desc') {
            order = 'asc';
            stepNum = 0;
        }
        
        this.setState({
            history: this.state.history.reverse(),
            ordering: order,
            stepNumber: stepNum
        });
    }

    render() {
        const history = this.state.history;
        const stepNum = this.state.stepNumber;
        const order = this.state.ordering;
        const current = history[stepNum];
        const winner = calculateWinner(current.squares);
        const draw = calculateDraw(current.squares);
        const moves = history.map((step, move) => { // step = element, move = index
            const currentSquares = history[move];
            const histLen = history.length;
            const decision = ((order === 'desc' && move) || (order === 'asc' && move !== histLen - 1));
            const previousSquares = decision ? history[(order === 'desc' ? move - 1 : move + 1)] : null;
            const lastMove = getLastMove(previousSquares, currentSquares);
            const moveNum = histLen - move - 1;
            const desc = decision ?
                'Go to move #' + (order === 'desc' ? move : moveNum) :
                'Go to game start';
            const coords = decision ?
                '(column ' + lastMove.x + ', row ' + lastMove.y + ')' :
                '';
            const boldStyle = (order === 'desc' && move === stepNum)
                    || (order === 'asc' && (
                    (stepNum === 0 && move === 0) || (stepNum !== 0 && move === stepNum))) ?
                {fontWeight: 'bold'} :
                {};

            return (
                <li style={boldStyle} key={move}>
                    <button style={boldStyle} onClick={() => this.jumpTo(move)}>{desc}</button>
                    <span style={{'paddingLeft': '10px'}}>{coords}</span>
                </li>
            );
        });

        let status;
        let set;

        if(!!winner) {
            status = 'Winner: ' + winner.winner;
            set = winner.set;
        } else if(draw) {
            status = 'The match has ended in a DRAW!'
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            set = [];
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winner={set}/>
                </div>
                <div className="game-info">
                    <div style={{'paddingBottom': '10px'}}>{status}</div>
                    <button onClick={() => this.toggleOrder()}>Toggle Ordering</button>
                    <span style={{'paddingLeft': '10px'}}>{(this.state.ordering === 'desc') ? 'Oldest to Newest' : 'Newest to Oldest'}</span>
                    <ol reversed={order === 'asc' ? "reversed" : ""}>{moves}</ol>
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
            return {
                winner: squares[a],
                set: [a, b, c]
            };
        }
    }

    return null;
}

function calculateDraw(squares) {
    for(let i = 0; i < squares.length; i++) {
        if(!squares[i]) {
            return false;
        }
    }

    return true;
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
