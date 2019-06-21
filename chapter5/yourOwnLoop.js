let loop = (value, testFunction, updateFunction, bodyFunction) => {
    value.forEach(element => {
        if (testFunction(element) == false) {
            bodyFunction(element);
            loop(updateFunction(element));
            return undefined;
        }
    });   
}