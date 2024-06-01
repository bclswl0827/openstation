import logo from "../assets/logo.png";
import { getRelease } from "../helpers/app/getRelease";
import { getVersion } from "../helpers/app/getVersion";
import { Translation } from "./locale";

interface GlobalConfig {
	readonly repository: string;
	readonly logo: string;
	readonly version: string;
	readonly release: string;
	readonly name: Translation;
	readonly footer: Translation;
}

const version = getVersion();
const release = getRelease();

export const globalConfig: GlobalConfig = {
	version,
	release,
	logo,
	name: {
		"en-US": "OpenStation",
		"zh-CN": "OpenStation",
		"zh-TW": "OpenStation"
	},
	footer: {
		"en-US": "OpenStation Project.",
		"zh-CN": "OpenStation Project.",
		"zh-TW": "OpenStation Project."
	},
	repository: "https://github.com/bclswl0827/openstation"
};
