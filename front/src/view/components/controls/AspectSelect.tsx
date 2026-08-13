import { useMemo } from "react";
import { Autocomplete, Box, InputAdornment, TextField, Typography } from "@mui/material";
import { useAppStore } from "@/core/store/appStore";
import { aspectLabel, compareAspects } from "@data/aspectMeta";
import type { AspectName } from "@data/types";
import { AspectIcon } from "../ui/AspectIcon";

interface AspectSelectProps {
	label: string;
	value: AspectName;
	onChange: (aspect: AspectName) => void;
}

/** MUI Autocomplete replacing the original select2 dropdown (icon + Latin + English search). */
export function AspectSelect({ label, value, onChange }: AspectSelectProps) {
	const aspects = useAppStore((s) => s.model.aspects);
	const options = useMemo(() => [...aspects].sort(compareAspects), [aspects]);

	return (
		<Autocomplete
			options={options}
			value={value}
			onChange={(_, next) => next && onChange(next)}
			disableClearable
			fullWidth
			size="small"
			getOptionLabel={(aspect) => aspectLabel(aspect)}
			isOptionEqualToValue={(a, b) => a === b}
			filterOptions={(opts, state) => {
				const q = state.inputValue.trim().toLowerCase();
				if (!q) return opts;
				return opts.filter((a) => aspectLabel(a).toLowerCase().includes(q) || a.toLowerCase().includes(q));
			}}
			renderOption={(props, aspect) => {
				const { key, ...rest } = props;
				return (
					<Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1.25, alignItems: "center", py: 0.75 }}>
						<AspectIcon aspect={aspect} size={26} />
						<Box sx={{ minWidth: 0 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{aspectLabel(aspect)}</Typography>
							<Typography variant="eyebrow" sx={{ fontSize: 10 }}>
								{aspect}
							</Typography>
						</Box>
					</Box>
				);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					slotProps={{
						input: {
							...params.InputProps,
							startAdornment: (
								<InputAdornment position="start">
									<AspectIcon aspect={value} size={22} />
								</InputAdornment>
							),
						},
					}}
				/>
			)}
		/>
	);
}
