import { versionDictionary } from "./versions";
import { addonDictionary, addonKeys } from "./addons";
import { compareAspects } from "./aspectMeta";
import type { AspectName, Combinations } from "./types";

export interface VersionModel {
	/** Ordered aspect list for the grid and selects: base, then version combos (sorted), then addon aspects (sorted). */
	aspects: AspectName[];
	/** Version combinations merged with every addon's combinations. */
	combinations: Combinations;
	/** Aspects contributed by addons (disabled by default, like the original). */
	addonAspects: Set<AspectName>;
}

/**
 * Builds the working model for a given version. Mirrors `reset_aspects()` +
 * `push_addons()` from the original: addon aspects and combinations are always
 * folded in (they merely start disabled until their addon is enabled).
 */
export function buildVersionModel(version: string): VersionModel {
	const data = versionDictionary[version];
	const base = [...data.base_aspects];
	const tier = Object.keys(data.combinations).sort(compareAspects);

	const combinations: Combinations = { ...data.combinations };
	const addonAspects: AspectName[] = [];
	for (const key of addonKeys) {
		const addon = addonDictionary[key];
		addonAspects.push(...addon.aspects);
		Object.assign(combinations, addon.combinations);
	}
	addonAspects.sort(compareAspects);

	return {
		aspects: [...base, ...tier, ...addonAspects],
		combinations,
		addonAspects: new Set(addonAspects),
	};
}
