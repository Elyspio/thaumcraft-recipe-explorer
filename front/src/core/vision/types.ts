import type { AspectName } from "@data/types";

/** Decoded RGBA pixels, the common currency of the whole vision pipeline. */
export interface RgbaImage {
	width: number;
	height: number;
	/** Row-major RGBA, 4 bytes per pixel — the shape `CanvasRenderingContext2D.getImageData` returns. */
	data: Uint8ClampedArray;
}

export interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** A connected run of foreground pixels — a candidate icon before identification. */
export interface Region {
	box: Box;
	/** Foreground pixel count, used to drop specks. */
	pixels: number;
}

/** A reference icon, tight-cropped and resampled to the comparison size. */
export interface Reference {
	aspect: AspectName;
	image: RgbaImage;
}

/** A region matched against the reference set. */
export interface Match {
	aspect: AspectName;
	/** 0..1, where 1 is a pixel-perfect match. */
	score: number;
	box: Box;
	/** Runner-up score, useful for spotting near-ties during calibration. */
	runnerUp: { aspect: AspectName; score: number } | null;
}
