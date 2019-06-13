function isEven(number) {
  if ( number === 0 ) {
    return false;
  } else if ( number === 1 ) {
    return true;
  } else if ( number < 0 ) {
    return isEven(-number);
  } else {
    return isEven(number - 2);
  }
}

console.log("50: " + isEven(50));
console.log("75: " + isEven(75));
console.log("-1: " + isEven(-1));



