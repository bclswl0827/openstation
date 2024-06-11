import { useTranslation } from "react-i18next";

import { Error } from "../../components/Error";

const NotFound = () => {
	const { t } = useTranslation();

	const handleGoBack = () => {
		window.history.back();
	};

	return (
		<div className="p-8">
			<Error
				code={404}
				heading={t("not_found.heading")}
				content={t("not_found.content")}
				action={{
					onClick: handleGoBack,
					label: t("not_found.go_back")
				}}
			/>
		</div>
	);
};

export default NotFound;
