import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { SyntheticEvent, useState } from "react";

import { Error } from "../../components/Error";
import { useGetData4TasksQuery } from "../../graphql";
import { useLocaleStore } from "../../stores/locale";

const Tasks = () => {
	const { locale } = useLocaleStore();

	// Handler for switching tabs
	const [value, setValue] = useState("calendar");
	const handleTabChange = (_: SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	//
	const [currentTasks, setTasks] = useState({
		total: {},
		pending: {}
	});
	const { data, loading, error } = useGetData4TasksQuery({ pollInterval: 10000 });

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
					<Tab sx={{ mx: 3 }} value="taskAdmin" label="任务管理视图" />
				</Tabs>
			</div>

			<div className="mt-6">
				<div hidden={value !== "calendar"}>
					<FullCalendar
						height={500}
						plugins={[dayGridPlugin]}
						initialView="dayGridMonth"
						events={[
							{ title: "event 1", date: "2024-06-08" },
							{ title: "event 2", date: "2024-06-09" }
						]}
						locale={locale}
						selectable={true}
					/>
				</div>

				<div hidden={value !== "countDown"}>
					<div className="flex flex-col items-center mt-48 space-y-4">
						<h2>任务倒计时</h2>
						<h2>任务倒计时</h2>
						<h2>任务倒计时</h2>
					</div>
				</div>

				<div hidden={value !== "taskAdmin"}>任务管理</div>
			</div>
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Tasks;
