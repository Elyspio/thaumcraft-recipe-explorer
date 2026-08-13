import { Box, Chip, Divider, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import { useAppStore } from "@/core/store/appStore";
import { aspectLabel } from "@data/aspectMeta";
import type { ResolvedPath } from "@/core/pathfinding/find";
import { AspectGlyph } from "../ui/AspectGlyph";
import { AspectIcon } from "../ui/AspectIcon";
import { CombinationTooltip } from "../ui/CombinationTooltip";

export function ResultPath({ result }: { result: ResolvedPath }) {
	const removeResult = useAppStore((s) => s.removeResult);
	const invertResult = useAppStore((s) => s.invertResult);

	return (
		<Paper
			variant="outlined"
			sx={(t) => ({
				p: 2,
				borderColor: t.palette.custom.line,
				borderRadius: `${Number(t.shape.borderRadius) * 1.5}px`,
				boxShadow: t.palette.custom.shadowSm,
				animation: "tcre-rise 220ms ease both",
			})}
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
				<Stack direction="row" spacing={1} alignItems="center">
					<Typography sx={{ fontWeight: 600 }}>{aspectLabel(result.from)}</Typography>
					<ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "accent.main" }} />
					<Typography sx={{ fontWeight: 600 }}>{aspectLabel(result.to)}</Typography>
					<Chip label={`${result.totalSteps} step${result.totalSteps === 1 ? "" : "s"}`} size="small" />
					<Tooltip title="Reverse" arrow>
						<IconButton
							size="small"
							aria-label="Reverse"
							onClick={() => invertResult(result.from, result.to)}
							sx={{ color: "accent.main" }}
						>
							<SwapHorizRoundedIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
				<Tooltip title="Close" arrow>
					<IconButton size="small" onClick={() => removeResult(result.from, result.to)} sx={{ color: "text.secondary" }}>
						<CloseRoundedIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			</Stack>

			<Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75 }}>
				{result.path.map((aspect, i) => (
					<Stack key={`${aspect}-${i}`} direction="row" alignItems="center" spacing={0.75}>
						<Tooltip arrow placement="top" enterDelay={350} title={<CombinationTooltip aspect={aspect} />}>
							<Box
								tabIndex={0}
								aria-label={`${aspectLabel(aspect)} recipe`}
								sx={(t) => ({
									p: 0.75,
									borderRadius: `${t.shape.borderRadius}px`,
									border: `1px solid ${i === 0 || i === result.path.length - 1 ? t.palette.custom.accent : t.palette.custom.line}`,
									backgroundColor: i === 0 || i === result.path.length - 1 ? t.palette.custom.accentSoft : t.palette.custom.paper2,
									outline: "none",
									"&:focus-visible": {
										outline: `2px solid ${t.palette.custom.accent}`,
										outlineOffset: 2,
									},
								})}
							>
								<AspectGlyph aspect={aspect} size={30} />
							</Box>
						</Tooltip>
						{i < result.path.length - 1 && <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
					</Stack>
				))}
			</Box>

			{result.usage.length > 0 && (
				<>
					<Divider sx={{ my: 1.5 }} />
					<Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
						<Typography variant="eyebrow" sx={{ mr: 0.5 }}>
							Aspects used
						</Typography>
						{result.usage.map((u) => (
							<Tooltip key={u.aspect} title={`${aspectLabel(u.aspect)} ×${u.count}`} arrow>
								<Stack
									direction="row"
									spacing={0.5}
									alignItems="center"
									sx={(t) => ({
										pl: 0.5,
										pr: 0.9,
										py: 0.25,
										borderRadius: 999,
										border: `1px solid ${t.palette.custom.line}`,
										backgroundColor: t.palette.custom.paper2,
									})}
								>
									<AspectIcon aspect={u.aspect} size={18} />
									<Typography variant="mono" sx={{ fontSize: 12, fontWeight: 600 }}>
										{u.count}
									</Typography>
								</Stack>
							</Tooltip>
						))}
					</Stack>
				</>
			)}
		</Paper>
	);
}
