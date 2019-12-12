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

	const tests/*:$ReadOnlyArray<{
		input: $ReadOnlyArray<string>,
		expected: $ReadOnlyArray<string>,
		expectedWitLeafOnlyOption: $ReadOnlyArray<string>,
	}>*/ = [
		{
			input: [],
			expected: [],
			expectedWitLeafOnlyOption: [],
		},
		{
			input: [
				"/foo.js",
				"/a/b.js",
				"/a/b/c.js",
				"/a/b/d.js",
				"/c/d/a.js",
				"/c/f/a.js",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
				"/c/d",
				"/c/f",
			],
			expectedWitLeafOnlyOption: [
				"/a/b",
				"/c/d",
				"/c/f",
			],
		},
		{
			input: [
				"/foo",
				"/a/b",
				"/a/b/c",
				"/a/b/d",
				"/c/d/a",
				"/c/f/a",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
				"/c/d",
				"/c/f",
			],
			expectedWitLeafOnlyOption: [
				"/a/b",
				"/c/d",
				"/c/f",
			],
		},
		{
			input: [
				"/a/b/d.js",
				"/foo.js",
				"/c/f/a.js",
				"/a/b/c.js",
				"/a/b.js",
				"/c/d/a.js",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
				"/c/d",
				"/c/f",
			],
			expectedWitLeafOnlyOption: [
				"/a/b",
				"/c/d",
				"/c/f",
			],
		},
		{
			input: [
				"/a/b/c",
				"/c/d/a",
				"/foo",
				"/a/b/d",
				"/a/b",
				"/c/f/a",
			],
			expected: [
				"/",
				"/a",
				"/a/b",
				"/c/d",
				"/c/f",
			],
			expectedWitLeafOnlyOption: [
				"/a/b",
				"/c/d",
				"/c/f",
			],
		},
	]

	for(const test of tests) {
		describe(`calling with ${test.input.toString()} and not options`, () => {
			beforeEach(() => {
				testData.actual = getAllFolders(test.input)
			})
			it(`should return ${test.expected.toString()}`, () => {
				expect(testData.actual)
					.to.deep.equal(test.expected)
			})
		})

		describe(`calling with ${test.input.toString()} and leafsOnly: true option`, () => {
			beforeEach(() => {
				testData.actual = getAllFolders(test.input, { leafsOnly: true })
			})
			it(`should return ${test.expected.toString()}`, () => {
				expect(testData.actual)
					.to.deep.equal(test.expectedWitLeafOnlyOption)
			})
		})
	}
})
