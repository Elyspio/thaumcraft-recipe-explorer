import { alphaBounds, resample } from "./raster";
import type { Box, Match, Reference, Region, RgbaImage } from "./types";

/** Side length every region and reference is resampled to before comparison — the icons' native size. */
export const COMPARE_SIZE = 32;

/** Minimum reference alpha for a pixel to count towards the score. */
const MIN_WEIGHT_ALPHA = 24;

/**
 * Similarity of a region sample to a reference icon, 0..1.
 *
 * Two terms, both weighted by the reference's alpha so the parchment showing
 * through transparent pixels never contributes:
 *
 * - **colour** — mean absolute RGB difference. Cheap, but blind to layout: two
 *   pale icons filling the frame (ordo and gloria) score within 0.003 of each
 *   other on colour alone.
 * - **structure** — zero-mean normalized cross-correlation of luminance, which
 *   compares how brightness is *arranged* and is invariant to overall offset and
 *   scale. This is what tells a ring from a pair of wings.
 *
 * They are multiplied rather than averaged so either can veto: averaging let
 * structure outvote colour and turned the green permutatio ring into pink flesh.
 * A real match has to agree on both what the icon is made of and how it is laid
 * out.
 */
export interface ScoreDetail {
	colour: number;
	structure: number;
	score: number;
}

/** Component breakdown behind `score`, kept exported for threshold calibration. */
export function scoreDetail(sample: RgbaImage, reference: RgbaImage): ScoreDetail {
	let error = 0;
	let weight = 0;

	for (let i = 0; i < reference.data.length; i += 4) {
		const alpha = reference.data[i + 3];
		if (alpha < MIN_WEIGHT_ALPHA) continue;

		const dr = Math.abs(sample.data[i] - reference.data[i]);
		const dg = Math.abs(sample.data[i + 1] - reference.data[i + 1]);
		const db = Math.abs(sample.data[i + 2] - reference.data[i + 2]);

		error += (alpha * (dr + dg + db)) / 3;
		weight += alpha;
	}

	if (weight === 0) return { colour: 0, structure: 0, score: 0 };

	const colour = 1 - error / weight / 255;
	const structure = correlation(sample, reference, weight);

	return { colour, structure, score: colour * structure };
}

/**
 * Alpha-weighted normalized cross-correlation, averaged over R, G and B.
 *
 * Per channel rather than on luminance: permutatio's centre glows white in one
 * screenshot and cyan in another, and that animated bloom swamps a
 * luminance-only correlation while leaving each channel's layout recognisable.
 */
function correlation(sample: RgbaImage, reference: RgbaImage, weight: number): number {
	let total = 0;

	for (let channel = 0; channel < 3; channel++) {
		let sumS = 0;
		let sumR = 0;

		for (let i = 0; i < reference.data.length; i += 4) {
			const alpha = reference.data[i + 3];
			if (alpha < MIN_WEIGHT_ALPHA) continue;
			sumS += alpha * sample.data[i + channel];
			sumR += alpha * reference.data[i + channel];
		}

		const meanS = sumS / weight;
		const meanR = sumR / weight;

		let covariance = 0;
		let varianceS = 0;
		let varianceR = 0;

		for (let i = 0; i < reference.data.length; i += 4) {
			const alpha = reference.data[i + 3];
			if (alpha < MIN_WEIGHT_ALPHA) continue;
			const ds = sample.data[i + channel] - meanS;
			const dr = reference.data[i + channel] - meanR;
			covariance += alpha * ds * dr;
			varianceS += alpha * ds * ds;
			varianceR += alpha * dr * dr;
		}

		const denominator = Math.sqrt(varianceS * varianceR);
		// A flat channel has no structure to correlate — score it zero rather
		// than rewarding it with a neutral 0.5. This is what sinks the wooden
		// frame's uniform slivers.
		total += denominator === 0 ? 0 : (covariance / denominator + 1) / 2;
	}

	return total / 3;
}

/** Similarity of a region sample to a reference icon, 0..1. */
export function score(sample: RgbaImage, reference: RgbaImage): number {
	return scoreDetail(sample, reference).score;
}

/**
 * Normalizes a reference icon to its comparison form: tight-cropped, resampled,
 * then **composited over the parchment colour** while keeping its coverage in the
 * alpha channel.
 *
 * The compositing step is not cosmetic. A sample cut from a screenshot has the
 * parchment already blended into every anti-aliased edge and every gap in a thin
 * stroke, whereas an alpha-weighted average of the source icon keeps those
 * strokes pure. Comparing the two directly makes airy icons — permutatio's ring,
 * praecantatio's wand — uncorrelated with their own reference, while solid ones
 * survive. Blending both the same way removes the asymmetry.
 */
export function prepareReference(image: RgbaImage, background: readonly [number, number, number]): RgbaImage {
	const bounds = alphaBounds(image) ?? { x: 0, y: 0, width: image.width, height: image.height };
	const scaled = resample(image, bounds, COMPARE_SIZE);

	for (let i = 0; i < scaled.data.length; i += 4) {
		const coverage = scaled.data[i + 3] / 255;
		scaled.data[i] = scaled.data[i] * coverage + background[0] * (1 - coverage);
		scaled.data[i + 1] = scaled.data[i + 1] * coverage + background[1] * (1 - coverage);
		scaled.data[i + 2] = scaled.data[i + 2] * coverage + background[2] * (1 - coverage);
	}

	return scaled;
}

/**
 * Framings of a region tried before scoring.
 *
 * A region's box does not always frame its icon the way the reference PNG frames
 * its own. Permutatio carries an animated bloom in its centre and praecantatio
 * loose sparkles, both of which inflate the box, shrinking the icon inside the
 * frame. Correlation punishes that hard — a ring offset from itself is
 * *anti*-correlated — so the icon is re-framed at a few scales and the best fit
 * wins.
 */
const FRAMING_SCALES = [1, 0.92, 0.84, 0.76];
const FRAMING_SHIFTS = [0];

export function* framings(box: Box, size: number, image: RgbaImage): Generator<RgbaImage> {
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;

	for (const factor of FRAMING_SCALES) {
		const width = Math.max(2, Math.round(box.width * factor));
		const height = Math.max(2, Math.round(box.height * factor));

		for (const sx of FRAMING_SHIFTS) {
			for (const sy of FRAMING_SHIFTS) {
				const x = Math.max(0, Math.min(image.width - width, Math.round(cx + sx * box.width - width / 2)));
				const y = Math.max(0, Math.min(image.height - height, Math.round(cy + sy * box.height - height / 2)));
				yield resample(image, { x, y, width, height }, size);
			}
		}
	}
}

/** Best and runner-up reference for one region. */
export function matchRegion(image: RgbaImage, region: Region, references: readonly Reference[]): Match | null {
	if (references.length === 0) return null;

	const samples = [...framings(region.box, COMPARE_SIZE, image)];
	let best: { aspect: string; score: number } | null = null;
	let runnerUp: { aspect: string; score: number } | null = null;

	for (const reference of references) {
		let value = 0;
		for (const sample of samples) value = Math.max(value, score(sample, reference.image));

		if (!best || value > best.score) {
			runnerUp = best;
			best = { aspect: reference.aspect, score: value };
		} else if (!runnerUp || value > runnerUp.score) {
			runnerUp = { aspect: reference.aspect, score: value };
		}
	}

	if (!best) return null;
	return { aspect: best.aspect, score: best.score, box: region.box, runnerUp };
}
