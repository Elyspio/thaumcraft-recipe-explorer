import type { AspectName } from "@data/types";
import { PriorityQueue } from "./priorityQueue";
import type { Graph } from "./graph";

interface SearchNode {
	path: AspectName[];
	length: number;
}

/**
 * Faithful port of the original `find()` from tcresearch.js.
 *
 * Returns the shortest path (by cumulative weight) connecting `from` to `to`
 * whose node count is strictly greater than `minSteps + 1`, or `null` if no
 * such path exists. Disabled (unavailable) aspects keep weight 100 so the
 * search avoids them unless there is no alternative.
 */
export function find(graph: Graph, from: AspectName, to: AspectName, minSteps: number, disabled: ReadonlySet<AspectName>): AspectName[] | null {
	const weight = (aspect: AspectName): number => (disabled.has(aspect) ? 100 : 1);

	// Upper bound on path length. The original algorithm allowed unbounded,
	// non-simple paths and would loop forever if `to` was unreachable. A
	// minimal qualifying path never needs more than (node count + minSteps + 2)
	// nodes, so capping here is result-preserving for reachable targets while
	// guaranteeing termination.
	const maxLength = Object.keys(graph).length + minSteps + 2;

	const queue = new PriorityQueue<SearchNode>((a, b) => a.length - b.length);
	queue.enqueue({ path: [from], length: 0 });

	const visited: Record<AspectName, number[]> = {};

	while (!queue.isEmpty()) {
		const element = queue.dequeue()!;
		const node = element.path[element.path.length - 1];
		const key = element.path.length - 1;

		if (!(node in visited) || visited[node].indexOf(key) < 0) {
			if (node === to && element.path.length > minSteps + 1) {
				return element.path;
			}
			if (element.path.length < maxLength) {
				for (const entry of graph[node] ?? []) {
					queue.enqueue({ path: [...element.path, entry], length: element.length + weight(entry) });
				}
			}
			(visited[node] ??= []).push(key);
		}
	}

	return null;
}

export interface AspectUsage {
	aspect: AspectName;
	count: number;
}

export interface ResolvedPath {
	from: AspectName;
	to: AspectName;
	path: AspectName[];
	/** Intermediate aspects (endpoints excluded) and how many times each is used. */
	usage: AspectUsage[];
	/** Total number of intermediate steps. */
	totalSteps: number;
}

/** Computes the "Aspects Used" summary shown for a result, like the original `run()`. */
export function summarizePath(from: AspectName, to: AspectName, path: AspectName[]): ResolvedPath {
	const counts = new Map<AspectName, number>();
	// Skip the first and last node (the endpoints) when counting usage.
	for (let i = 1; i < path.length - 1; i++) {
		counts.set(path[i], (counts.get(path[i]) ?? 0) + 1);
	}
	const usage: AspectUsage[] = [...counts.entries()].map(([aspect, count]) => ({ aspect, count }));
	const totalSteps = usage.reduce((sum, u) => sum + u.count, 0);
	return { from, to, path, usage, totalSteps };
}
