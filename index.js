// @flow strict

const buildCommand = require("./src/commands/build")

const [ , , command, ...argv ] = process.argv

const usageText =
`Usage: serve-prepare <command> <command options ...>

Supported commands:
	build <path to request config>
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
