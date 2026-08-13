import { Box, Stack, Typography } from "@mui/material";
import { aspectLabel } from "@data/aspectMeta";
import type { AspectName } from "@data/types";
import { AspectIcon } from "./AspectIcon";

interface AspectGlyphProps {
	aspect: AspectName;
	size?: number;
	available?: boolean;
	/** Layout: icon above label ("column") or icon beside label ("row"). */
	direction?: "row" | "column";
	showKey?: boolean;
}

/** An aspect icon paired with its Latin name (and optionally the English key). */
export function AspectGlyph({ aspect, size = 34, available = true, direction = "column", showKey = false }: AspectGlyphProps) {
	return (
		<Stack direction={direction} spacing={direction === "column" ? 0.5 : 1} alignItems="center" sx={{ minWidth: 0 }}>
			<AspectIcon aspect={aspect} size={size} available={available} />
			<Box sx={{ textAlign: direction === "column" ? "center" : "left", minWidth: 0 }}>
				<Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.15, color: available ? "text.primary" : "text.disabled" }}>{aspectLabel(aspect)}</Typography>
				{showKey && (
					<Typography variant="eyebrow" sx={{ fontSize: 9.5 }}>
						{aspect}
					</Typography>
				)}
			</Box>
		</Stack>
	);
}
