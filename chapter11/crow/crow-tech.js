// This code is from the following link:
// https://eloquentjavascript.net/code/crow-tech.js
//

(function() {
  // Define connections
  const connections = [
    "Church Tower-Sportsgrounds", "Church Tower-Big Maple", "Big Maple-Sportsgrounds",
    "Big Maple-Woods", "Big Maple-Fabienne's Garden", "Fabienne's Garden-Woods",
    "Fabienne's Garden-Cow Pasture", "Cow Pasture-Big Oak", "Big Oak-Butcher Shop",
    "Butcher Shop-Tall Poplar", "Tall Poplar-Sportsgrounds", "Tall Poplar-Chateau",
    "Chateau-Great Pine", "Great Pine-Jacques' Farm", "Jacques' Farm-Hawthorn",
    "Great Pine-Hawthorn", "Hawthorn-Gilles' Garden", "Great Pine-Gilles' Garden",
    "Gilles' Garden-Big Oak", "Gilles' Garden-Butcher Shop", "Chateau-Butcher Shop"
  ]

  /**
   * Generate storage info.
   * @param {?} name - ?
   */
  function storageFor(name) {
    let storage = Object.create(null)

    // Set things and infos in the storages.
    storage["food caches"] = ["cache in the oak", "cache in the meadow", "cache under the hedge"]
    storage["cache in the oak"] = "A hollow above the third big branch from the bottom. Several pieces of bread and a pile of acorns."
    storage["cache in the meadow"] = "Buried below the patch of nettles (south side). A dead snake."
    storage["cache under the hedge"] = "Middle of the hedge at Gilles' garden. Marked with a forked twig. Two bottles of beer."
    storage["enemies"] = ["Farmer Jacques' dog", "The butcher", "That one-legged jackdaw", "The boy with the airgun"]
    if (name == "Church Tower" || name == "Hawthorn" || name == "Chateau")
      storage["events on 2017-12-21"] = "Deep snow. Butcher's garbage can fell over. We chased off the ravens from Saint-Vulbas."
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    for (let y = 1985; y <= 2018; y++) {
      storage[`chicks in ${y}`] = hash % 6
      hash = Math.abs((hash << 2) ^ (hash + y))
    }
    if (name == "Big Oak") storage.scalpel = "Gilles' Garden"
    else if (name == "Gilles' Garden") storage.scalpel = "Woods"
    else if (name == "Woods") storage.scalpel = "Chateau"
    else if (name == "Chateau" || name == "Butcher Shop") storage.scalpel = "Butcher Shop"
    else storage.scalpel = "Big Oak"
    for (let prop of Object.keys(storage)) storage[prop] = JSON.stringify(storage[prop])
    return storage
  }

  /** Class representing ...? */
  class Network {
    /**
     * Create a network.
     * @param {string[]} connections - Connections
     * @param {Function} storageFor - ?
     */
    constructor(connections, storageFor) {
      let reachable = Object.create(null)
      for (let [from, to] of connections.map(conn => conn.split("-"))) {
        ;(reachable[from] || (reachable[from] = [])).push(to)
        ;(reachable[to] || (reachable[to] = [])).push(from)
      }
      this.nodes = Object.create(null)
      for (let name of Object.keys(reachable))
        this.nodes[name] = new Node(name, reachable[name], this, storageFor(name))
      this.types = Object.create(null)
    }

    /**
     * Define request type.
     * @param {string} name - The name of the type.
     * @param {Function} handler - ?
     */
    defineRequestType(name, handler) {
      this.types[name] = handler
    }

    /**
     * Run code on every nest.
     * @param {Function} f - Code to run.
     */
    everywhere(f) {
      for (let node of Object.values(this.nodes)) f(node)
    }
  }

  // ?
  const $storage = Symbol("storage"), $network = Symbol("network")

  /**
   * Convert Json format to string.
   * @param {*} value - ?
   */
  function ser(value) {
    return value == null ? null : JSON.parse(JSON.stringify(value))
  }

  /** Class representing a node. */
  class Node {
    /**
     * Create a node.
     * @param {string} name - Name
     * @param {Object} neighbors - Neighbors
     * @param {Network} network - Network
     * @param {storageFor()} storage - storageFor function
     */
    constructor(name, neighbors, network, storage) {
      this.name = name
      this.neighbors = neighbors
      this[$network] = network
      this.state = Object.create(null)
      this[$storage] = storage
    }

    /**
     * Send a message.
     * @param {string} to - Target nest.
     * @param {string} type - Type of the message.
     * @param {string} message - Content of the message.
     * @param {Function} callback - ?
     */
    send(to, type, message, callback) {
      // Set the target nest.
      let toNode = this[$network].nodes[to]
      // If the target nest is unreachable, return ...
      if (!toNode || !this.neighbors.includes(to))
        return callback(new Error(`${to} is not reachable from ${this.name}`))
      // Set the request type.
      let handler = this[$network].types[type]
      if (!handler)
        return callback(new Error("Unknown request type " + type))
      
      if (Math.random() > 0.03) setTimeout(() => {
        try {
          handler(toNode, ser(message), this.name, (error, response) => {
            setTimeout(() => callback(error, ser(response)), 10)
          })
        } catch(e) {
          callback(e)
        }
      }, 10 * Math.floor(Math.random() * 10))
    }

    /**
     * Get info of something in the storage.
     * @param {Node} name - The name of something in the storage.
     * @param {Function} callback - Callback function.
     */
    readStorage(name, callback) {
      let value = this[$storage][name]
      setTimeout(() => callback(value && JSON.parse(value)), 20)
    }

    /**
     * Add a new thing to the storage.
     * 
     * Note: This function is never used.
     * @param {string} name  - The name of the stroage.
     * @param {*} value - The value of the things.
     * @param {Function} callback - ?
     */
    writeStorage(name, value, callback) {
      setTimeout(() => {
        this[$storage][name] = JSON.stringify(value)
        callback()
      }, 20)
    }
  }

  // Initialize network.
  let network = new Network(connections, storageFor)

  // Export bindings.
  exports.bigOak = network.nodes["Big Oak"]
  exports.everywhere = network.everywhere.bind(network)
  exports.defineRequestType = network.defineRequestType.bind(network)

  // ?
  if (typeof __sandbox != "undefined") {
    __sandbox.handleDeps = false
    __sandbox.notify.onLoad = () => {
      // Kludge to make sure some functions are delayed until the
      // nodes have been running for 500ms, to give them a chance to
      // propagate network information.
      let waitFor = Date.now() + 500
      function wrapWaiting(f) {
        return function(...args) {
          let wait = waitFor - Date.now()
          if (wait <= 0) return f(...args)
          return new Promise(ok => setTimeout(ok, wait)).then(() => f(...args))
        }
      }
      for (let n of ["routeRequest", "findInStorage", "chicks"])
        window[n] = wrapWaiting(window[n])
    }
  }

  // ?
  if (typeof window != "undefined") {
    window.require = name => {
      if (name != "./crow-tech") throw new Error("Crow nests can only require \"./crow-tech\"")
      return exports
    }
  } else if (typeof module != "undefined" && module.exports) {
    module.exports = exports
  }
})()

