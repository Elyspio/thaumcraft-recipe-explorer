import type { Box, RgbaImage } from "./types";

/** Perceived brightness, 0..255. */
export function luminance(r: number, g: number, b: number): number {
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Normalized chromaticity `[r/(r+g+b), g/(r+g+b)]` — the pixel's tint with
 * intensity divided out.
 *
 * This is what separates icons from the note itself. The parchment, the hexagon
 * outlines and the decorative runes are all the *same* warm brown tint at
 * different brightnesses, so they collapse onto one chromaticity point; every
 * aspect icon sits far from it, whether it is strongly coloured (permutatio,
 * corpus, praecantatio) or near-grey (metallum, ordo, motus). Thresholding on
 * brightness alone cannot do this — the parchment is itself highly saturated.
 */
export function chromaticity(r: number, g: number, b: number): [number, number] {
	const sum = r + g + b;
	if (sum === 0) return [1 / 3, 1 / 3];
	return [r / sum, g / sum];
}

export interface Background {
	chroma: [number, number];
	luma: number;
	/** Median parchment colour — reference icons are composited over it before matching. */
	colour: [number, number, number];
}

/**
 * Estimates the parchment tint as the median chromaticity and luminance over a
 * subsample. Median rather than mean: the icons and the dark wooden frame are
 * outliers we want ignored, and the note's own texture dominates the histogram.
 */
export function estimateBackground(image: RgbaImage, step = 3): Background {
	const { width, height, data } = image;
	const rs: number[] = [];
	const gs: number[] = [];
	const ls: number[] = [];
	const reds: number[] = [];
	const greens: number[] = [];
	const blues: number[] = [];

	for (let y = 0; y < height; y += step) {
		for (let x = 0; x < width; x += step) {
			const i = (y * width + x) * 4;
			const [cr, cg] = chromaticity(data[i], data[i + 1], data[i + 2]);
			rs.push(cr);
			gs.push(cg);
			ls.push(luminance(data[i], data[i + 1], data[i + 2]));
			reds.push(data[i]);
			greens.push(data[i + 1]);
			blues.push(data[i + 2]);
		}
	}

	return {
		chroma: [median(rs), median(gs)],
		luma: median(ls),
		colour: [median(reds), median(greens), median(blues)],
	};
}

function median(values: number[]): number {
	values.sort((a, b) => a - b);
	return values[values.length >> 1];
}

export interface ForegroundOptions {
	/** Minimum chromaticity distance from the background tint. */
	chromaDistance: number;
	/** Reject pixels darker than this fraction of background luminance (the wooden frame). */
	minLumaRatio: number;
}

export const defaultForegroundOptions: ForegroundOptions = {
	chromaDistance: 0.05,
	minLumaRatio: 0.35,
};

/** True when a pixel belongs to an icon rather than to the note. */
export function isForeground(r: number, g: number, b: number, bg: Background, options: ForegroundOptions): boolean {
	if (luminance(r, g, b) < bg.luma * options.minLumaRatio) return false;
	const [cr, cg] = chromaticity(r, g, b);
	return Math.hypot(cr - bg.chroma[0], cg - bg.chroma[1]) >= options.chromaDistance;
}

/** Tightest box containing every pixel above `minAlpha`, or null when fully transparent. */
export function alphaBounds(image: RgbaImage, minAlpha = 8): Box | null {
	const { width, height, data } = image;
	let minX = width;
	let minY = height;
	let maxX = -1;
	let maxY = -1;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (data[(y * width + x) * 4 + 3] < minAlpha) continue;
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
	}

	if (maxX < 0) return null;
	return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Box-filter resample of `box` within `image` to `size`×`size`, averaging colour
 * weighted by alpha so transparent reference pixels don't drag a dark halo into
 * the result.
 */
export function resample(image: RgbaImage, box: Box, size: number): RgbaImage {
	const out = new Uint8ClampedArray(size * size * 4);

	for (let ty = 0; ty < size; ty++) {
		const y0 = box.y + Math.floor((ty * box.height) / size);
		const y1 = Math.max(y0 + 1, box.y + Math.floor(((ty + 1) * box.height) / size));

		for (let tx = 0; tx < size; tx++) {
			const x0 = box.x + Math.floor((tx * box.width) / size);
			const x1 = Math.max(x0 + 1, box.x + Math.floor(((tx + 1) * box.width) / size));

			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			let n = 0;

			for (let y = y0; y < y1; y++) {
				for (let x = x0; x < x1; x++) {
					const i = (y * image.width + x) * 4;
					const alpha = image.data[i + 3];
					r += image.data[i] * alpha;
					g += image.data[i + 1] * alpha;
					b += image.data[i + 2] * alpha;
					a += alpha;
					n++;
				}
			}

			const o = (ty * size + tx) * 4;
			if (a > 0) {
				out[o] = r / a;
				out[o + 1] = g / a;
				out[o + 2] = b / a;
			}
			out[o + 3] = n > 0 ? a / n : 0;
		}
	}

	return { width: size, height: size, data: out };
}
