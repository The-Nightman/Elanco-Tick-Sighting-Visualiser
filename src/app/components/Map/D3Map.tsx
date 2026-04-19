"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { tile, tileWrap } from "d3-tile";
import geoJson from "@/data/ltla2025.json";
import { MapSightingData } from "@/interfaces/MapSightingData";
import MapControls from "./MapControls";

const width = 800;
const height = 600;
const tau = 2 * Math.PI; // Needed for mercator projection conversions

const data = geoJson as GeoJSON.FeatureCollection; // 2025 Lower Tier Local Authorities data from ONS: https://onsdigital.github.io/uk-topojson/

// OpenStreetMap tile server
const url = (x: number, y: number, z: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const D3Map = () => {
  const [sightingData, setSightingData] = useState<MapSightingData[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#d8d8d8");

    //* Removing this causes strange behaviour when zooming, the map will
    //* briefly snap back to the minimum zoom and redraw the boundaries
    svg.selectAll("*").remove();

    const mapTile = tile()
      .extent([
        [0, 0],
        [width, height],
      ])
      .tileSize(256)
      .clampX(false);

    const projection = d3.geoMercator();
    // Center the map on the UK and fit the geojson data within the svg element with padding
    // This is way better for our UX
    projection.fitExtent(
      [
        [20, 20],
        [width - 20, height - 20],
      ],
      data,
    );

    const path = d3.geoPath(projection);

    const fittedScale = projection.scale();
    const [tx, ty] = projection.translate();

    // Writing these elements into DOM below and using d3.select doesnt work for some reason so we will just have to keep appending
    const tileLayer = svg.append("g").attr("pointer-events", "none");
    const geoLayer = svg.append("g");
    const bubbleLayer = svg.append("g");

    const tooltip = svg
      .append("g")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    const tooltipRect = tooltip
      .append("rect")
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("rx", 4) // Rounded corners
      .attr("ry", 4);

    const tooltipText = tooltip
      .append("text")
      .attr("x", 5) // Padding inside the rect
      .attr("y", 15) // Padding inside the rect
      .attr("font-size", "12px")
      .attr("fill", "#333");

    const tooltipArrow = tooltip
      .append("path")
      .attr("fill", "white")
      .attr("stroke", "#ccc");

    let image = tileLayer.selectAll<SVGImageElement, [number, number, number]>(
      "image",
    );

    // Draw geoJson boundaries
    const geoFeatures = geoLayer
      .selectAll<SVGPathElement, GeoJSON.Feature>("path")
      .data(data.features)
      .join("path")
      .attr("fill", "transparent")
      .attr("stroke", "#0000004D")
      .attr("stroke-width", 1)
      .attr("vector-effect", "non-scaling-stroke");

    // Bubble scaling sourced from: https://observablehq.com/@d3/bubble-map/2
    const radiusScale = d3
      .scaleSqrt()
      // Add a fallback max value so that the bubbles have some relative scaling not solely
      // bound by the data, if we do this then we can improve UX for users between visits
      .domain([0, Math.max(d3.max(sightingData, (d) => d.value) ?? 0, 20)])
      .range([4, 20]);

    const bubbleSelection = bubbleLayer
      .selectAll<SVGCircleElement, MapSightingData>("circle")
      .data(sightingData)
      .join("circle")
      .attr("fill", "rgba(255, 80, 80, 0.7)")
      .attr("stroke", "rgba(199, 35, 35, 1)")
      .attr("stroke-width", 1.5)
      .attr("r", (d) => radiusScale(d.value))
      .join("path")
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible");
        tooltip.select("text").text(`${d.cityName}: ${d.value}`);

        d3.select(this).attr("stroke-width", 3);

        // Measure the text and adjust the rect size so we dont have any overflow
        const textBBox = tooltipText.node()!.getBBox();
        const [rectWidth, rectHeight] = [
          textBBox.width + 10, // 10px padding
          textBBox.height + 10,
        ];
        tooltipRect.attr("width", rectWidth).attr("height", rectHeight);

        // Position the tooltip above the circle and centered
        const cx = +d3.select(event.target).attr("cx");
        const cy = +d3.select(event.target).attr("cy");
        tooltip.attr(
          "transform",
          `translate(${cx - rectWidth / 2}, ${cy - 40})`,
        );

        const arrowWidth = 10;
        const arrowHeight = 6;
        tooltipArrow.attr(
          "d",
          `M${rectWidth / 2 - arrowWidth / 2},${rectHeight} 
          L${rectWidth / 2},${rectHeight + arrowHeight} 
          L${rectWidth / 2 + arrowWidth / 2},${rectHeight} 
          Z`,
        );
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 1.5);
        tooltip.style("visibility", "hidden");
      });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      // a zoom level of 22 that is suggested in the docs is unnecessary for us, 20 may be so
      // too but it offers slightly better UX and leaves options for further geo support later
      .scaleExtent([1 << 8, 1 << 20])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", ({ transform }) => zoomed(transform));

    const zoomed = (transform: d3.ZoomTransform) => {
      const tiles = mapTile(transform);

      image = image
        .data(tiles, (d: any) => d)
        .join("image")
        .attr("href", (d) => url(...tileWrap(d)))
        .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
        .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
        .attr("width", tiles.scale)
        .attr("height", tiles.scale);

      // Update projection scaling and drawn elements positions, if we forget then
      // best casethe geoJson and markers will just be static
      // worst case they will be positioned off the map entirely
      projection.scale(transform.k / tau).translate([transform.x, transform.y]);

      geoFeatures.attr("d", path);

      bubbleSelection
        .attr("cx", (d) => projection([d.lon, d.lat])?.[0] ?? -9999)
        .attr("cy", (d) => projection([d.lon, d.lat])?.[1] ?? -9999);
    };

    svg.call(zoom);

    const initialTransform = d3.zoomIdentity
      .translate(tx, ty)
      .scale(fittedScale * tau);

    svg.call(zoom.transform, initialTransform);

    return () => {
      svg.on(".zoom", null);
    };
  }, [sightingData]);

  return (
    <div className="relative flex w-full h-full max-w-full">
      <svg ref={svgRef} className="w-full h-auto" />
      <MapControls setMapData={setSightingData} />
    </div>
  );
};

export default D3Map;
