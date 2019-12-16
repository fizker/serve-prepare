// @flow strict

const fs = require("fs")
const path = require("path")
const util = require("util")
const glob = util.promisify(require("glob"))
const mime = require("mime")

const assertSetupRequest = require("./src/assertSetupRequest")
const createOutputFolders = require("./src/createOutputFolders")
const prepareOutputFiles = require("./src/prepareOutputFiles")

/*::
import type { ServerSetup, Folders } from "./src/types"
*/

const [ , , requestPath ] = process.argv
const absRequestPath = path.resolve(requestPath)

prepareFiles(absRequestPath)
	.then(
		() => { console.log("all done") },
		(e) => {
			console.error(e.stack)
			process.exit(1)
		},
	)

async function prepareFiles(requestPath/*: string*/) /*: Promise<ServerSetup> */ {
	const rawRequest = await fs.promises.readFile(requestPath, "utf-8")
	const request = assertSetupRequest(JSON.parse(rawRequest))

	const baseDir = path.dirname(requestPath)
	const targetDir = path.resolve(baseDir, request.target)
	const outputDir = path.resolve(baseDir, request.output)

	await fs.promises.rmdir(outputDir,
		// $FlowFixMe flow 0.113 does not support the recursive statement
		{ recursive: true })

	const allFiles = await glob("**/*", { cwd: targetDir, nodir: true })
	const folders = await createOutputFolders(outputDir)
	const sizes = await prepareOutputFiles(targetDir, folders, allFiles)

	const setup = {
		aliases: [],
		folders: denormalizeFolders(outputDir, folders),
		catchAllFile: null,
		globalHeaders: request.globalHeaders,
		files: sizes.map(({ path, sizes }) => {
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
		}),
	}

	await fs.promises.writeFile(path.join(outputDir, "setup.json"), JSON.stringify(setup, null, 2))

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
