// @flow strict

const path = require("path")

module.exports = getAllFolders

function getAllFolders(
	files/*: $ReadOnlyArray<string>*/,
	{ leafsOnly = false }/*: { leafsOnly?: boolean }*/ = {},
) /*: $ReadOnlyArray<string>*/ {
	const allFolders = files.map(x => path.dirname(x))
	const foldersToCreate = allFolders.filter((folder, idx, arr) => {
		return arr.indexOf(folder) === idx
	})
	const sorted = foldersToCreate.sort()

	if(leafsOnly) {
		return sorted.filter((folder, idx, arr) => {
			return arr.find(x => x !== folder && x.startsWith(folder)) == null
		})
	} else {
		return sorted
	}
}
