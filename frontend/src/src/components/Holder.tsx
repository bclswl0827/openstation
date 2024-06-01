import { ReactNode } from "react";

export interface HolderProps<T = ReactNode> {
	readonly label: string;
	readonly content?: string;
	readonly children?: T;
}

export const Holder = ({ label, content, children }: HolderProps) => (
	<div className="mb-4 flex flex-col rounded-xl shadow-lg">
		<div className="mx-4 rounded-lg overflow-hidden shadow-lg">{children}</div>
		<div className="p-4">
			<h6 className="text-lg font-bold flex text-gray-800 dark:text-gray-300">{label}</h6>
			{content && (
				<div className="pt-2 text-gray-600 dark:text-gray-400">
					{content.split("\n").map((item, index) => (
						<p key={index}>{item}</p>
					))}
				</div>
			)}
		</div>
	</div>
);
