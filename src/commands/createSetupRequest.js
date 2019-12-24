// @flow strict

const path = require("path")
const fs = require("fs")

const getOutputPath = require("./_getOutputPath")
const createPromiseForStream = require("../createPromiseForStream")

module.exports = async function(argv/*: $ReadOnlyArray<string>*/) {
	const outputPath = await getOutputPath(argv, "serve-setup-request.json")

	const stream = fs.createReadStream(path.join(__dirname, "../../sample-serve-setup-request.json"))
		.pipe(fs.createWriteStream(outputPath))
	await createPromiseForStream(stream)

	return `Created ${outputPath}`
}
