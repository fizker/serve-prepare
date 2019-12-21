// @flow strict

module.exports = function createPromiseForStream(stream/*: stream$Stream*/) /*: Promise<void>*/ {
	return new Promise((res, rej) => {
		stream
		.on("error", rej)
		.on("close", res)
	})
}
