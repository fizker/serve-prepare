// @flow strict

const fs = require("fs")
const stream = require("stream")
const util = require("util")

const pipeline = util.promisify(stream.pipeline)

module.exports = function(input/*: string*/, output/*: string*/) /*: Promise<void>*/ {
	return pipeline(
		fs.createReadStream(input),
		fs.createWriteStream(output),
	)
}
