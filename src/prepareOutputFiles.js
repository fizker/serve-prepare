// @flow strict

const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
const zlib = require("zlib")
const stream = require("stream")
const util = require("util")

const pipeline = util.promisify(stream.pipeline)

const createOutputFolders = require("./createOutputFolders")
const getAllFolders = require("./getAllFolders")

/*::
import type { Folders, Sizes } from "@fizker/serve"
*/

module.exports = prepareOutputFiles
async function prepareOutputFiles(
	inputFolder/*: string*/,
	folders/*: Folders*/,
	files/*: $ReadOnlyArray<string>*/,
	isCompressionSkipped/*: boolean*/,
) /*: Promise<$ReadOnlyArray<{ path: string, sizes: Sizes, hash: string }>>*/ {
	const allFolders = getAllFolders(files, { leafsOnly: true })

	await Promise.all(Object.keys(folders).map(async (x) => {
		const rootFolder = folders[x]
		for(const folder of allFolders) {
			const pathToCreate = path.join(rootFolder, folder)
			await fs.promises.mkdir(pathToCreate, { recursive: true })
		}
	}))

	return Promise.all(files.map(async (path) => {
		const { sizes, hash } = await prepareFile(inputFolder, folders, path, isCompressionSkipped)
		return {
			path: "/" + path,
			sizes,
			hash,
		}
	}))
}

async function prepareFile(
	inputFolder/*: string*/,
	folders/*: Folders*/,
	filename/*: string*/,
	isCompressionSkipped/*: boolean*/,
) /*: Promise<{ sizes: Sizes, hash: string }>*/ {
	const inputStream = fs.createReadStream(path.join(inputFolder, filename))
	inputStream.setMaxListeners(0)
	const [ hash, identity, gzip, deflate, brotli ] = await Promise.all([
		getHash(inputStream),
		compressAndGetSize(folders, "identity", filename, inputStream),
		isCompressionSkipped ? null : compressAndGetSize(folders, "gzip", filename, inputStream),
		isCompressionSkipped ? null : compressAndGetSize(folders, "deflate", filename, inputStream),
		isCompressionSkipped ? null : compressAndGetSize(folders, "brotli", filename, inputStream),
	])

	return {
		hash,
		sizes: {
			identity,
			gzip,
			deflate,
			brotli,
		},
	}
}

async function getHash(inputStream) /*: Promise<string>*/ {
	let hash = ""
	await pipeline(
		inputStream,
		crypto.createHash("sha256"),
		new stream.Transform({
			transform(chunk, encoding, callback) {
				hash += chunk.toString()
				callback()
			},
		})
	)
	return hash
}

async function compressAndGetSize(
	folders/*: Folders*/,
	key/*: "identity"|"brotli"|"gzip"|"deflate"*/,
	filename/*: string*/,
	inputStream/*: stream$Readable*/,
) /*: Promise<number>*/ {
	const compressor = getCompressorForType(key)
	const output = path.join(folders[key], filename)
	const outputStream = fs.createWriteStream(output)

	let byteCount = 0
	await pipeline(
		inputStream,
		compressor,
		new stream.Transform({
			transform(chunk, encoding, callback) {
				byteCount += chunk.length
				callback(null, chunk)
			},
		}),
		outputStream,
	)
	return byteCount
}

function getCompressorForType(type/*: "identity"|"brotli"|"gzip"|"deflate"*/) /*: stream$Duplex*/ {
	switch(type) {
	case "identity":
		return new stream.PassThrough()
	case "brotli":
		// $FlowFixMe flow 0.117.0 does not have support for the brotli node functions
		return zlib.createBrotliCompress()
	case "gzip":
		return zlib.createGzip()
	case "deflate":
		return zlib.createDeflate()
	default:
		throw new Error(`Unknown compressor type: ${type}`)
	}
}
