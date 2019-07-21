//

// Look up a food cache in the storage bulbs of the Big Oak nest.
console.log("Look up a food cache in the storage bulbs of the Big Oak nest.");

bigOak.readStorage("food caches", caches => {
    let firstCache = caches[0];
    bigOak.readStorage(firstCache, info => {
        console.log(info);
    });
});

console.log();

// Send a message to another nest.
console.log("Send a message to another nest.");

bigOak.send("Cow Pasture", "note", "Let's caw loudly at 7PM",
    () => console.log("Note delivered."));

console.log();

