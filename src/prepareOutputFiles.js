// @flow strict

const path = require("path")
const fs = require("fs")
const zlib = require("zlib")
const stream = require("stream")

const createOutputFolders = require("./createOutputFolders")
const getAllFolders = require("./getAllFolders")
const createPromiseForStream = require("./createPromiseForStream")

/*::
import type { Folders, Sizes } from "@fizker/serve"
*/

module.exports = prepareOutputFiles
async function prepareOutputFiles(
	inputFolder/*: string*/,
	folders/*: Folders*/,
	files/*: $ReadOnlyArray<string>*/,
	isCompressionSkipped/*: boolean*/,
) /*: Promise<$ReadOnlyArray<{ path: string, sizes: Sizes }>>*/ {
	const allFolders = getAllFolders(files, { leafsOnly: true })

	await Promise.all(Object.keys(folders).map(async (x) => {
		const rootFolder = folders[x]
		for(const folder of allFolders) {
			const pathToCreate = path.join(rootFolder, folder)
			await fs.promises.mkdir(pathToCreate,
				// $FlowFixMe flow defs in 0.114.0 are broken
				{ recursive: true })
		}
	}))

	return Promise.all(files.map(async (path) => ({
		path: "/" + path,
		sizes: await prepareFile(inputFolder, folders, path, isCompressionSkipped)
	})))
}

async function prepareFile(
	inputFolder/*: string*/,
	folders/*: Folders*/,
	filename/*: string*/,
	isCompressionSkipped/*: boolean*/,
) /*: Promise<Sizes>*/ {
	const inputStream = fs.createReadStream(path.join(inputFolder, filename))
	const [ identity, gzip, deflate, brotli ] = await Promise.all([
		compressAndGetSize(folders, "identity", filename, inputStream),
		isCompressionSkipped ? null : compressAndGetSize(folders, "gzip", filename, inputStream),
		isCompressionSkipped ? null : compressAndGetSize(folders, "deflate", filename, inputStream),
		isCompressionSkipped ? null : compressAndGetSize(folders, "brotli", filename, inputStream),
	])

	return {
		identity,
		gzip,
		deflate,
		brotli,
	}
}

async function compressAndGetSize(folders, key, filename, inputStream) {
	const compressor = getCompressorForType(key)
	const output = path.join(folders[key], filename)
	const outputStream = fs.createWriteStream(output)
	await createPromiseForStream(
		inputStream
		.pipe(compressor)
		.pipe(outputStream)
	)
	const stat = await fs.promises.stat(output)
	return stat.size
}

function getCompressorForType(type/*: "identity"|"brotli"|"gzip"|"deflate"*/) /*: stream$Duplex*/ {
	switch(type) {
	case "identity":
		return new stream.PassThrough()
	case "brotli":
		// $FlowFixMe flow 0.114.0 does not have support for the brotli node functions
		return zlib.createBrotliCompress()
	case "gzip":
		return zlib.createGzip()
	case "deflate":
		return zlib.createDeflate()
	default:
		throw new Error(`Unknown compressor type: ${type}`)
	}
}
