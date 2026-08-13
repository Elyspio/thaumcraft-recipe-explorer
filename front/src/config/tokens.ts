/**
 * Design tokens for the Thaumcraft Recipe Explorer.
 * Same token shape as the reference project, re-skinned to an arcane palette:
 * amethyst/violet accent + thaumic gold, on slate (dark) or parchment (light).
 */

export type DesignTokens = {
	paper: string;
	paper2: string;
	paper3: string;
	ink: string;
	ink2: string;
	ink3: string;
	ink4: string;
	line: string;
	lineSoft: string;
	accent: string;
	accent2: string;
	accentSoft: string;
	accentInk: string;
	clay: string;
	claySoft: string;
	success: string;
	warn: string;
	warnSoft: string;
	danger: string;
	dangerSoft: string;
	shadowSm: string;
	shadowMd: string;
	shadowLg: string;
};

export const radii = {
	r1: 6,
	r2: 8,
	r3: 12,
	r4: 16,
} as const;

export const darkTokens: DesignTokens = {
	paper: "#1B1726",
	paper2: "#110E1A",
	paper3: "#2A2338",
	ink: "#ECE7F5",
	ink2: "#C9C1DC",
	ink3: "#9C92B5",
	ink4: "#6E6589",
	line: "#2E2740",
	lineSoft: "#221C31",
	accent: "#9B6BE3",
	accent2: "#7C4DD1",
	accentSoft: "rgba(155, 107, 227, 0.16)",
	accentInk: "#C9AEFF",
	clay: "#D9A84E",
	claySoft: "rgba(217, 168, 78, 0.16)",
	success: "#4ADE80",
	warn: "#FBBF24",
	warnSoft: "rgba(251, 191, 36, 0.16)",
	danger: "#F87171",
	dangerSoft: "rgba(248, 113, 113, 0.16)",
	shadowSm: "0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.4)",
	shadowMd: "0 4px 6px -2px rgba(0, 0, 0, 0.4), 0 12px 24px -8px rgba(0, 0, 0, 0.5)",
	shadowLg: "0 8px 16px -4px rgba(0, 0, 0, 0.45), 0 24px 48px -12px rgba(0, 0, 0, 0.65)",
};

export const lightTokens: DesignTokens = {
	paper: "#FBF7EF",
	paper2: "#F2EBDC",
	paper3: "#E7DDC9",
	ink: "#2A2233",
	ink2: "#4A3F58",
	ink3: "#6E6385",
	ink4: "#9A8FB0",
	line: "#E0D5C0",
	lineSoft: "#EBE2D2",
	accent: "#6D28D9",
	accent2: "#5B21B6",
	accentSoft: "#EDE4FB",
	accentInk: "#4C1D95",
	clay: "#B45309",
	claySoft: "#FBEAD2",
	success: "#16A571",
	warn: "#B45309",
	warnSoft: "#FEF1C8",
	danger: "#DC2626",
	dangerSoft: "#FEE2E2",
	shadowSm: "0 1px 2px rgba(42, 34, 51, 0.05), 0 1px 3px rgba(42, 34, 51, 0.05)",
	shadowMd: "0 4px 6px -2px rgba(42, 34, 51, 0.06), 0 12px 24px -8px rgba(42, 34, 51, 0.1)",
	shadowLg: "0 8px 16px -4px rgba(42, 34, 51, 0.1), 0 24px 48px -12px rgba(42, 34, 51, 0.14)",
};
