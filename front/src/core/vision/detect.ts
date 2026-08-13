import { matchRegion } from "./match";
import { prepareReferences, type ReferenceIcon } from "./references";
import { defaultSegmentOptions, segment, type SegmentOptions } from "./segment";
import type { Match, RgbaImage } from "./types";

export interface DetectOptions {
	segment: SegmentOptions;
	/**
	 * Matches scoring below this are treated as noise. Decorative runes and board
	 * artefacts resemble no aspect, so a single score threshold replaces any
	 * geometric filtering.
	 */
	minScore: number;
}

export const defaultDetectOptions: DetectOptions = {
	segment: defaultSegmentOptions,
	// Calibrated on the fixtures: correct matches land between 0.63 and 0.88.
	// This sits below the worst true positive (permutatio, 0.635) with headroom.
	// It is only a backstop — shape filtering in `segment` already removes the
	// board and the frame, and every match still passes through human review.
	minScore: 0.55,
};

export interface DetectResult {
	/** Confident matches, in reading order. */
	aspects: Match[];
	/** Everything that segmented but scored too low — surfaced as "N areas ignored". */
	rejected: Match[];
}

/** Identifies the aspect icons on a research-note screenshot. */
export function detect(image: RgbaImage, icons: readonly ReferenceIcon[], options: DetectOptions = defaultDetectOptions): DetectResult {
	const { background, regions } = segment(image, options.segment);
	const references = prepareReferences(icons, background.colour);

	const aspects: Match[] = [];
	const rejected: Match[] = [];

	for (const region of regions) {
		const match = matchRegion(image, region, references);
		if (!match) continue;
		(match.score >= options.minScore ? aspects : rejected).push(match);
	}

	aspects.sort(readingOrder);
	rejected.sort(readingOrder);
	return { aspects, rejected };
}

function readingOrder(a: Match, b: Match): number {
	return a.box.y === b.box.y ? a.box.x - b.box.x : a.box.y - b.box.y;
}
