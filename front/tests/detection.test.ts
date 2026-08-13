import { describe, expect, it } from "vitest";
import { decodeImage } from "@/core/vision/decode";
import { defaultDetectOptions, detect } from "@/core/vision/detect";
import { loadReferenceIcons } from "@/core/vision/references";
import type { RgbaImage } from "@/core/vision/types";
import smallUrl from "./fixtures/note-metallum-ordo-permutatio-902.png?url";
import largeUrl from "./fixtures/note-metallum-ordo-permutatio-1048.png?url";
import mixedUrl from "./fixtures/note-corpus-motus-praecantatio-942.png?url";

async function fixture(url: string): Promise<RgbaImage> {
	return decodeImage(await (await fetch(url)).blob());
}

/**
 * Ground truth is encoded in the fixture filenames (Latin, alphabetical); the
 * keys below are the English identities the model uses. The two
 * metallum/ordo/permutatio notes are the same board at different GUI scales,
 * which is what pins down scale invariance.
 */
const cases = [
	{ name: "902px note", url: smallUrl, expected: ["exchange", "metal", "order"] },
	{ name: "1048px note", url: largeUrl, expected: ["exchange", "metal", "order"] },
	{ name: "942px note", url: mixedUrl, expected: ["flesh", "magic", "motion"] },
];

describe("research note detection", () => {
	for (const { name, url, expected } of cases) {
		it(`recognises every anchor on the ${name}`, async () => {
			const [image, icons] = await Promise.all([fixture(url), loadReferenceIcons()]);
			const { aspects } = detect(image, icons);

			const detail = aspects.map((m) => `${m.aspect}@${m.score.toFixed(3)}`).join(" ");
			expect(aspects.map((m) => m.aspect).sort(), detail).toEqual(expected);
		});

		it(`keeps the board, the runes and the frame out of the results on the ${name}`, async () => {
			const [image, icons] = await Promise.all([fixture(url), loadReferenceIcons()]);
			const { aspects, rejected } = detect(image, icons);

			// Hexagon outlines and runes share the parchment's tint so they never
			// segment; the wooden frame's slivers are dropped on shape. Nothing
			// should be left over for the review panel to explain away.
			expect(aspects).toHaveLength(3);
			expect(rejected).toHaveLength(0);
		});

		it(`ranks the right aspect ahead of its runner-up on the ${name}`, async () => {
			const [image, icons] = await Promise.all([fixture(url), loadReferenceIcons()]);
			const { aspects } = detect(image, icons);

			for (const match of aspects) {
				expect(match.runnerUp).not.toBeNull();
				const margin = match.score - (match.runnerUp?.score ?? 0);
				expect(margin, `${match.aspect} over ${match.runnerUp?.aspect}`).toBeGreaterThan(0);
			}
		});
	}

	it("clears the score threshold on every anchor", async () => {
		const icons = await loadReferenceIcons();

		for (const { name, url } of cases) {
			const { aspects } = detect(await fixture(url), icons);
			for (const match of aspects) {
				expect(match.score, `${match.aspect} on ${name}`).toBeGreaterThan(defaultDetectOptions.minScore);
			}
		}
	});
});
