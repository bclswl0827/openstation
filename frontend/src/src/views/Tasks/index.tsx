import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { SyntheticEvent, useEffect, useState } from "react";

import { AlertMessage } from "../../components/AlertMessage";
import { Error } from "../../components/Error";
import { TableList } from "../../components/TableList";
import { WeekSchedule } from "../../components/WeekSchedule";
import {
	GetData4TasksQuery,
	useDeleteTaskByIdMutation,
	useGetData4TasksQuery
} from "../../graphql";
import { sendPromiseAlert } from "../../helpers/interact/sendPromiseAlert";
import { sendUserAlert } from "../../helpers/interact/sendUserAlert";
import { sendUserConfirm } from "../../helpers/interact/sendUserConfirm";
import { getTimeString } from "../../helpers/utils/getTimeString";
import { useLocaleStore } from "../../stores/locale";

const Tasks = () => {
	// Get the locale for the scheduler
	const { locale } = useLocaleStore();

	// Handlers for processing task status
	const getTaskStatusCode = (currentTime: number, endTime: number, hasDone: boolean) => {
		if (hasDone) {
			return 1;
		}
		if (endTime < currentTime) {
			return 2;
		}
		return 0;
	};
	const getTaskStatus = (
		currentTime: number,
		startTime: number,
		endTime: number,
		hasDone: boolean
	) => {
		if (hasDone) {
			return "已完成";
		}
		if (endTime < currentTime) {
			return "已错过";
		}
		if (startTime <= currentTime && endTime >= currentTime) {
			return `任务已进行 ${(
				((currentTime - startTime) / (endTime - startTime)) *
				100
			).toFixed(2)}%`;
		}
		const timeLeft = endTime - currentTime;
		if (timeLeft > 60 * 60 * 1000) {
			return `${Math.floor(timeLeft / (60 * 60 * 1000))} 小时后开始`;
		}
		if (timeLeft > 10 * 60 * 1000) {
			return `${Math.floor(timeLeft / (60 * 1000))} 分钟后开始`;
		}
		return `倒计时 ${Math.floor(timeLeft / 1000)} 秒`;
	};
	const getTaskComparator =
		() =>
		(
			a: GetData4TasksQuery["getPendingTasks"][number],
			b: GetData4TasksQuery["getPendingTasks"][number]
		) => {
			const statusA = getTaskStatusCode(currentTasks.timestamp, a!.endTime, a!.hasDone);
			const statusB = getTaskStatusCode(currentTasks.timestamp, b!.endTime, b!.hasDone);
			if (statusA === 1) {
				return -1;
			}
			if (statusB === 1) {
				return 1;
			}
			if (statusA === 0 && statusB === 0) {
				return a!.startTime - b!.startTime;
			}
			if (statusA === 0) {
				return -1;
			}
			if (statusB === 0) {
				return 1;
			}
			return statusA - statusB;
		};

	// Handler for switching tabs
	const [tabsState, setTabsState] = useState<
		Record<string, { label: string; current?: boolean }>
	>({ calendar: { current: true, label: "周历视图" }, countDown: { label: "列表视图" } });
	const handleTabChange = (_: SyntheticEvent, newValue: string) => {
		setTabsState((prev) => {
			const newState = Object.fromEntries(
				Object.entries(prev).map(([key, value]) => [key, { ...value, current: false }])
			);
			newState[newValue] = { ...newState[newValue], current: true };
			return newState;
		});
	};

	// Get tracking tasks
	const [currentTasks, setCurrentTasks] = useState<{
		timestamp: number;
		total: GetData4TasksQuery["getTotalTasks"];
		pending: GetData4TasksQuery["getPendingTasks"];
	}>({ timestamp: Date.now(), total: [], pending: [] });
	const [taskUpcoming, setTaskUpcoming] = useState<GetData4TasksQuery["getTotalTasks"][number]>();
	const [taskInProcess, setTaskInProcess] =
		useState<GetData4TasksQuery["getTotalTasks"][number]>();
	const { refetch, data, loading, error } = useGetData4TasksQuery({ pollInterval: 10 * 1000 });
	useEffect(() => {
		if (data && !loading) {
			const { getTotalTasks: total, getPendingTasks: pending, getGnss } = data!;
			const timestamp = getGnss.timestamp;
			// Set the current tasks
			setCurrentTasks({ timestamp, total, pending });
			// Get the task upcoming
			setTaskUpcoming(pending.find((task) => task!.startTime - timestamp <= 10 * 60 * 1000));
			// Get the task in process
			setTaskInProcess(
				total.find((task) => task!.startTime <= timestamp && task!.endTime >= timestamp)
			);
		}
	}, [data, loading]);

	// Handler for refreshing tasks
	const handleRefreshTasks = async () => {
		const result = (
			await sendPromiseAlert(refetch(), "正在刷新任务", "任务刷新成功", "任务刷新失败", true)
		)?.data;
		if (result) {
			const { getTotalTasks: total, getPendingTasks: pending, getGnss } = result;
			setCurrentTasks({ timestamp: getGnss.timestamp, total, pending });
		}
	};

	// Handler for deleting task
	const [deleteTaskById] = useDeleteTaskByIdMutation();
	const handleDeleteTask = (id?: string | number) => {
		if (id) {
			const handleConfirm = async () => {
				const taskId = Number(id);
				const result = (
					await sendPromiseAlert(
						deleteTaskById({ variables: { taskId } }),
						"正在删除任务",
						"任务删除成功",
						"任务删除失败",
						true
					)
				)?.data?.deleteTaskById;
				if (result) {
					setCurrentTasks({
						...currentTasks,
						total: currentTasks.total.filter((task) => task!.id !== id),
						pending: currentTasks.pending.filter((task) => task!.id !== id)
					});
				}
			};
			sendUserConfirm("确定要删除这个任务吗？", {
				title: "删除任务",
				confirmText: "删除",
				cancelText: "取消",
				onConfirmed: handleConfirm,
				onCancelled: () => sendUserAlert("删除操作已取消", true)
			});
		}
	};

	return !error ? (
		<div className="animate-fade p-8 min-h-screen">
			<div className="flex justify-center border-b dark:border-gray-600">
				<Tabs
					className="dark:text-gray-200"
					variant="scrollable"
					onChange={handleTabChange}
					allowScrollButtonsMobile
					scrollButtons
					value={Object.keys(tabsState).find((key) => tabsState[key].current)}
				>
					{Object.entries(tabsState).map(([key, { label }]) => (
						<Tab key={key} sx={{ mx: 3 }} value={key} label={label} />
					))}
				</Tabs>
			</div>

			<div className="mt-6">
				{tabsState.calendar.current && (
					<div className="lg:max-w-[calc(100vw-300px)]">
						{taskInProcess && (
							<AlertMessage severity="info">
								{`[${(
									((currentTasks.timestamp - taskInProcess.startTime) /
										(taskInProcess.endTime - taskInProcess.startTime)) *
									100
								).toFixed(2)}%] ${taskInProcess.name} 跟踪任务执行中`}
								<br />
								{`起始时间 ${getTimeString(taskInProcess.startTime)}`}
								<br />
								{`结束时间 ${getTimeString(taskInProcess.endTime)}`}
							</AlertMessage>
						)}
						{taskUpcoming && (
							<AlertMessage severity="warning">
								{`${taskUpcoming.name} 跟踪任务即将开始`}
								<br />
								{`起始时间 ${getTimeString(taskUpcoming.startTime)}`}
								<br />
								{`结束时间 ${getTimeString(taskUpcoming.endTime)}`}
							</AlertMessage>
						)}
						<WeekSchedule
							currentTime={currentTasks.timestamp ?? Date.now()}
							categories={{
								field: "taskStatusCode",
								name: "任务状态",
								instances: [
									{ id: 0, text: "未完成", color: "#0284c7" },
									{ id: 1, text: "已完成", color: "#059669" },
									{ id: 2, text: "已错过", color: "#d97706" }
								]
							}}
							events={
								currentTasks.total.map((task) => ({
									id: task!.id,
									title: task!.name,
									endDate: new Date(task!.endTime),
									startDate: new Date(task!.startTime),
									taskStatusCode: getTaskStatusCode(
										currentTasks.timestamp,
										task!.endTime,
										task!.hasDone
									)
								})) ?? []
							}
							onRefresh={handleRefreshTasks}
							onDelete={handleDeleteTask}
							locale={locale}
							todayButtonLabel="回到今日"
							refreshButtonLabel="刷新数据"
							cellWidth={120}
						/>
					</div>
				)}

				{tabsState.countDown.current && (
					<div className="space-y-8">
						<button
							className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800"
							onClick={handleRefreshTasks}
						>
							刷新数据
						</button>
						<TableList
							locale={locale}
							columns={[
								{
									field: "id",
									headerName: "任务 ID",
									hideable: false,
									minWidth: 150
								},
								{
									field: "name",
									headerName: "任务名称",
									hideable: false,
									minWidth: 220
								},
								{
									field: "startTime",
									headerName: "起始时间",
									hideable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "endTime",
									headerName: "结束时间",
									hideable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "createdAt",
									headerName: "创建时间",
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "taskStatus",
									headerName: "执行状态",
									hideable: false,
									minWidth: 200,
									renderCell: ({ value }) =>
										getTaskStatus(
											currentTasks.timestamp,
											value.startTime,
											value.endTime,
											value.hasDone
										),
									sortComparator: getTaskComparator()
								},
								{
									field: "actions",
									headerName: "操作",
									sortable: false,
									hideable: false,
									resizable: false,
									minWidth: 150,
									renderCell: ({ row }) => (
										<div className="flex flex-row space-x-4 w-full">
											<button
												className="text-red-700 dark:text-red-400 hover:opacity-50"
												onClick={() => {
													handleDeleteTask(row.id);
												}}
											>
												移除排程
											</button>
										</div>
									)
								}
							]}
							data={currentTasks.total.map((task) => ({
								id: task!.id,
								name: task!.name,
								startTime: task!.startTime,
								endTime: task!.endTime,
								createdAt: task!.createdAt,
								taskStatus: {
									hasDone: task!.hasDone,
									endTime: task!.endTime,
									startTime: task!.startTime
								}
							}))}
							sortField="taskStatus"
						/>
					</div>
				)}
			</div>
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Tasks;
