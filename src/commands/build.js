// @flow strict

const fs = require("fs")
const path = require("path")
const mime = require("mime")

const assertSetupRequest = require("../assertSetupRequest")
const createOutputFolders = require("../createOutputFolders")
const prepareOutputFiles = require("../prepareOutputFiles")
const listFiles = require("../listFiles")

/*::
import type { ServerSetup, Folders } from "../types"
*/

module.exports = cmd

async function cmd(argv/*: $ReadOnlyArray<string>*/) {
	const { requestPath, targetDir, outputDir, isCompressionSkipped } = parseArgv(argv)

	const rawRequest = await fs.promises.readFile(requestPath, "utf-8")
	const request = assertSetupRequest(JSON.parse(rawRequest))

	await fs.promises.rmdir(outputDir,
		// $FlowFixMe flow 0.114.0 does not support the recursive statement
		{ recursive: true })

	const allFiles = await listFiles(targetDir)
	const folders = await createOutputFolders(outputDir)
	const sizes = await prepareOutputFiles(targetDir, folders, allFiles, isCompressionSkipped)

	if(request.catchAllFile) {
		request.files = request.files.concat(request.catchAllFile)
	}

	const files = sizes.map(({ path, sizes }) => {
		const overrides = request.files.find(x => x.path === path) || { headers: {} }
		const mimeType = overrides.mime || "" || mime.getType(path)
		if(mimeType == null) {
			throw new Error(`Could not determine mime-type for ${path}`)
		}

		return {
			path,
			sizes,
			statusCode: overrides.statusCode || 0 || 200,
			headers: overrides.headers,
			mime: mimeType,
		}
	})

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

	await fs.promises.writeFile(path.join(outputDir, "setup.json"), JSON.stringify(setup, null, 2))

	return `Finished preparing output in ${outputDir}`
}

function denormalizeFolders(outputDir/*: string*/, absoluteFolders/*: Folders*/) /*: Folders */ {
	return {
		identity: path.relative(outputDir, absoluteFolders.identity),
		deflate: path.relative(outputDir, absoluteFolders.deflate),
		gzip: path.relative(outputDir, absoluteFolders.gzip),
		brotli: path.relative(outputDir, absoluteFolders.brotli),
	}
}

function parseArgv(argv/*: $ReadOnlyArray<string>*/) /*: { requestPath: string, targetDir: string, outputDir: string, isCompressionSkipped: boolean }*/{
	const rawRequestPath = argv.find(x => x.startsWith("--request"))
	const rawTargetDir = argv.find(x => x.startsWith("--target"))
	const rawOutputDir = argv.find(x => x.startsWith("--output"))
	const isCompressionSkipped = argv.includes("--skip-compression") || process.env.SERVE_SKIP_COMPRESSION === "true"

	if(rawRequestPath == null || rawTargetDir == null || rawOutputDir == null) {
		throw new Error("Command usage: build --request=<path to request config> --target=<path to target dir> --output=<path to output dir>")
	}

	const requestPath = path.resolve(rawRequestPath.replace("--request=", ""))
	const targetDir = path.resolve(rawTargetDir.replace("--target=", ""))
	const outputDir = path.resolve(rawOutputDir.replace("--output=", ""))

	return { requestPath, targetDir, outputDir, isCompressionSkipped }
}
