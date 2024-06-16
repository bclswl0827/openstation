import { JSX, lazy, LazyExoticComponent, RefObject } from "react";

import { RouterMode } from "../components/RouterWrapper";
import { Translation } from "./locale";

export type RouterProp<T> = Record<string, T>;

export interface RouterComponentProps {
	refs?: RouterProp<RefObject<HTMLElement>>;
	locale?: string;
}

export interface RouterConfigRoutes {
	readonly uri: string;
	readonly pattern: string;
	readonly title: Translation;
	readonly element: LazyExoticComponent<(props: RouterComponentProps) => JSX.Element>;
}

type RouterConfig = {
	readonly mode: RouterMode;
	readonly basename: string;
	readonly routes: Record<string, RouterConfigRoutes>;
};

const Home = lazy(() => import("../views/Home"));
const Tasks = lazy(() => import("../views/Tasks"));
const Satellites = lazy(() => import("../views/Satellites"));
const Control = lazy(() => import("../views/Control"));
const Debug = lazy(() => import("../views/Debug"));
const Tools = lazy(() => import("../views/Tools"));
const NotFound = lazy(() => import("../views/NotFound"));

export const routerConfig: RouterConfig = {
	basename: "/",
	mode: "hash",
	routes: {
		home: {
			uri: "/",
			pattern: "",
			element: Home,
			title: {
				"en-US": "Station Status",
				"zh-TW": "當前站況",
				"zh-CN": "测站状态"
			}
		},
		tasks: {
			uri: "/tasks",
			pattern: "",
			element: Tasks,
			title: {
				"en-US": "Tasks",
				"zh-TW": "任務管理",
				"zh-CN": "任务管理"
			}
		},
		satellite: {
			uri: "/satellites",
			pattern: "",
			element: Satellites,
			title: {
				"en-US": "Satellite Orbits",
				"zh-TW": "衛星轨道",
				"zh-CN": "卫星轨道"
			}
		},
		control: {
			uri: "/control",
			pattern: "",
			element: Control,
			title: {
				"en-US": "Control",
				"zh-TW": "转台控制",
				"zh-CN": "转台控制"
			}
		},
		diagnose: {
			uri: "/debug",
			pattern: "",
			element: Debug,
			title: {
				"en-US": "Diagnose",
				"zh-TW": "装置调试",
				"zh-CN": "装置调试"
			}
		},
		tools: {
			uri: "/tools",
			pattern: "",
			element: Tools,
			title: {
				"en-US": "Image Tools",
				"zh-TW": "雲圖工具",
				"zh-CN": "云图工具"
			}
		},
		default: {
			uri: "*",
			pattern: "",
			element: NotFound,
			title: {
				"en-US": "Page Not Found",
				"zh-TW": "找不到頁面",
				"zh-CN": "找不到页面"
			}
		}
	}
};
