// @flow strict

const path = require("path")
const fs = require("fs")

/*::
import type { Folders } from "@fizker/serve"
*/

module.exports = createOutputFolders
async function createOutputFolders(outputDir/*: string*/) /*: Promise<Folders> */ {
	const folders = {
		identity: path.join(outputDir, "files"),
		deflate: path.join(outputDir, "deflate"),
		gzip: path.join(outputDir, "gzip"),
		brotli: path.join(outputDir, "brotli"),
	}

	await fs.promises.mkdir(outputDir,
		// $FlowFixMe flow defs in 0.113.0 are broken
		{ recursive: true })
	await Promise.all([
		fs.promises.mkdir(folders.identity),
		fs.promises.mkdir(folders.deflate),
		fs.promises.mkdir(folders.gzip),
		fs.promises.mkdir(folders.brotli),
	])

	return folders
}
