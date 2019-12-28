import { expect } from "chai";
import gridsomeServer from "../gridsome.server";

const api = {
	beforeBuild: callable => callable(),
};

describe("server", () => {
	describe("library", () => {
		it("should export a function", () =>
			expect(gridsomeServer).to.be.an.instanceOf(Function));
	});
});
