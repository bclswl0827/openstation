import { Translation } from "../config/locale";
import { useLocaleStore } from "../stores/locale";

interface Props {
	readonly content: Translation;
}

export const Footer = ({ content }: Props) => {
	const { locale } = useLocaleStore();

	return (
		<footer className="text-center bg-black/5 border-t p-2 text-gray-500 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600">
			{`© ${new Date().getFullYear()} ${content[locale]}`}
		</footer>
	);
};
