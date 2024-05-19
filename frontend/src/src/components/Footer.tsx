import { Translation } from "../config/locale";

interface Props {
	readonly text: Translation;
	readonly locale: string;
}

export const Footer = ({ text, locale }: Props) => {
	return (
		<footer className="text-center bg-black/5 p-3 text-gray-500">
			{`© ${new Date().getFullYear()} ${text[locale]}`}
		</footer>
	);
};
