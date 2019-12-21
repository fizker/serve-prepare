// @flow strict

const path = require("path")
const fs = require("fs")

const getPathStatus = require("../getPathStatus")

module.exports = async function([ rawOutputPath, force ]/*: $ReadOnlyArray<string>*/, filename/*: string*/) /*: Promise<string>*/ {
	if(rawOutputPath == null) {
		throw new Error("output path required")
	}

	const absOutputPath = path.resolve(rawOutputPath)

	const [ pathStats, parentStats ] = await Promise.all([
		getPathStatus(absOutputPath),
		getPathStatus(path.dirname(absOutputPath)),
	])

	if(parentStats === "missing") {
		throw new Error("The given path must be to an existing folder or a file in an existing folder")
	}

	const outputPath = pathStats === "folder" ? path.join(absOutputPath, filename) : absOutputPath

	const outputStats = await getPathStatus(outputPath)
	if(outputStats === "file" && force !== "--force") {
		throw new Error(`\`${outputPath}\` already exists, add \`--force\` to override the existing file`)
	}

	return outputPath
}
