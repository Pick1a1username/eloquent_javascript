class Group {

    constructor() {
        this.set = [];
    }

    add(value) {
        if (!this.has(value)) this.set.push(value);
    }

    delete(value) {
        let idx = this.set.indexOf(value);

        if ( idx != -1 ) {
            this.set.splice(idx, 1);
        }
    }

    has(value) {
        if ( this.set.indexOf(value) == -1) {
            return false;
        } else {
            return true;
        }
    }

    static from(other) {
        let group = new Group();
        other.forEach(element => {
            group.add(element);
        });

        return group;
    }

    toString() {
        return this.set.join(',');
    }
}



// Test
console.log('Creating listA...');
let listA = [1, 2, 3, 4, 4, 5, 6, 6, 6];
console.log(listA);
console.log();

console.log('creating groupA...');
let groupA = new Group();
listA.forEach(element => {
    groupA.add(element);
});
console.log(groupA.toString());
console.log();

console.log('Removing some values from the set...');
groupA.delete(3);
groupA.delete(7);
console.log(groupA.toString());
console.log();

console.log('Creating groupB from listA by from()...');
// let groupB = new Group();
let groupB = Group.from(listA);
console.log(groupB.toString());
console.log();