// @flow strict

const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const util = require("util")
const stream = require("stream")
const pipeline = util.promisify(stream.pipeline)
const { Server, assertServerSetup } = require("@fizker/serve")

const assertSetupRequest = require("../assertSetupRequest")
const prepareFile = require("../prepareFile")

/*::
import type { ServerSetup, Sizes } from "@fizker/serve"
import type { SetupRequest } from "../types"

type CommandOptions = { targetDir: string, requestPath: string }
*/
const port = +process.env.PORT || 8080
const httpsPort = +process.env.HTTPS_PORT || null
const certPath = process.env.HTTPS_CERT
const keyPath = process.env.HTTPS_KEY

async function getFileSizeAndHash(filepath/*: string*/) /*: Promise<{ sizes: Sizes, hash: string }>*/ {
	let hash/*: ?string*/
	let size = 0
	await pipeline(
		fs.createReadStream(filepath),
		new stream.Transform({
			transform(chunk, encoding, callback) {
				size += chunk.length
				callback(null, chunk)
			},
		}),
		crypto.createHash("sha256"),
		new stream.Transform({
			transform(chunk, encoding, callback) {
				if(hash != null) {
					callback(new Error("crypto.Hash stream unexpectedly generated multiple chunks"))
					return
				}
				// $FlowFixMe[extra-arg] flow 0.140 have invalid typedef for crypto.Hash type
				hash = chunk.toString("hex")
				callback(null, chunk)
			},
		}),
	)

	if(hash == null) {
		throw new Error("crypto.Hash unexpected created zero chunks")
	}

	return {
		hash,
		sizes: {
			identity: size,
			deflate: null,
			brotli: null,
			gzip: null,
		},
	}
}

module.exports = async function cmd(argv/*: $ReadOnlyArray<string>*/) /*: Promise<string>*/ {
	const args = parseArgv(argv)

	try {
		await fs.promises.stat(args.requestPath)
	} catch(e) {
		throw new Error(`Could not load JSON file at ${path.resolve(args.requestPath)}`)
	}
	try {
		await fs.promises.stat(args.targetDir)
	} catch(e) {
		throw new Error(`Could not find target directory at ${path.resolve(args.targetDir)}`)
	}

	const [ { request, setup }, https ] = await Promise.all([
		createBaseSetup(args),
		prepareHTTPS(),
	])

	const { targetDir } = args

	const server = new Server(targetDir, setup, https && { ...https.cert })
	const ports = await server.listen(port, https && https.port)

	server.setFileProvider(async (setup, pathname) => {
		const filepath = path.join(targetDir, pathname)

		try {
			const { sizes, hash } = await getFileSizeAndHash(filepath)

			return prepareFile(request, { path: pathname, sizes, hash })
		} catch(e) {
			// Direct file was not found, try catch-all
			if(request.catchAllFile != null) {
				const catchAllFile = request.catchAllFile
				try {
					const filepath = path.join(targetDir, catchAllFile.path)
					const { sizes, hash } = await getFileSizeAndHash(filepath)

					return prepareFile(request, { path: catchAllFile.path, sizes, hash })
				} catch(e) {}
			}
			return null
		}
	})

	const logs = [
		`Listening to HTTP on ${ports.http}`,
	]
	if(ports.https != null) {
		logs.push(`Listening to HTTPS on ${ports.https}`)
	}

	console.log(logs.join("\n"))

	try {
		await new Promise((resolve, reject) => {
			process.on("SIGTERM", resolve)
			process.on("SIGINT", resolve)
			process.on("error", reject)
		})
	} finally {
		await server.close()
	}

	return "Server closed"
}

async function prepareHTTPS() /*: Promise<{ port: number, cert: { key: Buffer, cert: Buffer } }|void>*/ {
	if(httpsPort == null || Number.isNaN(httpsPort) || certPath == null || keyPath == null) {
		console.log("Setup for HTTPS missing, skipping encrypted server")
		return
	}

	let key, cert
	try {
		[ key, cert ] = await Promise.all([
			fs.promises.readFile(keyPath)
				.catch(e => {
					console.log(`Could not load HTTPS key at ${path.resolve(keyPath)}`)
					throw e
				}),
			fs.promises.readFile(certPath)
				.catch(e => {
					console.log(`Could not load HTTPS certificate at ${path.resolve(certPath)}`)
					throw e
				}),
		])
	} catch(e) {
		return
	}

	return { port: httpsPort, cert: { key, cert } }
}

async function createBaseSetup(args/*: CommandOptions*/) /*: Promise<{ request: SetupRequest, setup: ServerSetup }>*/ {
	const rawRequest = await fs.promises.readFile(args.requestPath, "utf-8")
	const request = assertSetupRequest(JSON.parse(rawRequest))

	if(request.catchAllFile) {
		request.files = request.files.concat(request.catchAllFile)
	}

	return {
		request,
		setup: {
			aliases: request.aliases,
			globalHeaders: request.globalHeaders,
			folders: {
				identity: ".",
				gzip: ".",
				deflate: ".",
				brotli: ".",
			},
			files: [
				{
					path: "/dummy file",
					mime: "text/plain",
					statusCode: 500,
					headers: {},
					sizes: {
						identity: 0,
						brotli: null,
						deflate: null,
						gzip: null,
					},
					envReplacements: {},
					hash: "abc",
				},
			],
			catchAllFile: null,
		},
	}
}

function parseArgv(argv/*: $ReadOnlyArray<string>*/) /*: CommandOptions*/ {
	const rawRequestPath = argv.find(x => x.startsWith("--request"))
	const rawTargetDir = argv.find(x => x.startsWith("--target"))

	if(rawRequestPath == null || rawTargetDir == null) {
		throw new Error("Command usage: serve --request=<path to request config> --target=<path to target dir>")
	}

	const requestPath = path.resolve(rawRequestPath.replace("--request=", ""))
	const targetDir = path.resolve(rawTargetDir.replace("--target=", ""))

	return { requestPath, targetDir }
}
