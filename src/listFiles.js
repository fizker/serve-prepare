// @flow strict

const fs = require("fs")
const path = require("path")

/*::
//import type { Dirent } from "fs"
type Dirent = {
	isDirectory() : boolean,
	isFile() : boolean,
	name: string,
}
*/

module.exports = async function listFiles(targetDir/*: string*/, root/*: string*/ = "") /*: Promise<$ReadOnlyArray<string>>*/ {
	// $FlowFixMe flow v0.114.0 have incorrect typing for fs
	const list/*: $ReadOnlyArray<Dirent>*/ = await fs.promises.readdir(targetDir, { withFileTypes: true })

	const all = await Promise.all(list.map((entry) => {
		const p = path.join(root, entry.name)
		if(entry.isDirectory()) {
			return listFiles(path.join(targetDir, root, entry.name), p)
		} else if(entry.isFile()) {
			return [ p ]
		} else {
			return []
		}
	}))

	return all.flatMap(x => x)
}
