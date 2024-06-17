import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { SyntheticEvent, useEffect, useState } from "react";

import { Error } from "../../components/Error";
import { WeekSchedule } from "../../components/WeekSchedule";
import {
	GetData4TasksQuery,
	useDeleteTaskByIdMutation,
	useGetData4TasksQuery
} from "../../graphql";
import { sendPromiseAlert } from "../../helpers/interact/sendPromiseAlert";
import { sendUserAlert } from "../../helpers/interact/sendUserAlert";
import { sendUserConfirm } from "../../helpers/interact/sendUserConfirm";
import { useLocaleStore } from "../../stores/locale";

const Tasks = () => {
	// Get the locale for the scheduler
	const { locale } = useLocaleStore();

	// Handler for switching tabs
	const [value, setValue] = useState("calendar");
	const handleTabChange = (_: SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	// Get tracking tasks
	const [currentTasks, setCurrentTasks] = useState<{
		timestamp: number;
		total: GetData4TasksQuery["getTotalTasks"];
		pending: GetData4TasksQuery["getPendingTasks"];
	}>();
	const { refetch, data, loading, error } = useGetData4TasksQuery({ pollInterval: 30 * 1000 });
	useEffect(() => {
		if (data && !loading) {
			const { getTotalTasks: total, getPendingTasks: pending, getGnss } = data!;
			const timestamp = getGnss.timestamp;
			setCurrentTasks({ timestamp, total, pending });
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
						...currentTasks!,
						total: currentTasks!.total.filter((task) => task!.id !== id),
						pending: currentTasks!.pending.filter((task) => task!.id !== id)
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
					value={value}
					onChange={handleTabChange}
					allowScrollButtonsMobile
					scrollButtons
				>
					<Tab sx={{ mx: 3 }} value="calendar" label="日历排程视图" />
					<Tab sx={{ mx: 3 }} value="countDown" label="倒计时视图" />
				</Tabs>
			</div>

			<div className="mt-6">
				<div className="lg:max-w-[calc(100vw-300px)]" hidden={value !== "calendar"}>
					<WeekSchedule
						currentTime={currentTasks?.timestamp ?? Date.now()}
						categories={{
							field: "taskStatus",
							name: "任务状态",
							instances: [
								{ id: 0, text: "未完成", color: "#0284c7" },
								{ id: 1, text: "已完成", color: "#059669" },
								{ id: 2, text: "已错过", color: "#d97706" }
							]
						}}
						events={
							currentTasks?.total.map((task) => ({
								id: task!.id,
								title: task!.name,
								endDate: new Date(task!.endTime),
								startDate: new Date(task!.startTime),
								taskStatus: !task!.hasDone
									? task!.startTime < currentTasks.timestamp
										? 2
										: 0
									: 1
							})) ?? []
						}
						onRefresh={handleRefreshTasks}
						onDelete={handleDeleteTask}
						locale={locale}
						todayButtonLabel="回到今日"
						refreshButtonLabel="刷新数据"
					/>
				</div>

				<div hidden={value !== "countDown"}>
					<div className="flex flex-col items-center mt-48 space-y-4">
						<h2>任务倒计时</h2>
						<h2>任务倒计时</h2>
						<h2>任务倒计时</h2>
					</div>
				</div>
			</div>
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Tasks;
