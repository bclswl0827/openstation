import {
	AppointmentModel,
	EditingState,
	GroupingState,
	IntegratedEditing,
	IntegratedGrouping,
	SchedulerDateTime,
	ViewState
} from "@devexpress/dx-react-scheduler";
import {
	Appointments,
	AppointmentTooltip,
	DateNavigator,
	GroupingPanel,
	Resources,
	Scheduler,
	TodayButton,
	Toolbar,
	WeekView
} from "@devexpress/dx-react-scheduler-material-ui";
import moment from "moment";

import { localeConfig } from "../config/locale";

interface WeekScheduleProps {
	readonly events?: AppointmentModel[];
	readonly currentTime: number;
	readonly locale: keyof typeof localeConfig.resources;
	readonly categories?: {
		readonly name: string;
		readonly field: keyof AppointmentModel[number];
		readonly instances: Array<{ id: number; text: string; color: string }>;
	};
	readonly onDelete: (id?: number | string) => void;
	readonly onRefresh: () => void;
	readonly refreshButtonLabel: string;
	readonly todayButtonLabel: string;
	readonly cellWidth?: number;
}

export const WeekSchedule = ({
	events,
	currentTime,
	locale,
	categories,
	onDelete,
	onRefresh,
	refreshButtonLabel,
	todayButtonLabel,
	cellWidth
}: WeekScheduleProps) => {
	const formatTimeScale = (date?: SchedulerDateTime) => moment(date).format("HH:mm");
	const formatDayScale = (date?: SchedulerDateTime, options?: Intl.DateTimeFormatOptions) =>
		moment(date).format(options?.weekday ? "yyyy-MM" : "D");
	const formatAppointmentContent = (date?: SchedulerDateTime) => moment(date).format("HH:mm");
	const formatAppointmentTooltip = (
		date?: SchedulerDateTime,
		options?: Intl.DateTimeFormatOptions
	) => moment(date).format(options?.weekday ? "yyyy-MM-DD" : "HH:mm:ss");

	return (
		<Scheduler data={events} locale={locale}>
			<ViewState defaultCurrentDate={currentTime} />

			<EditingState
				onCommitChanges={({ deleted }) => {
					deleted && onDelete?.(deleted);
				}}
			/>
			{categories && (
				<GroupingState
					groupByDate={() => true}
					grouping={[{ resourceName: categories.field.toString() }]}
				/>
			)}

			<Toolbar />
			<DateNavigator />

			<WeekView
				endDayHour={24}
				startDayHour={0}
				timeScaleLabelComponent={({ formatDate, ...restProps }) => (
					<WeekView.TimeScaleLabel {...restProps} formatDate={formatTimeScale} />
				)}
				dayScaleCellComponent={({ formatDate, ...restProps }) => (
					<WeekView.DayScaleCell
						{...restProps}
						formatDate={formatDayScale}
						style={
							cellWidth
								? {
										width: categories?.instances
											? cellWidth * categories.instances.length
											: cellWidth
									}
								: {}
						}
					/>
				)}
				timeTableCellComponent={({ ...restProps }) => (
					<WeekView.TimeTableCell
						{...restProps}
						style={cellWidth ? { width: cellWidth } : {}}
					/>
				)}
			/>
			<TodayButton
				buttonComponent={({ getMessage, ...restProps }) => (
					<TodayButton.Button
						{...restProps}
						style={{ marginRight: 15 }}
						getMessage={() => todayButtonLabel}
					/>
				)}
			/>
			<TodayButton
				buttonComponent={({ getMessage, setCurrentDate, ...restProps }) => (
					<TodayButton.Button
						{...restProps}
						style={{ marginRight: 15 }}
						setCurrentDate={() => {
							onRefresh?.();
						}}
						getMessage={() => refreshButtonLabel}
					/>
				)}
			/>

			<Appointments
				appointmentContentComponent={({ formatDate, type, ...restProps }) => (
					<Appointments.AppointmentContent
						{...restProps}
						type="horizontal"
						formatDate={formatAppointmentContent}
						style={{ padding: "1", textAlign: "center", fontWeight: "bold" }}
					/>
				)}
			/>

			{categories && (
				<Resources data={[{ ...categories, fieldName: categories.field.toString() }]} />
			)}
			{categories && <IntegratedGrouping />}
			<IntegratedEditing />

			<AppointmentTooltip
				contentComponent={({ ...restProps }) => (
					<AppointmentTooltip.Content
						{...restProps}
						formatDate={formatAppointmentTooltip}
					/>
				)}
				showDeleteButton
				showCloseButton
			/>
			{categories && (
				<GroupingPanel
					horizontalLayoutComponent={({ cellComponent, ...restProps }) => (
						<GroupingPanel.HorizontalLayout
							{...restProps}
							cellComponent={({ textStyle, ...cellProps }) => (
								<GroupingPanel.Cell
									{...cellProps}
									textStyle={{ width: "100%", textAlign: "center" }}
								/>
							)}
						/>
					)}
				/>
			)}
		</Scheduler>
	);
};
