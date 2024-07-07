import { Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();

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
			cancelText: t("common.confirm.cancel"),
			confirmText: t("common.confirm.confirm"),
			onConfirmed: callback
		});
	};

	const [setPanTiltToNorth] = useSetPanTiltToNorthMutation();
	const handleSetPanTiltToNorth = async () => {
		const { errors } = await setPanTiltToNorth();
		sendUserAlert(
			errors
				? t("views.debug.actions.set_north.failure")
				: t("views.debug.actions.set_north.success"),
			!!errors
		);
	};

	const [rebootSystemMutation] = useRebootSystemMutation();
	const handleRebootSystem = async () => {
		const { errors } = await rebootSystemMutation();
		sendUserAlert(
			errors
				? t("views.debug.actions.reboot.failure")
				: t("views.debug.actions.reboot.success"),
			!!errors
		);
	};

	const [purgeTaskQueue] = usePurgeTaskQueueMutation();
	const handlePurgeTaskQueue = async () => {
		const { errors } = await purgeTaskQueue();
		sendUserAlert(
			errors
				? t("views.debug.actions.purge_tasks.failure")
				: t("views.debug.actions.purge_tasks.success"),
			!!errors
		);
	};

	const [purgeTleRecordsMutation] = usePurgeTleRecordsMutation();
	const handlePurgeTLERecords = async () => {
		const { errors } = await purgeTleRecordsMutation();
		sendUserAlert(
			errors
				? t("views.debug.actions.purge_tle.failure")
				: t("views.debug.actions.purge_tle.success"),
			!!errors
		);
	};

	// Actions for all components
	const [commonControls] = useState([
		{
			button: t("views.debug.list.buttons.set_north"),
			onClick: handleSetPanTiltToNorth,
			description: t("views.debug.actions.set_north.description"),
			confirm: {
				title: t("views.debug.actions.set_north.confirm.title"),
				message: t("views.debug.actions.set_north.confirm.content")
			}
		},
		{
			button: t("views.debug.list.buttons.reboot"),
			onClick: handleRebootSystem,
			description: t("views.debug.actions.reboot.description"),
			confirm: {
				title: t("views.debug.actions.reboot.confirm.title"),
				message: t("views.debug.actions.reboot.confirm.content")
			}
		}
	]);
	const [dangerControls] = useState([
		{
			button: t("views.debug.list.buttons.purge_tasks"),
			onClick: handlePurgeTaskQueue,
			description: t("views.debug.actions.purge_tasks.description"),
			confirm: {
				title: t("views.debug.actions.purge_tasks.confirm.title"),
				message: t("views.debug.actions.purge_tasks.confirm.content")
			}
		},
		{
			button: t("views.debug.list.buttons.purge_tle"),
			onClick: handlePurgeTLERecords,
			description: t("views.debug.actions.purge_tle.description"),
			confirm: {
				title: t("views.debug.actions.purge_tle.confirm.title"),
				message: t("views.debug.actions.purge_tle.confirm.content")
			}
		}
	]);

	// States for all components
	const [diagnoseRows, setDiagnoseRows] = useState({
		// GNSS related data
		gnssTimestamp: { name: t("views.debug.list.labels.gnss_timestamp"), value: "" },
		gnssLongitude: { name: t("views.debug.list.labels.gnss_longitude"), value: "" },
		gnssLatitude: { name: t("views.debug.list.labels.gnss_latitude"), value: "" },
		gnssElevation: { name: t("views.debug.list.labels.gnss_elevation"), value: "" },
		gnssTrueAzimuth: { name: t("views.debug.list.labels.gnss_azimuth"), value: "" },
		gnssSatellites: { name: t("views.debug.list.labels.gnss_satellites"), value: "" },
		gnssDataQuality: { name: t("views.debug.list.labels.gnss_data_quality"), value: "" },
		// Pan-Tilt related data
		panTiltIsBusy: { name: t("views.debug.list.labels.pan_tilt_busy"), value: "" },
		panTiltCurrentPan: { name: t("views.debug.list.labels.pan_tilt_pan"), value: "" },
		panTiltCurrentTilt: { name: t("views.debug.list.labels.pan_tilt_tilt"), value: "" },
		panTiltNorthOffset: { name: t("views.debug.list.labels.pan_tilt_offset"), value: "" },
		// System resource usage
		systemCPUUsage: { name: t("views.debug.list.labels.cpu_usage"), value: "" },
		systemMemUsage: { name: t("views.debug.list.labels.mem_usage"), value: "" },
		systemDiskUsage: { name: t("views.debug.list.labels.disk_usage"), value: "" },
		systemTimestamp: { name: t("views.debug.list.labels.system_timestamp"), value: "" },
		systemUptime: { name: t("views.debug.list.labels.system_uptime"), value: "" },
		// System information
		systemIP: { name: t("views.debug.list.labels.system_ip"), value: "" },
		systemHostname: { name: t("views.debug.list.labels.system_hostname"), value: "" },
		systemRelease: { name: t("views.debug.list.labels.system_release"), value: "" },
		systemArch: { name: t("views.debug.list.labels.system_arch"), value: "" }
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
					value: getPanTilt.isBusy
						? t("common.statement.busy")
						: t("common.statement.ready")
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
	}, [t, data, error, loading]);

	return !error ? (
		<div className="animate-fade p-8 space-y-4 min-h-screen">
			<Panel heading={t("views.debug.panels.diagnose")}>
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

			<Panel className="space-y-4" heading={t("views.debug.panels.advanced")}>
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

			<Panel className="space-y-4" heading={t("views.debug.panels.dangerous")}>
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
