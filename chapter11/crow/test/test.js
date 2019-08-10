var assert = require('assert');

var networking = require('../networking');
var crow_tech = require('../crow-tech');


// describe('availableNeighbors()', function() {
//   it('should return a list of...', function(done) {
//     assert.equal(networking.availableNeighbors(networking.bigOak), "a");
//   });
// });

// beforeEach(function(done) {
//   return new Promise((resolve) => {
//     networking.everywhere(nest => {
//       nest.state.connections = new Map;
//       nest.state.connections.set(nest.name, nest.neighbors);
//       networking.broadcastConnections(nest, nest.name);
//       console.log("0");
//     });
//   }).then(done());
// });

describe('findRoute()', function() {
  it('should return somewhere...', function() {
    this.timeout(10000);
    // return new Promise( (resolve) => {
    //   networking.everywhere(nest => {
    //     nest.state.connections = new Map;
    //     nest.state.connections.set(nest.name, nest.neighbors);
    //     networking.broadcastConnections(nest, nest.name);
    //     console.log("0");
    //   });
    // }).then(function() {
    //   console.log("1");
    //   assert.equal(networking.findRoute("Big Oak", "Church Tower", networking.bigOak.state.connections), "Cow Pasture");
    // });

    // networking.everywhere(nest => {
    //   nest.state.connections = new Map;
    //   nest.state.connections.set(nest.name, nest.neighbors);
    //   networking.broadcastConnections(nest, nest.name);
    //   console.log("1");
    // });
    // setTimeout( () => true, 5000);
    // assert.equal(networking.findRoute("Big Oak", "Church Tower", networking.bigOak.state.connections), "Cow Pastur");


  });
});