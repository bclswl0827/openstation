import { atom } from "jotai";
import { useEffect, useState } from "react";

import { AsideMenu } from "./components/AsideMenu";
import { Header } from "./components/Header";
import { RouterView } from "./components/RouterView";
import { Skeleton } from "./components/Skeleton";
import { globalConfig } from "./config/global";
import { headerConfig } from "./config/header";
import i18n, { localeConfig } from "./config/locale";
import { menuConfig } from "./config/menu";
import { routerConfig } from "./config/router";
import { hideLoading } from "./helpers/app/hideLoading";
import { getCurrentLocale } from "./helpers/locale/getCurrentLocale";

const App = () => {
	const { fallback } = localeConfig;
	const [currentLocale, setCurrentLocale] = useState(fallback);
	const setCurrentLocaleToState = async () => setCurrentLocale(await getCurrentLocale(i18n));

	useEffect(() => {
		hideLoading();
		setCurrentLocaleToState();
	}, []);

	const [currentTitle, setCurrentTitle] = useState<string>("");
	const handleTitleChange = (routeTitle: string) => {
		setCurrentTitle(routeTitle);
	};

	const asideMenuState = atom(false);
	const { routes } = routerConfig;
	const { name, logo, release, version } = globalConfig;

	return (
		<div className="flex animate-fade animate-duration-500 animate-delay-500">
			<AsideMenu
				logo={logo}
				title={name}
				menu={menuConfig}
				open={asideMenuState}
				locale={currentLocale}
				release={`${version}@${release}`}
			/>
			<div className="flex flex-col w-full">
				<Header
					title={currentTitle}
					items={headerConfig}
					asideMenu={asideMenuState}
				/>
				<RouterView
					appName={name}
					routes={routes}
					locale={currentLocale}
					suspense={<Skeleton />}
					onTitleChange={handleTitleChange}
				/>
			</div>
		</div>
	);
};

export default App;
