import { Box, Button, IconButton, MenuItem, Paper, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { useAppStore } from "@/core/store/appStore";
import { versionKeys } from "@data/versions";
import { AspectSelect } from "./AspectSelect";

function FieldLabel({ children }: { children: string }) {
	return (
		<Typography variant="eyebrow" sx={{ mb: 0.75 }}>
			{children}
		</Typography>
	);
}

/** Left-hand control card: version, From/To, min steps and the Find action. */
export function ConfigPanel() {
	const version = useAppStore((s) => s.version);
	const setVersion = useAppStore((s) => s.setVersion);
	const from = useAppStore((s) => s.from);
	const to = useAppStore((s) => s.to);
	const setFrom = useAppStore((s) => s.setFrom);
	const setTo = useAppStore((s) => s.setTo);
	const swap = useAppStore((s) => s.swap);
	const minSteps = useAppStore((s) => s.minSteps);
	const setMinSteps = useAppStore((s) => s.setMinSteps);
	const run = useAppStore((s) => s.run);
	const gtnh = useAppStore((s) => s.gtnh);
	const setGtnh = useAppStore((s) => s.setGtnh);

	return (
		<Paper
			variant="outlined"
			sx={(t) => ({
				p: 2.5,
				borderColor: t.palette.custom.line,
				borderRadius: `${Number(t.shape.borderRadius) * 1.5}px`,
				boxShadow: t.palette.custom.shadowSm,
			})}
		>
			<Stack spacing={2.25}>
				<Tooltip title="Thaumcraft 4.2.2.0 with every addon enabled" arrow placement="top">
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={(t) => ({
							px: 1.25,
							py: 0.75,
							borderRadius: `${t.shape.borderRadius}px`,
							border: `1px solid ${gtnh ? t.palette.custom.accent : t.palette.custom.line}`,
							backgroundColor: gtnh ? t.palette.custom.accentSoft : "transparent",
							transition: "border-color 120ms ease, background-color 120ms ease",
						})}
					>
						<Stack direction="row" spacing={1} alignItems="center">
							<AutoFixHighRoundedIcon sx={{ fontSize: 18, color: gtnh ? "accent.main" : "text.disabled" }} />
							<Box>
								<Typography sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.1 }}>GTNH 2.9</Typography>
								<Typography variant="eyebrow" sx={{ fontSize: 9.5 }}>
									Preset
								</Typography>
							</Box>
						</Stack>
						<Switch checked={gtnh} onChange={(e) => setGtnh(e.target.checked)} />
					</Stack>
				</Tooltip>

				<Box>
					<FieldLabel>Version</FieldLabel>
					<TextField select fullWidth size="small" value={version} onChange={(e) => setVersion(e.target.value)}>
						{versionKeys.map((key) => (
							<MenuItem key={key} value={key}>
								{key}
							</MenuItem>
						))}
					</TextField>
				</Box>

				<Box>
					<FieldLabel>From → To</FieldLabel>
					<Stack spacing={1}>
						<AspectSelect label="From" value={from} onChange={setFrom} />
						<Box sx={{ display: "flex", justifyContent: "center", my: -0.5 }}>
							<Tooltip title="Swap" arrow>
								<IconButton onClick={swap} size="small" sx={{ color: "accent.main" }}>
									<SwapVertRoundedIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Box>
						<AspectSelect label="To" value={to} onChange={setTo} />
					</Stack>
				</Box>

				<Box>
					<FieldLabel>Min. Steps</FieldLabel>
					<TextField
						type="number"
						fullWidth
						size="small"
						value={minSteps}
						onChange={(e) => setMinSteps(Number(e.target.value))}
						slotProps={{ htmlInput: { min: 1, max: 10 } }}
						helperText="Blank spaces between the two aspects on the research note."
					/>
				</Box>

				<Button variant="accent" size="large" startIcon={<TravelExploreRoundedIcon />} onClick={run}>
					Find Connection
				</Button>
			</Stack>
		</Paper>
	);
}
