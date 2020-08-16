import "mocha-sinon";
import { expect } from "chai";
import GridsomeServer from "../gridsome.server";
import { existsSync, mkdir, rmdirSync, unlinkSync } from "fs";

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const api = {
	beforeBuild: callable => {
		(async () => await callable())();
	},
};

beforeEach(function () {
	this.sinon.stub(console, "error");
	this.sinon.stub(console, "log");
});

before(done => {
	mkdir("static", done);
});

describe("server", () => {
	describe("library", () => {
		it("should export a function", () =>
			expect(GridsomeServer).to.be.an.instanceOf(Function));

		it("should generate a service-worker.js file in the static folder", async function () {
			this.timeout(15000);

			new GridsomeServer(api, {
				networkFirst: {
					cacheName: "nf-v1",
					routes: ["/"],
				},
			});

			await sleep(12000);

			expect(existsSync("static/service-worker.js")).to.be.true;
			expect(existsSync("static/assets/js/service-worker.js")).to.be.true;
		});
	});

	describe("errors", () => {
		describe("cacheFirst", () => {
			it("should throw an error if the cacheFirst option is not an object", () => {
				new GridsomeServer(api, {
					cacheFirst: 42,
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheFirst" must be an object`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the cacheFirst option is not present", () => {
				new GridsomeServer(api, {
					cacheFirst: {},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheFirst.cacheName" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the routes and fileTypes keys of the cacheFirst option is not present", () => {
				new GridsomeServer(api, {
					cacheFirst: {
						cacheName: "cf-v1",
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheFirst.routes" or "cacheFirst.fileTypes" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the cacheFirst option is not a string", () => {
				new GridsomeServer(api, {
					cacheFirst: {
						cacheName: 42,
						routes: [],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheFirst.cacheName" must be a string`
					)
				).to.be.true;
			});

			it("should throw an error if the routes key of the cacheFirst option is not an array", () => {
				new GridsomeServer(api, {
					cacheFirst: {
						cacheName: "cf-v1",
						routes: 42,
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheFirst.routes" must be an array`
					)
				).to.be.true;
			});

			it("should throw an error if one of the value of the routes key of the cacheFirst option is not string nor a regexp", () => {
				new GridsomeServer(api, {
					cacheFirst: {
						cacheName: "cf-v1",
						routes: [42],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheFirst.routes[0]" must be a string or a regexp`
					)
				).to.be.true;
			});
		});

		describe("cacheOnly", () => {
			it("should throw an error if the cacheOnly option is not an object", () => {
				new GridsomeServer(api, {
					cacheOnly: 42,
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheOnly" must be an object`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the cacheOnly option is not present", () => {
				new GridsomeServer(api, {
					cacheOnly: {},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheOnly.cacheName" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the routes and fileTypes keys of the cacheOnly option is not present", () => {
				new GridsomeServer(api, {
					cacheOnly: {
						cacheName: "co-v1",
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheOnly.routes" or "cacheOnly.fileTypes" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the cacheOnly option is not a string", () => {
				new GridsomeServer(api, {
					cacheOnly: {
						cacheName: 42,
						routes: [],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheOnly.cacheName" must be a string`
					)
				).to.be.true;
			});

			it("should throw an error if the routes key of the cacheOnly option is not an array", () => {
				new GridsomeServer(api, {
					cacheOnly: {
						cacheName: "co-v1",
						routes: 42,
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheOnly.routes" must be an array`
					)
				).to.be.true;
			});

			it("should throw an error if one of the value of the routes key of the cacheOnly option is not string nor a regexp", () => {
				new GridsomeServer(api, {
					cacheOnly: {
						cacheName: "co-v1",
						routes: [42],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "cacheOnly.routes[0]" must be a string or a regexp`
					)
				).to.be.true;
			});
		});

		describe("networkFirst", () => {
			it("should throw an error if the networkFirst option is not an object", () => {
				new GridsomeServer(api, {
					networkFirst: 42,
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkFirst" must be an object`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the networkFirst option is not present", () => {
				new GridsomeServer(api, {
					networkFirst: {},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkFirst.cacheName" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the routes and fileTypes keys of the networkFirst option is not present", () => {
				new GridsomeServer(api, {
					networkFirst: {
						cacheName: "nf-v1",
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkFirst.routes" or "networkFirst.fileTypes" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the networkFirst option is not a string", () => {
				new GridsomeServer(api, {
					networkFirst: {
						cacheName: 42,
						routes: [],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkFirst.cacheName" must be a string`
					)
				).to.be.true;
			});

			it("should throw an error if the routes key of the networkFirst option is not an array", () => {
				new GridsomeServer(api, {
					networkFirst: {
						cacheName: "nf-v1",
						routes: 42,
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkFirst.routes" must be an array`
					)
				).to.be.true;
			});

			it("should throw an error if one of the value of the routes key of the networkFirst option is not string nor a regexp", () => {
				new GridsomeServer(api, {
					networkFirst: {
						cacheName: "nf-v1",
						routes: [42],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkFirst.routes[0]" must be a string or a regexp`
					)
				).to.be.true;
			});
		});

		describe("networkOnly", () => {
			it("should throw an error if the networkOnly option is not an object", () => {
				new GridsomeServer(api, {
					networkOnly: 42,
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkOnly" must be an object`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the networkOnly option is not present", () => {
				new GridsomeServer(api, {
					networkOnly: {},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkOnly.cacheName" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the routes and fileTypes keys of the networkOnly option is not present", () => {
				new GridsomeServer(api, {
					networkOnly: {
						cacheName: "no-v1",
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkOnly.routes" or "networkOnly.fileTypes" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the networkOnly option is not a string", () => {
				new GridsomeServer(api, {
					networkOnly: {
						cacheName: 42,
						routes: [],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkOnly.cacheName" must be a string`
					)
				).to.be.true;
			});

			it("should throw an error if the routes key of the networkOnly option is not an array", () => {
				new GridsomeServer(api, {
					networkOnly: {
						cacheName: "no-v1",
						routes: 42,
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkOnly.routes" must be an array`
					)
				).to.be.true;
			});

			it("should throw an error if one of the value of the routes key of the networkOnly option is not string nor a regexp", () => {
				new GridsomeServer(api, {
					networkOnly: {
						cacheName: "no-v1",
						routes: [42],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "networkOnly.routes[0]" must be a string or a regexp`
					)
				).to.be.true;
			});
		});

		describe("staleWhileRevalidate", () => {
			it("should throw an error if the staleWhileRevalidate option is not an object", () => {
				new GridsomeServer(api, {
					staleWhileRevalidate: 42,
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "staleWhileRevalidate" must be an object`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the staleWhileRevalidate option is not present", () => {
				new GridsomeServer(api, {
					staleWhileRevalidate: {},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "staleWhileRevalidate.cacheName" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the routes and fileTypes keys of the staleWhileRevalidate option is not present", () => {
				new GridsomeServer(api, {
					staleWhileRevalidate: {
						cacheName: "swr-v1",
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "staleWhileRevalidate.routes" or "staleWhileRevalidate.fileTypes" must be present`
					)
				).to.be.true;
			});

			it("should throw an error if the cacheName key of the staleWhileRevalidate option is not a string", () => {
				new GridsomeServer(api, {
					staleWhileRevalidate: {
						cacheName: 42,
						routes: [],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "staleWhileRevalidate.cacheName" must be a string`
					)
				).to.be.true;
			});

			it("should throw an error if the routes key of the staleWhileRevalidate option is not an array", () => {
				new GridsomeServer(api, {
					staleWhileRevalidate: {
						cacheName: "swr-v1",
						routes: 42,
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "staleWhileRevalidate.routes" must be an array`
					)
				).to.be.true;
			});

			it("should throw an error if one of the value of the routes key of the staleWhileRevalidate option is not string nor a regexp", () => {
				new GridsomeServer(api, {
					staleWhileRevalidate: {
						cacheName: "swr-v1",
						routes: [42],
					},
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "staleWhileRevalidate.routes[0]" must be a string or a regexp`
					)
				).to.be.true;
			});
		});

		describe("precachedRoutes", () => {
			it("should throw an error if the precachedRoutes options is not an array", () => {
				new GridsomeServer(api, {
					precachedRoutes: 42,
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "precachedRoutes" must be an array`
					)
				).to.be.true;
			});

			it("should throw an error if one of the items of the precachedRoutes option is not a string", () => {
				new GridsomeServer(api, {
					precachedRoutes: [42],
				});

				expect(
					console.error.calledWith(
						`gridsome-plugin-service-worker: "precachedRoutes[0]" must be a string`
					)
				).to.be.true;
			});
		});
	});
});
