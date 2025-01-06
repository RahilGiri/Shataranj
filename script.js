class ChessGame {
    constructor() {
        this.board = document.getElementById('board');
        this.game = new Chess();
        this.moveHistory = [];
        this.initializeBoard();
        ['click', 'restart', 'undo'].forEach(e => this.setupEvent(e));
    }

    initializeBoard() {
        this.board.innerHTML = [...Array(64)].map((_, i) => {
            const row = Math.floor(i / 8), col = i % 8;
            return `<div class="square ${(row + col) % 2 ? 'black' : 'white'}" 
                    data-square="${String.fromCharCode(97 + col)}${8 - row}"></div>`;
        }).join('');
        this.updateBoard();
    }

    setupEvent(type) {
        const events = {
            click: () => this.board.addEventListener('click', e => this.handleSquareClick(e)),
            restart: () => document.getElementById('restart').addEventListener('click', () => this.resetGame()),
            undo: () => document.getElementById('undo').addEventListener('click', () => this.undoMove())
        };
        events[type]();
    }

    handleSquareClick(e) {
        const square = e.target.closest('.square');
        if (!square) return;

        const squareNotation = square.dataset.square;
        if (this.selectedSquare) {
            this.tryMove(this.selectedSquare, squareNotation);
            this.selectedSquare = null;
            this.clearHighlights();
        } else {
            const piece = this.game.get(squareNotation);
            if (piece?.color === this.game.turn()) {
                this.selectedSquare = squareNotation;
                this.clearHighlights();
                square.classList.add('selected');
                this.game.moves({ square: squareNotation, verbose: true })
                    .forEach(move => document.querySelector(`[data-square="${move.to}"]`)
                        .classList.add('valid-move'));
            }
        }
    }

    tryMove(from, to) {
        const piece = this.game.get(from);
        const move = this.game.move({
            from,
            to,
            promotion: piece?.type === 'p' && (8 - parseInt(to[1])) % 7 === 0 ? 'q' : undefined
        });

        if (move) {
            this.moveHistory.push(move);
            this.updateBoard();
            this.updateGameStatus();
        }
    }

    undoMove() {
        if (this.moveHistory.length) {
            this.game.undo();
            this.moveHistory.pop();
            this.updateBoard();
            this.updateGameStatus();
            this.clearHighlights();
        }
    }

    updateBoard() {
        const symbols = {
            'w': { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
            'b': { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
        };
        [...this.board.getElementsByClassName('square')].forEach(square => {
            const piece = this.game.get(square.dataset.square);
            square.innerHTML = piece ? symbols[piece.color][piece.type] : '';
        });
    }

    clearHighlights() {
        this.board.querySelectorAll('.square').forEach(sq => 
            sq.classList.remove('selected', 'valid-move'));
    }

    updateGameStatus() {
        const status = document.getElementById('player');
        const message = document.getElementById('message');
        const turn = this.game.turn() === 'w' ? 'White' : 'Black';

        if (this.game.game_over()) {
            status.textContent = 'Game Over';
            message.textContent = this.game.in_checkmate() ? `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins!` :
                                this.game.in_stalemate() ? 'Game Over - Stalemate!' :
                                this.game.in_threefold_repetition() ? 'Game Over - Draw by repetition!' :
                                this.game.insufficient_material() ? 'Game Over - Draw by insufficient material!' :
                                'Game Over - Draw!';
        } else {
            status.textContent = `${turn}'s turn`;
            message.textContent = this.game.in_check() ? 'Check!' : '';
        }
    }

    resetGame() {
        this.game.reset();
        this.selectedSquare = null;
        this.moveHistory = [];
        this.clearHighlights();
        this.updateBoard();
        document.getElementById('player').textContent = "White's Turn";
        document.getElementById('message').textContent = '';
    }
}

window.addEventListener('DOMContentLoaded', () => new ChessGame());
