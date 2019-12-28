// @flow strict

const fs = require("fs")
const path = require("path")

const prepareServerSetup = require("../prepareServerSetup")

/*::
import type { PrepareServerSetupOptions } from "../prepareServerSetup"
*/

module.exports = cmd

async function cmd(argv/*: $ReadOnlyArray<string>*/) {
	const options = parseArgv(argv)
	const setup = await prepareServerSetup(options)

	const { outputDir } = options

	await fs.promises.writeFile(path.join(outputDir, "setup.json"), JSON.stringify(setup, null, 2))

	return `Finished preparing output in ${outputDir}`
}

cmd.parseArgv = parseArgv

function parseArgv(argv/*: $ReadOnlyArray<string>*/) /*: PrepareServerSetupOptions*/{
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
