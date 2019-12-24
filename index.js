#!/usr/bin/env node
// @flow strict

const buildCommand = require("./src/commands/build")
const createSetupRequest = require("./src/commands/createSetupRequest")
const createDockerfile = require("./src/commands/createDockerfile")

const [ , , command, ...argv ] = process.argv

const usageText =
`Usage: serve-prepare <command> <command options ...>

Supported commands:
	build --request=<path to request config> --target=<path to target dir> --output=<path to output dir> [--skip-compression]
	create-setup-request <output folder or file> [--force]
	create-dockerfile [--dockerfile=<path to docker file>] [--ignoreFile=<path to docker ignore file>] [--force]
`.trim()

class UnknownCommandError extends Error {
	constructor(command/*: string*/) {
		super(
`Unknown command: ${command}.

${usageText}`
		)
	}
}

async function exec(command/*: ?string*/, argv/*: $ReadOnlyArray<string>*/) /*: Promise<string>*/ {
	if(command == null) {
		throw new Error(usageText)
	}

	switch(command) {
		case "build":
			return buildCommand(argv)
		case "create-setup-request":
			return createSetupRequest(argv)
		case "create-dockerfile":
			return createDockerfile(argv)
		default:
			throw new UnknownCommandError(command)
	}
}

exec(command, argv)
	.then(
		(response) => { console.log(response) },
		(e) => {
			console.error(e.message)
			process.exit(1)
		},
	)
