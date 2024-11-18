const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restart');
let score = 0;
let grid = [];
let touchStartX = 0;
let touchStartY = 0;

function init() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    scoreDisplay.textContent = score;
    generateTile();
    generateTile();
    render();
}

function generateTile() {
    let emptyCells = [];
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 0) emptyCells.push({ rowIndex, colIndex });
        });
    });
    if (emptyCells.length) {
        const { rowIndex, colIndex } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[rowIndex][colIndex] = Math.random() < 0.9 ? 2 : 4;
        const cell = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
        if (cell) cell.classList.add('new');
    }
}

function render() {
    gridContainer.innerHTML = '';
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('grid-cell');
            cellDiv.setAttribute('data-value', cell);
            cellDiv.setAttribute('data-row', rowIndex);
            cellDiv.setAttribute('data-col', colIndex);
            cellDiv.textContent = cell ? cell : '';
            gridContainer.appendChild(cellDiv);
        });
    });
    scoreDisplay.textContent = score;
    if (checkGameOver()) {
        setTimeout(() => {
            alert('Game Over!');
            init();
        }, 300);
    }
    checkWin();
}

function move(direction) {
    let moved = false;
    let newGrid = grid.map(row => row.slice());
    let mergedCells = new Set();

    const moveCell = (fromRow, fromCol, toRow, toCol) => {
        if (grid[fromRow][fromCol] === 0) return false;
        if (grid[toRow][toCol] === 0) {
            grid[toRow][toCol] = grid[fromRow][fromCol];
            grid[fromRow][fromCol] = 0;
            return true;
        }
        if (grid[toRow][toCol] === grid[fromRow][fromCol] && 
            !mergedCells.has(`${toRow},${toCol}`)) {
            grid[toRow][toCol] *= 2;
            score += grid[toRow][toCol];
            grid[fromRow][fromCol] = 0;
            mergedCells.add(`${toRow},${toCol}`);
            const cell = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
            if (cell) cell.classList.add('merge');
            return true;
        }
        return false;
    };

    switch (direction) {
        case 'left':
            for (let i = 0; i < 4; i++) {
                for (let j = 1; j < 4; j++) {
                    for (let k = j; k > 0; k--) {
                        if (moveCell(i, k, i, k - 1)) moved = true;
                    }
                }
            }
            break;
        case 'right':
            for (let i = 0; i < 4; i++) {
                for (let j = 2; j >= 0; j--) {
                    for (let k = j; k < 3; k++) {
                        if (moveCell(i, k, i, k + 1)) moved = true;
                    }
                }
            }
            break;
        case 'up':
            for (let j = 0; j < 4; j++) {
                for (let i = 1; i < 4; i++) {
                    for (let k = i; k > 0; k--) {
                        if (moveCell(k, j, k - 1, j)) moved = true;
                    }
                }
            }
            break;
        case 'down':
            for (let j = 0; j < 4; j++) {
                for (let i = 2; i >= 0; i--) {
                    for (let k = i; k < 3; k++) {
                        if (moveCell(k, j, k + 1, j)) moved = true;
                    }
                }
            }
            break;
    }

    if (moved) {
        setTimeout(() => {
            generateTile();
            render();
        }, 150);
    }
}

function handleTouchStart(evt) {
    touchStartX = evt.touches[0].clientX;
    touchStartY = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = evt.touches[0].clientX;
    const touchEndY = evt.touches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 30) {
            move(deltaX > 0 ? 'right' : 'left');
            touchStartX = 0;
            touchStartY = 0;
        }
    } else {
        if (Math.abs(deltaY) > 30) {
            move(deltaY > 0 ? 'down' : 'up');
            touchStartX = 0;
            touchStartY = 0;
        }
    }
}

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
    }
});

gridContainer.addEventListener('touchstart', handleTouchStart, false);
gridContainer.addEventListener('touchmove', handleTouchMove, false);
restartButton.addEventListener('click', init);

init();
