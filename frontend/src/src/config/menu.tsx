import {
	mdiCalendarCheck,
	mdiCameraControl,
	mdiHomeAccount,
	mdiLifebuoy,
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
			"zh-TW": "當前站況",
			"zh-CN": "测站状态"
		},
		icon: mdiHomeAccount
	},
	{
		url: "/tasker",
		label: {
			"en-US": "Tasker",
			"zh-TW": "任務管理",
			"zh-CN": "任务管理"
		},
		icon: mdiCalendarCheck
	},
	{
		url: "/satellite",
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
	{
		url: "/diagnose",
		label: {
			"en-US": "Diagnose",
			"zh-TW": "装置诊断",
			"zh-CN": "装置诊断"
		},
		icon: mdiLifebuoy
	}
];
