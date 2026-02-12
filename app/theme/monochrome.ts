import { useColorScheme } from "react-native";

export type MonochromePalette = {
  gradient: string[];
  bg0: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  textPrimary: string;
  textSecondary: string;
  borderSubtle: string;
  borderStrong: string;
  accent: string;
};

export const lightPalette: MonochromePalette = {
  gradient: ["#ffffff", "#f1f3f6", "#e7ebf1"],
  bg0: "#ffffff",
  surface: "#f7f9fc",
  surfaceMuted: "#eef1f6",
  surfaceStrong: "#e6eaf1",
  textPrimary: "#111318",
  textSecondary: "#3a3f48",
  borderSubtle: "#d6dbe4",
  borderStrong: "#b6bdc9",
  accent: "#2b2f36",
};

export const darkPalette: MonochromePalette = {
  gradient: ["#0b0c0f", "#141822", "#202632"],
  bg0: "#0b0c0f",
  surface: "rgba(15, 18, 24, 0.92)",
  surfaceMuted: "rgba(15, 18, 24, 0.75)",
  surfaceStrong: "#151a22",
  textPrimary: "#e6e8ee",
  textSecondary: "#b7bcc7",
  borderSubtle: "#2a2f3a",
  borderStrong: "#3a414f",
  accent: "#cfd3dc",
};

export const getPalette = (mode?: "light" | "dark"): MonochromePalette =>
  mode === "dark" ? darkPalette : lightPalette;

export const usePalette = (): MonochromePalette => {
  const scheme = useColorScheme();
  return getPalette(scheme === "dark" ? "dark" : "light");
};
