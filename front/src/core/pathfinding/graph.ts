import type { AspectName, Combinations } from "@data/types";

export type Graph = Record<AspectName, AspectName[]>;

/**
 * Builds an undirected adjacency list from the combination tree: each compound
 * aspect is connected to both of its parents (and vice-versa). Mirrors the
 * original `connect()` in tcresearch.js.
 */
export function buildGraph(combinations: Combinations): Graph {
	const graph: Graph = {};
	const add = (from: AspectName, to: AspectName) => {
		(graph[from] ??= []).push(to);
	};
	for (const compound in combinations) {
		const [a, b] = combinations[compound];
		add(compound, a);
		add(a, compound);
		add(compound, b);
		add(b, compound);
	}
	return graph;
}
