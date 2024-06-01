import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { PrimitiveAtom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Translation } from "../config/locale";
import { MenuItem } from "../config/menu";
import { useLocaleStore } from "../stores/locale";

interface Props {
	readonly logo: string;
	readonly release: string;
	readonly version: string;
	readonly menu: MenuItem[];
	readonly open: PrimitiveAtom<boolean>;
	readonly title: Translation;
}

export const AsideMenu = ({ menu, open, logo, title, version, release }: Props) => {
	const [homeURL, setHomeURL] = useState<string>("/");

	useEffect(() => {
		setHomeURL(menu.find((item) => item.home)?.url ?? "/");
	}, [menu]);

	const { pathname } = useLocation();
	const { locale } = useLocaleStore();
	const [isAsideMenuOpen, setIsAsideMenuOpen] = useAtom(open);

	return (
		<>
			{isAsideMenuOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
					onClick={() => setIsAsideMenuOpen(false)}
				/>
			)}
			<div
				className={`fixed border-r border-gray-700 overflow-auto inset-y-0 left-0 z-20 w-64 bg-gray-900 transition-transform ${isAsideMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:h-screen lg:static flex flex-col`}
			>
				<div className="sticky top-0 py-5 px-2 flex justify-between font-semibold text-gray-200 border-b border-gray-800 bg-gray-900">
					<Link to={homeURL} title={title[locale]}>
						<img className="w-full" src={logo} alt={title[locale]} />
					</Link>
					<button
						className="ml-2 lg:hidden text-gray-600 hover:text-gray-400"
						onClick={() => setIsAsideMenuOpen(false)}
					>
						<Icon path={mdiClose} size={1} />
					</button>
				</div>
				<div className="flex-grow py-4 px-2 flex flex-col space-y-4">
					{menu.map(({ url, icon, label }, index) => (
						<Link
							key={index}
							to={url}
							className={`flex items-center space-x-3 p-2 rounded text-gray-300 ${pathname === url ? "bg-gray-800" : "hover:bg-gray-800"} transition-all duration-300`}
						>
							<Icon className="ml-2" path={icon} size={1} />
							<span>{label[locale]}</span>
						</Link>
					))}
				</div>
				<div className="p-1 flex flex-col text-center text-xs text-gray-300/30 border-gray-800 border-t">
					<span>{version}</span>
					<span>{release}</span>
				</div>
			</div>
		</>
	);
};
