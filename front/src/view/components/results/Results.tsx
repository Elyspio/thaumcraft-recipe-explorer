import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ImageSearchRoundedIcon from "@mui/icons-material/ImageSearchRounded";
import LayersClearRoundedIcon from "@mui/icons-material/LayersClearRounded";
import { useAppStore, type StoredResult } from "@/core/store/appStore";
import { ResultPath } from "./ResultPath";

export function Results() {
	const results = useAppStore((s) => s.results);
	const error = useAppStore((s) => s.error);
	const clearResults = useAppStore((s) => s.clearResults);

	const isEmpty = results.length === 0 && !error;

	return (
		<Stack spacing={1.5}>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Stack direction="row" spacing={1} alignItems="baseline">
					<Typography variant="h3">Results</Typography>
					{results.length > 0 && <Typography variant="eyebrow">{results.length}</Typography>}
				</Stack>
				{results.length > 0 && (
					<Button variant="soft" size="small" startIcon={<LayersClearRoundedIcon />} onClick={clearResults}>
						Clear all
					</Button>
				)}
			</Stack>

			{error && (
				<Alert severity="warning" variant="outlined">
					{error}
				</Alert>
			)}

			{isEmpty && (
				<Box
					sx={(t) => ({
						p: 4,
						textAlign: "center",
						borderRadius: `${Number(t.shape.borderRadius) * 1.5}px`,
						border: `1px dashed ${t.palette.custom.line}`,
						color: "text.secondary",
					})}
				>
					<AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: "accent.main", mb: 1, opacity: 0.8 }} />
					<Typography sx={{ fontWeight: 600, color: "text.primary" }}>No connections yet</Typography>
					<Typography variant="body2" sx={{ mt: 0.5 }}>
						Pick a From and To aspect, then hit Find Connection.
					</Typography>
				</Box>
			)}

			{groupByNote(results).map((group) => {
				const body = group.results.map((result) => <ResultPath key={`${result.from}->${result.to}`} result={result} />);
				if (!group.noteId) return body;

				return (
					<Box
						key={group.noteId}
						sx={(t) => ({
							pl: 1.5,
							borderLeft: `2px solid ${t.palette.custom.accent}`,
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
						})}
					>
						<Stack direction="row" spacing={0.75} alignItems="center">
							<ImageSearchRoundedIcon sx={{ fontSize: 15, color: "accent.main" }} />
							<Typography variant="eyebrow">
								From one note · {group.results.length} search{group.results.length === 1 ? "" : "es"}
							</Typography>
						</Stack>
						{body}
					</Box>
				);
			})}
		</Stack>
	);
}

/** Keeps searches read from the same screenshot visually together. */
function groupByNote(results: StoredResult[]): { noteId?: string; results: StoredResult[] }[] {
	const groups: { noteId?: string; results: StoredResult[] }[] = [];

	for (const result of results) {
		const last = groups.at(-1);
		if (last && last.noteId === result.noteId) last.results.push(result);
		else groups.push({ noteId: result.noteId, results: [result] });
	}

	return groups;
}
