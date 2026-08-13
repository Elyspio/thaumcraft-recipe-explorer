import { Box, Stack, Typography } from "@mui/material";
import { useAppStore } from "@/core/store/appStore";
import type { AspectName } from "@data/types";
import { AspectGlyph } from "./AspectGlyph";

function Operator({ children }: { children: string }) {
	return (
		<Typography component="span" sx={{ fontSize: 20, fontWeight: 500, color: "accent.main", px: 0.25, lineHeight: 1 }}>
			{children}
		</Typography>
	);
}

/** Tooltip body showing how an aspect is combined: `left + right = aspect`. */
export function CombinationTooltip({ aspect }: { aspect: AspectName }) {
	const combo = useAppStore((s) => s.model.combinations[aspect]);

	return (
		<Box sx={{ p: 1.25 }}>
			{combo ? (
				<Stack direction="row" alignItems="center" spacing={0.75}>
					<AspectGlyph aspect={combo[0]} size={30} showKey />
					<Operator>+</Operator>
					<AspectGlyph aspect={combo[1]} size={30} showKey />
					<Operator>=</Operator>
					<AspectGlyph aspect={aspect} size={30} showKey />
				</Stack>
			) : (
				<Stack alignItems="center" spacing={0.5}>
					<AspectGlyph aspect={aspect} size={32} showKey />
					<Typography variant="eyebrow">Primordial aspect</Typography>
				</Stack>
			)}
		</Box>
	);
}
