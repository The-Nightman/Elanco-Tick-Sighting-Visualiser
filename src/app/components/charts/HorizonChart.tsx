import { HorizonData } from "@/interfaces/HorizonData";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const HorizonChart = ({ data }: { data: HorizonData[] }) => {
  const [svgDimensions, setSvgDimensions] = useState({ height: 0, width: 0 });
  const horizonSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svgElement = horizonSvgRef.current;
    setSvgDimensions({
      height: svgElement!.clientHeight,
      width: svgElement!.clientWidth,
    });
  }, []);

  const dates = Array.from(d3.group(data, (d) => +d.date).keys()).sort(
    d3.ascending,
  );
  const series = d3
    .groups(data, (d) => d.cityName)
    .map(([cityName, sightings]) => {
      const value = new Map(sightings.map((d) => [+d.date, d.sightingCount]));
      return {
        cityName,
        values: dates.map(d => value.get(d) ?? 0) as number[],
      };
    });

  const xExtents = d3.extent(data.map((d) => new Date(d.date).getTime()));
 const xScale = d3.scaleLinear(
  xExtents as [number, number],
  [16, svgDimensions.width - 16],
  );
  const yScale = d3.scalePoint(
    data.map((d) => d.cityName),
    [16, svgDimensions.height - 16],
  );
  const zScale = d3.scaleLinear(
    [0, d3.max(series, (d) => d3.max(d.values as number[]))!],
    [0, -8 * yScale.step()],
  );

  const area = d3
    .area()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d))
    .x((d, i) => xScale(dates[i]))
    .y0(0)
    .y1((d) => zScale(d));

  const line = area.lineY1();

  return <svg ref={horizonSvgRef}></svg>;
};

export default HorizonChart;
