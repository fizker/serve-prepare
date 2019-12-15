// @flow strict

/*::
import type { Headers } from "./types"

export type FileOverride = {
	path: string,
	mime: ?string,
	statusCode: ?number,
	headers: Headers,
}

export type SetupRequest = {
	globalHeaders: Headers,
	files: $ReadOnlyArray<FileOverride>,
	target: string,
	output: string,
	catchAllFile: ?FileOverride
}

export type JSONObject = {
	[string]: mixed,
	...
}
*/

module.exports = assertSetupRequest
function assertSetupRequest(raw/*: JSONObject*/) /*: SetupRequest*/ {
	const {
		globalHeaders,
		files,
		target,
		output,
		catchAllFile,
	} = raw

	if(typeof target !== "string") {
		throw new Error("Property target is required")
	}
	if(typeof output !== "string") {
		throw new Error("Property output is required")
	}

	let realFiles/*: $ReadOnlyArray<FileOverride>*/
	if(files == null) {
		realFiles = []
	} else if(Array.isArray(files)) {
		realFiles = files.map(assertFile)
	} else {
		throw new Error("files property must be an array")
	}

	const caf = catchAllFile == null ? null : assertFile(catchAllFile)

	return {
		target,
		output,
		files: realFiles,
		globalHeaders: assertHeaders(globalHeaders),
		catchAllFile: caf,
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

	if(typeof input !== "object" ||  Array.isArray(input)) {
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
