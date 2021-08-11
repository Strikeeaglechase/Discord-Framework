function assert(bool, message) {
    if (!bool)
        throw new Error(message);
}
export { assert };
