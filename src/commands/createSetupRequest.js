// @flow strict

const path = require("path")
const fs = require("fs")
const stream = require("stream")
const util = require("util")

const pipeline = util.promisify(stream.pipeline)

const getOutputPath = require("./_getOutputPath")

module.exports = async function(argv/*: $ReadOnlyArray<string>*/) {
	const outputPath = await getOutputPath(argv, "serve-setup-request.json")

	await pipeline(
		fs.createReadStream(path.join(__dirname, "../../sample-serve-setup-request.json")),
		fs.createWriteStream(outputPath),
	)

	return `Created ${outputPath}`
}
