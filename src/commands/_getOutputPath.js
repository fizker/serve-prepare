// @flow strict

const getFilePathFromInput = require("../getFilePathFromInput")

module.exports = async function([ rawOutputPath, force ]/*: $ReadOnlyArray<string>*/, filename/*: string*/) /*: Promise<string>*/ {
	if(rawOutputPath == null) {
		throw new Error("output path required")
	}

	return getFilePathFromInput(rawOutputPath, filename, force === "--force")
}
