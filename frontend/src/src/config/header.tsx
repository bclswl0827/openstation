import { mdiCalendarCheck, mdiServerNetwork, mdiTranslate } from "@mdi/js";

export interface HeaderItem {
	icon: string;
	onClick: () => void;
}

export const headerConfig: HeaderItem[] = [
	{
		icon: mdiTranslate,
		onClick: () => {
			console.log("Translate");
		}
	},
	{
		icon: mdiCalendarCheck,
		onClick: () => {
			console.log("Calendar");
		}
	},
	{
		icon: mdiServerNetwork,
		onClick: () => {
			console.log("Network");
		}
	}
];
