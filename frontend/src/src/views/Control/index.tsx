import { mdiBackupRestore, mdiBoomGateArrowUp, mdiClockAlert, mdiNavigation } from "@mdi/js";
import Icon from "@mdi/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";

import dish from "../../assets/dish.png";
import { Error } from "../../components/Error";
import {
	SetPanTiltMutationVariables,
	useGetControlDataQuery,
	useSetPanTiltMutation
} from "../../graphql";
import { sendPromiseAlert } from "../../helpers/interact/sendPromiseAlert";

const Control = () => {
	const [setPanTiltMutation] = useSetPanTiltMutation();

	const handleSetPanTilt = async ({
		newPan,
		newTilt,
		newOffset
	}: SetPanTiltMutationVariables) => {
		await sendPromiseAlert(
			setPanTiltMutation({ variables: { newPan, newTilt, newOffset } }),
			"正在设置转台方位",
			"指令下发完成",
			"指令下发失败",
			true
		);
	};

	// States for all components
	const [panTiltStates, setPanTiltStates] = useState({
		trueAzimuth: {
			icon: mdiNavigation,
			value: "0",
			title: "真北方位角",
			description: "GNSS 方位角"
		},
		panTiltPan: {
			icon: mdiBackupRestore,
			value: "0",
			title: "转台方位",
			description: "转台相对真北方向"
		},
		panTiltTilt: {
			icon: mdiBoomGateArrowUp,
			value: "0",
			title: "转台俯仰",
			description: "转台相对地平面俯仰"
		},
		panTiltBusy: {
			icon: mdiClockAlert,
			value: "0",
			title: "转台状态",
			description: "转台空闲状态"
		}
	});

	// Polling Pan-Tilt data
	const { data, error, loading } = useGetControlDataQuery({ pollInterval: 1000 });

	useEffect(() => {
		if (!error && !loading) {
			const { getGnss, getPanTilt } = data!;
			setPanTiltStates((prev) => ({
				...prev,
				trueAzimuth: {
					...prev.trueAzimuth,
					value: getGnss.trueAzimuth.toFixed(2) ?? "0"
				},
				panTiltPan: {
					...prev.panTiltPan,
					value: getPanTilt.currentPan.toFixed(2) ?? "0"
				},
				panTiltTilt: {
					...prev.panTiltTilt,
					value: getPanTilt.currentTilt.toFixed(2) ?? "0"
				},
				panTiltBusy: {
					...prev.panTiltBusy,
					value: getPanTilt.isBusy ? "忙碌" : "空闲"
				}
			}));
		}
	}, [data, error, loading]);

	return !error ? (
		<div className="p-8 min-h-screen">
			<div className="rounded-md">
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
					{Object.values(panTiltStates).map(
						({ icon, title, description, value }, index) => (
							<div className="flex justify-between px-7 py-7" key={index}>
								<div className="flex items-center gap-5">
									<div className="text-purple-600 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
										<Icon path={icon} size={1.5} />
									</div>
									<div>
										<p className="text-lg font-medium text-purple-600">
											{title}
										</p>
										<span className="font-medium text-gray-400">
											{description}
										</span>
									</div>
								</div>
								<div>
									<p className="mt-1 font-medium text-lg text-gray-800 dark:text-white">
										{value}
									</p>
								</div>
							</div>
						)
					)}
				</div>
			</div>

			<div className="mt-12 grid grid-cols-12 md:gap-6 2xl:gap-7">
				<div className="col-span-12 xl:col-span-6">
					<img src={dish} alt="satellite dish" className="w-full max-w-2xl" />
				</div>
				<div className="col-span-12 xl:col-span-6">
					<div className="rounded-sm w-full mt-auto space-y-4">
						<div className="border-b dark:border-gray-500 py-4">
							<h3 className="font-medium text-2xl text-gray-800 dark:text-white">
								控制台
							</h3>
						</div>

						<Formik
							enableReinitialize
							initialValues={
								{
									newPan: data?.getPanTilt.currentPan,
									newTilt: data?.getPanTilt.currentTilt,
									newOffset: data?.getPanTilt.northOffset
								} as SetPanTiltMutationVariables
							}
							validate={(values) => {
								const errors: {
									newPan?: string;
									newTilt?: string;
									newOffset?: string;
								} = {};
								if (values.newPan < 0 || values.newPan > 360) {
									errors.newPan = "方位角应在 0 到 360 之间";
								}
								if (values.newTilt < 0 || values.newTilt > 85) {
									errors.newTilt = "俯仰角应在 0 到 85 之间";
								}
								if (values.newOffset < 0 || values.newOffset > 360) {
									errors.newOffset = "北偏角应在 0 到 360 之间";
								}
								return errors;
							}}
							onSubmit={async (values, { setSubmitting }) => {
								await handleSetPanTilt(values);
								setSubmitting(false);
							}}
						>
							{({ isSubmitting }) => (
								<Form className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-800 dark:text-white">
											转台方位设定
										</label>
										<ErrorMessage
											className="text-red-500 text-sm"
											name="newPan"
											component="div"
										/>
										<Field
											className="w-full rounded border dark:border-gray-600 bg-transparent px-5 py-3 text-gray-800 outline-none dark:text-white"
											type="number"
											name="newPan"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-800 dark:text-white">
											转台俯仰设定
										</label>
										<ErrorMessage
											className="text-red-500 text-sm"
											name="newTilt"
											component="div"
										/>
										<Field
											className="w-full rounded border dark:border-gray-600 bg-transparent px-5 py-3 text-gray-800 outline-none dark:text-white"
											type="number"
											name="newTilt"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-800 dark:text-white">
											转台北偏角设定
										</label>
										<ErrorMessage
											className="text-red-500 text-sm"
											name="newOffset"
											component="div"
										/>
										<Field
											className="w-full rounded border dark:border-gray-600 bg-transparent px-5 py-3 text-gray-800 outline-none dark:text-white"
											type="number"
											name="newOffset"
										/>
									</div>

									<button
										className="w-full text-center rounded-md bg-purple-700 hover:bg-purple-800 p-3 text-white font-medium transition-all disabled:cursor-not-allowed"
										disabled={isSubmitting}
										type="submit"
									>
										提交
									</button>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			</div>
		</div>
	) : (
		<Error heading={error.name} content={error.toString()} debug={error.stack} />
	);
};

export default Control;
