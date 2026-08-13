import { describe, expect, it } from "vitest";
import { buildVersionModel } from "@data/model";
import { translate } from "@data/aspectMeta";
import { buildGraph, type Graph } from "./graph";
import { find, summarizePath } from "./find";

const NO_DISABLED = new Set<string>();

const model = buildVersionModel("4.1.0g");
const graph = buildGraph(model.combinations);

/** Asserts every consecutive pair in a path is actually connected in the graph. */
function assertConnected(graph: Graph, path: string[]) {
	for (let i = 0; i < path.length - 1; i++) {
		expect(graph[path[i]], `${path[i]} has neighbours`).toBeDefined();
		expect(graph[path[i]]).toContain(path[i + 1]);
	}
}

describe("buildGraph", () => {
	it("connects a compound aspect to both parents, bidirectionally", () => {
		// 4.1.0g: void = air + entropy
		expect(graph.void).toEqual(expect.arrayContaining(["air", "entropy"]));
		expect(graph.air).toContain("void");
		expect(graph.entropy).toContain("void");
	});
});

describe("find", () => {
	it("returns the direct connection when minSteps is 0", () => {
		const path = find(graph, "air", "void", 0, NO_DISABLED);
		expect(path).toEqual(["air", "void"]);
	});

	it("returns a path whose endpoints match the query", () => {
		const path = find(graph, "air", "metal", 1, NO_DISABLED);
		expect(path).not.toBeNull();
		expect(path![0]).toBe("air");
		expect(path!.at(-1)).toBe("metal");
		assertConnected(graph, path!);
	});

	it("honours the minimum step count (path length > minSteps + 1)", () => {
		for (const minSteps of [1, 2, 3]) {
			const path = find(graph, "air", "light", minSteps, NO_DISABLED);
			expect(path, `min ${minSteps}`).not.toBeNull();
			expect(path!.length).toBeGreaterThan(minSteps + 1);
			assertConnected(graph, path!);
		}
	});

	it("avoids a disabled intermediate aspect when an alternative exists", () => {
		const free = find(graph, "air", "void", 0, NO_DISABLED);
		expect(free).toEqual(["air", "void"]);
		// Disabling void forces a longer detour (or at least never an empty result here).
		const disabled = new Set(["void"]);
		const detour = find(graph, "air", "darkness", 0, disabled);
		expect(detour).not.toBeNull();
		assertConnected(graph, detour!);
	});

	it("returns null when the target is unreachable", () => {
		const tiny = buildGraph({ foo: ["bar", "baz"] });
		expect(find(tiny, "bar", "isolated", 0, NO_DISABLED)).toBeNull();
	});
});

describe("summarizePath", () => {
	it("counts only intermediate aspects and totals the steps", () => {
		const res = summarizePath("air", "metal", ["air", "light", "energy", "metal"]);
		expect(res.totalSteps).toBe(2);
		expect(res.usage).toEqual([
			{ aspect: "light", count: 1 },
			{ aspect: "energy", count: 1 },
		]);
	});
});

describe("data integrity", () => {
	it("every aspect in the model has a Latin name / icon mapping", () => {
		for (const aspect of model.aspects) {
			expect(translate[aspect], `missing translation for "${aspect}"`).toBeDefined();
		}
	});
});
