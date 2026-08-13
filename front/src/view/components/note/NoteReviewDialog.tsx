import { useMemo, useRef, useState } from "react";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Stack,
	Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { aspectLabel } from "@data/aspectMeta";
import { useAppStore } from "@/core/store/appStore";
import { useNoteStore } from "@/core/store/noteStore";
import { AspectSelect } from "../controls/AspectSelect";
import { AspectIcon } from "../ui/AspectIcon";
import { AnnotatedImage } from "./AnnotatedImage";
import { PairComposer } from "./PairComposer";

/** Confidence below which the runner-up is worth showing next to the match. */
const THIN_CONFIDENCE = 0.7;

/**
 * Review before search. Detection is good but not certain, and a silently wrong
 * aspect sends the player hunting a recipe that has nothing to do with their
 * note — so nothing runs until the board on screen has been confirmed.
 */
export function NoteReviewDialog() {
	const { open, status, error, imageUrl, imageWidth, imageHeight, aspects, ignored, pairs, noteId } = useNoteStore();
	const close = useNoteStore((s) => s.close);
	const setAspect = useNoteStore((s) => s.setAspect);
	const promoteIgnored = useNoteStore((s) => s.promoteIgnored);
	const addPair = useNoteStore((s) => s.addPair);

	const known = useAppStore((s) => s.model.aspects);
	const version = useAppStore((s) => s.version);
	const minSteps = useAppStore((s) => s.minSteps);
	const runPair = useAppStore((s) => s.runPair);
	const enableAspects = useAppStore((s) => s.enableAspects);

	// Mirrored in a ref so two clicks landing in the same tick still pair up
	// instead of both reading a stale `null` from the render closure.
	const pending = useRef<number | null>(null);
	const [pendingIndex, setPendingIndex] = useState<number | null>(null);

	const unknown = useMemo(() => {
		const inModel = new Set(known);
		return aspects.map((a) => a.aspect).filter((a) => !inModel.has(a));
	}, [aspects, known]);

	function pick(index: number) {
		const first = pending.current;
		if (first === null) {
			pending.current = index;
			setPendingIndex(index);
			return;
		}
		if (first !== index) addPair(aspects[first].aspect, aspects[index].aspect, minSteps);
		pending.current = null;
		setPendingIndex(null);
	}

	function launch() {
		enableAspects(aspects.map((a) => a.aspect));
		for (const pair of pairs) runPair(pair.from, pair.to, pair.minSteps, noteId);
		close();
	}

	return (
		<Dialog open={open} onClose={close} fullWidth maxWidth="lg" slotProps={{ paper: { sx: { minHeight: "70vh" } } }}>
			<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1.5 }}>
				<Box>
					<Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>Review note</Typography>
					<Typography variant="eyebrow">Confirm the aspects, then link them</Typography>
				</Box>
				<IconButton onClick={close} size="small">
					<CloseRoundedIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				{status === "working" && (
					<Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
						<CircularProgress size={28} />
						<Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>Reading the note…</Typography>
					</Stack>
				)}

				{status === "error" && <Alert severity="error">{error}</Alert>}

				{status === "ready" && (
					<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 3 }}>
						{imageUrl && (
							<AnnotatedImage
								imageUrl={imageUrl}
								imageWidth={imageWidth}
								imageHeight={imageHeight}
								aspects={aspects}
								pendingIndex={pendingIndex}
								onPick={pick}
							/>
						)}

						<Stack spacing={2.25} sx={{ minWidth: 0 }}>
							{aspects.length === 0 && <Alert severity="warning">No aspect recognised. Make sure the screenshot is cropped to the note itself.</Alert>}

							{unknown.length > 0 && (
								<Alert severity="warning">
									{unknown.map(aspectLabel).join(", ")} {unknown.length > 1 ? "are" : "is"} not part of version {version}. Switch version or enable the
									matching addon before searching.
								</Alert>
							)}

							{aspects.length > 0 && (
								<Box>
									<Typography variant="eyebrow" sx={{ mb: 1 }}>
										Recognised
									</Typography>
									<Stack spacing={1}>
										{aspects.map((detected, index) => (
											<Stack key={`${detected.box.x}-${detected.box.y}`} direction="row" spacing={1.25} alignItems="center">
												<AspectIcon aspect={detected.aspect} size={28} />
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<AspectSelect label={`Aspect ${index + 1}`} value={detected.aspect} onChange={(a) => setAspect(index, a)} />
												</Box>
												{!detected.manual && detected.score < THIN_CONFIDENCE && detected.runnerUp && (
													<Typography variant="eyebrow" sx={{ fontSize: 10, flexShrink: 0, color: "warning.main" }}>
														or {aspectLabel(detected.runnerUp)}?
													</Typography>
												)}
											</Stack>
										))}
									</Stack>
								</Box>
							)}

							{ignored.length > 0 && (
								<Accordion disableGutters elevation={0} sx={(t) => ({ border: `1px solid ${t.palette.custom.line}`, borderRadius: 1, "&::before": { display: "none" } })}>
									<AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
										<Typography sx={{ fontSize: 13 }}>{ignored.length} area(s) ignored</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<Stack spacing={1}>
											{ignored.map((candidate, index) => (
												<AspectSelect
													key={`${candidate.box.x}-${candidate.box.y}`}
													label="Assign an aspect"
													value={candidate.aspect}
													onChange={(a) => promoteIgnored(index, a)}
												/>
											))}
										</Stack>
									</AccordionDetails>
								</Accordion>
							)}

							<Divider />

							<Box>
								<Typography variant="eyebrow" sx={{ mb: 1 }}>
									Searches
								</Typography>
								<PairComposer pairs={pairs} />
							</Box>
						</Stack>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2 }}>
				<Button onClick={close}>Cancel</Button>
				<Button variant="accent" startIcon={<TravelExploreRoundedIcon />} disabled={pairs.length === 0} onClick={launch}>
					Run {pairs.length || ""} search{pairs.length === 1 ? "" : "es"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
