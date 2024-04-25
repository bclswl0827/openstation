import { ReactNode, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { Translation } from "../config/locale";
import { RouterComponentProps, RouterConfigRoutes } from "../config/router";

interface Props {
	readonly routes: Record<string, RouterConfigRoutes>;
	readonly routerProps?: RouterComponentProps;
	readonly appName: Translation;
	readonly suspense: ReactNode;
	readonly locale: string;
	readonly onTitleChange: (routeTitle: string) => void;
}

export const RouterView = ({ routes, suspense, appName, locale, routerProps, onTitleChange }: Props) => {
	const { pathname } = useLocation();

	useEffect(() => {
		const routeTitle = Object.values(routes).find(({ uri }) => pathname === uri)?.title;
		const title = routeTitle?.[locale] ?? routes.default.title?.[locale];
		document.title = `${title} - ${appName[locale]}`;
		onTitleChange(title);
	}, [routes, appName, pathname, locale, onTitleChange]);

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
