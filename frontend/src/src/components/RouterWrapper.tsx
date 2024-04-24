import { ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";

export type RouterMode = "hash" | "history";

export interface Props {
	readonly mode: RouterMode;
	readonly basename: string;
	readonly children: ReactNode;
}

export const RouterWrapper = ({ mode, children }: Props) =>
	mode === "hash" ? (
		<HashRouter>{children}</HashRouter>
	) : (
		<BrowserRouter>{children}</BrowserRouter>
	);
