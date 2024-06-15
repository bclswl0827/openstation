import "leaflet/dist/leaflet.css";

import { mdiMapMarker } from "@mdi/js";
import L from "leaflet";
import { useCallback, useRef } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

export interface MapBoxProps {
	readonly className?: string;
	readonly minZoom: number;
	readonly maxZoom: number;
	readonly zoom: number;
	readonly tile: string;
	readonly center: [number, number];
	readonly marker?: [number, number];
	readonly scrollWheelZoom?: boolean;
	readonly zoomControl?: boolean;
	readonly dragging?: boolean;
}

export const MapBox = ({
	className,
	minZoom,
	maxZoom,
	zoom,
	tile,
	center,
	marker,
	scrollWheelZoom,
	zoomControl,
	dragging
}: MapBoxProps) => {
	const icon = L.divIcon({
		html: `<svg viewBox="0 0 24 24" style="width: 1.8rem; height: 1.8rem;" role="presentation">
    <path d="${mdiMapMarker}" style="fill: currentcolor;"></path>
</svg>`,
		iconAnchor: [15, 25],
		className: "leaflet-data-marker"
	});

	const mapRef = useRef<L.Map | null>();
	const setMapRef = useCallback(
		(ref: L.Map | null) => {
			const map = ref;
			if (map) {
				mapRef.current = ref;
				map.flyTo(center, zoom);
			}
		},
		[center, zoom]
	);

	return (
		<MapContainer
			ref={setMapRef}
			className={`z-0 w-full ${className ?? ""}`}
			scrollWheelZoom={scrollWheelZoom}
			zoomControl={zoomControl}
			attributionControl={false}
			doubleClickZoom={false}
			dragging={dragging}
			maxZoom={maxZoom}
			minZoom={minZoom}
			center={center}
			zoom={zoom}
			style={{ cursor: "default" }}
		>
			<TileLayer url={tile} />
			{marker && <Marker position={marker} icon={icon} />}
		</MapContainer>
	);
};
