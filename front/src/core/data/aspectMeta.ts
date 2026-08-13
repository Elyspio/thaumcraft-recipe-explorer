import type { AspectName } from "./types";

/**
 * Port of the original `translation_dictionary.js`: maps each internal aspect
 * key (English) to its canonical Thaumcraft Latin name. The Latin name doubles
 * as the icon filename (`aspects/{color,mono}/<latin>.png`) and the primary
 * display label, while the English key is shown as the secondary description.
 */
export const translate: Record<AspectName, string> = {
	air: "aer",
	earth: "terra",
	fire: "ignis",
	water: "aqua",
	order: "ordo",
	entropy: "perditio",
	void: "vacuos",
	light: "lux",
	energy: "potentia",
	motion: "motus",
	stone: "saxum",
	life: "victus",
	weather: "tempestas",
	cold: "gelum",
	crystal: "vitreus",
	death: "mortuus",
	flight: "volatus",
	darkness: "tenebrae",
	soul: "spiritus",
	heal: "sano",
	travel: "iter",
	poison: "venenum",
	eldritch: "alienis",
	magic: "praecantatio",
	aura: "auram",
	taint: "vitium",
	seed: "granum",
	slime: "limus",
	plant: "herba",
	tree: "arbor",
	beast: "bestia",
	flesh: "corpus",
	undead: "exanimis",
	mind: "cognitio",
	senses: "sensus",
	man: "humanus",
	crop: "messis",
	harvest: "meto",
	metal: "metallum",
	mine: "perfodio",
	tool: "instrumentum",
	weapon: "telum",
	aversion: "aversio",
	armor: "tutamen",
	protect: "praemundio",
	hunger: "fames",
	greed: "lucrum",
	desire: "desiderium",
	craft: "fabrico",
	cloth: "pannus",
	mechanism: "machina",
	trap: "vinculum",
	exchange: "permutatio",
	wrath: "ira",
	nether: "infernus",
	gluttony: "gula",
	envy: "invidia",
	sloth: "desidia",
	pride: "superbia",
	lust: "luxuria",
	time: "tempus",
	electricity: "electrum",
	magnetism: "magneto",
	cheatiness: "nebrisum",
	radioactivity: "radio",
	stupidity: "stronito",
	apocalypse: "terminus",
	equality: "aequalitas",
	madness: "vesania",
	beginning: "primordium",
	constellation: "astrum",
	glory: "gloria",
	space: "caelum",
	boots: "tabernus",
};

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Latin display name, e.g. `air` → `Aer`. */
export function aspectLabel(aspect: AspectName): string {
	return capitalize(translate[aspect] ?? aspect);
}

/** Icon path for an aspect. `variant` toggles colour vs greyed-out (unavailable). */
export function aspectIcon(aspect: AspectName, variant: "color" | "mono" = "color"): string {
	return `/aspects/${variant}/${translate[aspect] ?? aspect}.png`;
}

/** Sort comparator matching the original (alphabetical on the Latin name). */
export function compareAspects(a: AspectName, b: AspectName): number {
	const ta = translate[a] ?? a;
	const tb = translate[b] ?? b;
	return ta === tb ? 0 : ta < tb ? -1 : 1;
}
