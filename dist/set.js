Set.prototype.map = function map(f) {
    var newSet = new Set();
    for (var v of this.values())
        newSet.add(f(v));
    return newSet;
};
Set.prototype.filter = function filter(f) {
    var newSet = new Set();
    for (var v of this)
        if (f(v))
            newSet.add(v);
    return newSet;
};
Set.prototype.array = function array() {
    return [...this];
};
export {};
