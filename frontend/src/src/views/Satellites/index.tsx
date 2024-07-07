import "cesium/Build/Cesium/Widgets/widgets.css";

import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import {
	Cartesian3,
	ClockRange,
	ImageryLayer,
	JulianDate,
	ScreenSpaceEventType,
	TextureMinificationFilter,
	Timeline,
	UrlTemplateImageryProvider,
	Viewer as CesiumViewer
} from "cesium";
import { Field, Form, Formik } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CesiumComponentRef, Viewer } from "resium";

import { DialogForm, DialogFormProps } from "../../components/DialogForm";
import { Error } from "../../components/Error";
import { FileInputButton } from "../../components/FileInputButton";
import { ListForm, ListFormProps } from "../../components/ListForm";
import { Panel } from "../../components/Panel";
import SatelliteEntity from "../../components/SatelliteEntity";
import { TableList } from "../../components/TableList";
import {
	GetData4SatellitesQuery,
	GetForecastByIdQuery,
	GetTlEsByKeywordQuery,
	useAddNewTaskMutation,
	useAddNewTleMutation,
	useDeleteTleByIdMutation,
	useGetData4SatellitesQuery,
	useGetForecastByIdLazyQuery,
	useGetObservationByIdLazyQuery,
	useGetTlEsByKeywordLazyQuery,
	useImportTlEsMutation,
	useSetPanTiltMutation,
	useUpdateTleByIdMutation
} from "../../graphql";
import { sendPromiseAlert } from "../../helpers/interact/sendPromiseAlert";
import { sendUserAlert } from "../../helpers/interact/sendUserAlert";
import { sendUserConfirm } from "../../helpers/interact/sendUserConfirm";
import { getCurrentTime } from "../../helpers/utils/getCurrentTime";
import { getTimeString } from "../../helpers/utils/getTimeString";
import { setClipboardText } from "../../helpers/utils/setClipboardText";
import { useLocaleStore } from "../../stores/locale";

interface ExtendedTimeline extends Timeline {
	makeLabel: (time: JulianDate) => string;
}
(Timeline.prototype as ExtendedTimeline).makeLabel = (time: JulianDate) =>
	getTimeString(JulianDate.toDate(time).getTime());

const Satellites = () => {
	const { t } = useTranslation();

	// Get locale for Table component
	const { locale } = useLocaleStore();

	// Get Cesium viewer and run startup job
	const [isCesiumViewerReady, setIsCesiumViewerReady] = useState(false);
	const cesiumViewerRef = useRef<CesiumComponentRef<CesiumViewer> | null>(null);
	const setCesiumViewerRef = useCallback((ref: CesiumComponentRef<CesiumViewer> | null) => {
		if (ref && ref?.cesiumElement) {
			cesiumViewerRef.current = ref;
			setIsCesiumViewerReady(true);
		}
	}, []);
	const cesiumViewerSetup = (viewer: CesiumViewer) => {
		// Set Cesium lighting
		viewer.scene.globe.enableLighting = true;
		viewer.scene.skyAtmosphere.show = false;
		// Setup datetime formatter
		const minutes = 0 - new Date().getTimezoneOffset();
		viewer.animation.viewModel.dateFormatter = (date) =>
			JulianDate.toIso8601(JulianDate.addMinutes(date, minutes, new JulianDate())).slice(
				0,
				10
			);
		viewer.animation.viewModel.timeFormatter = (time) =>
			JulianDate.toIso8601(JulianDate.addMinutes(time, minutes, new JulianDate())).slice(
				11,
				19
			);
		// Setup zoom control limitation
		viewer.scene.screenSpaceCameraController.maximumZoomDistance = 3e8;
		viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1e6;
		// Fix Cesium resolution issue
		viewer.scene.postProcessStages.fxaa.enabled = true;
		viewer.scene.globe.maximumScreenSpaceError = 4 / 3;
		viewer.resolutionScale = window.devicePixelRatio;
		// Remove default event listener for left click
		viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
	};
	const cesiumTimeSetup = (viewer: CesiumViewer, baseTime: number, refTime: number) => {
		const currentTime = getCurrentTime(baseTime, refTime);
		const startTime = JulianDate.fromIso8601(new Date(currentTime).toISOString());
		const stopTime = JulianDate.addSeconds(startTime, 86400, new JulianDate());
		viewer.clock.startTime = startTime.clone();
		viewer.clock.stopTime = stopTime.clone();
		viewer.clock.currentTime = startTime.clone();
		viewer.clock.multiplier = 500;
		viewer.clock.shouldAnimate = true;
		viewer.clock.clockRange = ClockRange.LOOP_STOP;
		viewer.timeline.zoomTo(startTime, stopTime);
	};

	// Set Cesium to use current GNSS data
	const { data, error, loading } = useGetData4SatellitesQuery();
	const [data4Satellites, setData4Satellites] = useState<
		GetData4SatellitesQuery["getGnss"] & { baseTime: number }
	>();
	useEffect(() => {
		if (data && !loading) {
			setData4Satellites({ ...data.getGnss, baseTime: Date.now() });
		}
	}, [data, loading]);
	useEffect(() => {
		if (data4Satellites && isCesiumViewerReady) {
			// Initialize Cesium viewer
			const { cesiumElement: viewer } = cesiumViewerRef.current!;
			cesiumViewerSetup(viewer!);
			// Set Cesium Timeline
			const { baseTime, timestamp, latitude, longitude } = data4Satellites;
			cesiumTimeSetup(viewer!, baseTime, timestamp);
			// Setup Cesium camera
			viewer!.camera.setView({
				destination: Cartesian3.fromDegrees(longitude, latitude, 3e7)
			});
		}
	}, [data4Satellites, isCesiumViewerReady]);

	// States for dialog form
	const handleDialogFormClose = () => {
		setDialogFormState({ ...dialogFormState, placeholder: "", open: false });
	};
	const [dialogFormState, setDialogFormState] = useState<DialogFormProps>({
		open: false,
		cancelText: t("common.dialog.cancel"),
		submitText: t("common.dialog.submit"),
		onClose: handleDialogFormClose
	});

	// States for list form
	const handleListFormClose = () => {
		setListFormState({ ...listFormState, open: false });
	};
	const [listFormState, setListFormState] = useState<ListFormProps>({
		open: false,
		onClose: handleListFormClose
	});

	// Handlers for TLE batch importing
	const [importTlEsMutation] = useImportTlEsMutation();
	const handleImportTLEs = (file: File) => {
		if (file.size > 1024 * 1024 * 5) {
			sendUserAlert(t("views.satellites.actions.import.size_exceed", { value: 5 }), true);
			return;
		}
		const handleConfirm = async (tleData: string) => {
			const result = (
				await sendPromiseAlert(
					importTlEsMutation({ variables: { tleData } }),
					t("views.satellites.actions.import.loading"),
					t("views.satellites.actions.import.success"),
					t("views.satellites.actions.import.failure"),
					true
				)
			)?.data?.importTLEs;
			sendUserAlert(
				t("views.satellites.actions.import.result", { value: result ?? 0 }),
				false
			);
			// If the search keyword is not empty, refresh the search result
			if (satelliteSearchState.keyword.length) {
				await handleSearchSatellite(satelliteSearchState.keyword);
			}
		};
		const reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = ({ target }) => {
			if ((target!.result as string).includes("\0")) {
				sendUserAlert(t("views.satellites.actions.import.invalid_file"), true);
				return;
			}
			sendUserConfirm(t("views.satellites.actions.import.confirm.content"), {
				title: t("views.satellites.actions.import.confirm.title"),
				cancelText: t("common.confirm.cancel"),
				confirmText: t("common.confirm.confirm"),
				onConfirmed: () => handleConfirm(target!.result as string),
				onCancelled: () =>
					sendUserAlert(t("views.satellites.actions.import.confirm.cancel"), true)
			});
		};
	};

	// Handler for adding a TLE record
	const [addNewTleMutation] = useAddNewTleMutation();
	const handleAddNewTLE = async () => {
		const handleSubmit = async (tleData: string) => {
			handleDialogFormClose();
			await sendPromiseAlert(
				addNewTleMutation({ variables: { tleData } }),
				t("views.satellites.actions.add_new.loading"),
				t("views.satellites.actions.add_new.success"),
				t("views.satellites.actions.add_new.failure"),
				true
			);
		};
		setDialogFormState({
			...dialogFormState,
			open: true,
			title: t("views.satellites.actions.add_new.dialog.title"),
			inputType: "textarea",
			placeholder: t("views.satellites.actions.add_new.dialog.placeholder"),
			content: t("views.satellites.actions.add_new.dialog.content"),
			onSubmit: handleSubmit
		});
	};

	// Handler for preview satellite track
	const [selectedSatellites, setSelectedSatellites] = useState<
		GetTlEsByKeywordQuery["getTLEsByKeyword"]
	>([]);
	const handleSelectSatellites = (ids: GridRowSelectionModel) => {
		setSelectedSatellites(
			ids.map(
				(selectedId) => satelliteSearchState.result.find((row) => row?.id === selectedId)!
			)
		);
	};
	const handleSimulateTrack = () => {
		if (selectedSatellites.length > 10) {
			sendUserAlert(t("views.satellites.actions.simulate.items_exceed", { value: 10 }), true);
			return;
		} else if (!selectedSatellites.length) {
			sendUserAlert(t("views.satellites.actions.simulate.empty"), true);
			return;
		}
		const { cesiumElement: viewer } = cesiumViewerRef.current!;
		viewer!.container.scrollIntoView({ behavior: "smooth" });
		// Clear existing entities before adding new ones and reset Cesium clock
		viewer!.entities.removeAll();
		cesiumTimeSetup(viewer!, data4Satellites!.baseTime, data4Satellites!.timestamp);
		// Add satellite entities to Cesium viewer
		const currentTime = getCurrentTime(data4Satellites!.baseTime, data4Satellites!.timestamp);
		selectedSatellites.forEach((satellite) => {
			const { name, line_1, line_2 } = satellite!;
			const satelliteEntityObj = new SatelliteEntity(
				`${name}\n${line_1}\n${line_2}`,
				86400,
				100
			);
			const cesiumEntity = satelliteEntityObj.createSatelliteEntity(currentTime);
			viewer!.entities.add(cesiumEntity);
		});
		viewer!.clock.shouldAnimate = true;
		sendUserAlert(
			t("views.satellites.actions.simulate.success", { value: selectedSatellites.length }),
			false
		);
	};

	// States & handlers for satellite search box
	const [satelliteSearchState, setSatelliteSearchState] = useState<{
		keyword: string;
		result: GetTlEsByKeywordQuery["getTLEsByKeyword"];
	}>({ keyword: "", result: [] });
	const [getTlEsByKeyword] = useGetTlEsByKeywordLazyQuery();
	const handleSearchSatellite = async (keyword: string) => {
		setSatelliteSearchState((prev) => ({ ...prev, result: [] }));
		const result = (
			await sendPromiseAlert(
				getTlEsByKeyword({ variables: { keyword } }),
				t("views.satellites.actions.search.loading"),
				t("views.satellites.actions.search.success"),
				t("views.satellites.actions.search.failure"),
				true
			)
		)?.data?.getTLEsByKeyword;
		if (result?.length) {
			setSatelliteSearchState({ keyword, result });
			sendUserAlert(
				t("views.satellites.actions.search.result", { value: result.length }),
				false
			);
		} else {
			sendUserAlert(t("views.satellites.actions.search.empty"), true);
		}
	};

	// Handler for getting forecast data
	const [getForecastById] = useGetForecastByIdLazyQuery();
	const [addNewTaskMutation] = useAddNewTaskMutation();
	const handleGetForecast = (tleId: number, name: string) => {
		const handleElevationSubmit = async (elevationThreshold: number) => {
			handleDialogFormClose();
			if (elevationThreshold < 0 || elevationThreshold > 90) {
				sendUserAlert(t("views.satellites.actions.set_tracking.invalid_threshold"), true);
				return;
			}
			const results = (
				await sendPromiseAlert(
					getForecastById({
						variables: {
							tleId,
							elevationThreshold,
							gnssLatitude: data!.getGnss.latitude,
							gnssLongitude: data!.getGnss.longitude,
							gnssElevation: data!.getGnss.elevation
						}
					}),
					t("views.satellites.actions.set_tracking.forecast_loading"),
					t("views.satellites.actions.set_tracking.forecast_success"),
					t("views.satellites.actions.set_tracking.forecast_failed"),
					true
				)
			)?.data?.getForecastById;
			// Open list form if results are more than 0
			if (results?.length) {
				const handleTransitSelect = async (value: string) => {
					handleListFormClose();
					const valueObj = (JSON.parse(
						value
					) as GetForecastByIdQuery["getForecastById"][number])!;
					await sendPromiseAlert(
						addNewTaskMutation({
							variables: { tleId, elevationThreshold, ...valueObj }
						}),
						t("views.satellites.actions.set_tracking.loading"),
						t("views.satellites.actions.set_tracking.success"),
						t("views.satellites.actions.set_tracking.failure"),
						true
					);
				};
				setListFormState({
					...listFormState,
					open: true,
					onSelect: handleTransitSelect,
					title: t("views.satellites.actions.set_tracking.forecast_list.title", { name }),
					options: results.map((item) => [
						t("views.satellites.actions.set_tracking.forecast_list.template.title", {
							value: getTimeString(item!.startTime)
						}),
						JSON.stringify(item),
						t("views.satellites.actions.set_tracking.forecast_list.template.content", {
							startTime: getTimeString(item!.startTime),
							endTime: getTimeString(item!.endTime),
							entryAzimuth: item!.entryAzimuth.toFixed(2),
							exitAzimuth: item!.exitAzimuth.toFixed(2),
							maxElevation: item!.maxElevation.toFixed(2),
							isAscending: item!.isAscending
								? t("common.statement.ascending")
								: t("common.statement.descending"),
							gnssLatitude: item!.gnssLatitude.toFixed(5),
							gnssLongitude: item!.gnssLongitude.toFixed(5),
							gnssElevation: item!.gnssElevation.toFixed(2),
							elevationThreshold
						})
					])
				});
			} else {
				sendUserAlert(t("views.satellites.actions.set_tracking.forecast_empty"), true);
			}
		};
		setDialogFormState({
			...dialogFormState,
			open: true,
			title: t("views.satellites.actions.set_tracking.dialog.title", { name }),
			inputType: "number",
			defaultValue: "3",
			placeholder: t("views.satellites.actions.set_tracking.dialog.placeholder"),
			content: t("views.satellites.actions.set_tracking.dialog.content", { name }),
			onSubmit: (elevationThreshold: string) =>
				handleElevationSubmit(Number(elevationThreshold))
		});
	};

	// Handler for setting up Pan-Tilt
	const [getObservationById] = useGetObservationByIdLazyQuery();
	const [setPanTiltMutation] = useSetPanTiltMutation();
	const handleSetPanTilt = async (tleId: number, name: string) => {
		const result = (
			await sendPromiseAlert(
				getObservationById({
					variables: {
						tleId,
						elevationThreshold: 5,
						gnssLatitude: data!.getGnss.latitude,
						gnssLongitude: data!.getGnss.longitude,
						gnssElevation: data!.getGnss.elevation
					}
				}),
				t("views.satellites.actions.set_pan_tilt.observation_loading"),
				t("views.satellites.actions.set_pan_tilt.observation_success"),
				t("views.satellites.actions.set_pan_tilt.observation_failed"),
				true
			)
		)?.data?.getObservationById;
		if (!result?.observable) {
			sendUserAlert(
				t("views.satellites.actions.set_pan_tilt.not_observable", { value: name }),
				true
			);
			return;
		}
		const handleConfirm = async () => {
			await sendPromiseAlert(
				setPanTiltMutation({
					variables: { newPan: result.azimuth, newTilt: 90 - result.elevation }
				}),
				t("views.satellites.actions.set_pan_tilt.loading"),
				t("views.satellites.actions.set_pan_tilt.success"),
				t("views.satellites.actions.set_pan_tilt.failure"),
				true
			);
		};
		sendUserConfirm(
			t("views.satellites.actions.set_pan_tilt.confirm.content", {
				name,
				azimuth: result.azimuth.toFixed(2),
				elevation: result.elevation.toFixed(2)
			}),
			{
				title: t("views.satellites.actions.set_pan_tilt.confirm.title"),
				cancelText: t("common.confirm.cancel"),
				confirmText: t("common.confirm.confirm"),
				onConfirmed: handleConfirm,
				onCancelled: () =>
					sendUserAlert(t("views.satellites.actions.set_pan_tilt.confirm.cancel"), true)
			}
		);
	};

	// Handler for copying TLE data
	const handleCopyTLE = async (tleData: string) => {
		await setClipboardText(tleData);
		sendUserAlert(t("views.satellites.actions.copy_tle.success"), false);
	};

	// Handler for updating TLE record
	const [updateTleById] = useUpdateTleByIdMutation();
	const handleUpdateTLE = async (tleId: number, name: string) => {
		const handleSubmit = async (tleData: string) => {
			handleDialogFormClose();
			const result = (
				await sendPromiseAlert(
					updateTleById({ variables: { tleData, tleId } }),
					t("views.satellites.actions.update_tle.loading"),
					t("views.satellites.actions.update_tle.success"),
					t("views.satellites.actions.update_tle.failure"),
					true
				)
			)?.data?.updateTLEById;
			if (result) {
				// Refresh the search result after updating
				await handleSearchSatellite(satelliteSearchState.keyword);
			}
		};
		setDialogFormState({
			...dialogFormState,
			open: true,
			title: t("views.satellites.actions.update_tle.dialog.title"),
			inputType: "textarea",
			placeholder: t("views.satellites.actions.update_tle.dialog.placeholder"),
			content: t("views.satellites.actions.update_tle.dialog.content", { name }),
			onSubmit: handleSubmit
		});
	};

	// Handler for deleting TLE record
	const [deleteTleById] = useDeleteTleByIdMutation();
	const handleDeleteTLE = (tleId: number) => {
		const handleConfirm = async () => {
			await sendPromiseAlert(
				deleteTleById({ variables: { tleId } }),
				t("views.satellites.actions.delete_tle.loading"),
				t("views.satellites.actions.delete_tle.success"),
				t("views.satellites.actions.delete_tle.failure"),
				true
			);
			setSatelliteSearchState((prev) => ({
				...prev,
				result: prev.result.filter((val) => val!.id !== tleId)
			}));
		};
		sendUserConfirm(t("views.satellites.actions.delete_tle.confirm.content"), {
			title: t("views.satellites.actions.delete_tle.confirm.title"),
			confirmText: t("common.confirm.confirm"),
			cancelText: t("common.confirm.cancel"),
			onConfirmed: handleConfirm,
			onCancelled: () =>
				sendUserAlert(t("views.satellites.actions.delete_tle.confirm.cancel"), true)
		});
	};

	return !error ? (
		<div className="animate-fade p-8 min-h-screen space-y-8">
			<div className="flex flex-col sm:flex-row justify-between gap-6">
				<div className="flex flex-row space-x-4 sm:whitespace-nowrap">
					<FileInputButton
						className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
						onFileSelected={handleImportTLEs}
					>
						{t("views.satellites.list.buttons.import")}
					</FileInputButton>
					<button
						className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800"
						onClick={handleAddNewTLE}
					>
						{t("views.satellites.list.buttons.add_new")}
					</button>
					<button
						className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
						onClick={handleSimulateTrack}
					>
						{t("views.satellites.list.buttons.simulate")}
					</button>
				</div>

				<Formik
					initialValues={{ keyword: "" }}
					onSubmit={async ({ keyword }, { setSubmitting }) => {
						await handleSearchSatellite(keyword.toLocaleUpperCase());
						setSubmitting(false);
					}}
				>
					{({ isSubmitting }) => (
						<Form className="flex flex-row space-x-2">
							<Field
								type="search"
								name="keyword"
								className="ps-3 w-full min-w-32 md:w-64 py-2 text-sm text-gray-900 border focus:outline-none border-gray-300 rounded-lg bg-gray-50 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
								placeholder={t("views.satellites.actions.search.placeholder")}
								required
							/>
							<button
								className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm p-2 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:cursor-not-allowed"
								disabled={isSubmitting}
								type="submit"
							>
								<Icon className="text-white" path={mdiMagnify} size={1} />
							</button>
						</Form>
					)}
				</Formik>
			</div>

			<p className="mt-6 font-medium text-gray-400">{t("views.satellites.list.prompt")}</p>

			<TableList
				locale={locale}
				columns={[
					{
						field: "id",
						headerName: t("views.satellites.list.labels.satellite_id"),
						hideable: false,
						minWidth: 150
					},
					{
						field: "name",
						headerName: t("views.satellites.list.labels.satellite_name"),
						hideable: false,
						minWidth: 150
					},
					{
						field: "epochTime",
						headerName: t("views.satellites.list.labels.epoch_time"),
						minWidth: 160,
						renderCell: ({ value }) => getTimeString(value)
					},
					{
						field: "createdAt",
						headerName: t("views.satellites.list.labels.created_at"),
						minWidth: 160,
						renderCell: ({ value }) => getTimeString(value)
					},
					{
						field: "updatedAt",
						headerName: t("views.satellites.list.labels.updated_at"),
						minWidth: 160,
						renderCell: ({ value }) => getTimeString(value)
					},
					{
						field: "geostationary",
						headerName: t("views.satellites.list.labels.geostationary"),
						resizable: false,
						minWidth: 130,
						renderCell: ({ value }) =>
							value ? t("common.statement.yes") : t("common.statement.no"),
						sortComparator: (v1, v2) => (v1 === v2 ? 0 : v1 ? -1 : 1)
					},
					{
						field: "actions",
						headerName: t("views.satellites.list.labels.actions"),
						sortable: false,
						hideable: false,
						resizable: false,
						minWidth: 330,
						renderCell: ({ row }) => (
							<div className="flex flex-row space-x-4 w-full">
								<button
									className="text-blue-700 dark:text-blue-400 hover:opacity-50"
									onClick={() => {
										if (row.geostationary) {
											handleSetPanTilt(row.id, row.name);
										} else {
											handleGetForecast(row.id, row.name);
										}
									}}
								>
									{row.geostationary
										? t("views.satellites.list.buttons.set_pan_tilt")
										: t("views.satellites.list.buttons.set_tracking")}
								</button>
								<button
									className="text-blue-700 dark:text-blue-400 hover:opacity-50"
									onClick={() => {
										handleCopyTLE(`${row.line_1}\n${row.line_2}`);
									}}
								>
									{t("views.satellites.list.buttons.copy_tle")}
								</button>
								<button
									className="text-blue-700 dark:text-blue-400 hover:opacity-50"
									onClick={() => {
										handleUpdateTLE(row.id, row.name);
									}}
								>
									{t("views.satellites.list.buttons.update_tle")}
								</button>
								<button
									className="text-red-700 dark:text-red-400 hover:opacity-50"
									onClick={() => {
										handleDeleteTLE(row.id);
									}}
								>
									{t("views.satellites.list.buttons.delete_tle")}
								</button>
							</div>
						)
					}
				]}
				data={satelliteSearchState.result.map((row) => ({
					id: row!.id,
					name: row!.name,
					epochTime: row!.epochTime,
					createdAt: row!.createdAt,
					updatedAt: row!.updatedAt,
					geostationary: row!.geostationary,
					line_1: row!.line_1,
					line_2: row!.line_2
				}))}
				onSelect={handleSelectSatellites}
			/>

			<Panel heading={t("views.satellites.panels.simulate")}>
				<Viewer
					sceneModePicker={false}
					className="h-[calc(100vh-250px)]"
					ref={setCesiumViewerRef}
					infoBox={false}
					timeline={true}
					vrButton={false}
					geocoder={false}
					animation={true}
					homeButton={false}
					baseLayerPicker={false}
					fullscreenButton={false}
					navigationHelpButton={false}
					baseLayer={
						new ImageryLayer(
							new UrlTemplateImageryProvider({
								url: "/tiles/{z}/{x}/{y}.webp",
								maximumLevel: 7,
								minimumLevel: 0
							}),
							{
								gamma: 0.8,
								minificationFilter: TextureMinificationFilter.NEAREST
							}
						)
					}
					creditContainer={document.createElement("div")}
					scene3DOnly
					shouldAnimate
				/>
			</Panel>

			<DialogForm {...dialogFormState} />
			<ListForm {...listFormState} />
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Satellites;
