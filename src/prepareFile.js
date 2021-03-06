// @flow strict

const mime = require("mime")

/*::
import type { File, Sizes } from "@fizker/serve"
import type { SetupRequest } from "./types"
*/

module.exports = (request/*: SetupRequest */, { path, sizes, hash }/*: { path: string, sizes: Sizes, hash: string }*/) /*: File*/ => {
	const overrides = request.files.find(x => x.path === path) || { headers: {}, envReplacements: {} }
	const mimeType = overrides.mime || "" || mime.getType(path)
	if(mimeType == null) {
		throw new Error(`Could not determine mime-type for ${path}`)
	}

	return {
		path,
		sizes,
		statusCode: overrides.statusCode || 0 || 200,
		headers: overrides.headers,
		mime: mimeType,
		envReplacements: overrides.envReplacements,
		hash,
	}
}
