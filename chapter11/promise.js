new Promise((_, reject) => reject(new Error("Fail")))
    .then(value => console.log("Handler1"))
    .catch(reason => {
        console.log("Caught failure " + reason);
        return "nothing";
    })
    .then(value => console.log("Handler2", value));
