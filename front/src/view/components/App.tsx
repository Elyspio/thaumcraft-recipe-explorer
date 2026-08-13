import { useEffect } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { imageFromClipboard } from "@/core/vision/decode";
import { useNoteStore } from "@/core/store/noteStore";
import { Topbar } from "./Topbar";
import { ConfigPanel } from "./controls/ConfigPanel";
import { AddonAspectAccordion } from "./AddonAspectAccordion";
import { NoteReviewDialog } from "./note/NoteReviewDialog";
import { Results } from "./results/Results";

export default function App() {
	const analyze = useNoteStore((s) => s.analyze);

	// Ctrl/Cmd+V anywhere opens the note review, but only when the clipboard
	// actually holds an image — pasting text into the aspect search must keep
	// working untouched.
	useEffect(() => {
		function onPaste(event: ClipboardEvent) {
			const file = imageFromClipboard(event.clipboardData?.items ?? null);
			if (!file) return;
			event.preventDefault();
			void analyze(file);
		}

		window.addEventListener("paste", onPaste);
		return () => window.removeEventListener("paste", onPaste);
	}, [analyze]);

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

			<NoteReviewDialog />
		</Box>
	);
}
