import { Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { useEffect, useState } from "react";

import { Error } from "../../components/Error";
import { Panel } from "../../components/Panel";
import {
	useGetData4DebugQuery,
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

	const [rebootSystemMutation] = useRebootSystemMutation();
	const handleRebootSystem = async () => {
		const { errors } = await rebootSystemMutation();
		sendUserAlert(errors ? "执行失败" : "执行成功", !!errors);
	};

	const [setPanTiltToNorth] = useSetPanTiltToNorthMutation();
	const handleSetPanTiltToNorth = async () => {
		const { errors } = await setPanTiltToNorth();
		sendUserAlert(errors ? "执行失败" : "执行成功", !!errors);
	};

	const [purgeTaskQueue] = usePurgeTaskQueueMutation();
	const handlePurgeTaskQueue = async () => {
		const { errors } = await purgeTaskQueue();
		sendUserAlert(errors ? "执行失败" : "执行成功", !!errors);
	};

	const [purgeTleRecordsMutation] = usePurgeTleRecordsMutation();
	const handlePurgeTLERecords = async () => {
		const { errors } = await purgeTleRecordsMutation();
		sendUserAlert(errors ? "执行失败" : "执行成功", !!errors);
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
		}
	]);

	// States for all components
	const [diagnoseRows, setDiagnoseRows] = useState({
		// GNSS related data
		gnssTimestamp: { name: "GNSS 当前时间", value: "" },
		gnssLongitude: { name: "GNSS 当前经度", value: "" },
		gnssLatitude: { name: "GNSS 当前纬度", value: "" },
		gnssElevation: { name: "GNSS 当前高程", value: "" },
		gnssTrueAzimuth: { name: "GNSS 真北方位", value: "" },
		gnssSatellites: { name: "GNSS 卫星数量", value: "" },
		gnssDataQuality: { name: "GNSS 解算方法", value: "" },
		// Pan-Tilt related data
		panTiltIsBusy: { name: "转台当前状态", value: "" },
		panTiltCurrentPan: { name: "转台方位角", value: "" },
		panTiltCurrentTilt: { name: "转台俯仰角", value: "" },
		panTiltNorthOffset: { name: "转台北偏角", value: "" },
		// System resource usage
		systemCPUUsage: { name: "CPU 占用百分比", value: "" },
		systemMemUsage: { name: "RAM 占用百分比", value: "" },
		systemDiskUsage: { name: "磁盘占用百分比", value: "" },
		systemTimestamp: { name: "系统 RTC 时间", value: "" },
		systemUptime: { name: "站控系统运行时长", value: "" },
		// System information
		systemIP: { name: "设备 IP 地址", value: "" },
		systemHostname: { name: "设备主机名称", value: "" },
		systemRelease: { name: "设备内核版本号", value: "" },
		systemArch: { name: "设备 CPU 架构", value: "" }
	});

	// Polling debug data
	const { data, error, loading } = useGetData4DebugQuery({ pollInterval: 3000 });
	useEffect(() => {
		if (!error && !loading) {
			const { getGnss, getPanTilt, getSystem } = data!;
			setDiagnoseRows((prev) => ({
				...prev,
				gnssTimestamp: { ...prev.gnssTimestamp, value: getTimeString(getGnss.timestamp) },
				gnssLongitude: {
					...prev.gnssLongitude,
					value: `${getGnss.longitude.toFixed(5)} °`
				},
				gnssLatitude: { ...prev.gnssLatitude, value: `${getGnss.latitude.toFixed(5)} °` },
				gnssElevation: {
					...prev.gnssElevation,
					value: `${getGnss.elevation.toFixed(5)} °`
				},
				gnssTrueAzimuth: {
					...prev.gnssTrueAzimuth,
					value: `${getGnss.trueAzimuth.toFixed(2)} °`
				},
				gnssSatellites: { ...prev.gnssSatellites, value: String(getGnss.satellites) },
				gnssDataQuality: {
					...prev.gnssDataQuality,
					value:
						getGnss.dataQuality !== 0
							? getGnss.dataQuality === 4
								? "RTK Fix"
								: "RTK Float"
							: "Invalid"
				},
				panTiltIsBusy: {
					...prev.panTiltIsBusy,
					value: getPanTilt.isBusy ? "繁忙" : "就绪"
				},
				panTiltCurrentPan: {
					...prev.panTiltCurrentPan,
					value: `${getPanTilt.currentPan.toFixed(2)} °`
				},
				panTiltCurrentTilt: {
					...prev.panTiltCurrentTilt,
					value: `${getPanTilt.currentTilt.toFixed(2)} °`
				},
				panTiltNorthOffset: {
					...prev.panTiltNorthOffset,
					value: `${getPanTilt.northOffset.toFixed(2)} °`
				},
				systemCPUUsage: {
					...prev.systemCPUUsage,
					value: `${getSystem.cpuUsage.toFixed(2)} %`
				},
				systemMemUsage: {
					...prev.systemMemUsage,
					value: `${getSystem.memUsage.toFixed(2)} %`
				},
				systemDiskUsage: {
					...prev.systemDiskUsage,
					value: `${getSystem.diskUsage.toFixed(2)} %`
				},
				systemTimestamp: {
					...prev.systemTimestamp,
					value: getTimeString(getSystem.timestamp)
				},
				systemUptime: { ...prev.systemUptime, value: `${getSystem.uptime} s` },
				systemIP: { ...prev.systemIP, value: getSystem.ip.join(", ") },
				systemHostname: { ...prev.systemHostname, value: getSystem.hostname },
				systemArch: { ...prev.systemArch, value: getSystem.arch },
				systemRelease: { ...prev.systemRelease, value: getSystem.release }
			}));
		}
	}, [data, error, loading]);

	return !error ? (
		<div className="animate-fade p-8 space-y-4 min-h-screen">
			<Panel heading="系统资讯">
				<TableContainer>
					<Table>
						<TableBody>
							{Object.values(diagnoseRows).map((row, index) => (
								<TableRow key={index}>
									<TableCell>{row.name}</TableCell>
									<TableCell>{row.value}</TableCell>
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
									handleControl(confirm.title, confirm.message, onClick);
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
									handleControl(confirm.title, confirm.message, onClick);
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
