import { Box, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import type { AspectName } from "@data/types";
import { useNoteStore, type NotePair } from "@/core/store/noteStore";
import { AspectSelect } from "../controls/AspectSelect";

/**
 * The searches to run, built by hand from the recognised aspects. Detection
 * never guesses which anchors belong together — the note's hexagon geometry is
 * out of scope, so both the pairing and the gap count come from the player.
 */
export function PairComposer({ pairs }: { pairs: NotePair[] }) {
	const removePair = useNoteStore((s) => s.removePair);
	const swapPair = useNoteStore((s) => s.swapPair);
	const setPairSteps = useNoteStore((s) => s.setPairSteps);
	const setPairAspect = useNoteStore((s) => s.setPairAspect);

	if (pairs.length === 0) {
		return (
			<Paper variant="outlined" sx={(t) => ({ p: 2.5, borderStyle: "dashed", borderColor: t.palette.custom.line, textAlign: "center" })}>
				<Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>Click two aspects on the note to link them.</Typography>
			</Paper>
		);
	}

	return (
		<Stack spacing={1.25}>
			{pairs.map((pair) => (
				<Paper
					key={pair.id}
					variant="outlined"
					sx={(t) => ({ p: 1.5, borderColor: t.palette.custom.line, borderRadius: `${Number(t.shape.borderRadius) * 1.5}px` })}
				>
					<Stack direction="row" spacing={1} alignItems="center">
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<AspectSelect label="From" value={pair.from} onChange={(a: AspectName) => setPairAspect(pair.id, "from", a)} />
						</Box>

						<Tooltip title="Reverse" arrow>
							<IconButton onClick={() => swapPair(pair.id)} size="small" sx={{ color: "accent.main" }}>
								<SwapHorizRoundedIcon fontSize="small" />
							</IconButton>
						</Tooltip>

						<Box sx={{ flex: 1, minWidth: 0 }}>
							<AspectSelect label="To" value={pair.to} onChange={(a: AspectName) => setPairAspect(pair.id, "to", a)} />
						</Box>

						<TextField
							type="number"
							label="Steps"
							size="small"
							value={pair.minSteps}
							onChange={(e) => setPairSteps(pair.id, Number(e.target.value))}
							slotProps={{ htmlInput: { min: 1, max: 10 } }}
							sx={{ width: 92, flexShrink: 0 }}
						/>

						<Tooltip title="Remove" arrow>
							<IconButton onClick={() => removePair(pair.id)} size="small">
								<DeleteOutlineRoundedIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				</Paper>
			))}
		</Stack>
	);
}
