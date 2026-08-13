import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LayersClearRoundedIcon from "@mui/icons-material/LayersClearRounded";
import { useAppStore } from "@/core/store/appStore";
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

			{results.map((result) => (
				<ResultPath key={`${result.from}->${result.to}`} result={result} />
			))}
		</Stack>
	);
}
