import { create } from "zustand";
import type { AspectName } from "@data/types";
import { decodeImage } from "@/core/vision/decode";
import { detect } from "@/core/vision/detect";
import { loadReferenceIcons } from "@/core/vision/references";
import type { Box } from "@/core/vision/types";

export interface DetectedAspect {
	aspect: AspectName;
	/** Match confidence, 0..1. Zero once the user has picked the aspect by hand. */
	score: number;
	box: Box;
	/** Best alternative the matcher considered — shown when confidence is thin. */
	runnerUp: string | null;
	manual: boolean;
}

export interface NotePair {
	id: string;
	from: AspectName;
	to: AspectName;
	minSteps: number;
}

type Status = "idle" | "working" | "ready" | "error";

/**
 * Everything about the screenshot currently under review. Deliberately separate
 * from `appStore` and deliberately not persisted: a note is one-shot, and
 * closing the dialog ends it.
 */
interface NoteState {
	open: boolean;
	status: Status;
	error: string | null;
	noteId: string;
	imageUrl: string | null;
	imageWidth: number;
	imageHeight: number;
	aspects: DetectedAspect[];
	/** Regions that segmented but matched nothing convincing. */
	ignored: DetectedAspect[];
	pairs: NotePair[];

	analyze: (file: Blob) => Promise<void>;
	close: () => void;
	setAspect: (index: number, aspect: AspectName) => void;
	removeAspect: (index: number) => void;
	promoteIgnored: (index: number, aspect: AspectName) => void;
	addPair: (from: AspectName, to: AspectName, minSteps: number) => void;
	removePair: (id: string) => void;
	swapPair: (id: string) => void;
	setPairSteps: (id: string, minSteps: number) => void;
	setPairAspect: (id: string, end: "from" | "to", aspect: AspectName) => void;
}

const blank = {
	status: "idle" as Status,
	error: null,
	imageUrl: null,
	imageWidth: 0,
	imageHeight: 0,
	aspects: [] as DetectedAspect[],
	ignored: [] as DetectedAspect[],
	pairs: [] as NotePair[],
};

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${++sequence}`;

export const useNoteStore = create<NoteState>()((set, get) => ({
	open: false,
	noteId: "",
	...blank,

	analyze: async (file) => {
		URL.revokeObjectURL(get().imageUrl ?? "");
		set({ open: true, status: "working", error: null, imageUrl: URL.createObjectURL(file), aspects: [], ignored: [], pairs: [], noteId: nextId("note") });

		try {
			const [image, icons] = await Promise.all([decodeImage(file), loadReferenceIcons()]);
			const result = detect(image, icons);

			set({
				status: "ready",
				imageWidth: image.width,
				imageHeight: image.height,
				aspects: result.aspects.map((m) => ({ aspect: m.aspect, score: m.score, box: m.box, runnerUp: m.runnerUp?.aspect ?? null, manual: false })),
				ignored: result.rejected.map((m) => ({ aspect: m.aspect, score: m.score, box: m.box, runnerUp: m.runnerUp?.aspect ?? null, manual: false })),
			});
		} catch (cause) {
			set({ status: "error", error: cause instanceof Error ? cause.message : "Could not read that image." });
		}
	},

	close: () => {
		URL.revokeObjectURL(get().imageUrl ?? "");
		set({ open: false, ...blank });
	},

	setAspect: (index, aspect) =>
		set((s) => ({
			aspects: s.aspects.map((a, i) => (i === index ? { ...a, aspect, score: 1, manual: true, runnerUp: null } : a)),
		})),

	removeAspect: (index) => set((s) => ({ aspects: s.aspects.filter((_, i) => i !== index) })),

	promoteIgnored: (index, aspect) =>
		set((s) => {
			const promoted = s.ignored[index];
			if (!promoted) return {};
			return {
				ignored: s.ignored.filter((_, i) => i !== index),
				aspects: [...s.aspects, { ...promoted, aspect, score: 1, manual: true, runnerUp: null }],
			};
		}),

	addPair: (from, to, minSteps) => set((s) => ({ pairs: [...s.pairs, { id: nextId("pair"), from, to, minSteps }] })),

	removePair: (id) => set((s) => ({ pairs: s.pairs.filter((p) => p.id !== id) })),

	swapPair: (id) => set((s) => ({ pairs: s.pairs.map((p) => (p.id === id ? { ...p, from: p.to, to: p.from } : p)) })),

	setPairSteps: (id, minSteps) =>
		set((s) => ({
			pairs: s.pairs.map((p) => (p.id === id ? { ...p, minSteps: Math.min(10, Math.max(1, Math.round(minSteps || 1))) } : p)),
		})),

	setPairAspect: (id, end, aspect) => set((s) => ({ pairs: s.pairs.map((p) => (p.id === id ? { ...p, [end]: aspect } : p)) })),
}));
