"use client";
import { StackedHistogramData } from "@/interfaces/StackedHistogramData";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface HistogramStackedProps {
  data: StackedHistogramData[];
}

const HistogramStacked = ({ data }: HistogramStackedProps) => {
  const margins = { top: 30, right: 30, bottom: 30, left: 30 };
  const [svgDimensions, setSvgDimensions] = useState({ height: 0, width: 0 });
  const histogramSvgRef = useRef<SVGSVGElement | null>(null);
  const xAxisRef = useRef<SVGGElement | null>(null);
  const yAxisRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const svgElement = histogramSvgRef.current;
    setSvgDimensions({
      height: svgElement!.clientHeight,
      width: svgElement!.clientWidth,
    });
  }, []);

  const xScale = d3.scaleBand(
    data.map((d) => d.date),
    [margins.left, svgDimensions.width - margins.right],
  );
  const yScale = d3.scaleLinear(
    // Add an object as pseudo-data to act as a minimum domain threshold for better presentation at low counts
    [
      0,
      d3.max(
        [...data, { data: [{ speciesName: "", count: 5 }], date: "" }],
        (d) => d3.max(d.data, (s) => s.count) ?? 0,
      ) ?? 0,
    ],
    [svgDimensions.height - margins.bottom, margins.top],
  );

  useEffect(() => {
    // Date string parsing to display month names for readability
    const parseMonth = d3.utcParse("%Y-%m-%d");
    const formatMonth = d3.utcFormat("%B");

    d3.select(xAxisRef.current!).call(
      d3
        .axisBottom(xScale)
        .tickValues(data.map((m) => m.date))
        .tickFormat((d) => {
          const parsed = parseMonth(String(d));
          return parsed ? formatMonth(parsed) : "";
        })
        .tickSizeOuter(0),
    );
  }, [svgDimensions.height, svgDimensions.width]);

  return (
    <svg ref={histogramSvgRef} className="w-full h-full bg-white">
      <g>
        {data.map((d) => (
          <g key={d.date}>
            {d.data.map((s, i) => (
              <g key={`${s.speciesName}-${i}-${d.date}-${s.count}`}>
                <rect
                  x={xScale(d.date)}
                  y={yScale(s.count)}
                  width={xScale.bandwidth()}
                  height={yScale(0) - yScale(s.count)}
                  fill={`${s.colour}99`}
                  stroke={s.colour}
                />
                <text
                  // Add "tick mark" labels with bars for better general user accessibility than y-axis ticks for a "simpler" chart
                  x={(xScale(d.date) ?? 0) + xScale.bandwidth() / 2}
                  y={Math.max(margins.top + 12, yScale(s.count) - 6)}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#111827"
                >
                  {s.count}
                </text>
              </g>
            ))}
          </g>
        ))}
      </g>
      <g
        ref={xAxisRef}
        transform={`translate(0, ${svgDimensions.height - margins.bottom})`}
      />
      <g ref={yAxisRef} transform={`translate(${margins.left}, 0)`} />
    </svg>
  );
};

export default HistogramStacked;
