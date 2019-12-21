// @flow strict

const buildCommand = require("./src/commands/build")
const createSetupRequest = require("./src/commands/createSetupRequest")

const [ , , command, ...argv ] = process.argv

const usageText =
`Usage: serve-prepare <command> <command options ...>

Supported commands:
	build <path to request config>
	create-setup-request <output folder or file>
`.trim()

class UnknownCommandError extends Error {
	constructor(command/*: string*/) {
		super(
`Unknown command: ${command}.

${usageText}`
		)
	}
}

async function exec(command/*: ?string*/, argv/*: $ReadOnlyArray<string>*/) /*: Promise<void>*/ {
	if(command == null) {
		throw new Error(usageText)
	}

	switch(command) {
		case "build":
			return buildCommand(argv)
		case "create-setup-request":
			return createSetupRequest(argv)
		default:
			throw new UnknownCommandError(command)
	}
}

exec(command, argv)
	.then(
		() => { console.log("all done") },
		(e) => {
			console.error(e.message)
			process.exit(1)
		},
	)
