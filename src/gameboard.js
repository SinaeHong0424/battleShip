import Ship from './ship.js';

const Gameboard = (size = 10) => {
    const board = Array(size).fill(null).map(() => Array(size).fill(null));
    const ships = [];
    const missedAttacks = [];
    const successfulHits = [];

    const isValidCoord = (x, y) => x >= 0 && x < size && y >= 0 && y < size;
    const isAlreadyAttacked = (x, y) =>
        missedAttacks.some(m => m[0] === x && m[1] === y) ||
        successfulHits.some(h => h[0] === x && h[1] === y);

    const placeShip = (shipLength, startX, startY, isVertical) => {
        const newShip = Ship(shipLength);
        const coords = [];

        for (let i = 0; i < shipLength; i++) {
            const x = isVertical ? startX + i : startX;
            const y = isVertical ? startY : startY + i;

            if (!isValidCoord(x, y) || board[x][y] !== null || isAlreadyAttacked(x, y)) {
                return false;
            }
            coords.push({ x, y });
        }

        for (const coord of coords) {
            if (board[coord.x][coord.y] !== null) {
                return false;
            }
        }

        coords.forEach(coord => {
            board[coord.x][coord.y] = newShip;
        });

        ships.push(newShip);
        return true;
    };

    const receiveAttack = (x, y) => {
        if (!isValidCoord(x, y)) {
            return { status: 'invalid', message: 'Coordinates out of bounds.' };
        }

        if (isAlreadyAttacked(x, y)) {
            const message = missedAttacks.some(m => m[0] === x && m[1] === y)
                ? 'Already missed this spot.'
                : 'Already hit this spot.';
            return { status: 'invalid', message };
        }

        const target = board[x][y];

        if (target && typeof target.hit === 'function') {
            target.hit();
            successfulHits.push([x, y]);
            return { status: 'hit', ship: target, coordinates: [x, y] };
        } else {
            missedAttacks.push([x, y]);
            return { status: 'miss', coordinates: [x, y] };
        }
    };

    const allShipsSunk = () => ships.every(ship => ship.isSunk());

    const getBoard = () => board;
    const getMissedAttacks = () => missedAttacks;
    const getShips = () => ships;
    const getSuccessfulHits = () => successfulHits;

    return {
        placeShip,
        receiveAttack,
        allShipsSunk,
        getBoard,
        getMissedAttacks,
        getSuccessfulHits,
        getShips,
        isValidCoord,
        isAlreadyAttacked,
        size
    };
};

export default Gameboard;
