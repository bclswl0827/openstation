import { create } from "zustand";

import i18n, { localeConfig } from "../config/locale";
import { setUserLocale } from "../helpers/locale/setUserLocale";

interface LocaleState {
	locale: keyof typeof localeConfig.resources;
	setLocale: (
		locale: keyof typeof localeConfig.resources | Promise<keyof typeof localeConfig.resources>
	) => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
	locale: localeConfig.fallback,
	setLocale: async (
		locale: keyof typeof localeConfig.resources | Promise<keyof typeof localeConfig.resources>
	) => {
		if (typeof locale === "string") {
			await setUserLocale(i18n, locale);
			set({ locale });
		} else {
			const awaitedLocale = await locale;
			await setUserLocale(i18n, awaitedLocale);
			set({ locale: awaitedLocale });
		}
	}
}));
