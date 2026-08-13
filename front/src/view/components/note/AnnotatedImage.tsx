import { Box, Typography } from "@mui/material";
import { aspectLabel } from "@data/aspectMeta";
import type { DetectedAspect } from "@/core/store/noteStore";

interface Props {
	imageUrl: string;
	imageWidth: number;
	imageHeight: number;
	aspects: DetectedAspect[];
	/** Index of the aspect waiting to be paired, if any. */
	pendingIndex: number | null;
	onPick: (index: number) => void;
}

/**
 * The screenshot with a frame drawn over every recognised icon. Boxes are
 * positioned in percentages of the natural size so they track the image at any
 * rendered width.
 */
export function AnnotatedImage({ imageUrl, imageWidth, imageHeight, aspects, pendingIndex, onPick }: Props) {
	return (
		<Box sx={{ position: "relative", lineHeight: 0, alignSelf: "flex-start", width: "100%" }}>
			<Box component="img" src={imageUrl} alt="Research note" draggable={false} sx={{ width: "100%", height: "auto", display: "block", borderRadius: 1 }} />

			{aspects.map((detected, index) => {
				const pending = index === pendingIndex;
				return (
					<Box
						key={`${detected.box.x}-${detected.box.y}`}
						onClick={() => onPick(index)}
						sx={(t) => ({
							position: "absolute",
							cursor: "pointer",
							left: `${(detected.box.x / imageWidth) * 100}%`,
							top: `${(detected.box.y / imageHeight) * 100}%`,
							width: `${(detected.box.width / imageWidth) * 100}%`,
							height: `${(detected.box.height / imageHeight) * 100}%`,
							border: `2px solid ${pending ? t.palette.custom.clay : t.palette.custom.accent}`,
							borderRadius: `${t.shape.borderRadius}px`,
							boxShadow: pending ? `0 0 0 3px ${t.palette.custom.claySoft}` : "none",
							transition: "border-color 120ms ease, box-shadow 120ms ease",
							"&:hover": { borderColor: t.palette.custom.clay },
						})}
					>
						<Typography
							variant="mono"
							sx={(t) => ({
								position: "absolute",
								top: "100%",
								left: "50%",
								transform: "translate(-50%, 4px)",
								whiteSpace: "nowrap",
								px: 0.75,
								py: 0.25,
								fontSize: 11,
								lineHeight: 1.4,
								borderRadius: `${t.shape.borderRadius}px`,
								backgroundColor: t.palette.custom.paper,
								border: `1px solid ${t.palette.custom.line}`,
								color: t.palette.custom.ink,
							})}
						>
							{aspectLabel(detected.aspect)}
						</Typography>
					</Box>
				);
			})}
		</Box>
	);
}
