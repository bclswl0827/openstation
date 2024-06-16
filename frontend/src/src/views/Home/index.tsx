import {
	mdiArchive,
	mdiClockFast,
	mdiCompass,
	mdiCrosshairsGps,
	mdiReceiptClock,
	mdiSatelliteUplink,
	mdiSatelliteVariant
} from "@mdi/js";
import Icon from "@mdi/react";
import { HighchartsReactRefObject } from "highcharts-react-official";
import { RefObject, useEffect, useRef, useState } from "react";

import { Chart, ChartProps } from "../../components/Chart";
import { Error } from "../../components/Error";
import { Holder } from "../../components/Holder";
import { MapBox, MapBoxProps } from "../../components/MapBox";
import { useGetData4HomeQuery } from "../../graphql";

const RETENTION_THRESHOLD_MS = 1000 * 60 * 5;

const Home = () => {
	const getBadageColor = (index: number) => {
		const colors = [
			"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
			"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
			"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
			"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
			"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
			"bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
		];

		return colors[index % colors.length];
	};

	const getCardColor = (index: number) => {
		const colors = [
			"text-blue-500 dark:text-blue-700",
			"text-green-500 dark:text-green-700",
			"text-yellow-500 dark:text-yellow-700",
			"text-red-500 dark:text-red-700",
			"text-indigo-500 dark:text-indigo-700",
			"text-purple-500 dark:text-purple-700",
			"text-pink-500 dark:text-pink-700"
		];

		return colors[index % colors.length];
	};

	// States for all components
	const [stationInfo, setStationInfo] = useState<{
		name: string;
		location: string;
		remarks: string[];
		elevation: number;
		coordinates: [number, number];
	}>();
	const [cards, setCards] = useState({
		satellites: {
			value: 0,
			title: "Available Satellites",
			icon: mdiSatelliteVariant,
			unit: ""
		},
		gnssSatellites: { value: 0, title: "GNSS Satellites", icon: mdiCrosshairsGps, unit: "" },
		trueAzimuth: { value: 0, title: "Current Azimuth", icon: mdiCompass, unit: "°" },
		pendingTasks: { value: 0, title: "Pending Tasks", icon: mdiReceiptClock, unit: "" },
		totalTasks: { value: 0, title: "Total Tasks", icon: mdiArchive, unit: "" },
		clockOffset: { value: 0, title: "Clock Offset", icon: mdiClockFast, unit: "s" }
	});
	const [chartsState, setChartsState] = useState<
		Record<
			string,
			{
				title: string;
				content?: string;
				chart: ChartProps & {
					ref: RefObject<HighchartsReactRefObject>;
				};
			}
		>
	>({
		cpuUsage: {
			title: "CPU Usage",
			content: "当前 0 %",
			chart: {
				height: 250,
				lineWidth: 5,
				backgroundColor: "#14b8a6",
				series: { type: "line", color: "#fff" },
				ref: useRef<HighchartsReactRefObject>(null)
			}
		},
		memUsage: {
			title: "Memory Usage",
			content: "当前 0 %",
			chart: {
				height: 250,
				lineWidth: 5,
				backgroundColor: "#06b6d4",
				series: { type: "line", color: "#fff" },
				ref: useRef<HighchartsReactRefObject>(null)
			}
		}
	});
	const [mapState, setMapState] = useState<MapBoxProps>({
		zoom: 7,
		minZoom: 0,
		maxZoom: 7,
		center: [0, 0],
		tile: "/tiles/{z}/{x}/{y}.webp"
	});

	// Polling home data
	const { data, error, loading } = useGetData4HomeQuery({ pollInterval: 1000 });
	useEffect(() => {
		if (!error && !loading) {
			const { getStation, getGnss, getSystem } = data!;
			setStationInfo({
				name: getStation.name,
				location: getStation.location,
				remarks: getStation.remarks,
				elevation: getGnss.elevation,
				coordinates: [getGnss.latitude, getGnss.longitude]
			});
			setCards((prev) => ({
				...prev,
				satellites: { ...prev.satellites, value: getStation.satellites },
				gnssSatellites: { ...prev.gnssSatellites, value: getGnss.satellites },
				trueAzimuth: { ...prev.trueAzimuth, value: getGnss.trueAzimuth },
				clockOffset: { ...prev.clockOffset, value: getStation.clockOffset },
				totalTasks: { ...prev.totalTasks, value: getStation.totalTasks },
				pendingTasks: { ...prev.pendingTasks, value: getStation.pendingTasks }
			}));
			setChartsState((prev) => {
				const { timestamp } = getGnss;
				const { cpuUsage, memUsage } = getSystem;
				const { chart: cpuUsageChart } = prev["cpuUsage"];
				const { chart: memUsageChart } = prev["memUsage"];
				if (cpuUsageChart.ref.current && memUsageChart.ref.current) {
					const { current: cpuUsageChartRef } = cpuUsageChart.ref;
					const cpuUsageChartInitTimestamp = cpuUsageChartRef.chart.series[0].data.length
						? cpuUsageChartRef.chart.series[0].data[0].x
						: timestamp;
					cpuUsageChartRef.chart.series[0].addPoint(
						[timestamp, cpuUsage],
						true,
						timestamp - cpuUsageChartInitTimestamp >= RETENTION_THRESHOLD_MS
					);
					const { current: memUsageChartRef } = memUsageChart.ref;
					const memUsageChartInitTimestamp = memUsageChartRef.chart.series[0].data.length
						? memUsageChartRef.chart.series[0].data[0].x
						: timestamp;
					memUsageChartRef.chart.series[0].addPoint(
						[timestamp, memUsage],
						true,
						timestamp - memUsageChartInitTimestamp >= RETENTION_THRESHOLD_MS
					);
				}
				return {
					...prev,
					cpuUsage: { ...prev.cpuUsage, content: `当前 ${cpuUsage.toFixed(2)} %` },
					memUsage: { ...prev.memUsage, content: `当前 ${memUsage.toFixed(2)} %` }
				};
			});
			setMapState((prev) => ({
				...prev,
				center: [getGnss.latitude, getGnss.longitude],
				marker: [getGnss.latitude, getGnss.longitude]
			}));
		}
	}, [data, error, loading]);

	return !error ? (
		<div className="animate-fade p-8 min-h-screen">
			<div className="p-4">
				<div className="flex space-x-4 text-gray-800 dark:text-gray-300">
					<Icon path={mdiSatelliteUplink} size={1} />
					<h2 className="font-mono text-2xl">{stationInfo?.name}</h2>
				</div>
				{stationInfo?.remarks &&
					stationInfo.remarks.map((remark, index) => (
						<span
							className={`text-xs font-medium px-2.5 rounded m-1 ${getBadageColor(index)}`}
							key={index}
						>
							{`#${remark}`}
						</span>
					))}
			</div>

			<div className="p-4 grid grid-cols-1 gap-6 md:grid-cols-3">
				{Object.values(cards).map(({ value, title, icon, unit }, index) => (
					<div
						className="bg-white flex rounded-2xl flex-col dark:bg-slate-900/70 shadow-lg"
						key={index}
					>
						<div className="p-6 flex items-center justify-between">
							<div>
								<h3 className="text-lg leading-tight text-gray-500 dark:text-slate-500">
									{title}
								</h3>
								<h1 className="text-2xl leading-tight font-semibold dark:text-slate-400">
									{value}
									<span>{` ${unit}`}</span>
								</h1>
							</div>
							<Icon className={getCardColor(index)} path={icon} size={3} />
						</div>
					</div>
				))}
			</div>

			<div className="p-4 grid grid-cols-1 gap-3 md:grid-cols-2">
				{Object.values(chartsState).map(({ title, chart, content }, index) => (
					<Holder label={title} content={content} key={index}>
						<Chart {...chart} />
					</Holder>
				))}
			</div>

			<div className="p-4">
				<Holder
					label={`${stationInfo?.location}`}
					content={`Latitude: ${stationInfo?.coordinates[0].toFixed(5)}\nLongitude: ${stationInfo?.coordinates[1].toFixed(5)}\nElevation: ${stationInfo?.elevation.toFixed(2)} m`}
				>
					<MapBox className="h-[300px] md:h-[400px]" {...mapState} />
				</Holder>
			</div>
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Home;
