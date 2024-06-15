import { ReactNode } from "react";

interface PanelProps<T = ReactNode> {
	readonly embedded?: boolean;
	readonly className?: string;
	readonly heading: string;
	readonly children: T;
}

export const Panel = ({ embedded, className, heading, children }: PanelProps) => (
	<div className="w-full">
		<div className="flex flex-col shadow-lg rounded-lg">
			<div className="mx-6 p-4 font-bold">
				<h2
					className={`text-gray-800 dark:text-gray-300 ${embedded ? "text-md" : "text-lg"}`}
				>
					{heading}
				</h2>
			</div>
			<hr className="mx-6 border-gray-200 dark:border-gray-600" />
			<div className={`p-4 m-2 text-gray-700 dark:text-gray-400 ${className ?? ""}`}>
				{children}
			</div>
		</div>
	</div>
);
