import Gameboard from './gameboard.js';

const Player = (name = 'Player', isComputer = false, boardSize = 10) => {
    const gameboard = Gameboard(boardSize);
    const playerName = name;
    const computer = isComputer;
    let previousAttacks = new Set();

    const attack = (enemyBoard, x, y) => {
        return enemyBoard.receiveAttack(x, y);
    };

    const generateRandomCoords = (boardSize) => {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        return { x, y };
    };

    const computerAttack = (enemyBoard) => {
        if (!computer) return null;

        let x, y, coordKey;
        let attempts = 0;
        const maxAttempts = boardSize * boardSize * 2;

        do {
            const coords = generateRandomCoords(enemyBoard.size);
            x = coords.x;
            y = coords.y;
            coordKey = `${x},${y}`;
            attempts++;
            if (attempts > maxAttempts) {
                console.error("Computer failed to find a valid move!");
                return null;
            }
        } while (previousAttacks.has(coordKey));

        previousAttacks.add(coordKey);
        const result = enemyBoard.receiveAttack(x, y);

        return { x, y, result };
    };

    const reset = () => {
        previousAttacks.clear();
    };

    return {
        get name() { return playerName; },
        get isComputer() { return computer; },
        gameboard,
        attack,
        computerAttack,
        reset,
    };
};

export default Player;
