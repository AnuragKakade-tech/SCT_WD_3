let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let gameMode = "pvp";

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const pvpBtn = document.getElementById('pvp-btn');
const pvcBtn = document.getElementById('pvc-btn');

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedCellIndex] !== "" || !isGameActive || (gameMode === "pvc" && currentPlayer === "O")) {
        return;
    }

    makeMove(clickedCellIndex, clickedCell);

    if (isGameActive && gameMode === "pvc" && currentPlayer === "O") {
        setTimeout(makeComputerMove, 500);
    }
}

function makeMove(index, cellElement) {
    boardState[index] = currentPlayer;
    cellElement.innerText = currentPlayer;
    cellElement.setAttribute('data-value', currentPlayer);

    checkForResult();
}

function makeComputerMove() {
    if (!isGameActive) return;

    // Helper to find a cell that completes a winning condition for a specific player
    const findWinningOrBlockingMove = (player) => {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const values = [boardState[a], boardState[b], boardState[c]];
            
            // Check if two cells match the target player and the third is empty
            const playerCount = values.filter(v => v === player).length;
            const emptyCount = values.filter(v => v === "").length;
            
            if (playerCount === 2 && emptyCount === 1) {
                if (boardState[a] === "") return a;
                if (boardState[b] === "") return b;
                if (boardState[c] === "") return c;
            }
        }
        return null;
    };

    let targetIndex = null;

    // Priority 1: Check if Computer ('O') can win right now
    targetIndex = findWinningOrBlockingMove("O");

    // Priority 2: Check if Player ('X') needs to be blocked from winning
    if (targetIndex === null) {
        targetIndex = findWinningOrBlockingMove("X");
    }

    // Priority 3: Strategic position - Take the center square if it's open
    if (targetIndex === null && boardState[4] === "") {
        targetIndex = 4;
    }

    // Priority 4: Strategic position - Take an open corner
    if (targetIndex === null) {
        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(idx => boardState[idx] === "");
        if (emptyCorners.length > 0) {
            targetIndex = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        }
    }

    // Priority 5: Fallback - Pick any remaining empty cell at random
    if (targetIndex === null) {
        let emptyCells = [];
        boardState.forEach((val, idx) => {
            if (val === "") emptyCells.push(idx);
        });
        if (emptyCells.length > 0) {
            targetIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }

    // Execute the calculated smart move
    if (targetIndex !== null) {
        const targetCell = document.querySelector(`.cell[data-index="${targetIndex}"]`);
        makeMove(targetIndex, targetCell);
    }
}

function checkForResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerText = `Player ${currentPlayer} Wins! 🎉`;
        isGameActive = false;
        return;
    }

    if (!boardState.includes("")) {
        statusDisplay.innerText = "Game is a Draw! 🤝";
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerText = gameMode === "pvc" && currentPlayer === "O" ? "Computer is thinking..." : `Player ${currentPlayer}'s turn`;
}

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusDisplay.innerText = "Player X's turn";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.removeAttribute('data-value');
    });
}

pvpBtn.addEventListener('click', () => {
    gameMode = "pvp";
    pvpBtn.classList.add('active');
    pvcBtn.classList.remove('active');
    resetGame();
});

pvcBtn.addEventListener('click', () => {
    gameMode = "pvc";
    pvcBtn.classList.add('active');
    pvpBtn.classList.remove('active');
    resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);