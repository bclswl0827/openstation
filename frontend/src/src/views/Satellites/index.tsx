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
		cancelText: "取消",
		submitText: "确定",
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
			sendUserAlert("文件过大，请确保文件小于 5 MB", true);
			return;
		}
		const handleConfirm = async (tleData: string) => {
			const result = (
				await sendPromiseAlert(
					importTlEsMutation({ variables: { tleData } }),
					"数据导入中",
					"导入完成",
					"导入失败",
					true
				)
			)?.data?.importTLEs;
			sendUserAlert(`导入结束，${result ?? 0} 条记录导入失败`);
			// If the search keyword is not empty, refresh the search result
			if (satelliteSearchState.keyword.length) {
				await handleSearchSatellite(satelliteSearchState.keyword);
			}
		};
		const reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = ({ target }) => {
			if ((target!.result as string).includes("\0")) {
				sendUserAlert("文件格式错误，请确保文件为纯文本文件", true);
				return;
			}
			sendUserConfirm("导入 TLE 数据会覆盖现有数据，是否继续？", {
				title: "确认操作",
				cancelText: "取消",
				confirmText: "继续",
				onConfirmed: () => handleConfirm(target!.result as string),
				onCancelled: () => sendUserAlert("导入操作已取消", true)
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
				"新增记录中",
				"添加成功",
				"添加失败",
				true
			);
		};
		setDialogFormState({
			...dialogFormState,
			open: true,
			title: "新增 TLE",
			inputType: "textarea",
			placeholder: "输入一组 TLE 数据",
			content:
				"输入一组 TLE 数据，包含卫星名字、TLE 第一行、TLE 第二行，每行之间使用换行分隔",
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
	const handlePreviewTrack = () => {
		if (selectedSatellites.length > 10) {
			sendUserAlert("最多选择 10 个卫星进行预览", true);
			return;
		} else if (!selectedSatellites.length) {
			sendUserAlert("请选择至少一个卫星预览轨道", true);
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
		sendUserAlert(`成功为 ${selectedSatellites.length} 个卫星生成了轨道预览`, false);
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
				"搜索中",
				"搜索完成",
				"搜索失败",
				true
			)
		)?.data?.getTLEsByKeyword;
		if (result?.length) {
			setSatelliteSearchState({ keyword, result });
			sendUserAlert(`找到 ${result.length} 个卫星`, false);
		} else {
			sendUserAlert("未找到相关卫星", true);
		}
	};

	// Handler for getting forecast data
	const [getForecastById] = useGetForecastByIdLazyQuery();
	const [addNewTaskMutation] = useAddNewTaskMutation();
	const handleGetForecast = (tleId: number, name: string) => {
		const handleElevationSubmit = async (elevationThreshold: number) => {
			handleDialogFormClose();
			if (elevationThreshold < 5 || elevationThreshold > 90) {
				sendUserAlert("仰角门限应在 5 到 90 度之间", true);
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
					"正在生成卫星过境预测数据",
					"预测完成",
					"预测出错",
					true
				)
			)?.data?.getForecastById;
			// Open list form if results are more than 0
			if (results?.length) {
				sendUserAlert(`查询到 ${results.length} 个 过境事件`, false);
				const handleTransitSelect = async (value: string) => {
					handleListFormClose();
					const valueObj = (JSON.parse(
						value
					) as GetForecastByIdQuery["getForecastById"][number])!;
					await sendPromiseAlert(
						addNewTaskMutation({
							variables: { tleId, elevationThreshold, ...valueObj }
						}),
						"正在添加任务",
						"任务添加成功",
						"任务添加失败",
						true
					);
				};
				setListFormState({
					...listFormState,
					open: true,
					onSelect: handleTransitSelect,
					title: `${name} 未来 24 小时过境事件`,
					options: results.map((item) => [
						`${getTimeString(item!.startTime)} 过境事件`,
						JSON.stringify(item),
						`入境时间 ${getTimeString(item!.startTime)}\n出境时间 ${getTimeString(
							item!.endTime
						)}\n入境方位 ${item!.entryAzimuth.toFixed(
							2
						)}\n出境方位 ${item!.exitAzimuth.toFixed(
							2
						)}\n最大仰角 ${item!.maxElevation.toFixed(2)}\n升降类型 ${
							item!.isAscending ? "升轨" : "降轨"
						}\n观测坐标 ${item!.gnssLatitude.toFixed(5)}, ${item!.gnssLongitude.toFixed(
							5
						)}\n观测高程 ${item!.gnssElevation.toFixed(
							2
						)}\n仰角门限 ${elevationThreshold}°`
					])
				});
			} else {
				sendUserAlert("未来 24 小时没有过境事件", true);
			}
		};
		setDialogFormState({
			...dialogFormState,
			open: true,
			title: `${name} 过境预测`,
			inputType: "number",
			defaultValue: "5",
			placeholder: "输入入境仰角门限",
			content: "输入入境仰角门限，单位为度",
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
				"正在取得观测数据",
				"观测数据取得完成",
				"观测数据取得失败",
				true
			)
		)?.data?.getObservationById;
		if (!result?.observable) {
			sendUserAlert(`${name} 在此位置无法跟踪`, true);
			return;
		}
		const handleConfirm = async () => {
			await sendPromiseAlert(
				setPanTiltMutation({
					variables: { newPan: result.azimuth, newTilt: 90 - result.elevation }
				}),
				"正在对准卫星",
				"指令发送成功",
				"指令发送失败",
				true
			);
		};
		sendUserConfirm(
			`转台即将对准 ${name}，方位角 ${result.azimuth.toFixed(2)}，仰角 ${result.elevation.toFixed(2)}，是否继续？`,
			{
				title: "确认操作",
				confirmText: "确定",
				cancelText: "取消",
				onConfirmed: handleConfirm,
				onCancelled: () => sendUserAlert("删除操作已取消", true)
			}
		);
	};

	// Handler for copying TLE data
	const handleCopyTLE = async (tleData: string) => {
		await setClipboardText(tleData);
		sendUserAlert("TLE 数据已复制到剪贴板", false);
	};

	// Handler for updating TLE record
	const [updateTleById] = useUpdateTleByIdMutation();
	const handleUpdateTLE = async (tleId: number, name: string) => {
		const handleSubmit = async (tleData: string) => {
			handleDialogFormClose();
			const result = (
				await sendPromiseAlert(
					updateTleById({ variables: { tleData, tleId } }),
					"更新记录中",
					"更新成功",
					"更新失败",
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
			title: "更新 TLE",
			inputType: "textarea",
			placeholder: "输入新的 TLE 数据",
			content: `正在更新 ${name} 的 TLE 数据，请输入新的 TLE 数据`,
			onSubmit: handleSubmit
		});
	};

	// Handler for deleting TLE record
	const [deleteTleById] = useDeleteTleByIdMutation();
	const handleDeleteTLE = (tleId: number) => {
		const handleConfirm = async () => {
			await sendPromiseAlert(
				deleteTleById({ variables: { tleId } }),
				"删除记录中",
				"删除成功",
				"删除失败",
				true
			);
			setSatelliteSearchState((prev) => ({
				...prev,
				result: prev.result.filter((val) => val!.id !== tleId)
			}));
		};
		sendUserConfirm("是否删除该条 TLE 记录？", {
			title: "确认操作",
			confirmText: "删除",
			cancelText: "取消",
			onConfirmed: handleConfirm,
			onCancelled: () => sendUserAlert("删除操作已取消", true)
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
						导入 TLE
					</FileInputButton>
					<button
						className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800"
						onClick={handleAddNewTLE}
					>
						新增 TLE
					</button>
					<button
						className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
						onClick={handlePreviewTrack}
					>
						预览轨道
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
								placeholder="Input satellite name or ID"
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

			<p className="mt-6 font-medium text-gray-400">
				请输入卫星关键字或 ID 以查询，卫星数据将显示于表格
			</p>

			<TableList
				locale={locale}
				columns={[
					{
						field: "id",
						headerName: "NORAD ID",
						hideable: false,
						minWidth: 150
					},
					{
						field: "name",
						headerName: "卫星名称",
						hideable: false,
						minWidth: 150
					},
					{
						field: "epochTime",
						headerName: "星历时间",
						minWidth: 160,
						renderCell: ({ value }) => getTimeString(value)
					},
					{
						field: "createdAt",
						headerName: "创建时间",
						minWidth: 160,
						renderCell: ({ value }) => getTimeString(value)
					},
					{
						field: "updatedAt",
						headerName: "更新时间",
						minWidth: 160,
						renderCell: ({ value }) => getTimeString(value)
					},
					{
						field: "geostationary",
						headerName: "同步卫星",
						resizable: false,
						minWidth: 130,
						renderCell: ({ value }) => (value ? "是" : "否"),
						sortComparator: (v1, v2) => (v1 === v2 ? 0 : v1 ? -1 : 1)
					},
					{
						field: "actions",
						headerName: "操作",
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
									{row.geostationary ? "设定转台" : "添加排程"}
								</button>
								<button
									className="text-blue-700 dark:text-blue-400 hover:opacity-50"
									onClick={() => {
										handleCopyTLE(`${row.line_1}\n${row.line_2}`);
									}}
								>
									复制 TLE
								</button>
								<button
									className="text-blue-700 dark:text-blue-400 hover:opacity-50"
									onClick={() => {
										handleUpdateTLE(row.id, row.name);
									}}
								>
									更新 TLE
								</button>
								<button
									className="text-red-700 dark:text-red-400 hover:opacity-50"
									onClick={() => {
										handleDeleteTLE(row.id);
									}}
								>
									移除 TLE
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

			<Panel heading="轨道预览">
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
