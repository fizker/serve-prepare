// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")

const assertSetupRequest = require("../../src/assertSetupRequest")

describe("unit/assertSetupRequest.js", () => {
	let testData
	beforeEach(() => {
		testData = {
			minimalValidObject: {
				target: "abc",
				output: "def",
			},
		}
	})

	describe("called with object with invalid properties", () => {
		describe("`target`", () => {
			const tests = [
				{
					input: {
						output: "def",
					},
				},
				{
					input: {
						target: null,
						output: "def",
					},
				},
				{
					input: {
						target: 1,
						output: "def",
					},
				},
				{
					input: {
						target: true,
						output: "def",
					},
				},
				{
					input: {
						target: [],
						output: "def",
					},
				},
				{
					input: {
						target: {},
						output: "def",
					},
				},
			]
			for(const test of tests) {
				describe(`${JSON.stringify(test.input)}`, () => {
					it("should throw", () => {
						expect(() => assertSetupRequest(test.input))
							.to.throw()
					})
				})
			}
		})
		describe("`output`", () => {
			const tests = [
				{
					input: {
						target: "abc",
					},
				},
				{
					input: {
						target: "abc",
						output: null,
					},
				},
				{
					input: {
						target: "abc",
						output: 1,
					},
				},
				{
					input: {
						target: "abc",
						output: true,
					},
				},
				{
					input: {
						target: "abc",
						output: [],
					},
				},
				{
					input: {
						target: "abc",
						output: {},
					},
				},
			]
			for(const test of tests) {
				describe(`${JSON.stringify(test.input)}`, () => {
					it("should throw", () => {
						expect(() => assertSetupRequest(test.input))
							.to.throw()
					})
				})
			}
		})
		describe("`globalHeaders`", () => {
			const tests = [
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: 1,
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: "abc",
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: [],
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: true,
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: {
							"abc": 1,
						},
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: {
							"abc": true,
						},
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: {
							"abc": [],
						},
					},
				},
				{
					input: {
						target: "abc",
						output: "def",
						globalHeaders: {
							"abc": {},
						},
					},
				},
			]
			for(const test of tests) {
				describe(`${JSON.stringify(test)}`, () => {
					it("should throw", () => {
						expect(() => assertSetupRequest(test.input))
							.to.throw()
					})
				})
			}
		})
		describe("`catchAllFile`", () => {
			const tests = [
				{
					description: "number",
					input: {
						target: "abc",
						output: "def",
						files: 1,
					},
				},
				{
					description: "false",
					input: {
						target: "abc",
						output: "def",
						files: false,
					},
				},
				{
					description: "object",
					input: {
						target: "abc",
						output: "def",
						files: {},
					},
				},
				{
					description: "containing number",
					input: {
						target: "abc",
						output: "def",
						files: [
							1,
						],
					},
				},
				{
					description: "containing false",
					input: {
						target: "abc",
						output: "def",
						files: [
							false,
						],
					},
				},
				{
					description: "containing array",
					input: {
						target: "abc",
						output: "def",
						files: [
							[],
						],
					},
				},
				{
					description: "containing object missing path",
					input: {
						target: "abc",
						output: "def",
						files: [
							{},
						],
					},
				},
				{
					description: "mime is number",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								mime: 1,
							},
						],
					},
				},
				{
					description: "mime is false",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								mime: false,
							},
						],
					},
				},
				{
					description: "mime is object",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								mime: {},
							},
						],
					},
				},
				{
					description: "mime is array",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								mime: [],
							},
						],
					},
				},
				{
					description: "mime is empty string",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								mime: "",
							},
						],
					},
				},
				{
					description: "statusCode is string",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								statusCode: "1",
							},
						],
					},
				},
				{
					description: "statusCode is 0",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								statusCode: 0,
							},
						],
					},
				},
				{
					description: "statusCode is array",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								statusCode: [],
							},
						],
					},
				},
				{
					description: "statusCode is object",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								statusCode: {},
							},
						],
					},
				},
				{
					description: "statusCode is false",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								statusCode: false,
							},
						],
					},
				},
				{
					description: "headers is number",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: 0,
							},
						],
					},
				},
				{
					description: "headers is string",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: "",
							},
						],
					},
				},
				{
					description: "headers is array",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: [],
							},
						],
					},
				},
				{
					description: "headers is false",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: false,
							},
						],
					},
				},
				{
					description: "headers values are number",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: {
									"abc": 0,
								},
							},
						],
					},
				},
				{
					description: "headers values are array",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: {
									"abc": [],
								},
							},
						],
					},
				},
				{
					description: "headers values are object",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: {
									"abc": {},
								},
							},
						],
					},
				},
				{
					description: "headers values are false",
					input: {
						target: "abc",
						output: "def",
						files: [
							{
								path: "abc",
								headers: {
									"abc": false,
								},
							},
						],
					},
				},
			]
			for(const test of tests) {
				describe(test.description, () => {
					it("should throw", () => {
						expect(() => assertSetupRequest(test.input))
							.to.throw()
					})
				})
			}
		})
		describe("`catchAllFile`", () => {
			const tests = [
				{
					description: "number",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: 1,
					},
				},
				{
					description: "false",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: false,
					},
				},
				{
					description: "array",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: [],
					},
				},
				{
					description: "missing path",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {},
					},
				},
				{
					description: "mime is number",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							mime: 1,
						},
					},
				},
				{
					description: "mime is false",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							mime: false,
						},
					},
				},
				{
					description: "mime is object",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							mime: {},
						},
					},
				},
				{
					description: "mime is array",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							mime: [],
						},
					},
				},
				{
					description: "mime is empty string",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							mime: "",
						},
					},
				},
				{
					description: "statusCode is string",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							statusCode: "1",
						},
					},
				},
				{
					description: "statusCode is 0",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							statusCode: 0,
						},
					},
				},
				{
					description: "statusCode is array",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							statusCode: [],
						},
					},
				},
				{
					description: "statusCode is object",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							statusCode: {},
						},
					},
				},
				{
					description: "statusCode is false",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							statusCode: false,
						},
					},
				},
				{
					description: "headers is number",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: 0,
						},
					},
				},
				{
					description: "headers is string",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: "",
						},
					},
				},
				{
					description: "headers is array",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: [],
						},
					},
				},
				{
					description: "headers is false",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: false,
						},
					},
				},
				{
					description: "headers values are number",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: {
								"abc": 0,
							},
						},
					},
				},
				{
					description: "headers values are array",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: {
								"abc": [],
							},
						},
					},
				},
				{
					description: "headers values are object",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: {
								"abc": {},
							},
						},
					},
				},
				{
					description: "headers values are false",
					input: {
						target: "abc",
						output: "def",
						catchAllFile: {
							path: "abc",
							headers: {
								"abc": false,
							},
						},
					},
				},
			]
			for(const test of tests) {
				describe(test.description, () => {
					it("should throw", () => {
						expect(() => assertSetupRequest(test.input))
							.to.throw()
					})
				})
			}
		})
	})

	describe("called with valid objects", () => {
		// list of all possible mutations
		const tests = [
			{
				description: "All non-required values missing",
				input: {
					target: "abc",
					output: "def",
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [],
					catchAllFile: null,
					aliases: [],
				},
			},
			{
				description: "All non-required values set to null",
				input: {
					target: "abc",
					output: "def",
					globalHeaders: null,
					files: null,
					catchAllFile: null,
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [],
					catchAllFile: null,
					aliases: [],
				},
			},
			{
				description: "Global headers and empty catch-all file",
				input: {
					target: "abc",
					output: "def",
					globalHeaders: {
						"abc": "123",
						"def": null,
					},
					files: [],
					catchAllFile: {
						path: "no-overrides",
					},
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {
						"abc": "123",
					},
					files: [],
					catchAllFile: {
						path: "no-overrides",
						mime: null,
						statusCode: null,
						headers: {},
					},
					aliases: [],
				},
			},
			{
				description: "Different file overrides",
				input: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [
						{
							path: "no-overrides",
						},
						{
							path: "explicit nulls",
							mime: null,
							statusCode: null,
							headers: null,
						},
						{
							path: "overridden values",
							mime: "text/abc",
							statusCode: 123,
							headers: {
								"abc": "foo",
							},
						},
						{
							path: "empty headers",
							headers: {},
						},
						{
						path: "headers with content",
							headers: {
								"abc": "123",
								"def": null,
								"ghi": "",
							},
						},
					],
					catchAllFile: {
						path: "explicit nulls",
						mime: null,
						statusCode: null,
						headers: null,
					},
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [
						{
							path: "no-overrides",
							mime: null,
							statusCode: null,
							headers: {},
						},
						{
							path: "explicit nulls",
							mime: null,
							statusCode: null,
							headers: {},
						},
						{
							path: "overridden values",
							mime: "text/abc",
							statusCode: 123,
							headers: {
								"abc": "foo",
							},
						},
						{
							path: "empty headers",
							mime: null,
							statusCode: null,
							headers: {},
						},
						{
							path: "headers with content",
							mime: null,
							statusCode: null,
							headers: {
								"abc": "123",
								"ghi": "",
							},
						},
					],
					catchAllFile: {
						path: "explicit nulls",
						mime: null,
						statusCode: null,
						headers: {},
					},
					aliases: [],
				},
			},
			{
				description: "Catch-all file have all values set",
				input: {
					target: "abc",
					output: "def",
					catchAllFile: {
						path: "overridden values",
						mime: "text/abc",
						statusCode: 123,
						headers: {
							"abc": "foo",
						},
					},
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [],
					catchAllFile: {
						path: "overridden values",
						mime: "text/abc",
						statusCode: 123,
						headers: {
							"abc": "foo",
						},
					},
					aliases: [],
				},
			},
			{
				description: "Catch-all file have empty headers",
				input: {
					target: "abc",
					output: "def",
					catchAllFile: {
						path: "empty headers",
						headers: {},
					},
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [],
					catchAllFile: {
						path: "empty headers",
						mime: null,
						statusCode: null,
						headers: {},
					},
					aliases: [],
				},
			},
			{
				description: "Catch-all file have content in headers, both string and null",
				input: {
					target: "abc",
					output: "def",
					catchAllFile: {
						path: "headers with content",
						headers: {
							"abc": "123",
							"def": null,
							"ghi": "",
						},
					},
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [],
					catchAllFile: {
						path: "headers with content",
						mime: null,
						statusCode: null,
						headers: {
							"abc": "123",
							"ghi": "",
						},
					},
					aliases: [],
				},
			},
			{
				description: "Aliases present",
				input: {
					target: "abc",
					output: "def",
					aliases: [
						{ from: "/a", to: "/b" },
					]
				},
				expected: {
					target: "abc",
					output: "def",
					globalHeaders: {},
					files: [],
					catchAllFile: null,
					aliases: [
						{ from: "/a", to: "/b" },
					],
				},
			},
		]
		for(const test of tests) {
			describe(test.description, () => {
				it("should return expected SetupRequest", () => {
					expect(assertSetupRequest(test.input))
						.to.deep.equal(test.expected)
				})
			})
		}
	})
})
