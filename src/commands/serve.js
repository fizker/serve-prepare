// @flow strict

const fs = require("fs")
const path = require("path")
const { Server, assertServerSetup } = require("@fizker/serve")

const assertSetupRequest = require("../assertSetupRequest")
const prepareFile = require("../prepareFile")

/*::
import type { ServerSetup } from "@fizker/serve"
import type { SetupRequest } from "../types"

type CommandOptions = { targetDir: string, requestPath: string }
*/
const port = +process.env.PORT || 8080
const httpsPort = +process.env.HTTPS_PORT || null
const certPath = process.env.HTTPS_CERT
const keyPath = process.env.HTTPS_KEY

module.exports = async function cmd(argv/*: $ReadOnlyArray<string>*/) {
	const args = parseArgv(argv)

	const [ { request, setup }, https ] = await Promise.all([
		createBaseSetup(args),
		prepareHTTPS(),
	])

	const { targetDir } = args

	const server = new Server(targetDir, setup, https && https.cert)
	const ports = await server.listen(port, https && https.port)

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
