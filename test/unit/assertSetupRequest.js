// @flow strict

const { describe, it, beforeEach } = require("mocha")
const { expect } = require("chai")

const assertSetupRequest = require("../../src/assertSetupRequest")

describe("unit/assertSetupRequest.js", () => {
	describe("called with object with invalid properties", () => {
		describe("`globalHeaders`", () => {
			const tests = [
				{
					input: {
						globalHeaders: 1,
					},
				},
				{
					input: {
						globalHeaders: "abc",
					},
				},
				{
					input: {
						globalHeaders: [],
					},
				},
				{
					input: {
						globalHeaders: true,
					},
				},
				{
					input: {
						globalHeaders: {
							"abc": 1,
						},
					},
				},
				{
					input: {
						globalHeaders: {
							"abc": true,
						},
					},
				},
				{
					input: {
						globalHeaders: {
							"abc": [],
						},
					},
				},
				{
					input: {
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
		describe("`files`", () => {
			const tests = [
				{
					description: "number",
					input: {
						files: 1,
					},
				},
				{
					description: "false",
					input: {
						files: false,
					},
				},
				{
					description: "object",
					input: {
						files: {},
					},
				},
				{
					description: "containing number",
					input: {
						files: [
							1,
						],
					},
				},
				{
					description: "containing false",
					input: {
						files: [
							false,
						],
					},
				},
				{
					description: "containing array",
					input: {
						files: [
							[],
						],
					},
				},
				{
					description: "containing object missing path",
					input: {
						files: [
							{},
						],
					},
				},
				{
					description: "mime is number",
					input: {
						files: [
							{
								path: "/abc",
								mime: 1,
							},
						],
					},
				},
				{
					description: "mime is false",
					input: {
						files: [
							{
								path: "/abc",
								mime: false,
							},
						],
					},
				},
				{
					description: "mime is object",
					input: {
						files: [
							{
								path: "/abc",
								mime: {},
							},
						],
					},
				},
				{
					description: "mime is array",
					input: {
						files: [
							{
								path: "/abc",
								mime: [],
							},
						],
					},
				},
				{
					description: "mime is empty string",
					input: {
						files: [
							{
								path: "/abc",
								mime: "",
							},
						],
					},
				},
				{
					description: "statusCode is string",
					input: {
						files: [
							{
								path: "/abc",
								statusCode: "1",
							},
						],
					},
				},
				{
					description: "statusCode is 0",
					input: {
						files: [
							{
								path: "/abc",
								statusCode: 0,
							},
						],
					},
				},
				{
					description: "statusCode is array",
					input: {
						files: [
							{
								path: "/abc",
								statusCode: [],
							},
						],
					},
				},
				{
					description: "statusCode is object",
					input: {
						files: [
							{
								path: "/abc",
								statusCode: {},
							},
						],
					},
				},
				{
					description: "statusCode is false",
					input: {
						files: [
							{
								path: "/abc",
								statusCode: false,
							},
						],
					},
				},
				{
					description: "headers is number",
					input: {
						files: [
							{
								path: "/abc",
								headers: 0,
							},
						],
					},
				},
				{
					description: "headers is string",
					input: {
						files: [
							{
								path: "/abc",
								headers: "",
							},
						],
					},
				},
				{
					description: "headers is array",
					input: {
						files: [
							{
								path: "/abc",
								headers: [],
							},
						],
					},
				},
				{
					description: "headers is false",
					input: {
						files: [
							{
								path: "/abc",
								headers: false,
							},
						],
					},
				},
				{
					description: "headers values are number",
					input: {
						files: [
							{
								path: "/abc",
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
						files: [
							{
								path: "/abc",
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
						files: [
							{
								path: "/abc",
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
						files: [
							{
								path: "/abc",
								headers: {
									"abc": false,
								},
							},
						],
					},
				},
				{
					description: "path does not start with slash",
					input: {
						files: [
							{
								path: "abc",
							},
						],
					},
				},
				{
					description: "overlapping catchAllFile",
					input: {
						files: [
							{
								path: "/abc",
							},
						],
						catchAllFile: {
							path: "/abc",
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
		describe("`catchAllFile`", () => {
			const tests = [
				{
					description: "number",
					input: {
						catchAllFile: 1,
					},
				},
				{
					description: "false",
					input: {
						catchAllFile: false,
					},
				},
				{
					description: "array",
					input: {
						catchAllFile: [],
					},
				},
				{
					description: "missing path",
					input: {
						catchAllFile: {},
					},
				},
				{
					description: "path does not start with slash",
					input: {
						catchAllFile: {
							path: "abc",
						},
					},
				},
				{
					description: "mime is number",
					input: {
						catchAllFile: {
							path: "/abc",
							mime: 1,
						},
					},
				},
				{
					description: "mime is false",
					input: {
						catchAllFile: {
							path: "/abc",
							mime: false,
						},
					},
				},
				{
					description: "mime is object",
					input: {
						catchAllFile: {
							path: "/abc",
							mime: {},
						},
					},
				},
				{
					description: "mime is array",
					input: {
						catchAllFile: {
							path: "/abc",
							mime: [],
						},
					},
				},
				{
					description: "mime is empty string",
					input: {
						catchAllFile: {
							path: "/abc",
							mime: "",
						},
					},
				},
				{
					description: "statusCode is string",
					input: {
						catchAllFile: {
							path: "/abc",
							statusCode: "1",
						},
					},
				},
				{
					description: "statusCode is 0",
					input: {
						catchAllFile: {
							path: "/abc",
							statusCode: 0,
						},
					},
				},
				{
					description: "statusCode is array",
					input: {
						catchAllFile: {
							path: "/abc",
							statusCode: [],
						},
					},
				},
				{
					description: "statusCode is object",
					input: {
						catchAllFile: {
							path: "/abc",
							statusCode: {},
						},
					},
				},
				{
					description: "statusCode is false",
					input: {
						catchAllFile: {
							path: "/abc",
							statusCode: false,
						},
					},
				},
				{
					description: "headers is number",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: 0,
						},
					},
				},
				{
					description: "headers is string",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: "",
						},
					},
				},
				{
					description: "headers is array",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: [],
						},
					},
				},
				{
					description: "headers is false",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: false,
						},
					},
				},
				{
					description: "headers values are number",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: {
								"abc": 0,
							},
						},
					},
				},
				{
					description: "headers values are array",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: {
								"abc": [],
							},
						},
					},
				},
				{
					description: "headers values are object",
					input: {
						catchAllFile: {
							path: "/abc",
							headers: {
								"abc": {},
							},
						},
					},
				},
				{
					description: "headers values are false",
					input: {
						catchAllFile: {
							path: "/abc",
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
				},
				expected: {
					globalHeaders: {},
					files: [],
					catchAllFile: null,
					aliases: [],
				},
			},
			{
				description: "All non-required values set to null",
				input: {
					globalHeaders: null,
					files: null,
					catchAllFile: null,
				},
				expected: {
					globalHeaders: {},
					files: [],
					catchAllFile: null,
					aliases: [],
				},
			},
			{
				description: "Global headers and empty catch-all file",
				input: {
					globalHeaders: {
						"abc": "123",
						"def": null,
					},
					files: [],
					catchAllFile: {
						path: "/no-overrides",
					},
				},
				expected: {
					globalHeaders: {
						"abc": "123",
					},
					files: [],
					catchAllFile: {
						path: "/no-overrides",
						mime: null,
						statusCode: null,
						headers: {},
						envReplacements: {},
					},
					aliases: [],
				},
			},
			{
				description: "Different file overrides",
				input: {
					globalHeaders: {},
					files: [
						{
							path: "/no-overrides",
						},
						{
							path: "/explicit-nulls",
							mime: null,
							statusCode: null,
							headers: null,
						},
						{
							path: "/overridden-values",
							mime: "text/abc",
							statusCode: 123,
							headers: {
								"abc": "foo",
							},
						},
						{
							path: "/empty-headers",
							headers: {},
						},
						{
							path: "/headers-with-content",
							headers: {
								"abc": "123",
								"def": null,
								"ghi": "",
							},
						},
					],
					catchAllFile: {
						path: "/catch-all-file",
						mime: null,
						statusCode: null,
						headers: null,
					},
				},
				expected: {
					globalHeaders: {},
					files: [
						{
							path: "/no-overrides",
							mime: null,
							statusCode: null,
							headers: {},
							envReplacements: {},
						},
						{
							path: "/explicit-nulls",
							mime: null,
							statusCode: null,
							headers: {},
							envReplacements: {},
						},
						{
							path: "/overridden-values",
							mime: "text/abc",
							statusCode: 123,
							headers: {
								"abc": "foo",
							},
							envReplacements: {},
						},
						{
							path: "/empty-headers",
							mime: null,
							statusCode: null,
							headers: {},
							envReplacements: {},
						},
						{
							path: "/headers-with-content",
							mime: null,
							statusCode: null,
							headers: {
								"abc": "123",
								"ghi": "",
							},
							envReplacements: {},
						},
					],
					catchAllFile: {
						path: "/catch-all-file",
						mime: null,
						statusCode: null,
						headers: {},
						envReplacements: {},
					},
					aliases: [],
				},
			},
			{
				description: "Catch-all file have all values set",
				input: {
					catchAllFile: {
						path: "/overridden-values",
						mime: "text/abc",
						statusCode: 123,
						headers: {
							"abc": "foo",
						},
					},
				},
				expected: {
					globalHeaders: {},
					files: [],
					catchAllFile: {
						path: "/overridden-values",
						mime: "text/abc",
						statusCode: 123,
						headers: {
							"abc": "foo",
						},
						envReplacements: {},
					},
					aliases: [],
				},
			},
			{
				description: "Catch-all file have empty headers",
				input: {
					catchAllFile: {
						path: "/empty-headers",
						headers: {},
					},
				},
				expected: {
					globalHeaders: {},
					files: [],
					catchAllFile: {
						path: "/empty-headers",
						mime: null,
						statusCode: null,
						headers: {},
						envReplacements: {},
					},
					aliases: [],
				},
			},
			{
				description: "Catch-all file have content in headers, both string and null",
				input: {
					catchAllFile: {
						path: "/headers-with-content",
						headers: {
							"abc": "123",
							"def": null,
							"ghi": "",
						},
					},
				},
				expected: {
					globalHeaders: {},
					files: [],
					catchAllFile: {
						path: "/headers-with-content",
						mime: null,
						statusCode: null,
						headers: {
							"abc": "123",
							"ghi": "",
						},
						envReplacements: {},
					},
					aliases: [],
				},
			},
			{
				description: "Aliases present",
				input: {
					aliases: [
						{ from: "/a", to: "/b" },
					]
				},
				expected: {
					globalHeaders: {},
					files: [],
					catchAllFile: null,
					aliases: [
						{ from: "/a", to: "/b" },
					],
				},
			},
			{
				description: "Env replacements present",
				input: {
					files: [
						{
							path: "/abc",
							envReplacements: {
								"a": "b",
							},
						},
					],
				},
				expected: {
					globalHeaders: {},
					files: [
						{
							path: "/abc",
							headers: {},
							mime: null,
							statusCode: null,
							envReplacements: {
								"a": "b",
							},
						},
					],
					catchAllFile: null,
					aliases: [],
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
