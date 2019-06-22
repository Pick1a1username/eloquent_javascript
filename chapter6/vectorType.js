class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    minus(other) {
        return new Vec(this.x - other.x, this.y - other.y);
    }

    get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}

// Test
let vecA = new Vec(1, 1);
let vecB = new Vec(2, 2);

console.log(vecA.plus(vecB));
console.log(vecA.minus(vecB));

console.log(vecA.length);
console.log(vecB.length);
