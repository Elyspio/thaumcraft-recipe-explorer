import { useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import ImageSearchRoundedIcon from "@mui/icons-material/ImageSearchRounded";
import { useNoteStore } from "@/core/store/noteStore";

/** Entry point for the screenshot flow: paste, drop, or browse. */
export function NoteDropZone() {
	const analyze = useNoteStore((s) => s.analyze);
	const input = useRef<HTMLInputElement>(null);
	const [over, setOver] = useState(false);

	return (
		<Box>
			<Box
				onClick={() => input.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setOver(true);
				}}
				onDragLeave={() => setOver(false)}
				onDrop={(e) => {
					e.preventDefault();
					setOver(false);
					const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
					if (file) void analyze(file);
				}}
				sx={(t) => ({
					px: 1.5,
					py: 1.75,
					cursor: "pointer",
					textAlign: "center",
					borderRadius: `${t.shape.borderRadius}px`,
					border: `1px dashed ${over ? t.palette.custom.accent : t.palette.custom.line}`,
					backgroundColor: over ? t.palette.custom.accentSoft : "transparent",
					transition: "border-color 120ms ease, background-color 120ms ease",
					"&:hover": { borderColor: t.palette.custom.accent },
				})}
			>
				<Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
					<ImageSearchRoundedIcon sx={{ fontSize: 18, color: "accent.main" }} />
					<Typography sx={{ fontSize: 13, fontWeight: 600 }}>Read a note screenshot</Typography>
				</Stack>
				<Typography variant="eyebrow" sx={{ fontSize: 9.5, mt: 0.5 }}>
					Paste, drop or click — cropped to the note
				</Typography>
			</Box>

			<input
				ref={input}
				type="file"
				accept="image/*"
				hidden
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) void analyze(file);
					e.target.value = "";
				}}
			/>
		</Box>
	);
}
