import { aspectIcon, translate } from "@data/aspectMeta";
import type { AspectName } from "@data/types";
import { decodeImage } from "./decode";
import { prepareReference } from "./match";
import type { Reference, RgbaImage } from "./types";

/**
 * Every aspect the tool knows an icon for. Matching deliberately spans all of
 * them rather than the current version's model: an aspect recognised but absent
 * from the selected version is reported as such, instead of being silently
 * confused with a neighbour.
 */
export const referenceAspects: AspectName[] = Object.keys(translate);

export interface ReferenceIcon {
	aspect: AspectName;
	image: RgbaImage;
}

let pending: Promise<ReferenceIcon[]> | null = null;

/** Decodes the reference icons once per session, as raw RGBA with alpha intact. */
export function loadReferenceIcons(): Promise<ReferenceIcon[]> {
	pending ??= Promise.all(
		referenceAspects.map(async (aspect) => {
			const response = await fetch(aspectIcon(aspect, "color"));
			if (!response.ok) throw new Error(`Cannot load icon for ${aspect}: HTTP ${response.status}`);
			return { aspect, image: await decodeImage(await response.blob()) };
		}),
	);
	return pending;
}

/**
 * Bakes the icons against one note's parchment colour. Cheap enough to redo per
 * screenshot, and it has to be: the comparison is only valid against the
 * background the sample was actually cut from.
 */
export function prepareReferences(icons: readonly ReferenceIcon[], background: readonly [number, number, number]): Reference[] {
	return icons.map(({ aspect, image }) => ({ aspect, image: prepareReference(image, background) }));
}
