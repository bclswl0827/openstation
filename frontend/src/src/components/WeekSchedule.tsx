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

interface WeekScheduleProps {
	events?: AppointmentModel[];
	currentTime: number;
	locale: string;
	categories?: {
		name: string;
		field: keyof AppointmentModel[number];
		instances: Array<{ id: number; text: string; color: string }>;
	};
	onDelete: (id?: number | string) => void;
	onRefresh: () => void;
	refreshButtonLabel: string;
	todayButtonLabel: string;
}

export const WeekSchedule = ({
	events,
	currentTime,
	locale,
	categories,
	onDelete,
	onRefresh,
	refreshButtonLabel,
	todayButtonLabel
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
					<WeekView.DayScaleCell {...restProps} formatDate={formatDayScale} />
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
				appointmentContentComponent={({ formatDate, ...restProps }) => (
					<Appointments.AppointmentContent
						{...restProps}
						formatDate={formatAppointmentContent}
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
			{categories && <GroupingPanel />}
		</Scheduler>
	);
};
