import {
	mdiCalendarCheck,
	mdiDotsVertical,
	mdiMenu,
	mdiServerNetwork,
	mdiTranslate
} from "@mdi/js";
import Icon from "@mdi/react";
import { PrimitiveAtom, useAtom } from "jotai";
import { useState } from "react";

import { Translation } from "../config/locale";

interface Props {
	readonly title?: Translation;
	readonly asideMenu: PrimitiveAtom<boolean>;
}

export const Header = ({ asideMenu }: Props) => {
	const [isAsideMenuOpen, setIsAsideMenuOpen] = useAtom(asideMenu);
	const [isIconsMenuOpen, setIsIconsMenuOpen] = useState(false);

	return (
		<div className="flex border-b justify-between p-5 items-center shadow-lg">
			<div className="flex items-center">
				<button
					className="p-2 lg:hidden text-gray-700 hover:bg-gray-200 rounded-md mr-1"
					onClick={() => setIsAsideMenuOpen(!isAsideMenuOpen)}
				>
					<Icon path={mdiMenu} size={1} />
				</button>
				<h2 className="text-gray-700 font-light text-xl">Dashboard</h2>
			</div>
			<div className="hidden sm:flex flex-row space-x-5">
				<button className="text-gray-500 hover:text-gray-400">
					<Icon path={mdiTranslate} size={1} />
				</button>
				<button className="text-gray-500 hover:text-gray-400">
					<Icon path={mdiCalendarCheck} size={1} />
				</button>
				<button className="text-gray-500 hover:text-gray-400">
					<Icon path={mdiServerNetwork} size={1} />
				</button>
			</div>
			<div className="sm:hidden">
				<button
					className="p-2 text-gray-700 hover:bg-gray-200 rounded-md"
					onClick={() => setIsIconsMenuOpen(!isIconsMenuOpen)}
				>
					<Icon path={mdiDotsVertical} size={1} />
				</button>
				{isIconsMenuOpen && (
					<div className="absolute flex right-2 mt-2 p-4 space-x-4 bg-white border rounded-md shadow-xl animate-fade animate-duration-300">
						<button className="text-gray-500 hover:text-gray-400 w-full">
							<Icon path={mdiTranslate} size={1} />
						</button>
						<button className="text-gray-500 hover:text-gray-400 w-full">
							<Icon path={mdiCalendarCheck} size={1} />
						</button>
						<button className="text-gray-500 hover:text-gray-400 w-full">
							<Icon path={mdiServerNetwork} size={1} />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
