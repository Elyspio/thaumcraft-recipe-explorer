import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { themes } from "./config/theme";
import { useAppStore } from "./core/store/appStore";
import App from "./view/components/App";
import "./index.scss";

function Root() {
	const mode = useAppStore((s) => s.mode);
	return (
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={themes[mode]}>
				<CssBaseline />
				<App />
			</ThemeProvider>
		</StyledEngineProvider>
	);
}

createRoot(document.getElementById("root")!).render(<Root />);
