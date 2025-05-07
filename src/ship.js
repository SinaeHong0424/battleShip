const Ship = (length) => {
    if (length < 1) {
      throw new Error('Ship length must be at least 1.');
    }
  
    let hits = 0;
    let sunk = false;
  
    const hit = () => {
      if (!sunk) {
        hits += 1;
        if (hits >= length) {
          sunk = true;
        }
      }
    };
  
    const isSunk = () => sunk;
  
    const getLength = () => length; 
    const getHits = () => hits;   
  
    return {
      getLength,
      getHits, 
      hit,
      isSunk,
    };
  };
  
  export default Ship;