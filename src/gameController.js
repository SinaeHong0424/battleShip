import Player from './player.js';
import {
    renderBoard,
    updateShipStatus,
    displayMessage,
    showGameOver as domShowGameOver,
    player1BoardEl,
    player2BoardEl,
} from './domController.js';

const GameController = () => {
    let player1 = null;
    let player2 = null;
    let currentPlayer = null;
    let opponent = null;
    let gameOver = false;
    let attackCallback = null;
    const shipLengths = [5, 4, 3, 3, 2];

    const autoPlaceShips = (gameboard, lengths) => {
        for (const len of lengths) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const isVertical = Math.random() < 0.5;
                const x = Math.floor(Math.random() * gameboard.size);
                const y = Math.floor(Math.random() * gameboard.size);
                placed = gameboard.placeShip(len, x, y, isVertical);
                attempts++;
            }
        }
    };

    const getShipName = (length) => {
        switch (length) {
            case 5: return 'Carrier';
            case 4: return 'Battleship';
            case 3: return 'Destroyer/Submarine';
            case 2: return 'Patrol Boat';
            default: return 'ship';
        }
    };

    const renderGame = () => {
        if (!player1 || !player2) return;
        const isP1Turn = currentPlayer === player1;

        document.getElementById('player1-name').textContent = player1.name;
        document.getElementById('player2-name').textContent = player2.name;

        renderBoard(player1BoardEl, player1.gameboard, false, null);
        updateShipStatus(document.getElementById('player1-ships'), player1.gameboard);

        const p2BoardCallback = (isP1Turn && !gameOver) ? attackCallback : null;
        renderBoard(player2BoardEl, player2.gameboard, true, p2BoardCallback);
        updateShipStatus(document.getElementById('player2-ships'), player2.gameboard);
    };

    const showGameOver = (winnerName) => {
        domShowGameOver(winnerName);
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.innerHTML += `<br/>Play again? Choose a game mode above.`;
        }
        const modeSelectionDiv = document.getElementById('game-mode-selection');
        if (modeSelectionDiv) {
            modeSelectionDiv.style.display = 'block';
        }
    };

    const handleAttack = (x, y) => {
        if (gameOver || currentPlayer.isComputer) return;
        const targetBoard = opponent.gameboard;
        if (targetBoard.isAlreadyAttacked(x, y)) {
            displayMessage(`Invalid move: Already attacked this spot.`);
            return;
        }

        const result = targetBoard.receiveAttack(x, y);
        if (result.status === 'invalid') {
            displayMessage(`Invalid move: ${result.message}`);
            return;
        }

        let switchTurns = false;
        if (result.status === 'hit') {
            displayMessage(`Hit! ${result.ship.isSunk() ? `You sunk ${getShipName(result.ship.getLength())}!` : `Attack again!`}`);
        } else if (result.status === 'miss') {
            displayMessage(`Miss!`);
            switchTurns = true;
        }

        renderGame();

        if (targetBoard.allShipsSunk()) {
            gameOver = true;
            showGameOver(player1.name);
            return;
        }

        if (switchTurns) {
            switchTurn();
        }
    };

    const computerTurn = () => {
        if (gameOver || !currentPlayer.isComputer) return;
        const attackData = currentPlayer.computerAttack(opponent.gameboard);
        if (attackData) {
            const { x, y, result } = attackData;
            displayMessage(`Computer attacks ${x}, ${y}...`);
            let continueTurn = false;
            if (result.status === 'hit') {
                displayMessage(`Computer Hit! ${result.ship.isSunk() ? `It sunk your ${getShipName(result.ship.getLength())}!` : 'Computer attacks again...'}`);
                continueTurn = true;
            } else {
                displayMessage('Computer Miss! Your turn.');
            }

            renderGame();

            if (opponent.gameboard.allShipsSunk()) {
                gameOver = true;
                showGameOver(player2.name);
                return;
            }

            if (continueTurn) {
                setTimeout(computerTurn, 800);
            } else {
                switchTurn();
            }
        }
    };

    const switchTurn = () => {
        if (gameOver) return;
        [currentPlayer, opponent] = [opponent, currentPlayer];
        displayMessage(`${currentPlayer.name}'s turn.`);
        renderGame();
        if (currentPlayer.isComputer) {
            setTimeout(computerTurn, 800);
        }
    };

    const setupGame = () => {
        gameOver = false;
        player1 = Player('Player 1', false);
        player2 = Player('Computer', true);
        currentPlayer = player1;
        opponent = player2;

        autoPlaceShips(player1.gameboard, shipLengths);
        autoPlaceShips(player2.gameboard, shipLengths);

        attackCallback = (event) => {
            if (gameOver || currentPlayer.isComputer) return;
            const cell = event.target;
            if (!cell.classList.contains('cell') || cell.dataset.x === undefined || cell.dataset.y === undefined) {
                return;
            }
            const x = parseInt(cell.dataset.x, 10);
            const y = parseInt(cell.dataset.y, 10);
            handleAttack(x, y);
        };

        renderGame();
        displayMessage(`${currentPlayer.name}'s turn.`);
    };

    const init = () => {
        const vsComputerButton = document.getElementById('vs-computer');
        const modeSelectionDiv = document.getElementById('game-mode-selection');

        if (!vsComputerButton || !modeSelectionDiv) {
            console.error("Required HTML elements not found!");
            return;
        }

        vsComputerButton.addEventListener('click', () => {
            setupGame();
        });

        modeSelectionDiv.style.display = 'block';
        displayMessage("Welcome! Click 'Human vs Computer' to start.");
    };

    return { init };
};

export default GameController;
