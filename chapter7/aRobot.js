function buildGraph(edges) {
    let graph = Object.create(null);

    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }

    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}


// The object of this class should be handled as immutable.
class VillageState {
    constructor(place, parcels) {
        // Robot's current place
        this.place = place;
        // parcels' place including the parcel which Robot is not carrying.
        this.parcels = parcels;
    }

    move(destination) {
        // Check whether there is a road going from the current place to the destination.
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                // If a parcel is not placed at where the robot is,
                // do not change the state of the parcel.
                if (p.place != this.place) return p;
                // Else, the robot bring the parcel to destination.
                return {place: destination, address: p.address};
            // If address is destination, delivery is done.
            // So remove the parcel from parcels.
            }).filter(p => p.place != p.address);

            return new VillageState(destination, parcels);
        }
    }
}

// Static method for generating a VillageState object randomly.
VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        // Origin should be different from destination.
        } while (place == address);
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
};

/**
 * Have a robot work
 *
 * @param {VillageObject} state
 * @param {robot(state, memory): Object} robot - Robot's function
 * @param {string[]} memory - This parameter can be omitted.
 * @return {undefined}
 * 
 */
function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        // If delivary is completed. break the loop.
        if (state.parcels.length == 0) {
            console.log(`Done in ${turn} turns`);
            break;
        }
        // Get the robot's next destination
        let action = robot(state, memory);
        // Have the robot move
        state = state.move(action.direction);
        // ?
        memory = action.memory;
        console.log(`Moved to ${action.direction}`);
    }
}

function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

// Robot moving randomly
function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
}

// Robot moving through a specified route.
function routeRobot(state, memory) {
    console.log(`Destinations Remaining: ${memory}`);
    // If the robot has gone through entire route, start from beginning.
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
}

// Find the shortest route
function findRoute(graph, from, to) {
    // 
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        // Search throught entire graph.
        for (let place of graph[at]) {
            // If the end point is the destination, 
            if (place == to) return route.concat(place);
            // If the end point is not found before,
            // consider this end point as a passing point.
            if (!work.some(w => w.at == place)) {
                work.push({at: place, route: route.concat(place)});
            }
        }
    }
}


/**
 * ?
 * 
 * @param {VillageObject} {place, parcels}
 * @param {string[]} route - It is same as 'memory' in the other robots.
 * 
 * I have no idea why the first parameter is '{place, parcels}'.
 */
function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}


// Define roads
const roads = [
    "Alice's Houst-Bob's House",
    "Alice's House-Cabin",
    "Alice's House-Post Office",
    "Bob's House-Town Hall",
    "Daria's House-Ernie's House",
    "Daria's House-Town Hall",
    "Ernie's House-Grete's House",
    "Grete's House-Farm",
    "Grete's House-Shop",
    "Marketplace-Farm",
    "Marketplace-Post Office",
    "Marketplace-Shop",
    "Marketplace-Town Hall",
    "Shop-Town Hall"
];

// Generate graphs from roads.
const roadGraph = buildGraph(roads);

const mailRoute = [
    "Alice's House",
    "Cabin",
    "Alice's House",
    "Bob's House",
    "Town Hall",
    "Daria's House",
    "Ernie's House",
    "Grete's House",
    "Shop",
    "Grete's House",
    "Farm",
    "Marketplace",
    "Post Office"
];

//
// Start delivery
//

// Test ViliageState class
console.log('Testing VillageState class...');
let first = new VillageState(
    "Post Office",
    [{place: "Post Office", address: "Alice's House"}]
);

let next = first.move("Alice's House");

console.log(next.place);
console.log(next.parcels);
console.log(first.place);

console.log();


// Test random robot
console.log('Testing random robot...');
runRobot(VillageState.random(), randomRobot);
console.log();


// Test route robot
// Note: The robot will never stop!
//
// console.log('Testing route robot...');
// runRobot(VillageState.random(), routeRobot, mailRoute);


// Test goal-oriented robot
console.log('Testing goal-oriented robot...');
runRobot(VillageState.random(), goalOrientedRobot, []);
console.log();
