"use client";

import { useState } from "react";
import { MapSightingData } from "@/interfaces/MapSightingData";
import MapControls from "./MapControls";
import { MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet";
import MapBubbleLayer from "./MapSvgLayer";

const width = 800;
const height = 600;

const D3Map = () => {
  const [sightingData, setSightingData] = useState<MapSightingData[]>([]);

  return (
    <div id="map" className={`relative xl:flex w-full h-[${height}px] max-h-[${height}px] max-w-full`}>
      <MapContainer
        center={[54.093409, -2.89479]}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBubbleLayer sightingData={sightingData} />
      </MapContainer>
      <MapControls setMapData={setSightingData} />
    </div>
  );
};

export default D3Map;
