import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { Field, Form, Formik } from "formik";
import { SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();

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
			return t("views.tasks.status.categories.completed");
		}
		if (endTime < currentTime) {
			return t("views.tasks.status.categories.missed");
		}
		if (startTime <= currentTime && endTime >= currentTime) {
			return t("views.tasks.status.categories.in_progress", {
				value: (((currentTime - startTime) / (endTime - startTime)) * 100).toFixed(2)
			});
		}
		const timeLeft = startTime - currentTime;
		if (timeLeft > 60 * 60 * 1000) {
			return t("views.tasks.status.countdown.hours", {
				value: Math.floor(timeLeft / (60 * 60 * 1000))
			});
		}
		if (timeLeft > 10 * 60 * 1000) {
			return t("views.tasks.status.countdown.minutes", {
				value: Math.floor(timeLeft / (60 * 1000))
			});
		}
		return t("views.tasks.status.countdown.seconds", {
			value: Math.floor(timeLeft / 1000)
		});
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
	>({
		calendar: { current: true, label: t("views.tasks.tabs.week_view.title") },
		list: { label: t("views.tasks.tabs.list_view.title") }
	});
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
			await sendPromiseAlert(
				refetch(),
				t("views.tasks.actions.refresh.loading"),
				t("views.tasks.actions.refresh.success"),
				t("views.tasks.actions.refresh.failure"),
				true
			)
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
						t("views.tasks.actions.delete.loading"),
						t("views.tasks.actions.delete.success"),
						t("views.tasks.actions.delete.failure"),
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
			sendUserConfirm(t("views.tasks.actions.delete.confirm.content", { value: id }), {
				title: t("views.tasks.actions.delete.confirm.title"),
				confirmText: t("common.confirm.confirm"),
				cancelText: t("common.confirm.cancel"),
				onConfirmed: handleConfirm,
				onCancelled: () =>
					sendUserAlert(t("views.tasks.actions.delete.confirm.cancel"), true)
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
			sendUserAlert(t("views.tasks.actions.batch_delete.empty"), true);
			return;
		}
		const handleConfirm = async () => {
			await sendPromiseAlert(
				Promise.all(
					selectedTasks.map((task) => deleteTaskById({ variables: { taskId: task!.id } }))
				),
				t("views.tasks.actions.batch_delete.loading"),
				t("views.tasks.actions.batch_delete.success"),
				t("views.tasks.actions.batch_delete.failure"),
				true
			);
			await handleRefreshTasks();
		};
		sendUserConfirm(
			t("views.tasks.actions.batch_delete.confirm.content", { value: selectedTasks.length }),
			{
				title: t("views.tasks.actions.batch_delete.confirm.title"),
				confirmText: t("common.confirm.confirm"),
				cancelText: t("common.confirm.cancel"),
				onConfirmed: handleConfirm,
				onCancelled: () =>
					sendUserAlert(t("views.tasks.actions.batch_delete.confirm.cancel"), true)
			}
		);
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
			sendUserAlert(t("views.tasks.actions.search.failure"), true);
		} else {
			sendUserAlert(
				t("views.tasks.actions.search.success", { value: results.length }),
				false
			);
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
								{t("views.tasks.banners.in_progress.content", {
									progress: (
										((currentTasks.timestamp - taskInProcess.startTime) /
											(taskInProcess.endTime - taskInProcess.startTime)) *
										100
									).toFixed(2),
									name: taskInProcess.name
								})}
								<br />
								{t("views.tasks.banners.in_progress.start_time", {
									value: getTimeString(taskInProcess.startTime)
								})}
								<br />
								{t("views.tasks.banners.in_progress.end_time", {
									value: getTimeString(taskInProcess.endTime)
								})}
							</AlertMessage>
						)}
						{taskUpcoming && (
							<AlertMessage severity="warning">
								{t("views.tasks.banners.upcoming.content", {
									name: taskUpcoming.name,
									status: getTaskStatus(
										currentTasks.timestamp,
										taskUpcoming.startTime,
										taskUpcoming.endTime,
										taskUpcoming.hasDone
									)
								})}
								<br />
								{t("views.tasks.banners.upcoming.start_time", {
									value: getTimeString(taskUpcoming.startTime)
								})}
								<br />
								{t("views.tasks.banners.upcoming.end_time", {
									value: getTimeString(taskUpcoming.endTime)
								})}
							</AlertMessage>
						)}
						<WeekSchedule
							currentTime={currentTasks.timestamp ?? Date.now()}
							categories={{
								field: "taskStatusCode",
								name: t("views.tasks.status.title"),
								instances: [
									{
										id: 0,
										text: t("views.tasks.status.categories.pending"),
										color: "#0284c7"
									},
									{
										id: 1,
										text: t("views.tasks.status.categories.completed"),
										color: "#059669"
									},
									{
										id: 2,
										text: t("views.tasks.status.categories.missed"),
										color: "#d97706"
									}
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
							todayButtonLabel={t("views.tasks.tabs.week_view.buttons.today")}
							refreshButtonLabel={t("views.tasks.tabs.week_view.buttons.refresh")}
							cellWidth={120}
						/>
					</div>
				)}

				{tabsState.list.current && (
					<div className="space-y-8">
						<div className="flex flex-col sm:flex-row justify-between gap-6">
							<div className="flex flex-row space-x-4 sm:whitespace-nowrap">
								<button
									className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-800"
									onClick={handleRefreshTasks}
								>
									{t("views.tasks.tabs.list_view.buttons.refresh")}
								</button>
								<button
									className="px-3 py-2 rounded-lg font-medium text-white transition-all bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
									onClick={handleBatchDelete}
								>
									{t("views.tasks.tabs.list_view.buttons.batch_delete")}
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
											placeholder={t(
												"views.tasks.actions.search.placeholder"
											)}
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
									headerName: t("views.tasks.tabs.list_view.labels.task_id"),
									hideable: false,
									sortable: false,
									minWidth: 110
								},
								{
									field: "name",
									headerName: t("views.tasks.tabs.list_view.labels.task_name"),
									hideable: false,
									sortable: false,
									minWidth: 220
								},
								{
									field: "startTime",
									headerName: t("views.tasks.tabs.list_view.labels.start_time"),
									hideable: false,
									sortable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "endTime",
									headerName: t("views.tasks.tabs.list_view.labels.end_time"),
									hideable: false,
									sortable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "createdAt",
									headerName: t("views.tasks.tabs.list_view.labels.created_at"),
									sortable: false,
									minWidth: 200,
									renderCell: ({ value }) => getTimeString(value)
								},
								{
									field: "taskStatus",
									headerName: t("views.tasks.tabs.list_view.labels.task_status"),
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
									headerName: t("views.tasks.tabs.list_view.labels.actions"),
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
												{t("views.tasks.tabs.list_view.buttons.delete")}
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
