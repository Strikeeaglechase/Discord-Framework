declare global {
	interface Set<T> {
		map<V>(f: (item: T) => V): Set<V>;
		filter(f: (item: T) => boolean): Set<T>;
		array(): Array<T>;
	}
}
Set.prototype.map = function map<T, V>(this: Set<T>, f: (item: T) => V) {
	var newSet = new Set<V>();
	for (var v of this.values()) newSet.add(f(v));
	return newSet;
};

Set.prototype.filter = function filter<T>(this: Set<T>, f: (item: T) => boolean) {
	var newSet = new Set();
	for (var v of this) if (f(v)) newSet.add(v);
	return newSet;
};
Set.prototype.array = function array<T>(this: Set<T>) {
	return [...this];
}

// Set.prototype.every = function every(f) {
// 	for (var v of this) if (!f(v)) return false;
// 	return true;
// };

// Set.prototype.some = function some(f) {
// 	for (var v of this) if (f(v)) return true;
// 	return false;
// };
export { };