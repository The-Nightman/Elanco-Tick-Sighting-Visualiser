import { useEffect } from "react";
import { useMap } from "react-leaflet";
import * as d3 from "d3";
import { MapSightingData } from "@/interfaces/MapSightingData";
import L from "leaflet";
import geoJson from "@/data/ltla2025.json";

const data = geoJson as GeoJSON.FeatureCollection; // 2025 Lower Tier Local Authorities data from ONS: https://onsdigital.github.io/uk-topojson/

interface MapSvgLayerProps {
  sightingData: { data: MapSightingData[]; viewBySpecies: boolean };
}

/**
 * D3-Leaflet combination leaflet map content layer for dataViz
 *
 * IMPORTANT! for general info around the code inside this component read this:
 * https://observablehq.com/@sfu-iat355/intro-to-leaflet-d3-interactivity
 *
 * @param {MapSvgLayerProps} props - The component props
 * @param {{ data: MapSightingData[]; viewBySpecies: boolean }} props.sightingData - The data array for the sightings to be visualized on the map
 * @param {boolean} props.sightingData.viewBySpecies - Whether to view sightings by species
 *
 * @returns Map svg layer component with content
 */
const MapSvgLayer = ({ sightingData }: MapSvgLayerProps) => {
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
      .domain([0, Math.max(d3.max(sightingData.data, (d) => d.value) ?? 0, 20)])
      .range([4, 20]);

    const updateLayer = sightingData.viewBySpecies
      ? generatePie(bubbleLayer, sightingData.data, map, radiusScale, {
          body: tooltip,
          text: tooltipText,
          rect: tooltipRect,
          arrow: tooltipArrow,
        })
      : generateCircle(bubbleLayer, sightingData.data, map, radiusScale, {
          body: tooltip,
          text: tooltipText,
          rect: tooltipRect,
          arrow: tooltipArrow,
        });

    map.on("move zoom resize", updateLayer);

    return () => {
      map.off("move zoom resize", updateLayer);
    };
  }, [map, JSON.stringify(sightingData)]);

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

  /**
   * Adjusts the luminosity of a given hex color by a specified magnitude.
   *
   * @param {string} hexColour - The hex color code to be adjusted. It should be a 6-character string prefixed with `#`.
   * @param {number} magnitude - The amount by which to adjust the luminosity. Positive values lighten the color, while negative values darken it.
   * @returns {string} The adjusted hex color code. If the input hex color is not a 6-character string, the original hex color is returned.
   *
   * @remarks Rizwana, Syafiq and whomever it may concern, i sourced this from one of my personal projects i need to continue with since it fits my exact needs
   * https://github.com/The-Nightman/AtomiFit/blob/dev/utils/hexcodeLuminosity.ts
   */
  const hexcodeLuminosity = (hexColour: string, magnitude: number): string => {
    const hexcode = hexColour.replace(`#`, ``);
    // Check if the hex colour is a 6-character string
    if (hexcode.length === 6) {
      // Convert the hex colour to a 16-bit decimal
      const decimalColour = parseInt(hexcode, 16);
      // Extract the RGB components and adjust them by the magnitude
      // Extract red with a 16-bit right shift and adjust
      let r: number = (decimalColour >> 16) + magnitude;
      r > 255 && (r = 255);
      r < 0 && (r = 0);
      // Extract green with a bitwise AND mask and adjust
      let g: number = (decimalColour & 0x0000ff) + magnitude;
      g > 255 && (g = 255);
      g < 0 && (g = 0);
      // Extract blue with an 8-bit right shift, bitwise AND mask and adjust
      let b: number = ((decimalColour >> 8) & 0x00ff) + magnitude;
      b > 255 && (b = 255);
      b < 0 && (b = 0);
      // Return the adjusted hex colour as a string
      return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
      // Return the original hex colour if it is not a 6-character string
      return hexColour;
    }
  };

  // Breakout previous circle generation logic into reusable function so that we can use it for hotswapping between views
  const generateCircle = (
    bubbleLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
    sightingData: MapSightingData[],
    map: L.Map,
    radiusScale: d3.ScalePower<number, number, never>,
    tooltip: {
      body: d3.Selection<SVGGElement, unknown, null, undefined>;
      text: d3.Selection<SVGTextElement, unknown, null, undefined>;
      rect: d3.Selection<SVGRectElement, unknown, null, undefined>;
      arrow: d3.Selection<SVGPathElement, unknown, null, undefined>;
    },
  ) => {
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
        tooltip.body.style("visibility", "visible");
        tooltip.body.select("text").text(`${d.cityName}: ${d.value}`);

        d3.select(this).attr("stroke-width", 3);

        // Measure the text and adjust the positioning and rect size so we dont have any overflow
        const textBBox = tooltip.text.node()!.getBBox();
        const [rectWidth, rectHeight] = [
          textBBox.width + 10 * 2,
          textBBox.height + 10 * 2,
        ];
        tooltip.rect.attr("width", rectWidth).attr("height", rectHeight);
        tooltip.text.attr("transform", `translate(${rectWidth / 2}, ${10})`);

        // Position the tooltip above the circle and centered
        const cx = +d3.select(event.target).attr("cx");
        const cy = +d3.select(event.target).attr("cy");
        tooltip.body.attr(
          "transform",
          `translate(${cx - rectWidth / 2}, ${cy - 50})`,
        );

        const arrowWidth = 10;
        const arrowHeight = 6;
        tooltip.arrow.attr(
          "d",
          `M${rectWidth / 2 - arrowWidth / 2},${rectHeight} 
                  L${rectWidth / 2},${rectHeight + arrowHeight} 
                  L${rectWidth / 2 + arrowWidth / 2},${rectHeight} 
                  Z`,
        );
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 1.5);
        tooltip.body.style("visibility", "hidden");
      });

    const update = () =>
      bubbleSelection
        .attr("cx", (d) => map.latLngToLayerPoint([d.lat, d.lon]).x)
        .attr("cy", (d) => map.latLngToLayerPoint([d.lat, d.lon]).y);

    return update;
  };

  // Breakout new pie generation logic into reusable function so that we can use it for hotswapping between views
  const generatePie = (
    pieLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
    sightingData: MapSightingData[],
    map: L.Map,
    radiusScale: d3.ScalePower<number, number, never>,
    tooltip: {
      body: d3.Selection<SVGGElement, unknown, null, undefined>;
      text: d3.Selection<SVGTextElement, unknown, null, undefined>;
      rect: d3.Selection<SVGRectElement, unknown, null, undefined>;
      arrow: d3.Selection<SVGPathElement, unknown, null, undefined>;
    },
  ) => {
    const pie = d3
      .pie<MapSightingData["species"][number]>()
      .value((d) => d.count)
      .sort(null);

    const bubbleSelection = pieLayer
      .selectAll<SVGGElement, MapSightingData>("g.pie")
      .data(sightingData)
      .join("g")
      .attr("class", "pie")
      .style("pointer-events", "auto")
      .attr("transform", (d) => {
        const point = map.latLngToLayerPoint([d.lat, d.lon]);
        return `translate(${point.x}, ${point.y})`;
      });

    bubbleSelection.each(function (cityDatum) {
      const radius = radiusScale(
        cityDatum.species.reduce((sum, s) => sum + s.count, 0),
      );

      const arc = d3
        .arc<d3.PieArcDatum<MapSightingData["species"][number]>>()
        .innerRadius(0)
        .outerRadius(radius);

      d3.select(this)
        .selectAll<
          SVGPathElement,
          d3.PieArcDatum<MapSightingData["species"][number]>
        >("path")
        .data(pie(cityDatum.species))
        .join("path")
        .attr("d", arc)
        .attr("fill", (d, i) => `${d.data.colour}B3`) // 70% opacity, for future reference: https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
        .attr("stroke", (d, i) => hexcodeLuminosity(d.data.colour, -20))
        .attr("stroke-width", 1.5);

      d3.select(this)
        .selectAll("circle.pie-hit")
        .data([null])
        .join("circle")
        .attr("class", "pie-hit")
        .attr("r", radius)
        .attr("fill", "transparent")
        .style("pointer-events", "all")
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          tooltip.body.style("visibility", "visible");

          const lines =
            `${cityDatum.cityName}: ${cityDatum.value} \n ${cityDatum.species.map((s) => `${s.speciesName}: ${s.count}`).join("\n")}`.split(
              "\n",
            );
          const tspans = tooltip.text.selectAll("tspan").data(lines);

          tspans
            .join("tspan")
            .text((d) => d)
            .attr("x", 0)
            .attr("dy", (_, i) => (i === 0 ? "0em" : "1.2em"));

          d3.select(this).attr("stroke-width", 3);

          // Measure the text and adjust the positioning and rect size so we dont have any overflow
          const textBBox = tooltip.text.node()!.getBBox();
          const [rectWidth, rectHeight] = [
            textBBox.width + 10 * 2,
            textBBox.height + 10 * 2,
          ];
          tooltip.rect.attr("width", rectWidth).attr("height", rectHeight);
          tooltip.text.attr("transform", `translate(${rectWidth / 2}, ${10})`);

          // Position the tooltip above the circle and centered
          // Using the same method as the circles for position does not work as here it is relative to each pies group rather than the individual items
          const point = map.latLngToLayerPoint([cityDatum.lat, cityDatum.lon]);
          tooltip.body.attr(
            "transform",
            `translate(${point.x - rectWidth / 2}, ${point.y - rectHeight - 10})`,
          );

          const arrowWidth = 10;
          const arrowHeight = 6;
          tooltip.arrow.attr(
            "d",
            `M${rectWidth / 2 - arrowWidth / 2},${rectHeight} 
              L${rectWidth / 2},${rectHeight + arrowHeight} 
              L${rectWidth / 2 + arrowWidth / 2},${rectHeight} 
              Z`,
          );
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 1.5);
          tooltip.body.style("visibility", "hidden");
        });
    });

    const update = () =>
      bubbleSelection.attr("transform", (d) => {
        const point = map.latLngToLayerPoint([d.lat, d.lon]);
        return `translate(${point.x}, ${point.y})`;
      });

    return update;
  };

  return null;
};

export default MapSvgLayer;
