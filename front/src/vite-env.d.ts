/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Tag Docker injecté au build de l'image ; absent en développement. */
	readonly VITE_APP_VERSION?: string;
}
