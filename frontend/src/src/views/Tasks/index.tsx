import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { Field, Form, Formik } from "formik";
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
		const timeLeft = startTime - currentTime;
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
			// Unfinished task
			if (statusA === 0 && statusB === 0) {
				return a!.startTime - b!.startTime;
			}
			if (statusA === 0) {
				return -1;
			}
			if (statusB === 0) {
				return 1;
			}
			// Finished task
			if (statusA === 1 && statusB === 1) {
				return b!.endTime - a!.endTime;
			}
			if (statusA === 1) {
				return -1;
			}
			if (statusB === 1) {
				return 1;
			}
			// Missed task
			return b!.startTime - a!.startTime;
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
	const [tasks4TableList, setTasks4TableList] = useState<GetData4TasksQuery["getTotalTasks"]>([]);
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
			// Set the tasks for table list view
			setTasks4TableList(total);
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

	// Handler for batch deleting tasks
	const [selectedTasks, setSelectedTasks] = useState<GetData4TasksQuery["getTotalTasks"]>([]);
	const handleSelectTasks = (ids: GridRowSelectionModel) => {
		setSelectedTasks(ids.map((id) => currentTasks.total.find((task) => task!.id === id)!));
	};
	const handleBatchDelete = () => {
		if (!selectedTasks.length) {
			sendUserAlert("请先选择要删除的任务", true);
			return;
		}
		const handleConfirm = async () => {
			await sendPromiseAlert(
				Promise.all(
					selectedTasks.map((task) => deleteTaskById({ variables: { taskId: task!.id } }))
				),
				"正在删除任务",
				"任务删除成功",
				"任务删除失败",
				true
			);
			await sendPromiseAlert(refetch(), "正在刷新任务", "任务刷新成功", "任务刷新失败", true);
		};
		sendUserConfirm("确定要删除所有任务吗？", {
			title: "删除任务",
			confirmText: "删除",
			cancelText: "取消",
			onConfirmed: handleConfirm,
			onCancelled: () => sendUserAlert("删除操作已取消", true)
		});
	};

	// Handler for searching tasks
	const handleSearchTasks = async (keyword: string) => {
		if (!keyword) {
			setTasks4TableList(currentTasks.total);
			return;
		}
		const results = currentTasks.total.filter(
			(task) => task!.id.toString().includes(keyword) || task!.name.includes(keyword) || false
		);
		setTasks4TableList(results);
		if (!results.length) {
			sendUserAlert("未搜索到匹配的任务", true);
		} else {
			sendUserAlert(`搜索到 ${results.length} 条符合条件的任务`, false);
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
								{`${taskUpcoming.name} 跟踪任务 ${getTaskStatus(
									currentTasks.timestamp,
									taskUpcoming.startTime,
									taskUpcoming.endTime,
									taskUpcoming.hasDone
								)}`}
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
								tasks4TableList.map((task) => ({
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
						<div className="flex flex-col sm:flex-row justify-between gap-6">
							<div className="flex flex-row space-x-4 sm:whitespace-nowrap">
								<button
									className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800"
									onClick={handleRefreshTasks}
								>
									刷新数据
								</button>
								<button
									className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
									onClick={handleBatchDelete}
								>
									批量删除
								</button>
							</div>

							<Formik
								initialValues={{ keyword: "" }}
								onSubmit={async ({ keyword }, { setSubmitting }) => {
									await handleSearchTasks(keyword.toLocaleUpperCase());
									setSubmitting(false);
								}}
							>
								{({ isSubmitting }) => (
									<Form className="flex flex-row space-x-2">
										<Field
											type="search"
											name="keyword"
											className="ps-3 w-full min-w-32 md:w-64 py-2 text-sm text-gray-900 border focus:outline-none border-gray-300 rounded-lg bg-gray-50 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
											placeholder="Input task name or ID"
										/>
										<button
											className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm p-2 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:cursor-not-allowed"
											disabled={isSubmitting}
											type="submit"
										>
											<Icon
												className="text-white"
												path={mdiMagnify}
												size={1}
											/>
										</button>
									</Form>
								)}
							</Formik>
						</div>

						<TableList
							locale={locale}
							columns={[
								{
									field: "id",
									headerName: "任务 ID",
									hideable: false,
									sortable: false,
									minWidth: 110
								},
								{
									field: "name",
									headerName: "任务名称",
									hideable: false,
									sortable: false,
									minWidth: 220
								},
								{
									field: "startTime",
									headerName: "起始时间",
									hideable: false,
									sortable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "endTime",
									headerName: "结束时间",
									hideable: false,
									sortable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "createdAt",
									headerName: "创建时间",
									sortable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "taskStatus",
									headerName: "执行状态",
									hideable: false,
									sortable: false,
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
							data={tasks4TableList.map((task) => ({
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
							onSelect={handleSelectTasks}
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
