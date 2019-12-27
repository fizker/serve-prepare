// @flow strict

/*::
import type { Headers, Alias, JSONObject } from "@fizker/serve"
import type { FileOverride, SetupRequest } from "./types"
*/

module.exports = assertSetupRequest
function assertSetupRequest(raw/*: JSONObject*/) /*: SetupRequest*/ {
	const {
		globalHeaders,
		files,
		catchAllFile,
		aliases,
	} = raw

	let realFiles/*: $ReadOnlyArray<FileOverride>*/
	if(files == null) {
		realFiles = []
	} else if(Array.isArray(files)) {
		realFiles = files.map(assertFile)
	} else {
		throw new Error("files property must be an array")
	}

	const caf = catchAllFile == null ? null : assertFile(catchAllFile)

	if(caf != null && realFiles.find(x => x.path === caf.path)) {
		throw new Error("Please don't add catch-all file to list of files")
	}

	return {
		files: realFiles,
		globalHeaders: assertHeaders(globalHeaders),
		catchAllFile: caf,
		aliases: assertAliases(aliases),
	}
}

function assertFile(file/*: mixed*/) /*: FileOverride*/ {
	if(file == null || typeof file !== "object") {
		throw new Error("Each file must be an object")
	}

	const { path, mime, statusCode, headers } = file
	if(typeof path !== "string") {
		throw new Error("Each file must have a path")
	}
	if(path[0] !== "/") {
		throw new Error("File paths must start with `/`")
	}
	if(mime != null && typeof mime !== "string") {
		throw new Error("The mime-type must be omitted (auto-detected) or a string")
	}
	if(mime === "") {
		throw new Error("The mime-type must not be empty")
	}
	if(statusCode != null && typeof statusCode !== "number") {
		throw new Error("The status-code must be omitted (default: 200) or a string")
	}
	if(statusCode === 0) {
		throw new Error("The status-code must not be 0")
	}
	return {
		path,
		mime: mime || "" || null,
		statusCode: statusCode || 0 || null,
		headers: assertHeaders(headers),
	}
}

function assertHeaders(input/*: mixed*/) /*: Headers*/ {
	if(input == null) {
		return {}
	}

	if(typeof input !== "object" || Array.isArray(input)) {
		throw new Error("Headers must be a string-string object")
	}

	return Object.keys(input).reduce((o, k) => {
		const val = input[k]
		if(val == null) {
			return o
		}
		if(typeof val !== "string") {
			throw new Error("Headers must be a string-string object")
		}
		o[k] = val
		return o
	}, {})
}

function assertAliases(input/*: mixed*/) /*: $ReadOnlyArray<Alias>*/ {
	if(input == null) {
		return []
	}

	if(!Array.isArray(input)) {
		throw new Error("Aliases must be an array of aliases")
	}

	return input.map(x => {
		if(x == null || typeof x !== "object") {
			throw new Error("Aliases must be an array of aliases")
		}

		const { from, to } = x

		if(typeof from !== "string" || typeof to !== "string") {
			throw new Error("Alias objects must have a `to` and `from` string")
		}

		return { to, from }
	})
}
