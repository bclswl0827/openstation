import {
	Cartesian2,
	Cartesian3,
	Color,
	Entity,
	HorizontalOrigin,
	JulianDate,
	NearFarScalar,
	PathGraphics,
	ReferenceFrame,
	SampledPositionProperty,
	TimeInterval,
	TimeIntervalCollection,
	VerticalOrigin
} from "cesium";
import { EciVec3, propagate, SatRec, twoline2satrec } from "satellite.js";

class SatelliteEntity {
	name: string;
	line_1: string;
	line_2: string;

	satelliteRecord: SatRec;
	durationSeconds: number;
	stepSeconds: number;

	leadTime: number;
	trailTime: number;

	constructor(tleData: string, durationSeconds: number, stepSeconds: number) {
		const tleDataSegment = tleData.split("\n");
		if (tleDataSegment.length !== 3) {
			throw new Error("TLE data is invalid");
		}

		const [name, line_1, line_2] = tleDataSegment;

		this.name = name.trim();
		this.line_1 = line_1.trim();
		this.line_2 = line_2.trim();
		this.satelliteRecord = twoline2satrec(this.line_1, this.line_2);

		this.durationSeconds = durationSeconds;
		this.stepSeconds = stepSeconds;

		const circle = line_2.slice(52, 64);
		this.leadTime = (24 * 3600) / parseInt(circle);
		this.trailTime = 0;
	}

	getPositionEci = (time: Date) => propagate(this.satelliteRecord, time).position;

	_getPositionProperty = (currentTime: number) => {
		const start = JulianDate.fromIso8601(new Date(currentTime).toISOString());
		const positionProperty = new SampledPositionProperty(ReferenceFrame.INERTIAL);

		for (let i = 0; i < this.durationSeconds / this.stepSeconds; i++) {
			const sateTime = new Date(currentTime + i * this.stepSeconds * 1000);
			const sateCoord = this.getPositionEci(sateTime) as EciVec3<number>;
			if (!sateCoord) {
				continue;
			}
			positionProperty.addSample(
				JulianDate.addSeconds(start, i * this.stepSeconds, new JulianDate()),
				new Cartesian3(sateCoord.x * 1000, sateCoord.y * 1000, sateCoord.z * 1000)
			);
		}

		return positionProperty;
	};

	createSatelliteEntity = (currentTime: number): Entity.ConstructorOptions => {
		const startTime = JulianDate.fromIso8601(new Date().toISOString());
		const endTime = JulianDate.addSeconds(startTime, this.durationSeconds, new JulianDate());
		const color4Satellite = Color.fromRandom({ alpha: 1.0 });
		return {
			name: this.name,
			availability: new TimeIntervalCollection([
				new TimeInterval({ start: startTime, stop: endTime })
			]),
			position: this._getPositionProperty(currentTime),
			point: {
				pixelSize: 10,
				color: color4Satellite,
				scaleByDistance: new NearFarScalar(1.5e3, 1, 8.0e8, 0.5)
			},
			path: new PathGraphics({
				width: 1,
				show: true,
				resolution: 256,
				leadTime: this.leadTime,
				trailTime: this.trailTime,
				material: color4Satellite
			}),
			label: {
				text: this.name,
				font: "12px",
				showBackground: true,
				backgroundColor: new Color(0.165, 0.165, 0.165, 0.5),
				backgroundPadding: new Cartesian2(6, 4),
				outlineWidth: 3,
				verticalOrigin: VerticalOrigin.CENTER,
				horizontalOrigin: HorizontalOrigin.CENTER,
				pixelOffset: new Cartesian2(0, 5),
				fillColor: Color.WHITE,
				pixelOffsetScaleByDistance: new NearFarScalar(1.5e3, 1, 8.0e8, 0.5)
			}
		};
	};
}

export default SatelliteEntity;
