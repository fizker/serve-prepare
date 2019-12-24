// @flow strict

const fs = require("fs")
const createPromiseForStream = require("./createPromiseForStream")

module.exports = function(input/*: string*/, output/*: string*/) /*: Promise<void>*/ {
	const stream = fs.createReadStream(input)
		.pipe(fs.createWriteStream(output))

	return createPromiseForStream(stream)
}
