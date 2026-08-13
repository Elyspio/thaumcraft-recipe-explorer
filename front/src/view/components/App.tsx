import { Box, Divider, Stack } from "@mui/material";
import { Topbar } from "./Topbar";
import { ConfigPanel } from "./controls/ConfigPanel";
import { AddonAspectAccordion } from "./AddonAspectAccordion";
import { Results } from "./results/Results";

export default function App() {
	return (
		<Box sx={{ height: "100%", display: "grid", gridTemplateRows: "64px 1fr", overflow: "hidden" }}>
			<Topbar />
			<Box component="main" sx={{ overflowY: "auto" }}>
				<Box
					sx={{
						maxWidth: 1320,
						mx: "auto",
						p: { xs: 2, sm: 3 },
						display: "grid",
						gap: { xs: 2, md: 3 },
						gridTemplateColumns: { xs: "1fr", md: "320px minmax(0, 1fr)" },
						alignItems: "start",
					}}
				>
					<Box sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
						<ConfigPanel />
					</Box>

					<Stack spacing={3} sx={{ minWidth: 0 }}>
						<AddonAspectAccordion />
						<Divider />
						<Results />
					</Stack>
				</Box>
			</Box>
		</Box>
	);
}
