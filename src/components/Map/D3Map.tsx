"use client";

import { useState } from "react";
import { MapSightingData } from "@/interfaces/MapSightingData";
import MapControls from "./MapControls";
import { MapContainer, TileLayer } from "react-leaflet";
import MapSvgLayer from "./MapSvgLayer";
import "leaflet/dist/leaflet";

// const width = 800;
const height = 600;

const D3Map = () => {
  const [sightingData, setSightingData] = useState<{
    data: MapSightingData[];
    viewBySpecies: boolean;
  }>({ data: [], viewBySpecies: false });

  return (
    <div
      id="map"
      className={`relative xl:flex w-full max-w-full`}
      style={{ height: `${height}px`, maxHeight: `${height}px` }} // Unexpected problems of the map having no height appeared randomly so now we use this
    >
      <MapContainer
        center={[54.093409, -2.89479]}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSvgLayer sightingData={sightingData} />
      </MapContainer>
      <MapControls setMapData={setSightingData} />
    </div>
  );
};

export default D3Map;
