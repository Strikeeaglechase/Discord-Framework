declare global {
    interface Set<T> {
        map<V>(f: (item: T) => V): Set<V>;
        filter(f: (item: T) => boolean): Set<T>;
        array(): Array<T>;
    }
}
export {};
