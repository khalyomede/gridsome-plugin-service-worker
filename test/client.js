import { expect } from "chai";
import gridsomeClient from "../gridsome.client";

describe("client", () => {
	describe("library", () => {
		it("should export a function", () =>
			expect(gridsomeClient).to.be.an.instanceOf(Function));
	});
});
