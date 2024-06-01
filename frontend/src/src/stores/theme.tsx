import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
	theme: "light" | "dark" | "system";
	setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useThemeStore = create(
	persist<ThemeState>(
		(set) => ({
			theme: "system",
			setTheme: (theme: "light" | "dark" | "system") => {
				set({ theme });
			}
		}),
		{ name: "theme" }
	)
);
