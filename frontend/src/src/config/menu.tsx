import {
	mdiCalendarCheck,
	mdiCameraControl,
	mdiDebugStepOver,
	mdiHomeAccount,
	mdiSatelliteVariant
} from "@mdi/js";

import { Translation } from "./locale";

export interface MenuItem {
	readonly url: string;
	readonly icon: string;
	readonly home?: boolean;
	readonly label: Translation;
}

export const menuConfig: MenuItem[] = [
	{
		home: true,
		url: "/",
		label: {
			"en-US": "Station Status",
			"zh-TW": "站況總覽",
			"zh-CN": "状态总览"
		},
		icon: mdiHomeAccount
	},
	{
		url: "/tasks",
		label: {
			"en-US": "Tasks",
			"zh-TW": "任務管理",
			"zh-CN": "任务管理"
		},
		icon: mdiCalendarCheck
	},
	{
		url: "/satellites",
		label: {
			"en-US": "Satellite Orbit",
			"zh-TW": "衛星轨道",
			"zh-CN": "卫星轨道"
		},
		icon: mdiSatelliteVariant
	},
	{
		url: "/control",
		label: {
			"en-US": "Control",
			"zh-TW": "转台控制",
			"zh-CN": "转台控制"
		},
		icon: mdiCameraControl
	},
	// {
	// 	url: "/tools",
	// 	label: {
	// 		"en-US": "Tools",
	// 		"zh-TW": "雲圖工具",
	// 		"zh-CN": "云图工具"
	// 	},
	// 	icon: mdiCreation
	// },
	{
		url: "/debug",
		label: {
			"en-US": "Debug",
			"zh-TW": "装置调试",
			"zh-CN": "装置调试"
		},
		icon: mdiDebugStepOver
	}
];
