/** Version de l'application injectée au build depuis le tag Docker. */
export const appVersion: string = import.meta.env.VITE_APP_VERSION ?? "dev";
