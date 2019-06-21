let arrayA = [1, 2, 3];
let arrayB = [4, 5, 6];
let arrayC = [7, 8, 9];
let arrayABC = [ arrayA, arrayB, arrayC ];

console.log(arrayABC.reduce((comb, array) => comb.concat(array) ));


