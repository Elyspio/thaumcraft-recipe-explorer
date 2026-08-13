import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { aspectIcon, aspectLabel } from "@data/aspectMeta";
import type { AspectName } from "@data/types";

interface AspectIconProps {
	aspect: AspectName;
	size?: number;
	available?: boolean;
	sx?: SxProps<Theme>;
}

/** Renders an aspect's Thaumcraft icon, greyed out (mono) when unavailable. */
export function AspectIcon({ aspect, size = 32, available = true, sx }: AspectIconProps) {
	return (
		<Box
			component="img"
			src={aspectIcon(aspect, available ? "color" : "mono")}
			alt={aspectLabel(aspect)}
			draggable={false}
			sx={[
				{
					width: size,
					height: size,
					objectFit: "contain",
					display: "block",
					userSelect: "none",
					opacity: available ? 1 : 0.5,
					transition: "opacity 120ms ease, filter 120ms ease",
				},
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		/>
	);
}
