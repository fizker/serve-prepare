// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")

const getAllFolders = require("../../src/getAllFolders")

describe("unit/getAllFolders.js", () => {
	let testData
	beforeEach(() => {
		testData = {
		}
	})

	const tests/*:$ReadOnlyArray<{ input: $ReadOnlyArray<string>, expected: $ReadOnlyArray<string> }>*/ = [
		{
			input: [],
			expected: [],
		},
		{
			input: [
				"/foo.js",
				"/a/b.js",
				"/a/b/c.js",
				"/a/b/d.js",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
			],
		},
		{
			input: [
				"/foo",
				"/a/b",
				"/a/b/c",
				"/a/b/d",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
			],
		},
		{
			input: [
				"/a/b/d.js",
				"/foo.js",
				"/a/b/c.js",
				"/a/b.js",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
			],
		},
		{
			input: [
				"/a/b/c",
				"/foo",
				"/a/b/d",
				"/a/b",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
			],
		},
	]

	for(const test of tests) {
		describe(`calling with ${test.input.toString()}`, () => {
			beforeEach(() => {
				testData.actual = getAllFolders(test.input)
			})
			it(`should return ${test.expected.toString()}`, () => {
				expect(testData.actual)
					.to.deep.equal(test.expected)
			})
		})
	}
})
