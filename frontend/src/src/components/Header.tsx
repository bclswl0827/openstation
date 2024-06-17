import {
	mdiDotsVertical,
	mdiGithub,
	mdiLaptop,
	mdiMenu,
	mdiMoonWaningCrescent,
	mdiTranslate,
	mdiWhiteBalanceSunny
} from "@mdi/js";
import Icon from "@mdi/react";
import { ResourceLanguage } from "i18next";
import { PrimitiveAtom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { RouterConfigRoutes } from "../config/router";
import { useLocaleStore } from "../stores/locale";
import { useThemeStore } from "../stores/theme";
import { DialogForm } from "./DialogForm";

interface Props {
	readonly repository: string;
	readonly asideMenu: PrimitiveAtom<boolean>;
	readonly routes: Record<string, RouterConfigRoutes>;
	readonly locales: Record<string, { label: string; translation: ResourceLanguage }>;
}

export const Header = ({ repository, routes, asideMenu, locales }: Props) => {
	const [isAsideMenuOpen, setIsAsideMenuOpen] = useAtom(asideMenu);
	const [isIconsMenuOpen, setIsIconsMenuOpen] = useState(false);

	const { t } = useTranslation();
	const { pathname } = useLocation();
	const [title, setTitle] = useState<string>("");
	const { locale, setLocale } = useLocaleStore();
	useEffect(() => {
		const headerTitle = Object.values(routes).find(({ uri }) => pathname === uri)?.title?.[
			locale
		];
		setTitle(headerTitle ?? routes.default.title?.[locale]);
	}, [locale, routes, pathname]);

	const [dialogOpen, setDialogOpen] = useState(false);
	const handleDialogOpen = () => {
		setDialogOpen(true);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};
	const handleLocaleChange = (value: string) => {
		setLocale(value);
		setDialogOpen(false);
	};

	const { theme, setTheme } = useThemeStore();
	const handleThemeChange = () => {
		setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
	};
	const getThemeIcon = () => {
		switch (theme) {
			case "light":
				return mdiWhiteBalanceSunny;
			case "dark":
				return mdiMoonWaningCrescent;
			default:
				return mdiLaptop;
		}
	};

	return (
		<div className="flex border-b justify-between p-5 items-center shadow-lg dark:bg-gray-800 dark:border-gray-600">
			<div className="flex items-center">
				<button
					className="lg:hidden text-gray-700 hover:text-gray-400 rounded-md ml-2 mr-4 dark:text-gray-300"
					onClick={() => setIsAsideMenuOpen(!isAsideMenuOpen)}
				>
					<Icon path={mdiMenu} size={1} />
				</button>
				<h2 className="text-gray-700 font-light text-xl lg:pl-4 dark:text-gray-300">
					{title}
				</h2>
			</div>

			<div className="hidden sm:flex flex-row space-x-8">
				<button
					className="text-gray-500 hover:text-gray-400 dark:text-gray-300"
					onClick={handleDialogOpen}
				>
					<Icon path={mdiTranslate} size={1} />
				</button>
				<button
					className="text-gray-500 hover:text-gray-400 dark:text-gray-300"
					onClick={handleThemeChange}
				>
					<Icon path={getThemeIcon()} size={1} />
				</button>
				<Link
					className="text-gray-500 hover:text-gray-400 dark:text-gray-300"
					to={repository}
					target="_blank"
				>
					<Icon path={mdiGithub} size={1} />
				</Link>
			</div>

			<div className="sm:hidden flex">
				<button
					className="text-gray-500 hover:text-gray-400 rounded-md dark:text-gray-300"
					onClick={() => setIsIconsMenuOpen(!isIconsMenuOpen)}
				>
					<Icon path={mdiDotsVertical} size={1} />
				</button>
				{isIconsMenuOpen && (
					<div className="absolute z-10 flex right-2 mt-8 p-4 bg-white border rounded-md shadow-xl animate-fade animate-duration-300 space-x-4 dark:bg-gray-800 dark:border-gray-500">
						<button
							className="text-gray-500 hover:text-gray-400 dark:text-gray-300"
							onClick={handleDialogOpen}
						>
							<Icon path={mdiTranslate} size={1} />
						</button>
						<button
							className="text-gray-500 hover:text-gray-400 dark:text-gray-300"
							onClick={handleThemeChange}
						>
							<Icon path={getThemeIcon()} size={1} />
						</button>
						<Link
							className="text-gray-500 hover:text-gray-400 dark:text-gray-300"
							to={repository}
							target="_blank"
						>
							<Icon path={mdiGithub} size={1} />
						</Link>
					</div>
				)}
			</div>

			<DialogForm
				inputType="select"
				title="Choose your language"
				content="选择语言 / Choose your language"
				open={dialogOpen}
				onClose={handleDialogClose}
				onSubmit={handleLocaleChange}
				selectOptions={Object.entries(locales).map(([key, { label }]) => ({
					value: key,
					label
				}))}
                defaultValue={locale}
				cancelText={t("common.close")}
				submitText={t("common.submit")}
			/>
		</div>
	);
};
