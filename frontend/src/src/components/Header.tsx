import { mdiDotsVertical, mdiMenu } from "@mdi/js";
import Icon from "@mdi/react";
import { PrimitiveAtom, useAtom } from "jotai";
import { useState } from "react";

import { HeaderItem } from "../config/header";

interface Props {
	readonly title: string;
	readonly items: HeaderItem[];
	readonly asideMenu: PrimitiveAtom<boolean>;
}

export const Header = ({ title, items, asideMenu }: Props) => {
	const [isAsideMenuOpen, setIsAsideMenuOpen] = useAtom(asideMenu);
	const [isIconsMenuOpen, setIsIconsMenuOpen] = useState(false);

	return (
		<div className="flex border-b justify-between p-5 items-center shadow-lg">
			<div className="flex items-center">
				<button
					className="lg:hidden text-gray-700 hover:text-gray-500 rounded-md mr-4"
					onClick={() => setIsAsideMenuOpen(!isAsideMenuOpen)}
				>
					<Icon path={mdiMenu} size={1} />
				</button>
				<h2 className="text-gray-700 font-light text-xl lg:pl-4">{title}</h2>
			</div>
			<div className="hidden sm:flex flex-row">
				{items.map(({ icon, onClick }, index) => (
					<div className="flex" key={index}>
						<button
							className="text-gray-500 hover:text-gray-400 mx-4"
							onClick={onClick}
						>
							<Icon path={icon} size={1} />
						</button>
						{index !== items.length - 1 && (
							<span className="text-gray-300 select-none">|</span>
						)}
					</div>
				))}
			</div>
			<div className="sm:hidden flex">
				<button
					className="text-gray-700 hover:text-gray-500 rounded-md"
					onClick={() => setIsIconsMenuOpen(!isIconsMenuOpen)}
				>
					<Icon path={mdiDotsVertical} size={1} />
				</button>
				{isIconsMenuOpen && (
					<div className="absolute flex right-2 mt-8 p-4 space-x-4 bg-white border rounded-md shadow-xl animate-fade animate-duration-300">
						{items.map(({ icon, onClick }, index) => (
							<div className="flex space-x-4" key={index}>
								<button
									className="text-gray-500 hover:text-gray-400"
									onClick={onClick}
								>
									<Icon path={icon} size={1} />
								</button>
								{index !== items.length - 1 && (
									<span className="text-gray-300 select-none">|</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
