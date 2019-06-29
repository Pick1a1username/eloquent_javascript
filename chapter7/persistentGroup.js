class PGroup {

    // constructor() {
    //     this.set = [];
    // }

    add(value) {
        if (!this.has(value)) {
            this.set.push(value);
        } else {
            let newGroup = PGroup.empty;
            this.set.forEach( element => {
                newGroup.add(element);
            });
            return newGroup;
        }
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

    get empty() {
        return Object.create(PGroup, { 'set' : []});
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


console.log(PGroup.empty);
let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false