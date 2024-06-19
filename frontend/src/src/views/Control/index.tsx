import { mdiBackupRestore, mdiBoomGateArrowUp, mdiClockAlert, mdiNavigation } from "@mdi/js";
import Icon from "@mdi/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";

import dish from "../../assets/dish.png";
import { Error } from "../../components/Error";
import {
	SetPanTiltMutationVariables,
	SetPanTiltOffsetMutationVariables,
	useGetData4ControlQuery,
	useSetPanTiltMutation,
	useSetPanTiltOffsetMutation
} from "../../graphql";
import { sendPromiseAlert } from "../../helpers/interact/sendPromiseAlert";

const Control = () => {
	// Handler for whether to set Pan-Tilt without offset
	const [panTiltOffset, setPanTiltOffset] = useState({
		value: 0,
		ignore: true
	});
	const handleToggleIgnorePanTiltOffset = () => {
		setPanTiltOffset((prev) => ({ ...prev, ignore: !prev.ignore }));
	};

	// Handler for setting Pan-Tilt
	const [setPanTiltMutation] = useSetPanTiltMutation();
	const [setPanTiltOffsetMutation] = useSetPanTiltOffsetMutation();
	const handleSetPanTilt = async ({
		newPan,
		newTilt,
		newOffset
	}: SetPanTiltMutationVariables & SetPanTiltOffsetMutationVariables) => {
		if (!panTiltOffset.ignore) {
			await sendPromiseAlert(
				setPanTiltOffsetMutation({ variables: { newOffset } }),
				"正在设置转台北偏角",
				"指令下发完成",
				"指令下发失败",
				true
			);
		}
		await sendPromiseAlert(
			setPanTiltMutation({ variables: { newPan, newTilt } }),
			"正在设置转台方位俯仰数据",
			"指令下发完成",
			"指令下发失败",
			true
		);
	};

	// States for all components
	const [panTiltStates, setPanTiltStates] = useState({
		trueAzimuth: {
			icon: mdiNavigation,
			value: "0 °",
			title: "真北方位角",
			description: "透过 GNSS 解算"
		},
		panTiltPan: {
			icon: mdiBackupRestore,
			value: "0 °",
			title: "转台方位角",
			description: "相对真北方位角"
		},
		panTiltTilt: {
			icon: mdiBoomGateArrowUp,
			value: "0 °",
			title: "转台俯仰角",
			description: "相对地平面俯仰角"
		},
		panTiltBusy: {
			icon: mdiClockAlert,
			value: "繁忙",
			title: "转台状态",
			description: "转台是否就绪"
		}
	});

	// Polling Pan-Tilt data
	const { data, error, loading } = useGetData4ControlQuery({ pollInterval: 1000 });
	useEffect(() => {
		if (!error && !loading) {
			const { getGnss, getPanTilt } = data!;
			setPanTiltStates((prev) => ({
				...prev,
				trueAzimuth: {
					...prev.trueAzimuth,
					value: `${getGnss.trueAzimuth.toFixed(2)} °`
				},
				panTiltPan: {
					...prev.panTiltPan,
					value: `${getPanTilt.currentPan.toFixed(2)} °`
				},
				panTiltTilt: {
					...prev.panTiltTilt,
					value: `${(90 - getPanTilt.currentTilt).toFixed(2)} °`
				},
				panTiltBusy: {
					...prev.panTiltBusy,
					value: getPanTilt.isBusy ? "繁忙" : "就绪"
				}
			}));
			setPanTiltOffset((prev) => ({ ...prev, value: getPanTilt.northOffset }));
		}
	}, [data, error, loading]);

	return !error ? (
		<div className="animate-fade p-8 min-h-screen">
			<div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4">
				{Object.values(panTiltStates).map(({ icon, title, description, value }, index) => (
					<div className="flex justify-between px-4 py-6 space-x-1" key={index}>
						<div className="flex items-center space-x-4">
							<div className="text-purple-600 flex size-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
								<Icon path={icon} size={1.5} />
							</div>
							<div className="whitespace-nowrap">
								<p className="text-lg font-medium text-purple-600">{title}</p>
								<span className="font-medium text-gray-400">{description}</span>
							</div>
						</div>
						<div className="whitespace-nowrap">
							<p className="mt-1 font-medium text-lg text-gray-800 dark:text-white">
								{value}
							</p>
						</div>
					</div>
				))}
			</div>

			<div className="mt-12 xl:grid xl:grid-cols-12 xl:gap-6 2xl:gap-7">
				<div className="hidden xl:block xl:col-span-6">
					<img src={dish} alt="satellite dish" className="w-full max-w-2xl" />
				</div>
				<div className="lg:col-span-6">
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
									newPan: 0,
									newTilt: 0,
									newOffset: panTiltOffset.value
								} as SetPanTiltMutationVariables & SetPanTiltOffsetMutationVariables
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
										<div className="flex items-center">
											<input
												className="rounded-full size-4"
												type="checkbox"
												checked={panTiltOffset.ignore}
												onChange={handleToggleIgnorePanTiltOffset}
											/>
											<label className="ml-1 text-sm font-medium text-gray-800 dark:text-white">
												不设置北偏角
											</label>
										</div>
									</div>

									{!panTiltOffset.ignore && (
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
									)}

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
