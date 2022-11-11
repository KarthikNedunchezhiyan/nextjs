import styles from '../styles/Chess.module.css';
import * as Chess from 'js-chess-engine';

// maps js-chess-engine's codes to text chess pieces
const GLYPHS = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟︎",
};

function makeGame(div) {
    // make a new html <table> to render chess
    const board = document.createElement('table');
    board.className = styles.board;
    fillInBoard(board);

    // put that table into the div we control
    div.appendChild(board);

    // make a new chess game
    const game = new Chess.Game();
    let gameState = game.exportJson();

    // loop through and update all the squares with a piece on them
    Object.keys(gameState.pieces).forEach(square => {
        // square will be "A1" through "H8"

        // get the html element representing that square
        const el = document.getElementById(square);

        // take that piece and put its corresponding glyph into the square
        const piece = gameState.pieces[square];
        el.innerText = GLYPHS[piece];
    });

    // either null or the actively selected square
    let selected = null;
    let valid_moves;
    function resetSelection() {
        if(valid_moves) {
            valid_moves.forEach(valid_move=>{
                document.getElementById(valid_move).classList.remove(styles.validMove);
            });
        }
        selected = null;
    }

    // make an onClick function
    const onClick = event => {
        const square = event.target.id;

        // check to see if we are moving a piece
        if (selected) {
            if(!gameState.moves[selected] || !gameState.moves[selected].includes(square)) {
                resetSelection();
                alert("invalid move!");
                return;
            }
            // move the piece
            game.move(selected, square);
            gameState = game.exportJson();

            // update the text by clearing out the old square
            document.getElementById(selected).innerText = "";
            // and putting the piece on the new square
            document.getElementById(square).innerText = GLYPHS[gameState.pieces[square]];

            // reset the selection state to unselected
            resetSelection();

            // ai moves
            const [movedFrom, movedTo] = Object.entries(game.aiMove(2))[0];
            gameState = game.exportJson();
            document.getElementById(movedFrom).innerText = "";
            document.getElementById(movedTo).innerText = GLYPHS[gameState.pieces[movedTo]];
        } else if(gameState.moves[square]) {
            selected = square;
            valid_moves = gameState.moves[selected];
            if(valid_moves) {
                valid_moves.forEach(valid_move=>{
                    document.getElementById(valid_move).classList.add(styles.validMove);
                });
            }
        }
    }

    // put that onClick function on every square
    Array.from(
        board.getElementsByClassName(styles.square)
    ).forEach(el => {
        el.onclick = onClick;
    });
}

// makes a chess board out of an html table
function fillInBoard(board) {
    const COLNAMES = " ABCDEFGH";

    const body = document.createElement('tbody');

    // make each row in the table
    for (let r = 8; r >= 1; r--) {
        const row = document.createElement('tr');

        // number each row
        const rowLabel = document.createElement('td');
        rowLabel.innerText = r.toString();
        row.appendChild(rowLabel);

        // add the board squares
        for (let c = 1; c <= 8; c++) {
            const colName = COLNAMES[c];

            const square = document.createElement('td');
            square.id = colName + r;

            // color alternating squares
            const color = (r + c) % 2 ? styles.white : styles.black;
            square.className = styles.square + ' ' + color;

            row.appendChild(square);
        }

        body.appendChild(row);
    }

    // put column numbers on the bottom
    const footer = document.createElement('tr');
    for (let c = 0; c <= 8; c++) {
        const label = document.createElement('td');
        label.innerText = COLNAMES[c];

        footer.appendChild(label);
    }

    body.appendChild(footer);

    board.appendChild(body);
}

export default function ChessPage() {
    // Tell React to put a div down that is
    // controlled by the makeGame function
    return <div ref={makeGame} />;
}