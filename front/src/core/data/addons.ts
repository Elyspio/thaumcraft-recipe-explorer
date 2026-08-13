import type { AddonInfo } from "./types";

/**
 * Port of the original `addon_dictionary.js`.
 * Each addon contributes extra aspects + combinations. As in the original tool,
 * addon aspects are always present in the graph but start *disabled* until the
 * addon is enabled.
 */
export const addonDictionary: Record<string, AddonInfo> = {
	fm: {
		name: "Forbidden Magic",
		aspects: ["wrath", "nether", "gluttony", "envy", "sloth", "pride", "lust"],
		combinations: {
			wrath: ["weapon", "fire"],
			nether: ["fire", "magic"],
			gluttony: ["hunger", "void"],
			envy: ["senses", "hunger"],
			sloth: ["trap", "soul"],
			pride: ["flight", "void"],
			lust: ["flesh", "hunger"],
		},
	},
	mb: {
		name: "Magic Bees",
		aspects: ["time"],
		combinations: {
			time: ["void", "order"],
		},
	},
	gt: {
		name: "Gregtech",
		aspects: ["electricity", "magnetism", "cheatiness", "radioactivity", "stupidity"],
		combinations: {
			electricity: ["energy", "mechanism"],
			magnetism: ["metal", "travel"],
			cheatiness: ["mine", "greed"],
			radioactivity: ["light", "energy"],
			stupidity: ["entropy", "mind"],
		},
	},
	av: {
		name: "Avaritia",
		aspects: ["apocalypse"],
		combinations: {
			apocalypse: ["greed", "eldritch"],
		},
	},
	tb: {
		name: "Thaumic Boots",
		aspects: ["space", "boots"],
		combinations: {
			space: ["crystal", "metal"],
			boots: ["armor", "travel"],
		},
	},
	gtnh: {
		name: "GTNH (2.1.3.0+)",
		aspects: ["equality", "madness", "beginning", "constellation", "glory"],
		combinations: {
			equality: ["mind", "order"],
			madness: ["mind", "taint"],
			beginning: ["void", "motion"],
			constellation: ["light", "beginning"],
			glory: ["man", "travel"],
		},
	},
};

export const addonKeys = Object.keys(addonDictionary);

/** Flat list of every aspect contributed by any addon. */
export const allAddonAspects = addonKeys.flatMap((key) => addonDictionary[key].aspects);
