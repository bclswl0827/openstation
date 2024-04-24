import { ResourceLanguage } from "i18next";

import { createI18n } from "../helpers/locale/createI18n";
import enUS from "../locales/en-US.json";
import zhCN from "../locales/zh-CN.json";
import zhTW from "../locales/zh-TW.json";

interface LocaleConfig {
	key: string;
	fallback: string;
	resources: Record<string, { label: string; translation: ResourceLanguage }>;
}

export const localeConfig: LocaleConfig = {
	fallback: "en-US",
	key: "i18n",
	resources: {
		"en-US": { label: "US English", translation: enUS },
		"zh-TW": { label: "正體中文", translation: zhTW },
		"zh-CN": { label: "简体中文", translation: zhCN }
	}
};

export type Translation = Record<keyof typeof localeConfig.resources, string>;

const i18n = createI18n(localeConfig.fallback, localeConfig.key, localeConfig.resources);

export default i18n;
