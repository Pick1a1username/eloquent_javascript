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

class GroupIterator {
    constructor(group) {
        this.set = group.set;
        this.counter = 0;
    }

    next() {
        if (this.counter > this.set.length - 1) return {done: true};

        let value = this.set[this.counter];

        this.counter++;

        return {value, done: false};
    }
}

Group.prototype[Symbol.iterator] = function() {
    return new GroupIterator(this);
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

console.log('Iterating groupA...');
for (let x of groupA) {
    console.log(x);
}
console.log();
