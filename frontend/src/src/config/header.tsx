import { mdiTranslate } from "@mdi/js";

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
	}
];
