export type AspectName = string;

/** A combination maps a compound aspect to its two parent aspects. */
export type Combination = [AspectName, AspectName];

export type Combinations = Record<AspectName, Combination>;

export interface VersionData {
	base_aspects: AspectName[];
	combinations: Combinations;
}

export interface AddonInfo {
	name: string;
	aspects: AspectName[];
	combinations: Combinations;
}
