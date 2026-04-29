import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import * as d3 from "d3";
import { MapSightingData } from "@/interfaces/MapSightingData";
import L from "leaflet";
import geoJson from "@/data/ltla2025.json";

const data = geoJson as GeoJSON.FeatureCollection; // 2025 Lower Tier Local Authorities data from ONS: https://onsdigital.github.io/uk-topojson/

/**
 * D3-Leaflet combination leaflet map content layer for dataViz
 *
 * IMPORTANT! for general info around the code inside this component read this:
 * https://observablehq.com/@sfu-iat355/intro-to-leaflet-d3-interactivity
 *
 * @param {Object} props - The component props
 * @param {MapSightingData[]} props.sightingData - The data array for the sightings to be visualized on the map
 *
 * @returns Map svg layer component with content
 */
const MapSvgLayer = ({ sightingData }: { sightingData: MapSightingData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Adding an svg layer any other way does not work, it has to be done following this:
    // https://observablehq.com/@sfu-iat355/intro-to-leaflet-d3-interactivity#WesternCanadianCities
    L.svg().addTo(map);

    const overlay = d3.select(map.getPanes().overlayPane);
    const svg = overlay.select("svg").style("pointer-events", "auto");
    svg.selectAll("*").remove();

    const bubbleLayer = svg.append("g");

    const tooltip = svg
      .append("g")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    const tooltipRect = tooltip
      .append("rect")
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("rx", 4)
      .attr("ry", 4);

    const tooltipText = tooltip
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "16px")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging")
      .attr("fill", "#333")
      .style("pointer-events", "none");

    const tooltipArrow = tooltip
      .append("path")
      .attr("fill", "white")
      .attr("stroke", "#ccc");

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
      .attr("cx", (d) => map.latLngToLayerPoint([d.lat, d.lon]).x)
      .attr("cy", (d) => map.latLngToLayerPoint([d.lat, d.lon]).y)
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible");
        tooltip.select("text").text(`${d.cityName}: ${d.value}`);

        d3.select(this).attr("stroke-width", 3);

        // Measure the text and adjust the positioning and rect size so we dont have any overflow
        const textBBox = tooltipText.node()!.getBBox();
        const [rectWidth, rectHeight] = [
          textBBox.width + 10 * 2,
          textBBox.height + 10 * 2,
        ];
        tooltipRect.attr("width", rectWidth).attr("height", rectHeight);
        tooltipText.attr("transform", `translate(${rectWidth / 2}, ${10})`);

        // Position the tooltip above the circle and centered
        const cx = +d3.select(event.target).attr("cx");
        const cy = +d3.select(event.target).attr("cy");
        tooltip.attr(
          "transform",
          `translate(${cx - rectWidth / 2}, ${cy - 50})`,
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

    const update = () =>
      bubbleSelection
        .attr("cx", (d) => map.latLngToLayerPoint([d.lat, d.lon]).x)
        .attr("cy", (d) => map.latLngToLayerPoint([d.lat, d.lon]).y);

    map.on("move zoom resize", update);

    return () => {
      map.off("move zoom resize", update);
    };
  }, [map, sightingData]);

  // We need to segregate the geoJson logic because if not then changing options in the MapControls caused another draw each time state changes
  useEffect(() => {
    if (!map) return;

    // We need to add a seperate pane for geojson boundaries or else it renders over the bubbles
    if (!map.getPane("geoPane")) {
      map.createPane("geoPane");
      map.getPane("geoPane")!.style.zIndex = "200";
      map.getPane("geoPane")!.style.pointerEvents = "none";
    }

    const geoFeatures = L.geoJSON(data, {
      pane: "geoPane",
      style: {
        fill: false,
        color: "#0000004D",
        weight: 1,
        opacity: 0.25,
      },
    }).addTo(map);

    // Center and zoom the map to fit the geojson boundaries, this is way better trying to fine tune a zoom level
    map.fitBounds(geoFeatures.getBounds());
  }, [map]);

  return null;
};

export default MapSvgLayer;
