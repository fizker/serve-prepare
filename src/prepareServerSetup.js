// @flow strict

const fs = require("fs")
const path = require("path")

const assertSetupRequest = require("./assertSetupRequest")
const createOutputFolders = require("./createOutputFolders")
const prepareOutputFiles = require("./prepareOutputFiles")
const listFiles = require("./listFiles")
const prepareFile = require("./prepareFile")

/*::
import type { ServerSetup, Folders } from "@fizker/serve"

export type PrepareServerSetupOptions = {
	requestPath: string,
	targetDir: string,
	outputDir: string,
	isCompressionSkipped: boolean,
}
*/

module.exports = async function({ requestPath, targetDir, outputDir, isCompressionSkipped }/*: PrepareServerSetupOptions*/) /*: Promise<ServerSetup>*/ {
	const rawRequest = await fs.promises.readFile(requestPath, "utf-8")
	const request = assertSetupRequest(JSON.parse(rawRequest))

	await fs.promises.rmdir(outputDir,
		// $FlowFixMe flow 0.117.0 does not support the recursive statement
		{ recursive: true })

	const allFiles = await listFiles(targetDir)
	const folders = await createOutputFolders(outputDir)
	const sizes = await prepareOutputFiles(targetDir, folders, allFiles, isCompressionSkipped)

	if(request.catchAllFile) {
		request.files = request.files.concat(request.catchAllFile)
	}

	const files = sizes.map(x => prepareFile(request, x))

	let catchAllFile = null
	if(request.catchAllFile) {
		const caf = request.catchAllFile
		const index = files.findIndex(x => x.path === caf.path)
		if(index < 0) {
			throw new Error("CatchAllFile is missing")
		}
		[ catchAllFile ] = files.splice(index, 1)
	}

	const setup = {
		aliases: [],
		folders: denormalizeFolders(outputDir, folders),
		catchAllFile,
		globalHeaders: request.globalHeaders,
		files,
	}

	return setup
}

function denormalizeFolders(outputDir/*: string*/, absoluteFolders/*: Folders*/) /*: Folders */ {
	return {
		identity: path.relative(outputDir, absoluteFolders.identity),
		deflate: path.relative(outputDir, absoluteFolders.deflate),
		gzip: path.relative(outputDir, absoluteFolders.gzip),
		brotli: path.relative(outputDir, absoluteFolders.brotli),
	}
}
