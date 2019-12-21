// @flow strict

const fs = require("fs")

module.exports = async function getPathStatus(path/*: string*/) /*: Promise<"folder"|"file"|"missing">*/ {
	try {
		const stats = await fs.promises.stat(path)
		return stats.isDirectory() ? "folder" : "file"
	} catch(e) {
		return "missing"
	}
}
