// tests/ship.test.js
import Ship from '../src/ship';

describe('Ship Factory', () => {
  let testShip;

  beforeEach(() => {
    testShip = Ship(3); // Example: Cruiser
  });

  test('Ship creation', () => {
    expect(testShip.getLength()).toBe(3);
    expect(testShip.getHits()).toBe(0);
    expect(testShip.isSunk()).toBe(false);
  });

  test('hit() increases hits', () => {
    testShip.hit();
    expect(testShip.getHits()).toBe(1);
    expect(testShip.isSunk()).toBe(false);
  });

  test('Multiple hits', () => {
    testShip.hit();
    testShip.hit();
    expect(testShip.getHits()).toBe(2);
    expect(testShip.isSunk()).toBe(false);
  });

  test('isSunk() becomes true when hits equal length', () => {
    testShip.hit();
    testShip.hit();
    testShip.hit();
    expect(testShip.getHits()).toBe(3);
    expect(testShip.isSunk()).toBe(true);
  });

  test('hit() does not increase hits after sunk', () => {
    testShip.hit();
    testShip.hit();
    testShip.hit();
    testShip.hit(); // Extra hit
    expect(testShip.getHits()).toBe(3); // Should not exceed length
    expect(testShip.isSunk()).toBe(true);
  });

   test('Throws error for invalid length', () => {
    expect(() => Ship(0)).toThrow('Ship length must be at least 1.');
    expect(() => Ship(-1)).toThrow('Ship length must be at least 1.');
  });
});