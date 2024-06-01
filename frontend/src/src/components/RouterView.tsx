import { ReactNode, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import i18n, { Translation } from "../config/locale";
import { RouterComponentProps, RouterConfigRoutes } from "../config/router";
import { getCurrentLocale } from "../helpers/locale/getCurrentLocale";
import { useLocaleStore } from "../stores/locale";

interface Props {
	readonly routes: Record<string, RouterConfigRoutes>;
	readonly routerProps?: RouterComponentProps;
	readonly appName: Translation;
	readonly suspense: ReactNode;
}

export const RouterView = ({ routes, suspense, appName, routerProps }: Props) => {
	const { pathname } = useLocation();
	const { locale, setLocale } = useLocaleStore();

	// Set the document title based on the current route
	useEffect(() => {
		const routeTitle = Object.values(routes).find(({ uri }) => pathname === uri)?.title;
		const title = routeTitle?.[locale] ?? routes.default.title?.[locale];
		document.title = `${title} - ${appName[locale]}`;
	}, [routes, appName, pathname, locale]);

	// Get the current locale and set to the store
	useEffect(() => {
		const currentLocale = getCurrentLocale(i18n);
		setLocale(currentLocale);
	}, [setLocale]);

	return (
		<Suspense fallback={suspense}>
			<Routes>
				{Object.values(routes).map(({ uri, pattern, element: Element }, index) => (
					<Route
						key={index}
						element={<Element {...routerProps} />}
						path={`${uri}${pattern}`}
					/>
				))}
			</Routes>
		</Suspense>
	);
};
