import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useAppStore } from "@/core/store/appStore";
import { aspectIcon } from "@data/aspectMeta";
import { appVersion } from "@/config/runtime";

export function Topbar() {
	const mode = useAppStore((s) => s.mode);
	const toggleMode = useAppStore((s) => s.toggleMode);

	return (
		<Box
			component="header"
			sx={(t) => ({
				height: 64,
				px: { xs: 2, sm: 3 },
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				borderBottom: `1px solid ${t.palette.custom.line}`,
				backgroundColor: t.palette.custom.paper,
				backdropFilter: "blur(8px)",
			})}
		>
			<Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }} title={`Version ${appVersion}`}>
				<Box
					component="img"
					src={aspectIcon("magic")}
					alt=""
					sx={(t) => ({
						width: 34,
						height: 34,
						filter: `drop-shadow(0 0 10px ${t.palette.custom.accentSoft})`,
					})}
				/>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="h5" sx={{ lineHeight: 1.1 }} noWrap>
						Thaumcraft Recipe Explorer
					</Typography>
					<Typography variant="eyebrow" sx={{ display: { xs: "none", sm: "block" } }}>
						Aspect pathfinder · TC 4.x–5.x
					</Typography>
				</Box>
			</Stack>

			<Stack direction="row" spacing={0.5} alignItems="center">
				<Tooltip title="Source on GitHub" arrow>
					<IconButton component="a" href="https://github.com/Elyspio/thaumcraft-recipe-explorer" target="_blank" rel="noreferrer" size="small" sx={{ color: "text.secondary" }}>
						<GitHubIcon fontSize="small" />
					</IconButton>
				</Tooltip>
				<Tooltip title={mode === "dark" ? "Switch to light" : "Switch to dark"} arrow>
					<IconButton onClick={toggleMode} size="small" sx={{ color: "text.secondary" }}>
						{mode === "dark" ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
					</IconButton>
				</Tooltip>
			</Stack>
		</Box>
	);
}
