#!/usr/bin/env node
// @flow strict

const fs = require("fs")
const path = require("path")
const { Server, assertServerSetup } = require("@fizker/serve")

const assertSetupRequest = require("./src/assertSetupRequest")
const prepareFile = require("./src/prepareFile")

/*::
import type { ServerSetup } from "@fizker/serve"
import type { SetupRequest } from "./src/types"

type CommandOptions = { targetDir: string, requestPath: string }
*/
const port = +process.env.PORT || 8080
const httpsPort = +process.env.HTTPS_PORT || null
const certPath = process.env.HTTPS_CERT
const keyPath = process.env.HTTPS_KEY

const [ , , ...rawArgs ] = process.argv

const args = parseArgv(rawArgs)

Promise.all([
	createBaseSetup(args),
	prepareHTTPS(),
])
	.then(async ([ { request, setup }, https ]) => {
		const { targetDir } = args

		const server = new Server(targetDir, setup, https && https.cert)
		await server.listen(port, https && https.port)

		server.setFileProvider(async (setup, pathname) => {
			const filepath = path.join(targetDir, pathname)

			try {
				const stat = await fs.promises.stat(filepath)
				const sizes = {
					identity: stat.size,
					brotli: null,
					gzip: null,
					deflate: null,
				}

				return prepareFile(request, { path: pathname, sizes })
			} catch(e) {
				// Direct file was not found, try catch-all
				if(request.catchAllFile != null) {
					const catchAllFile = request.catchAllFile
					try {
						const filepath = path.join(targetDir, catchAllFile.path)
						const stat = await fs.promises.stat(filepath)
						const sizes = {
							identity: stat.size,
							brotli: null,
							gzip: null,
							deflate: null,
						}

						return prepareFile(request, { path: catchAllFile.path, sizes })
					} catch(e) {}
				}
				return null
			}
		})
	})
	.catch(e => {
		console.log(e.message)
		process.exit(1)
	})

async function prepareHTTPS() /*: Promise<{ port: number, cert: { key: Buffer, cert: Buffer } }|void>*/ {
	if(httpsPort == null || Number.isNaN(httpsPort) || certPath == null || keyPath == null) {
		return
	}

	let key, cert
	try {
		[ key, cert ] = await Promise.all([
			fs.promises.readFile(keyPath),
			fs.promises.readFile(certPath),
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
