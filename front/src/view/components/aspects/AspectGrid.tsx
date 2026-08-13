import { Box, Button, ButtonBase, Stack, Tooltip, Typography } from "@mui/material";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import RemoveDoneRoundedIcon from "@mui/icons-material/RemoveDoneRounded";
import { useAppStore } from "@/core/store/appStore";
import { aspectLabel } from "@data/aspectMeta";
import type { AspectName } from "@data/types";
import { AspectIcon } from "../ui/AspectIcon";
import { CombinationTooltip } from "../ui/CombinationTooltip";

function AspectTile({ aspect }: { aspect: AspectName }) {
	const available = useAppStore((s) => !s.disabled.has(aspect));
	const toggleAspect = useAppStore((s) => s.toggleAspect);

	return (
		<Tooltip arrow placement="top" enterDelay={350} title={<CombinationTooltip aspect={aspect} />}>
			<ButtonBase
				onClick={() => toggleAspect(aspect)}
				focusRipple
				sx={(t) => ({
					width: 78,
					px: 0.5,
					py: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 0.5,
					borderRadius: `${t.shape.borderRadius}px`,
					border: `1px solid ${available ? t.palette.custom.line : "transparent"}`,
					backgroundColor: available ? t.palette.custom.paper : "transparent",
					transition: "border-color 120ms ease, background-color 120ms ease, transform 60ms ease",
					"&:hover": {
						borderColor: t.palette.custom.accent,
						backgroundColor: available ? t.palette.custom.paper : t.palette.custom.lineSoft,
					},
					"&:active": { transform: "translateY(1px)" },
				})}
			>
				<AspectIcon aspect={aspect} size={36} available={available} />
				<Typography
					sx={{
						fontSize: 11.5,
						fontWeight: 600,
						lineHeight: 1.1,
						textAlign: "center",
						color: available ? "text.primary" : "text.disabled",
					}}
				>
					{aspectLabel(aspect)}
				</Typography>
			</ButtonBase>
		</Tooltip>
	);
}

/** The selectable aspect palette (replaces `#avail`) with Select/Deselect all. */
export function AspectGrid() {
	const aspects = useAppStore((s) => s.model.aspects);
	const availableCount = useAppStore((s) => s.model.aspects.length - s.disabled.size);
	const setAllAvailable = useAppStore((s) => s.setAllAvailable);

	return (
		<Stack spacing={1.5}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
				<Stack direction="row" spacing={1} alignItems="baseline">
					<Typography variant="h3">Available Aspects</Typography>
					<Typography variant="eyebrow">
						{availableCount} / {aspects.length}
					</Typography>
				</Stack>
				<Stack direction="row" spacing={1}>
					<Button variant="soft" size="small" startIcon={<DoneAllRoundedIcon />} onClick={() => setAllAvailable(true)}>
						Select all
					</Button>
					<Button variant="soft" size="small" startIcon={<RemoveDoneRoundedIcon />} onClick={() => setAllAvailable(false)}>
						Deselect all
					</Button>
				</Stack>
			</Stack>

			<Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
				Click an aspect to disable it — the search will then avoid it where possible.
			</Typography>

			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
				{aspects.map((aspect) => (
					<AspectTile key={aspect} aspect={aspect} />
				))}
			</Box>
		</Stack>
	);
}
