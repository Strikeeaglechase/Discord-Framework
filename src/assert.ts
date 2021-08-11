function assert(bool: boolean, message?: string): asserts bool {
	if (!bool) throw new Error(message);
}

export { assert };