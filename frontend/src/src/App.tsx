import { useMediaQuery } from "@mui/material";
import { createTheme, Theme, ThemeProvider } from "@mui/material/styles";
import { atom } from "jotai";
import { useEffect, useState } from "react";
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
	const [muiTheme, setMuiTheme] = useState<{ light: Theme; dark: Theme; current: Theme }>({
		light: createTheme({ palette: { mode: "light" } }),
		dark: createTheme({ palette: { mode: "dark" } }),
		current: createTheme({ palette: { mode: "light" } })
	});
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

	useEffect(() => {
		if (theme === "light") {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
			setMuiTheme((prev) => ({ ...prev, current: prev.light }));
		} else if (theme === "dark") {
			document.documentElement.classList.remove("light");
			document.documentElement.classList.add("dark");
			setMuiTheme((prev) => ({ ...prev, current: prev.dark }));
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.remove("light");
			// Get the system theme and apply it
			const systemTheme = prefersDarkMode ? "dark" : "light";
			setMuiTheme((prev) => ({ ...prev, current: prev[systemTheme] }));
		}
	}, [theme, prefersDarkMode]);

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
					<ThemeProvider theme={muiTheme.current}>
						<RouterView appName={name} routes={routes} suspense={<Skeleton />} />
					</ThemeProvider>
				</div>
				<Footer content={footer} />
			</div>

			<Toaster />
		</div>
	);
};

export default App;
