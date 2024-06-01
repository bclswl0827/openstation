import { atom } from "jotai";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { AsideMenu } from "./components/AsideMenu";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { RouterView } from "./components/RouterView";
import { Skeleton } from "./components/Skeleton";
import { globalConfig } from "./config/global";
import { localeConfig } from "./config/locale";
import { menuConfig } from "./config/menu";
import { routerConfig } from "./config/router";
import { hideLoading } from "./helpers/app/hideLoading";
import { useThemeStore } from "./stores/theme";

const App = () => {
	useEffect(() => {
		hideLoading();
	}, []);

	const { theme } = useThemeStore();

	useEffect(() => {
		if (theme === "light") {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
		} else if (theme === "dark") {
			document.documentElement.classList.remove("light");
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.remove("light");
		}
	}, [theme]);

	const asideMenuState = atom(false);
	const { routes } = routerConfig;
	const { name, logo, version, release, footer, repository } = globalConfig;

	return (
		<div className="flex animate-fade animate-duration-500 animate-delay-300">
			<AsideMenu
				logo={logo}
				title={name}
				menu={menuConfig}
				open={asideMenuState}
				version={version}
				release={`Build ${release}`}
			/>
			<div className="flex flex-col w-full h-screen justify-between">
				<Header
					repository={repository}
					locales={localeConfig.resources}
					routes={routes}
					asideMenu={asideMenuState}
				/>
				<div className="mb-auto overflow-y-scroll dark:bg-gray-800">
					<RouterView appName={name} routes={routes} suspense={<Skeleton />} />
				</div>
				<Footer content={footer} />
			</div>

			<Toaster />
		</div>
	);
};

export default App;
