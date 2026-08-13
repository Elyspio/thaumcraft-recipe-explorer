import { beforeEach, describe, expect, it } from "vitest";
import type { AspectName } from "@data/types";
import { summarizePath } from "@/core/pathfinding/find";
import { useAppStore, type StoredResult } from "./appStore";

function result(from: AspectName, to: AspectName, path: AspectName[], noteId?: string): StoredResult {
	return { ...summarizePath(from, to, path), noteId };
}

const airToMetal = result("air", "metal", ["air", "light", "energy", "metal"]);

beforeEach(() => {
	useAppStore.setState({ results: [], error: null });
});

describe("invertResult", () => {
	it("swaps the endpoints and reverses the path", () => {
		useAppStore.setState({ results: [airToMetal] });
		useAppStore.getState().invertResult("air", "metal");

		const [inverted] = useAppStore.getState().results;
		expect(inverted.from).toBe("metal");
		expect(inverted.to).toBe("air");
		expect(inverted.path).toEqual(["metal", "energy", "light", "air"]);
	});

	it("leaves the usage summary untouched — the graph is undirected", () => {
		useAppStore.setState({ results: [airToMetal] });
		useAppStore.getState().invertResult("air", "metal");

		const [inverted] = useAppStore.getState().results;
		expect(inverted.totalSteps).toBe(airToMetal.totalSteps);
		expect(inverted.usage).toEqual(airToMetal.usage);
	});

	it("keeps the card at its index and in its note group", () => {
		const first = result("air", "ice", ["air", "cold", "ice"], "note-1");
		const second = result("air", "metal", ["air", "light", "energy", "metal"], "note-1");
		const third = result("air", "void", ["air", "void"]);
		useAppStore.setState({ results: [first, second, third] });

		useAppStore.getState().invertResult("air", "metal");

		const results = useAppStore.getState().results;
		expect(results.map((r) => [r.from, r.to])).toEqual([
			["air", "ice"],
			["metal", "air"],
			["air", "void"],
		]);
		expect(results[1].noteId).toBe("note-1");
	});

	it("drops a card that was already holding the reversed pair", () => {
		const existing = result("metal", "air", ["metal", "tool", "air"]);
		useAppStore.setState({ results: [airToMetal, existing] });

		useAppStore.getState().invertResult("air", "metal");

		const results = useAppStore.getState().results;
		expect(results).toHaveLength(1);
		// The inverted card wins, not the one it collided with.
		expect(results[0].path).toEqual(["metal", "energy", "light", "air"]);
	});

	it("does nothing when no card matches the pair", () => {
		useAppStore.setState({ results: [airToMetal] });
		useAppStore.getState().invertResult("air", "void");
		expect(useAppStore.getState().results).toEqual([airToMetal]);
	});
});
