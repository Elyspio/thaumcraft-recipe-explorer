import type { RgbaImage } from "./types";

/**
 * The pipeline's only DOM boundary alongside `references.ts`: everything
 * downstream works on plain `RgbaImage` values.
 */
export function fromBitmap(bitmap: ImageBitmap): RgbaImage {
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) throw new Error("2D canvas context unavailable");

	ctx.drawImage(bitmap, 0, 0);
	const { data, width, height } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
	return { width, height, data };
}

/** Decodes any image blob — a pasted screenshot, a dropped file, a fetched icon. */
export async function decodeImage(source: Blob): Promise<RgbaImage> {
	const bitmap = await createImageBitmap(source);
	try {
		return fromBitmap(bitmap);
	} finally {
		bitmap.close();
	}
}

/** Extracts the first image in a clipboard payload, or null when there is none. */
export function imageFromClipboard(items: DataTransferItemList | null): File | null {
	if (!items) return null;
	for (const item of items) {
		if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
		const file = item.getAsFile();
		if (file) return file;
	}
	return null;
}
