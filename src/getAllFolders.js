// @flow strict

const path = require("path")

module.exports = getAllFolders

function getAllFolders(files/*: $ReadOnlyArray<string>*/) /*: $ReadOnlyArray<string>*/ {
	const allFolders = files.map(x => path.dirname(x))
	const foldersToCreate = allFolders.filter((folder, idx, arr) => {
		return arr.indexOf(folder) === idx
	})
	return foldersToCreate.sort()
}
