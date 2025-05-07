// tests/gameboard.test.js
import Gameboard from '../src/gameboard';
import Ship from '../src/ship'; // Need Ship for testing placing/hitting

describe('Gameboard Factory', () => {
  let gameboard;
  const boardSize = 10;

  beforeEach(() => {
    gameboard = Gameboard(boardSize);
  });

  test('Initialization', () => {
    expect(gameboard.getBoard().length).toBe(boardSize);
    expect(gameboard.getBoard()[0].length).toBe(boardSize);
    expect(gameboard.getMissedAttacks().length).toBe(0);
    expect(gameboard.getShips().length).toBe(0);
    expect(gameboard.allShipsSunk()).toBe(true); // No ships yet
  });

  describe('placeShip', () => {
    test('Place ship horizontally successfully', () => {
      expect(gameboard.placeShip(3, 0, 0, false)).toBe(true);
      const board = gameboard.getBoard();
      expect(board[0][0]).toBeInstanceOf(Object); // Should be the Ship object
      expect(board[0][1]).toBeInstanceOf(Object);
      expect(board[0][2]).toBeInstanceOf(Object);
      expect(board[0][3]).toBeNull();
      expect(gameboard.getShips().length).toBe(1);
    });

    test('Place ship vertically successfully', () => {
      expect(gameboard.placeShip(4, 1, 1, true)).toBe(true);
      const board = gameboard.getBoard();
      expect(board[1][1]).toBeInstanceOf(Object);
      expect(board[2][1]).toBeInstanceOf(Object);
      expect(board[3][1]).toBeInstanceOf(Object);
      expect(board[4][1]).toBeInstanceOf(Object);
      expect(board[5][1]).toBeNull();
      expect(board[1][2]).toBeNull();
       expect(gameboard.getShips().length).toBe(1);
    });

    test('Cannot place ship out of bounds (horizontal)', () => {
      expect(gameboard.placeShip(3, 0, 8, false)).toBe(false); // 0,8 0,9 0,10(invalid)
      expect(gameboard.getShips().length).toBe(0);
    });

     test('Cannot place ship out of bounds (vertical)', () => {
      expect(gameboard.placeShip(4, 8, 0, true)).toBe(false); // 8,0 9,0 10,0(invalid) 11,0(invalid)
       expect(gameboard.getShips().length).toBe(0);
    });

    test('Cannot place ship overlapping another ship', () => {
      gameboard.placeShip(3, 0, 0, false); // Place first ship at [0,0], [0,1], [0,2]
      expect(gameboard.placeShip(2, 0, 1, true)).toBe(false); // Try to place at [0,1], [1,1] - overlaps at [0,1]
      expect(gameboard.getShips().length).toBe(1); // Only the first ship should be there
    });
  });

  describe('receiveAttack', () => {
    beforeEach(() => {
      // Place a ship for hit testing
      gameboard.placeShip(3, 2, 2, false); // Ship at [2,2], [2,3], [2,4]
    });

    test('Registers a miss', () => {
       const result = gameboard.receiveAttack(0, 0);
       expect(result.status).toBe('miss');
       expect(gameboard.getMissedAttacks()).toContainEqual([0, 0]);
       expect(gameboard.getBoard()[0][0]).toBeNull(); // Or 'miss' if you modify board state
    });

    test('Registers a hit', () => {
      const result = gameboard.receiveAttack(2, 2);
      expect(result.status).toBe('hit');
      expect(result.ship).toBeDefined();
      expect(result.ship.getHits()).toBe(1);
      expect(gameboard.getMissedAttacks().length).toBe(0); // Hit is not a miss
      expect(result.ship.isSunk()).toBe(false);
    });

    test('Registers multiple hits on the same ship', () => {
       gameboard.receiveAttack(2, 2);
       const result = gameboard.receiveAttack(2, 3);
       expect(result.status).toBe('hit');
       expect(result.ship.getHits()).toBe(2);
       expect(result.ship.isSunk()).toBe(false);
    });

    test('Sinks a ship', () => {
       gameboard.receiveAttack(2, 2);
       gameboard.receiveAttack(2, 3);
       const result = gameboard.receiveAttack(2, 4); // Final hit
       expect(result.status).toBe('hit');
       expect(result.ship.getHits()).toBe(3);
       expect(result.ship.isSunk()).toBe(true);
    });

    test('Returns invalid for out-of-bounds attack', () => {
       const result = gameboard.receiveAttack(10, 10);
       expect(result.status).toBe('invalid');
       expect(result.message).toContain('out of bounds');
    });

    // Add tests for attacking the same spot (miss then attack, hit then attack)
    // Need to refine how receiveAttack checks this (e.g., check missedAttacks array, check board state)
    test('Returns invalid for attacking a missed spot again', () => {
        gameboard.receiveAttack(0, 0); // Miss
        const result = gameboard.receiveAttack(0, 0); // Attack again
        expect(result.status).toBe('invalid');
        expect(result.message).toContain('Already missed');
    });

     // This test requires more complex state tracking in receiveAttack or Ship
     // test('Returns invalid for attacking a hit spot again', () => {
     //    gameboard.receiveAttack(2, 2); // Hit
     //    const result = gameboard.receiveAttack(2, 2); // Attack again
     //    expect(result.status).toBe('invalid');
     //    expect(result.message).toContain('Already hit');
     // });
  });

  describe('allShipsSunk', () => {
     beforeEach(() => {
      // Place two ships
      gameboard.placeShip(2, 0, 0, false); // Ship 1 at [0,0], [0,1]
      gameboard.placeShip(1, 5, 5, false); // Ship 2 at [5,5]
    });

     test('Reports false when no ships are sunk', () => {
        expect(gameboard.allShipsSunk()).toBe(false);
     });

     test('Reports false when only some ships are sunk', () => {
        // Sink ship 1
        gameboard.receiveAttack(0, 0);
        gameboard.receiveAttack(0, 1);
        expect(gameboard.allShipsSunk()).toBe(false);
     });

     test('Reports true when all ships are sunk', () => {
        // Sink ship 1
        gameboard.receiveAttack(0, 0);
        gameboard.receiveAttack(0, 1);
        // Sink ship 2
        gameboard.receiveAttack(5, 5);
        expect(gameboard.allShipsSunk()).toBe(true);
     });
  });
});