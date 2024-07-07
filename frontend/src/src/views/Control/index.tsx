import { mdiBackupRestore, mdiBoomGateArrowUp, mdiClockAlert, mdiNavigation } from "@mdi/js";
import Icon from "@mdi/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();

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
				t("views.control.actions.set_offset.loading"),
				t("views.control.actions.set_offset.success"),
				t("views.control.actions.set_offset.failure"),
				true
			);
		}
		await sendPromiseAlert(
			setPanTiltMutation({ variables: { newPan, newTilt } }),
			t("views.control.actions.set_pan_tilt.loading"),
			t("views.control.actions.set_pan_tilt.success"),
			t("views.control.actions.set_pan_tilt.failure"),
			true
		);
	};

	// States for all components
	const [panTiltStates, setPanTiltStates] = useState({
		trueAzimuth: {
			icon: mdiNavigation,
			value: "0 °",
			title: t("views.control.cards.true_azimuth.title"),
			description: t("views.control.cards.true_azimuth.description")
		},
		panTiltPan: {
			icon: mdiBackupRestore,
			value: "0 °",
			title: t("views.control.cards.pan_tilt_pan.title"),
			description: t("views.control.cards.pan_tilt_pan.description")
		},
		panTiltTilt: {
			icon: mdiBoomGateArrowUp,
			value: "0 °",
			title: t("views.control.cards.pan_tilt_tilt.title"),
			description: t("views.control.cards.pan_tilt_tilt.description")
		},
		panTiltBusy: {
			icon: mdiClockAlert,
			value: t("common.statement.busy"),
			title: t("views.control.cards.pan_tilt_busy.title"),
			description: t("views.control.cards.pan_tilt_busy.description")
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
					value: getPanTilt.isBusy
						? t("common.statement.busy")
						: t("common.statement.ready")
				}
			}));
			setPanTiltOffset((prev) => ({ ...prev, value: getPanTilt.northOffset }));
		}
	}, [t, data, error, loading]);

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
								{t("views.control.form.title")}
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
									errors.newPan = t("views.control.form.errors.invalid_pan");
								}
								if (values.newTilt < 0 || values.newTilt > 85) {
									errors.newTilt = t("views.control.form.errors.invalid_tilt");
								}
								if (values.newOffset < 0 || values.newOffset > 360) {
									errors.newOffset = t(
										"views.control.form.errors.invalid_offset"
									);
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
											{t("views.control.form.fields.set_pan")}
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
											{t("views.control.form.fields.set_tilt")}
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
												{t("views.control.form.fields.ignore_offset")}
											</label>
										</div>
									</div>

									{!panTiltOffset.ignore && (
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-800 dark:text-white">
												{t("views.control.form.fields.set_offset")}
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
										{t("views.control.form.submit")}
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
