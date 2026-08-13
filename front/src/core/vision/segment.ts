import { defaultForegroundOptions, estimateBackground, isForeground, type Background, type ForegroundOptions } from "./raster";
import type { Box, Region, RgbaImage } from "./types";

export interface SegmentOptions extends ForegroundOptions {
	/**
	 * Gap bridged before labelling, as a fraction of image width. An aspect icon
	 * is not one connected shape — permutatio's ring is detached from its glowing
	 * centre, praecantatio's sparkles float free of the wand — so parts are merged
	 * before they are ever counted as separate candidates.
	 */
	dilationRatio: number;
	/** Minimum region area as a fraction of image area. */
	minAreaRatio: number;
	/** Minimum box side as a fraction of image width. */
	minSideRatio: number;
	/** Maximum long-side / short-side ratio. */
	maxElongation: number;
}

export const defaultSegmentOptions: SegmentOptions = {
	...defaultForegroundOptions,
	dilationRatio: 0.008,
	minAreaRatio: 0.0006,
	minSideRatio: 0.03,
	maxElongation: 3,
};

export interface SegmentResult {
	background: Background;
	regions: Region[];
}

/**
 * Splits a research-note screenshot into candidate icon regions.
 *
 * Shape filtering is not cosmetic here: the note's dark wooden frame yields thin
 * slivers that, resampled to the comparison size, become flat patches scoring
 * *higher* against dark references than real icons score against their own. A
 * score threshold alone cannot separate them; plausible size and squareness can.
 */
export function segment(image: RgbaImage, options: SegmentOptions = defaultSegmentOptions): SegmentResult {
	const { width, height, data } = image;
	const background = estimateBackground(image);

	const mask = new Uint8Array(width * height);
	for (let p = 0; p < mask.length; p++) {
		const i = p * 4;
		if (isForeground(data[i], data[i + 1], data[i + 2], background, options)) mask[p] = 1;
	}

	const radius = Math.max(1, Math.round(width * options.dilationRatio));
	const grown = dilate(mask, width, height, radius);

	const minArea = width * height * options.minAreaRatio;
	const minSide = width * options.minSideRatio;
	const regions: Region[] = [];

	for (const component of label(grown, width, height)) {
		// Undo the dilation margin so the box hugs the icon again.
		const box = shrink(component.box, radius, width, height);
		if (box.width < minSide || box.height < minSide) continue;
		if (Math.max(box.width, box.height) / Math.min(box.width, box.height) > options.maxElongation) continue;

		const pixels = countMasked(mask, width, box);
		if (pixels < minArea) continue;

		regions.push({ box, pixels });
	}

	return { background, regions };
}

/** Separable square max-filter — the cheap way to bridge gaps of `radius` px. */
function dilate(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
	const horizontal = new Uint8Array(mask.length);
	for (let y = 0; y < height; y++) {
		const row = y * width;
		for (let x = 0; x < width; x++) {
			const from = Math.max(0, x - radius);
			const to = Math.min(width - 1, x + radius);
			let on = 0;
			for (let k = from; k <= to && !on; k++) on = mask[row + k];
			horizontal[row + x] = on;
		}
	}

	const out = new Uint8Array(mask.length);
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			const from = Math.max(0, y - radius);
			const to = Math.min(height - 1, y + radius);
			let on = 0;
			for (let k = from; k <= to && !on; k++) on = horizontal[k * width + x];
			out[y * width + x] = on;
		}
	}

	return out;
}

/** Flood-fills every connected run, 8-connectivity, iteratively. */
function* label(mask: Uint8Array, width: number, height: number): Generator<{ box: Box }> {
	const seen = new Uint8Array(mask.length);
	const stack = new Int32Array(mask.length);

	for (let seed = 0; seed < mask.length; seed++) {
		if (mask[seed] !== 1 || seen[seed]) continue;

		let top = 0;
		stack[top++] = seed;
		seen[seed] = 1;

		let minX = width;
		let minY = height;
		let maxX = -1;
		let maxY = -1;

		while (top > 0) {
			const p = stack[--top];
			const x = p % width;
			const y = (p - x) / width;

			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;

			for (let dy = -1; dy <= 1; dy++) {
				const ny = y + dy;
				if (ny < 0 || ny >= height) continue;
				for (let dx = -1; dx <= 1; dx++) {
					const nx = x + dx;
					if (nx < 0 || nx >= width) continue;
					const q = ny * width + nx;
					if (mask[q] !== 1 || seen[q]) continue;
					seen[q] = 1;
					stack[top++] = q;
				}
			}
		}

		yield { box: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } };
	}
}

function shrink(box: Box, radius: number, width: number, height: number): Box {
	const x = Math.max(0, box.x + radius);
	const y = Math.max(0, box.y + radius);
	const right = Math.min(width, box.x + box.width - radius);
	const bottom = Math.min(height, box.y + box.height - radius);
	return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
}

function countMasked(mask: Uint8Array, width: number, box: Box): number {
	let count = 0;
	for (let y = box.y; y < box.y + box.height; y++) {
		for (let x = box.x; x < box.x + box.width; x++) {
			count += mask[y * width + x];
		}
	}
	return count;
}
