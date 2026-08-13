import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useAppStore } from "@/core/store/appStore";
import { addonDictionary, addonKeys } from "@data/addons";

function AddonToggle({ id }: { id: string }) {
	const enabled = useAppStore((s) => addonDictionary[id].aspects.every((a) => !s.disabled.has(a)));
	const toggleAddon = useAppStore((s) => s.toggleAddon);

	return (
		<FormControlLabel
			control={<Checkbox size="small" checked={enabled} onChange={() => toggleAddon(id)} sx={{ py: 0.25 }} />}
			label={<Typography sx={{ fontSize: 13.5 }}>{addonDictionary[id].name}</Typography>}
			sx={(t) => ({
				m: 0,
				pl: 0.5,
				pr: 1.25,
				borderRadius: `${t.shape.borderRadius}px`,
				border: `1px solid ${enabled ? t.palette.custom.accent : t.palette.custom.line}`,
				backgroundColor: enabled ? t.palette.custom.accentSoft : "transparent",
				transition: "border-color 120ms ease, background-color 120ms ease",
			})}
		/>
	);
}

/** Addon checkboxes — toggling one enables/disables that addon's whole aspect group. */
export function AddonList() {
	return (
		<Box>
			<Typography variant="eyebrow" sx={{ mb: 1 }}>
				Addons
			</Typography>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{addonKeys.map((id) => (
					<AddonToggle key={id} id={id} />
				))}
			</Stack>
		</Box>
	);
}
