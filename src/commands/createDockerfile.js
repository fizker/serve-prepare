// @flow strict

const path = require("path")
const fs = require("fs")

const getFilePathFromInput = require("../getFilePathFromInput")

module.exports = async function(argv/*: $ReadOnlyArray<string>*/) /*: Promise<string>*/ {
	const { dockerfile, ignoreFile, isForced } = parseArgv(argv)

	const [ dockerfileOutputPath, dockerignoreOutputPath ] = await Promise.all([
		getFilePathFromInput(dockerfile, "Dockerfile", isForced),
		getFilePathFromInput(ignoreFile, ".dockerignore", isForced),
	])

	await Promise.all([
		fs.promises.copyFile(path.join(__dirname, "../../sample-Dockerfile"), dockerfileOutputPath),
		fs.promises.copyFile(path.join(__dirname, "../../sample-dockerignore"), dockerignoreOutputPath),
	])

	return [
		`Created ${dockerfileOutputPath}`,
		`Created ${dockerignoreOutputPath}`,
	].join("\n")
}

function parseArgv(argv/*: $ReadOnlyArray<string>*/) /*: { dockerfile: string, ignoreFile: string, isForced: boolean }*/{
	const rawDockerfile = argv.find(x => x.startsWith("--dockerfile="))
	const rawIgnoreFile = argv.find(x => x.startsWith("--ignoreFile="))
	const isForced = argv.includes("--force")

	let dockerfile
	if(rawDockerfile == null) {
		dockerfile = path.resolve("")
	} else {
		dockerfile = path.resolve(rawDockerfile.replace("--dockerfile=", ""))
	}

	let ignoreFile
	if(rawIgnoreFile == null) {
		ignoreFile = path.resolve("")
	} else {
		ignoreFile = path.resolve(rawIgnoreFile.replace("--ignoreFile=", ""))
	}

	return { dockerfile, ignoreFile, isForced }
}
