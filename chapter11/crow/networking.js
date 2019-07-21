class Timeout extends Error {}

// Even though the following code is written in the book,
// it doesn't work.
// import {bigOak} from "./crow-tech";
// import {defineRequestType} from "./crow-tech";


var bigOak = require("./crow-tech").bigOak;
var defineRequestType = require("./crow-tech").defineRequestType;
var everywhere = require("./crow-tech").everywhere;

/*


*/
defineRequestType("note", (nest, content, source, done) => {
    console.log(`${nest.name} received note: ${content}`);
    done();
});


/**
 * Get info of something in the storage.
 * @param {Node} - Current nest.
 */
function storage(nest, name) {
  return new Promise(resolve => {
    nest.readStorage(name, result => resolve(result));
  });
}

/**
 * Send a request.
 * @param {Node} nest 
 * @param {string} target 
 * @param {string} type 
 * @param {string} content 
 */
function request(nest, target, type, content) {
  return new Promise((resolve, reject) => {
    let done = false;

    /**
     * 
     * @param {number} n - The count attempted.
     */
    function attempt(n) {
      nest.send(target, type, content, (failed, value) => {
        done = true;
        if (failed) reject(failed);
        else resolve(value);
      });
      // If there is no response after 250 ms, retry or reject the promise.
      setTimeout(() => {
        if (done) return;
        else if (n < 3) attempt(n + 1);
        else reject(new Timeout("Timed out"));
      }, 250);
    }
    attempt(1);
  });
}

/**
 * Wrapper for defineRequestType, allowing the handler function to
 * return a promise or plain value.
 * @param {string} name 
 * @param {Function} handler 
 */
function requestType(name, handler) {
    defineRequestType(name, (nest, content, source, callback) => {
        try {
            Promise.resolve(handler(nest, content, source))
                .then(
                    response => callback(null, response),
                    failure => callback(failure)
                );
        } catch (exception) {
            callback(exception);
        }
    });
}

// Create a new request type for ping.
requestType("ping", () => "pong");

/**
 * Get reachable neighbors.
 * @param {*} nest 
 */
function availableNeighbors(nest) {
  // Send a "ping" request to each of neighbors.
  let requests = nest.neighbors.map(neighbor => {
    return request(nest, neighbor, "ping")
      .then(() => true, () => false);
    });
  return Promise.all(requests).then(result => {
    // ?
    return nest.neighbors.filter((_, i) => result[i]);
  });
}

// Add a property to the nest's state object.
everywhere(nest => {
  nest.state.gossip = [];
});

/**
 * Send a gossip to rechable neighbors
 * @param {Node} nest 
 * @param {string} message 
 * @param {Node} exceptFor 
 */
function sendGossip(nest, message, exceptFor = null) {
  nest.state.gossip.push(message);
  for (let neighbor of nest.neighbors) {
    if (neighbor == exceptFor) continue;
    request(nest, neighbor, "gossip", message);
  }
}

// Create a new request type for gossip.
requestType("gossip", (nest, message, source) => {
  if (nest.state.gossip.includes(message)) return;
  console.log(`${nest.name} received gossip '${message}' from ${source}`);
});


// Create a new request type for connections.
requestType(
  "connections",
  (nest, {name, neighbors}, source) => {
    let connections = nest.state.connections;
    if (JSON.stringify(connections.get(name)) == JSON.stringify(neighbors)) return;
    connections.set(name, neighbors);
    broadcastConnections(nest, name, source);
    }
);

/**
 * Broadcast Connections
 * @param {Node} nest - The current nest.
 * @param {?} name - 
 * @param {Node} exceptFor - ?
 */
function broadcastConnections(nest, name, exceptFor = null) {
    for (let neighbor of nest.neighbors) {
        if (neighbor == exceptFor) continue;
        request(nest, neighbor, "connections", {
            name,
            neighbors: nest.state.connections.get(name)
        });
    }
}

// ???
everywhere(nest => {
    nest.state.connections = new Map;
    nest.state.connections.set(nest.name, nest.neighbors);
    broadcastConnections(nest, nest.name);
}); 


/**
 * Search for a way to reach a given node in the network.
 *
 * Note that this function just returns the next step.
 * @param {string} from - Source nest.
 * @param {string} to - Target nest.
 * @param {?} connections - Source nest's neighbors
 */
function findRoute(from, to, connections) {
    let work = [{at: from, via: null}];
    for (let i = 0; i < work.length; i++) {
        let {at, via} = work[i];
        for (let next of connections.get(at) || []) {
            if (next == to) return via;
            if (!work.some(w => w.at == next)) {
                work.push({at: next, via: via || next});
            }
        }
    }

    return null;
}

// Create a new request type for route.
requestType(
    "route",
    (nest, {target, type, content}) => {
        return routeRequest(nest, target, type, content);
    }
);

/**
 * Send long-distance messages
 * @param {Node} nest - Current nest.
 * @param {string} target - Target nest.
 * @param {string} type - Type of request.
 * @param {string} content - Content of request. 
 */
function routeRequest(nest, target, type, content) {
  // If target is a direct neighbor, send it directly.
  if (nest.neighbors.includes(target)) {
    return request(nest, target, type, content);
  // If target is not a direct neighbor, send it via ...
  } else {
    let via = findRoute(nest.name, target, nest.state.connections);
    if (!via) throw new Error(`No route to ${target}`);
    return request(nest, via, "route", {target, type, content});
  }
}


// Create a new request type for storage.
requestType("storage", (nest, name) => storage(nest, name));

/**
 * Retrieve a specific information which the current nest doesn't have.
 * @param {Node} nest - Current nest.
 * @param {string} name - The name of the information.
 */
async function findInStorage(nest, name) {
    let local = await storage(nest, name);
    if (local != null) return local;

    let sources = network(nest).filter(n => n != nest.name);

    while (sources.length > 0) {
        let source = sources[Math.floor(Math.random() * sources.length)];
        source = sources.filter(n => n != source);

        try {
            let found = await routeRequest(nest, source, "storage", name);
            if (found != null) return found;
        } catch (_) {}
    }
    throw new Error("Not found");
}


/**
 * Get neighbor's names.
 * @param {Node} nest - Current nest.
 */
function network(nest) {
    return Array.from(nest.state.connections.keys());
}


/**
 * ?
 * @param {Node} nest - Current nest.
 * @param {?} source - ?
 * @param {?} name - ?
 */
function anyStorage(nest, source, name) {
    if (source == nest.name) return storage(nest, name);
    else return routeRequest(nest, source, "storage", name);
}


/**
 * Get the number of chicks from all neighbors.
 * @param {Node} nest - Current nest.
 * @param {number} year - The year of ...
 */
async function chicks(nest, year) {
    let lines = network(nest).map(async name => {
        return name + ": " +
            await anyStorage(nest, name, `chicks in ${year}`);
    });
    return (await Promise.all(lines)).join("\n");
}


// ?
storage(bigOak, "enemies")
  .then(value => console.log("Got", value));


// Look up a food cache in the storage bulbs of the Big Oak nest.
// console.log("Look up a food cache in the storage bulbs of the Big Oak nest.");

// bigOak.readStorage("food caches", caches => {
//   let firstCache = caches[0];
//   bigOak.readStorage(firstCache, info => {
//     console.log(info);
//   });
// });

// console.log();

// Send a gossip to reachable neighbors.
// console.log("Send a gossip to all neighbors.");

// sendGossip(bigOak, "Kids with airgun in the park");

// console.log();

// Send a message to another nest.
// console.log("Send a message to another nest.");

// bigOak.send("Cow Pasture", "note", "Let's caw loudly at 7PM",
//   () => console.log("Note delivered."));

// console.log();

// Send a message to the nest in the church tower.
// console.log("Send a message to the nest in the church tower.");

// // This part is supposed to be done successfully.
// routeRequest(bigOak, "Church Tower", "note", "Incoming jackdaws!");