const player1BoardEl = document.getElementById('player1-board');
const player2BoardEl = document.getElementById('player2-board');
const player1ShipsEl = document.getElementById('player1-ships');
const player2ShipsEl = document.getElementById('player2-ships');
const messageEl = document.getElementById('message-area');
const p1NameEl = document.getElementById('player1-name');
const p2NameEl = document.getElementById('player2-name');
const resetButton = document.getElementById('reset-button');
const shipPlacementEl = document.getElementById('ship-placement');

const renderBoard = (boardElement, gameboard, opponent = false, attackCallback = null) => {
    boardElement.innerHTML = '';
    const missed = gameboard.getMissedAttacks();
    const hits = gameboard.getSuccessfulHits();
    const boardSize = gameboard.size;

    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;

            const isHit = hits.some(h => h[0] === i && h[1] === j);
            const isMiss = missed.some(m => m[0] === i && m[1] === j);
            const isAttacked = isHit || isMiss;

            if (isHit) {
                cell.classList.add('hit');
                cell.textContent = '🔥';
            } else if (isMiss) {
                cell.classList.add('miss');
                cell.textContent = '•';
            } else {
                if (!opponent) {
                    const cellContent = gameboard.getBoard()[i][j];
                    if (cellContent) {
                        cell.classList.add('ship');
                    }
                }
            }

            if (opponent && attackCallback && !isAttacked) {
                cell.addEventListener('click', attackCallback);
                cell.classList.add('clickable');
            } else if (opponent && isAttacked) {
                cell.classList.add('attacked');
            }

            boardElement.appendChild(cell);
        }
    }
};

const updateShipStatus = (shipsElement, gameboard) => {
    shipsElement.innerHTML = '';
    const ships = gameboard.getShips();
    const fleetOrder = [
        { name: 'Carrier', length: 5 },
        { name: 'Battleship', length: 4 },
        { name: 'Destroyer', length: 3 },
        { name: 'Submarine', length: 3 },
        { name: 'Patrol Boat', length: 2 }
    ];

    fleetOrder.forEach(type => {
        const shipDiv = document.createElement('div');
        shipDiv.classList.add('ship-status');
        const label = document.createElement('span');
        label.textContent = `${type.name}: `;
        shipDiv.appendChild(label);

        const matchingShips = ships.filter(s => s.getLength() === type.length);
        let displayShip = matchingShips.find(s => !s.isSunk());
        if (!displayShip && matchingShips.length > 0) {
            displayShip = matchingShips[0];
        }
        const isAnySunk = matchingShips.some(s => s.isSunk());

        const segmentsDiv = document.createElement('div');
        segmentsDiv.classList.add('ship-segments');

        for (let i = 0; i < type.length; i++) {
            const segment = document.createElement('div');
            segment.classList.add('segment');

            if (isAnySunk && displayShip && displayShip.isSunk()) {
                segment.classList.add('sunk');
            } else if (displayShip && i < displayShip.getHits()) {
                segment.classList.add('hit');
            }
            segmentsDiv.appendChild(segment);
        }
        shipDiv.appendChild(segmentsDiv);

        if (isAnySunk && displayShip && displayShip.isSunk()) {
            shipDiv.classList.add('sunk');
        }

        shipsElement.appendChild(shipDiv);
    });
};

const displayMessage = (message) => {
    messageEl.textContent = message;
};

const showGameOver = (winnerName) => {
    displayMessage(`Game Over! ${winnerName} wins!`);
};

const showPlacementScreen = (player, placeShipCallback) => {
    shipPlacementEl.style.display = 'block';
    displayMessage(`${player.name}, place your ships.`);
};

const hidePlacementScreen = () => {
    shipPlacementEl.style.display = 'none';
};

export {
    renderBoard,
    updateShipStatus,
    displayMessage,
    showGameOver,
    player1BoardEl,
    player2BoardEl,
    showPlacementScreen,
    hidePlacementScreen
};
