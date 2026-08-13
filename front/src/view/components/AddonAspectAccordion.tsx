import { Box, ButtonBase, Collapse, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { useAppStore } from "@/core/store/appStore";
import { AddonList } from "./addons/AddonList";
import { AspectGrid } from "./aspects/AspectGrid";

const panelId = "addon-aspect-panel";

/** Compact, persisted disclosure for the addon and available-aspect filters. */
export function AddonAspectAccordion() {
	const open = useAppStore((s) => s.filtersOpen);
	const toggleFilters = useAppStore((s) => s.toggleFilters);

	return (
		<Box>
			<ButtonBase
				component="button"
				onClick={toggleFilters}
				aria-expanded={open}
				aria-controls={panelId}
				sx={(t) => ({
					width: "100%",
					justifyContent: "space-between",
					alignItems: "center",
					px: 0.5,
					py: 1,
					borderBottom: `1px solid ${t.palette.custom.line}`,
					color: t.palette.text.primary,
					textAlign: "left",
					"&:hover": { color: t.palette.custom.accent },
				})}
			>
				<Typography variant="h3">Addons &amp; Aspects</Typography>
				<ExpandMoreRoundedIcon
					aria-hidden
					sx={{
						color: "text.secondary",
						transform: open ? "rotate(180deg)" : "none",
						transition: "transform 160ms ease",
					}}
				/>
			</ButtonBase>

			<Collapse in={open} timeout="auto" unmountOnExit>
				<Box id={panelId} sx={{ pt: { xs: 2, md: 2.5 } }}>
					<Stack spacing={3}>
						<AddonList />
						<AspectGrid />
					</Stack>
				</Box>
			</Collapse>
		</Box>
	);
}
