// import "cesium/Build/Cesium/Widgets/widgets.css";
// import { Viewer } from "resium";

import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { DataGrid } from "@mui/x-data-grid";
import * as dataGridLocales from "@mui/x-data-grid/locales";
import { Localization } from "@mui/x-data-grid/utils/getGridLocalization";
import { Form, Formik } from "formik";
import { useState } from "react";

import { useLocaleStore } from "../../stores/locale";

const Satellites = () => {
	const { locale } = useLocaleStore();
	const themeRecords = Object.entries(dataGridLocales).reduce(
		(acc, [locale, value]) => {
			acc[locale] = value;
			return acc;
		},
		{} as Record<string, object>
	);
	let locale4Component = locale.replaceAll(/[^a-z0-9]/gi, "");
	if (!themeRecords[locale4Component]) {
		locale4Component = "enUS";
	}

	const [satelliteSearchResult, setSatelliteSearchResult] = useState<
		Array<{
			id: number;
			name: string;
			epochTime: string;
			createdAt: string;
			updatedAt: string;
			geostationary: boolean;
		}>
	>([]);

	const handleSearchSatellite = (value: string) => {
		setSatelliteSearchResult([
			{
				id: 1,
				name: "Starlink 1",
				epochTime: "2021-10-01 12:00:00",
				createdAt: "2021-10-01 12:00:00",
				updatedAt: "2021-10-01 12:00:00",
				geostationary: false
			},
			{
				id: 2,
				name: "Starlink 2",
				epochTime: "2021-10-01 12:00:00",
				createdAt: "2021-10-01 12:00:00",
				updatedAt: "2021-10-01 12:00:00",
				geostationary: false
			},
			{
				id: 3,
				name: "Starlink 3",
				epochTime: "2021-10-01 12:00:00",
				createdAt: "2021-10-01 12:00:00",
				updatedAt: "2021-10-01 12:00:00",
				geostationary: false
			},
			{
				id: 4,
				name: "Starlink 4",
				epochTime: "2021-10-01 12:00:00",
				createdAt: "2021-10-01 12:00:00",
				updatedAt: "2021-10-01 12:00:00",
				geostationary: false
			},
			{
				id: 5,
				name: "Starlink 5",
				epochTime: "2021-10-01 12:00:00",
				createdAt: "2021-10-01 12:00:00",
				updatedAt: "2021-10-01 12:00:00",
				geostationary: false
			}
		]);
	};

	return (
		<div className="p-8 min-h-screen space-y-8">
			<div className="flex flex-col sm:flex-row justify-between gap-6">
				<div className="flex flex-row space-x-4 sm:whitespace-nowrap">
					<button className="px-4 py-2 rounded-lg font-medium text-white transition-all bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
						导入 TLE
					</button>
					<button className="px-4 py-2 rounded-lg font-medium text-white transition-all bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800">
						查看轨道
					</button>
				</div>

				<Formik
					initialValues={{ search: "" }}
					onSubmit={(values) => {
						void handleSearchSatellite(values.search);
					}}
				>
					{({ isSubmitting }) => (
						<Form className="flex flex-row space-x-2">
							<input
								type="search"
								className="ps-3 w-full min-w-64 md:w-64 py-2 text-sm text-gray-900 border focus:outline-none border-gray-300 rounded-lg bg-gray-50 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
								placeholder="NORAD ID or satellite name"
								required
							/>
							<button
								className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm p-2 dark:bg-blue-600 dark:hover:bg-blue-700"
								disabled={isSubmitting}
								type="submit"
							>
								<Icon className="text-white" path={mdiMagnify} size={1} />
							</button>
						</Form>
					)}
				</Formik>
			</div>

			<DataGrid
				localeText={
					(themeRecords[locale4Component] as Localization).components.MuiDataGrid
						.defaultProps.localeText
				}
				columns={[
					{
						field: "id",
						headerName: "NORAD ID",
						resizable: false,
						minWidth: 150,
						hideable: false
					},
					{ field: "name", headerName: "卫星名称", resizable: false, minWidth: 200 },
					{
						field: "epochTime",
						headerName: "星历时间",
						resizable: false,
						minWidth: 200
					},
					{
						field: "createdAt",
						headerName: "创建时间",
						resizable: false,
						minWidth: 200
					},
					{
						field: "updatedAt",
						headerName: "更新时间",
						resizable: false,
						minWidth: 200
					},
					{
						field: "geostationary",
						headerName: "同步卫星",
						resizable: false,
						sortable: false,
						minWidth: 150
					},
					{
						field: "actions",
						headerName: "操作",
						sortable: false,
						hideable: false,
						resizable: false,
						minWidth: 350,
						renderCell: () => (
							<div className="flex flex-row space-x-4 w-full">
								<button className="text-blue-700 dark:text-blue-400 hover:opacity-50">
									查看排程
								</button>
								<button className="text-blue-700 dark:text-blue-400 hover:opacity-50">
									复制 TLE
								</button>
								<button className="text-blue-700 dark:text-blue-400 hover:opacity-50">
									更新 TLE
								</button>
								<button className="text-red-700 dark:text-red-400 hover:opacity-50">
									移除数据
								</button>
							</div>
						)
					}
				]}
				className="shadow-lg lg:max-w-[calc(100vw-300px)]"
				sx={{ minHeight: 300 }}
				pageSizeOptions={[5, 10]}
				rows={satelliteSearchResult}
				initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
				onCellClick={(params, event) => {
					// Prevent the checkbox from being clicked when clicking the actions button
					if (params.field === "actions") {
						event.stopPropagation();
					}
				}}
				checkboxSelection
			/>
		</div>
	);
};

export default Satellites;
