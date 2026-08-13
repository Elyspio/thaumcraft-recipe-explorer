/**
 * Binary min-heap priority queue. Replaces the original `buckets.PriorityQueue`
 * (which was used with comparator `(a, b) => b.length - a.length`, i.e. the
 * smallest cumulative weight is dequeued first).
 */
export class PriorityQueue<T> {
	private items: T[] = [];

	/** `compare(a, b) < 0` means `a` has higher priority (dequeued first). */
	constructor(private readonly compare: (a: T, b: T) => number) {}

	get size(): number {
		return this.items.length;
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	enqueue(item: T): void {
		const items = this.items;
		items.push(item);
		let i = items.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (this.compare(items[i], items[parent]) >= 0) break;
			[items[i], items[parent]] = [items[parent], items[i]];
			i = parent;
		}
	}

	dequeue(): T | undefined {
		const items = this.items;
		if (items.length === 0) return undefined;
		const top = items[0];
		const last = items.pop()!;
		if (items.length > 0) {
			items[0] = last;
			let i = 0;
			const n = items.length;
			for (;;) {
				const left = 2 * i + 1;
				const right = left + 1;
				let smallest = i;
				if (left < n && this.compare(items[left], items[smallest]) < 0) smallest = left;
				if (right < n && this.compare(items[right], items[smallest]) < 0) smallest = right;
				if (smallest === i) break;
				[items[i], items[smallest]] = [items[smallest], items[i]];
				i = smallest;
			}
		}
		return top;
	}
}
