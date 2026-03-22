"use client";
import { HorizonData } from "@/interfaces/HorizonData";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface HorizonChartProps {
  data: HorizonData[];
}

const HorizonChart = ({ data }: HorizonChartProps) => {
  const margins = { top: 30, right: 20, bottom: 30, left: 120 };
  const overlap = 1; // Adjust this value to control the amount of overlap between layers
  const [svgDimensions, setSvgDimensions] = useState({ height: 0, width: 0 });
  const horizonSvgRef = useRef<SVGSVGElement | null>(null);
  const xAxisRef = useRef<SVGGElement | null>(null);
  const yAxisRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const uniqueCities = Array.from(new Set(data.map((d) => d.cityName)));

    // Calculate dynamic height based on the number of unique cities
    const dynamicHeight =
      margins.top + margins.bottom + uniqueCities.length * 16;

    const svgElement = horizonSvgRef.current;
    setSvgDimensions({
      height: dynamicHeight,
      width: svgElement ? svgElement.clientWidth : 0,
    });
  }, []);

  // Generate date timestamps for each week in the given year, this will help to smoothen the chart
  // lines and avoid a curve from the axis extents when only 1 or 2 data points are present in a year
  // TODO: Test this implementation with bi-weekly generation and decide which is more suitable
  const generatedDates = ((startYear: number, endYear: number): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(startYear, 0, 1);
    const endDate = new Date(endYear + 1, 0, 1);

    for (
      let date = startDate;
      date < endDate;
      date.setDate(date.getDate() + 7)
    ) {
      dates.push(new Date(date));
    }

    return dates;
  })(2026, 2026).map((date) => date.getTime());

  // Extract date timestamps from data
  const dates = Array.from(d3.group(data, (d) => +d.date).keys()).sort(
    d3.ascending,
  );

  // Combine generated dates with actual data dates to ensure the chart lines show accurate data
  const combinedDates = Array.from(new Set([...generatedDates, ...dates])).sort(
    d3.ascending,
  );

  // From D3 docs, iterate through the data to sort into "bins" for each city
  const series = d3
    .groups(data, (d) => d.cityName)
    .map(([cityName, sightings]) => {
      const value = new Map(sightings.map((d) => [+d.date, d.sightingCount]));
      return { cityName, values: combinedDates.map((d) => value.get(d) || 0) };
    });

  const xScale = d3.scaleUtc(
    // Domain needs to run from the start of the year to the end of the year for a clear data view
    [
      new Date(new Date(d3.min(combinedDates)!).getFullYear(), 0, 1),
      new Date(new Date(d3.max(combinedDates)!).getFullYear(), 11, 31),
    ],
    [margins.left, svgDimensions.width - margins.right],
  );
  const yScale = d3.scalePoint(
    Array.from(new Set(data.map((d) => d.cityName))),
    [margins.top, svgDimensions.height - margins.bottom],
  );
  const zScale = d3.scaleLinear(
    [0, d3.max(series, (d) => d3.max(d.values))!],
    [0, -overlap * yScale.step()],
  );

  const area = d3
    .area<number>()
    .curve(d3.curveBasis)
    .defined((d) => !isNaN(d))
    .x((_d, i) => xScale(combinedDates[i]))
    .y0(0)
    .y1((d) => zScale(d));

  const line = area.lineY1();

  // Generate area and line paths for each series
  const areaPath = series.map((d) => ({
    cityName: d.cityName,
    path: area(d.values),
  }));

  const linePath = series.map((d) => ({
    cityName: d.cityName,
    path: line(d.values),
  }));

  useEffect(() => {
    // Create x and y axis tickmarks
    if (xAxisRef.current && yAxisRef.current) {
      // TODO: Refactor tickFormat so that the graph can support data display over different timeframes
      d3.select(xAxisRef.current).call(
        d3
          .axisBottom(xScale)
          .ticks(svgDimensions.width / 80)
          .tickFormat((d) => d3.timeFormat("%B")(new Date(+d))) // Ensures the 1st tickmark is a month and not year
          .tickSizeOuter(0),
      );

      d3.select(yAxisRef.current)
        .call(d3.axisLeft(yScale).tickSize(0).tickPadding(4))
        .selectAll(".domain")
        .remove();
    }
  }, [svgDimensions.height, svgDimensions.width]);

  return (
    <svg
      ref={horizonSvgRef}
      className="w-full"
      style={{ height: `${svgDimensions.height}px` }} // Set dynamic height here
    >
      <g
        ref={xAxisRef}
        transform={`translate(0,${svgDimensions.height - margins.bottom})`}
      />
      <g ref={yAxisRef} transform={`translate(${margins.left},0)`} />
      {areaPath.map((d, i) => (
        <g key={i} transform={`translate(0,${yScale(d.cityName) ?? 0 + 1})`}>
          <path fill="#ddd" d={d.path || ""} />
          <path fill="none" stroke="black" d={linePath[i].path || ""} />
        </g>
      ))}
    </svg>
  );
};

export default HorizonChart;
