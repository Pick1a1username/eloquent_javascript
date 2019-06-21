let everyLoop = (array, predicateFunction) => {
    let result = true;
    for (let element of array) {
        if (predicateFunction(element) == false) {
            return false;
        }
    }
    return result;
};


let everySome = (array, predicateFunction) => {
    return !array.some( x => {
        return !predicateFunction(x);
    });
};

let arrayA = [2, 4, 6, 8, 10];
let arrayB = [2, 4, 7, 8, 10];

let checkEven = x => {
    if (x % 2 == 0) {
        return true;
    } else {
        return false;
    }
}


console.log("Testing everyLoop...");
console.log("Expected Result: true");
console.log(everyLoop(arrayA, checkEven));
console.log("Expected Result: false");
console.log(everyLoop(arrayB, checkEven));
console.log();

console.log("Testing everySome...");
console.log("Expected Result: true");
console.log(everySome(arrayA, checkEven));
console.log("Expected Result: false");
console.log(everySome(arrayB, checkEven));

