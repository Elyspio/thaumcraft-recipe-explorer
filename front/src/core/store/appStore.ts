import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/config/theme";
import type { AspectName } from "@data/types";
import { buildVersionModel, type VersionModel } from "@data/model";
import { addonDictionary } from "@data/addons";
import { aspectLabel } from "@data/aspectMeta";
import { GTNH_VERSION, LATEST_VERSION } from "@data/versions";
import { buildGraph } from "@/core/pathfinding/graph";
import { find, summarizePath, type ResolvedPath } from "@/core/pathfinding/find";

interface FreshState {
	model: VersionModel;
	disabled: Set<AspectName>;
	from: AspectName;
	to: AspectName;
}

/**
 * Computes the initial state for a version. `enableAddons` keeps every addon
 * aspect available (used by the GTNH preset); otherwise addon aspects start
 * disabled, like the original tool.
 */
function freshForVersion(version: string, enableAddons = false): FreshState {
	const model = buildVersionModel(version);
	return {
		model,
		disabled: enableAddons ? new Set<AspectName>() : new Set<AspectName>(model.addonAspects),
		from: "air",
		to: "air",
	};
}

/** A path plus where it came from — `noteId` groups the searches of one screenshot. */
export interface StoredResult extends ResolvedPath {
	noteId?: string;
}

interface AppState {
	mode: ThemeMode;
	version: string;
	model: VersionModel;
	from: AspectName;
	to: AspectName;
	minSteps: number;
	/** Source of truth for availability — disabled aspects cost 100 in pathfinding. */
	disabled: Set<AspectName>;
	results: StoredResult[];
	error: string | null;
	/** "GTNH 2.9" preset active: version 4.2.2.0 with every addon enabled. */
	gtnh: boolean;
	/** Global Addons & Aspects panel visibility. */
	filtersOpen: boolean;

	toggleMode: () => void;
	toggleFilters: () => void;
	setGtnh: (on: boolean) => void;
	setVersion: (version: string) => void;
	setFrom: (aspect: AspectName) => void;
	setTo: (aspect: AspectName) => void;
	swap: () => void;
	setMinSteps: (value: number) => void;
	toggleAspect: (aspect: AspectName) => void;
	setAllAvailable: (available: boolean) => void;
	toggleAddon: (id: string) => void;
	isAddonEnabled: (id: string) => boolean;
	/** Marks aspects as available without disturbing the GTNH preset. */
	enableAspects: (aspects: readonly AspectName[]) => void;
	run: () => void;
	/** Runs one search without touching the manual From/To/Min. Steps selection. */
	runPair: (from: AspectName, to: AspectName, minSteps: number, noteId?: string) => boolean;
	removeResult: (from: AspectName, to: AspectName) => void;
	clearResults: () => void;
}

export const useAppStore = create<AppState>()(
	persist(
		(set, get) => ({
			mode: "dark",
			// GTNH 2.9 preset is on by default: version 4.2.2.0 + every addon enabled.
			version: GTNH_VERSION,
			minSteps: 1,
			results: [],
			error: null,
			gtnh: true,
			filtersOpen: false,
			...freshForVersion(GTNH_VERSION, true),

			toggleMode: () => set((s) => ({ mode: s.mode === "dark" ? "light" : "dark" })),
			toggleFilters: () => set((s) => ({ filtersOpen: !s.filtersOpen })),

			setGtnh: (on) =>
				set({
					gtnh: on,
					version: on ? GTNH_VERSION : LATEST_VERSION,
					results: [],
					error: null,
					...freshForVersion(on ? GTNH_VERSION : LATEST_VERSION, on),
				}),

			setVersion: (version) =>
				set({
					version,
					gtnh: false,
					results: [],
					error: null,
					...freshForVersion(version),
				}),

			setFrom: (from) => set({ from }),
			setTo: (to) => set({ to }),
			swap: () => set((s) => ({ from: s.to, to: s.from })),

			setMinSteps: (value) => set({ minSteps: Math.min(10, Math.max(1, Math.round(value || 1))) }),

			toggleAspect: (aspect) =>
				set((s) => {
					const disabled = new Set(s.disabled);
					if (disabled.has(aspect)) disabled.delete(aspect);
					else disabled.add(aspect);
					return { disabled, gtnh: false };
				}),

			setAllAvailable: (available) =>
				set((s) => ({
					disabled: available ? new Set<AspectName>() : new Set<AspectName>(s.model.aspects),
					gtnh: false,
				})),

			toggleAddon: (id) =>
				set((s) => {
					const aspects = addonDictionary[id]?.aspects ?? [];
					const enabled = aspects.every((a) => !s.disabled.has(a));
					const disabled = new Set(s.disabled);
					for (const a of aspects) {
						if (enabled) disabled.add(a);
						else disabled.delete(a);
					}
					return { disabled, gtnh: false };
				}),

			isAddonEnabled: (id) => {
				const { disabled } = get();
				const aspects = addonDictionary[id]?.aspects ?? [];
				return aspects.length > 0 && aspects.every((a) => !disabled.has(a));
			},

			enableAspects: (aspects) =>
				set((s) => {
					if (aspects.every((a) => !s.disabled.has(a))) return {};
					const disabled = new Set(s.disabled);
					for (const aspect of aspects) disabled.delete(aspect);
					// Deliberately no `gtnh: false` here, unlike `toggleAspect`: an
					// aspect printed on the note is proof it exists in the save, not a
					// deliberate departure from the preset.
					return { disabled };
				}),

			run: () => {
				const { from, to, minSteps, runPair } = get();
				runPair(from, to, minSteps);
			},

			runPair: (from, to, minSteps, noteId) => {
				const { model, disabled, results } = get();
				const graph = buildGraph(model.combinations);
				const path = find(graph, from, to, minSteps, disabled);
				if (!path) {
					set({ error: `No connection found from ${aspectLabel(from)} to ${aspectLabel(to)}. Try lowering Min. Steps or enabling more aspects.` });
					return false;
				}
				const resolved: StoredResult = { ...summarizePath(from, to, path), noteId };
				const others = results.filter((r) => !(r.from === from && r.to === to));
				set({ results: [resolved, ...others], error: null });
				return true;
			},

			removeResult: (from, to) => set((s) => ({ results: s.results.filter((r) => !(r.from === from && r.to === to)) })),

			clearResults: () => set({ results: [], error: null }),
		}),
		{
			name: "tcre-store",
			partialize: (s) => ({ mode: s.mode, version: s.version, minSteps: s.minSteps, gtnh: s.gtnh, filtersOpen: s.filtersOpen }),
			onRehydrateStorage: () => (state) => {
				if (!state) return;
				if (state.gtnh) Object.assign(state, freshForVersion(GTNH_VERSION, true), { version: GTNH_VERSION });
				else Object.assign(state, freshForVersion(state.version));
			},
		},
	),
);
