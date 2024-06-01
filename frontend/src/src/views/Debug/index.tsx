import { Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { useEffect, useState } from "react";

import { Error } from "../../components/Error";
import { Panel } from "../../components/Panel";
import {
	useGetDebugDataQuery,
	usePurgeForecastRecordsMutation,
	usePurgeTaskQueueMutation,
	usePurgeTleRecordsMutation,
	useRebootSystemMutation,
	useSetPanTiltToNorthMutation
} from "../../graphql";
import { sendUserAlert } from "../../helpers/interact/sendUserAlert";
import { sendUserConfirm } from "../../helpers/interact/sendUserConfirm";
import { getTimeString } from "../../helpers/utils/getTimeString";

const Diagnose = () => {
	const getButtonColor = (index: number, danger: boolean) => {
		const colors = [
			"bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
			"bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800",
			"bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800",
			"bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800",
			"bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
			"bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800"
		];
		return danger
			? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
			: colors[index % colors.length];
	};

	const handleControl = (title: string, message: string, callback: () => void) => {
		sendUserConfirm(message, {
			title,
			cancelText: "取消",
			confirmText: "确认",
			onConfirmed: callback
		});
	};

	const [rebootSystemMutation, { error: rebootSystemMutationError }] = useRebootSystemMutation();

	const handleRebootSystem = async () => {
		await rebootSystemMutation();
		sendUserAlert(
			rebootSystemMutationError ? "执行失败" : "执行成功",
			!!rebootSystemMutationError
		);
	};

	const [setPanTiltToNorth, { error: setPanTiltToNorthError }] = useSetPanTiltToNorthMutation();

	const handleSetPanTiltToNorth = async () => {
		await setPanTiltToNorth();
		sendUserAlert(setPanTiltToNorthError ? "执行失败" : "执行成功", !!setPanTiltToNorthError);
	};

	const [purgeTaskQueue, { error: purgeTaskQueueError }] = usePurgeTaskQueueMutation();

	const handlePurgeTaskQueue = async () => {
		await purgeTaskQueue();
		sendUserAlert(purgeTaskQueueError ? "执行失败" : "执行成功", !!purgeTaskQueueError);
	};

	const [purgeTleRecordsMutation, { error: purgeTleRecordsMutationError }] =
		usePurgeTleRecordsMutation();

	const handlePurgeTLERecords = async () => {
		await purgeTleRecordsMutation();
		sendUserAlert(
			purgeTleRecordsMutationError ? "执行失败" : "执行成功",
			!!purgeTleRecordsMutationError
		);
	};

	const [purgeForecastRecords, { error: purgeForecastRecordsError }] =
		usePurgeForecastRecordsMutation();

	const handlePurgeForecastRecords = async () => {
		await purgeForecastRecords();
		sendUserAlert(
			purgeForecastRecordsError ? "执行失败" : "执行成功",
			!!purgeForecastRecordsError
		);
	};

	// Actions for all components
	const [commonControls] = useState([
		{
			button: "定北",
			onClick: handleSetPanTiltToNorth,
			description: "若转台跟踪卫星时星偏差较大，可以重新执行转台定北",
			confirm: {
				title: "确认操作",
				message: "定北需要 1 分钟左右，请保证周围空旷，是否确认执行此操作？"
			}
		},
		{
			button: "重启",
			onClick: handleRebootSystem,
			description: "点击此按钮将重启站控服务器",
			confirm: {
				title: "确认操作",
				message: "重启操作将导致站控服务器断开连接，是否确认执行此操作？"
			}
		}
	]);
	const [dangerControls] = useState([
		{
			button: "清理所有排程",
			onClick: handlePurgeTaskQueue,
			description: "此操作将清空所有排程，请谨慎操作",
			confirm: {
				title: "这是一个危险操作",
				message: "此操作将清空所有排程，是否确认执行此操作？"
			}
		},
		{
			button: "清理所有 TLE",
			onClick: handlePurgeTLERecords,
			description: "此操作将清空所有卫星 TLE 数据，请谨慎操作",
			confirm: {
				title: "这是一个危险操作",
				message: "此操作将清空所有卫星 TLE 数据，是否确认执行此操作？"
			}
		},
		{
			button: "清理所有过境预报",
			onClick: handlePurgeForecastRecords,
			description: "此操作将清理所有卫星过境预报数据，请谨慎操作",
			confirm: {
				title: "这是一个危险操作",
				message: "此操作将清理所有卫星过境预报数据，是否确认执行此操作？"
			}
		}
	]);

	// States for all components
	const [diagnoseRows, setDiagnoseRows] = useState({
		gnssDataQuality: { name: "RTK 解算方式", value: "" },
		gnssLatitude: { name: "当前纬度", value: "" },
		gnssLongitude: { name: "当前经度", value: "" },
		gnssElevation: { name: "当前高程", value: "" },
		gnssSatellites: { name: "GNSS 解算卫星", value: "" },
		gnssTimestamp: { name: "GNSS 时间戳", value: "" },
		gnssTrueAzimuth: { name: "真北方位角", value: "" },
		panTiltCurrentPan: { name: "转台方位", value: "" },
		panTiltCurrentTilt: { name: "转台俯仰", value: "" },
		panTiltNorthOffset: { name: "转台真北偏角", value: "" },
		panTiltIsBusy: { name: "转台状态", value: "" },
		systemArch: { name: "系统架构", value: "" },
		systemCPUUsage: { name: "CPU 占用", value: "" },
		systemMemUsage: { name: "内存占用", value: "" },
		systemDiskUsage: { name: "磁盘占用", value: "" },
		systemHostname: { name: "系统主机名", value: "" },
		systemIP: { name: "IP 地址", value: "" },
		systemTimestamp: { name: "系统时间戳", value: "" },
		systemRelease: { name: "系统版本", value: "" },
		systemUptime: { name: "在线时长", value: "" }
	});

	// Polling debug data
	const { data, error, loading } = useGetDebugDataQuery({ pollInterval: 3000 });

	useEffect(() => {
		if (!error && !loading) {
			const { getGnss, getPanTilt, getSystem } = data!;
			// console.log(data);
			setDiagnoseRows((prev) => ({
				...prev,
				gnssDataQuality: {
					name: "RTK 解算方式",
					value: getGnss.dataQuality === 4 ? "RTK Fixed" : "RTK Float"
				},
				gnssLatitude: { ...prev.gnssLatitude, value: String(getGnss.latitude) },
				gnssLongitude: { ...prev.gnssLongitude, value: String(getGnss.longitude) },
				gnssElevation: { ...prev.gnssElevation, value: String(getGnss.elevation) },
				gnssSatellites: { ...prev.gnssSatellites, value: String(getGnss.satellites) },
				gnssTimestamp: { ...prev.gnssTimestamp, value: getTimeString(getGnss.timestamp) },
				gnssTrueAzimuth: { ...prev.gnssTrueAzimuth, value: String(getGnss.trueAzimuth) },
				panTiltCurrentPan: {
					...prev.panTiltCurrentPan,
					value: String(getPanTilt.currentPan)
				},
				panTiltCurrentTilt: {
					...prev.panTiltCurrentTilt,
					value: String(getPanTilt.currentTilt)
				},
				panTiltNorthOffset: {
					...prev.panTiltNorthOffset,
					value: String(getPanTilt.northOffset)
				},
				panTiltIsBusy: { name: "转台正北偏角", value: getPanTilt.isBusy ? "正忙" : "空闲" },
				systemArch: { ...prev.systemArch, value: getSystem.arch },
				systemCPUUsage: { ...prev.systemCPUUsage, value: String(getSystem.cpuUsage) },
				systemMemUsage: { ...prev.systemMemUsage, value: String(getSystem.memUsage) },
				systemDiskUsage: { ...prev.systemDiskUsage, value: String(getSystem.diskUsage) },
				systemHostname: { ...prev.systemHostname, value: getSystem.hostname },
				systemIP: { ...prev.systemIP, value: getSystem.ip.join(", ") },
				systemTimestamp: {
					...prev.systemTimestamp,
					value: getTimeString(getSystem.timestamp)
				},
				systemRelease: { ...prev.systemRelease, value: getSystem.release },
				systemUptime: { ...prev.systemUptime, value: String(getSystem.uptime) }
			}));
		}
	}, [data, error, loading]);

	return !error ? (
		<div className="p-8 space-y-4">
			<Panel heading="系统资讯">
				<TableContainer>
					<Table>
						<TableBody>
							{Object.values(diagnoseRows).map((row, index) => (
								<TableRow key={index}>
									<TableCell>
										<span className="font-medium text-gray-700 dark:text-gray-400">
											{row.name}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-gray-700 dark:text-gray-400">
											{row.value}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Panel>

			<Panel className="space-y-4" heading="装置控制">
				{commonControls.map(({ button, description, onClick, confirm }, index) => (
					<div
						className="p-5 flex justify-between items-center rounded-md border dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
						key={index}
					>
						<p className="px-2">{description}</p>
						<div className="px-3 h-full shrink-0">
							<button
								className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${getButtonColor(index, false)}`}
								onClick={() => {
									void handleControl(confirm.title, confirm.message, onClick);
								}}
							>
								{button}
							</button>
						</div>
					</div>
				))}
			</Panel>

			<Panel className="space-y-4" heading="危险操作">
				{dangerControls.map(({ button, description, onClick, confirm }, index) => (
					<div
						className="p-5 flex justify-between items-center rounded-md border border-orange-400 dark:border-orange-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
						key={index}
					>
						<p className="px-2">{description}</p>
						<div className="px-3 h-full shrink-0">
							<button
								className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${getButtonColor(index, true)}`}
								onClick={() => {
									void handleControl(confirm.title, confirm.message, onClick);
								}}
							>
								{button}
							</button>
						</div>
					</div>
				))}
			</Panel>
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Diagnose;
