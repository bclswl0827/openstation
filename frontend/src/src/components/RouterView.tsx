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
}

export const RouterView = ({ routes, suspense, appName, locale, routerProps }: Props) => {
	const { pathname } = useLocation();

	useEffect(() => {
		const title = Object.values(routes).find(({ uri }) => pathname === uri)?.title;
		document.title = `${title?.[locale] ?? routes.default.title?.[locale]} - ${appName[locale]}`;
	}, [routes, appName, pathname, locale]);

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
