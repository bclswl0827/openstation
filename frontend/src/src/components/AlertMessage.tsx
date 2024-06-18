import { Alert, AlertColor, AlertPropsColorOverrides } from "@mui/material";
import { OverridableStringUnion } from "@mui/types";
import { ReactNode } from "react";

interface AlertMessageProps<T = ReactNode> {
	readonly severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>;
	readonly children: T;
}

export const AlertMessage = ({ severity, children }: AlertMessageProps) => {
	return (
		<div className="m-4 shadow-lg">
			<Alert variant="standard" severity={severity}>
				{children}
			</Alert>
		</div>
	);
};
