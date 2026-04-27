"use client";
import { HistogramData } from "@/interfaces/HistogramData";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface HistogramProps {
  data: HistogramData[];
}

const Histogram = ({ data }: HistogramProps) => {
  const margins = { top: 30, right: 30, bottom: 30, left: 30 };
  const [svgDimensions, setSvgDimensions] = useState({ height: 0, width: 0 });
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    content: "",
  });
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
    [0, d3.max([...data, { count: 5, date: "" }], (d) => d.count) ?? 0],
    [svgDimensions.height - margins.bottom, margins.top],
  );

  // Date string parsing to display month names for readability
  const parseMonth = d3.utcParse("%Y-%m-%d");
  const formatMonth = d3.utcFormat("%B");

  useEffect(() => {
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
  }, [svgDimensions.height, svgDimensions.width, JSON.stringify(data)]); // We need to stringify the array as react will just use an object reference check otherwise

  const handleMouseEnter = (d: HistogramData) => {
    // Use what we already have to calculate the text size from a sacrificial lamb
    const svg = d3.select(histogramSvgRef.current);
    const tempText = svg
      .append("text")
      .attr("font-size", 12)
      .text(`Sightings: ${d.count} \n (${formatMonth(parseMonth(d.date)!)})`);

    const textBBox = tempText.node()!.getBBox();
    const [rectWidth, rectHeight] = [
      textBBox.width + 10 * 4, // Probably due to text rendering stuff with too little or no padding the rect will be smaller than the text
      textBBox.height * 2 + 10 * 2,
    ];
    tempText.remove(); // The lamb is sacrificed, onward to a new era

    // Clamp the tooltip top position so it doesn't clip outside the svg on tall bars
    const tooltipY = yScale(d.count) - 10;
    const minY = rectHeight + 20; // Minimum y position to avoid clipping, 10 meets the edges of the svg but 20 gives nicer padding

    setTooltip({
      visible: true,
      x: (xScale(d.date) ?? 0) + xScale.bandwidth() / 2,
      y: Math.max(tooltipY, minY),
      width: rectWidth,
      height: rectHeight,
      content: `Sightings: ${d.count} \n (${formatMonth(parseMonth(d.date)!)})`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      content: "",
    });
  };

  return (
    <svg ref={histogramSvgRef} className="w-full h-full bg-white">
      <g>
        {data.map((d) => (
          <g key={d.date}>
            <rect
              x={xScale(d.date)}
              y={yScale(d.count)}
              width={xScale.bandwidth()}
              height={yScale(0) - yScale(d.count)}
              fill="steelblue"
              onMouseEnter={() => handleMouseEnter(d)}
              onMouseLeave={handleMouseLeave}
            />
            <text
              // Add "tick mark" labels with bars for better general user accessibility than y-axis ticks for a "simpler" chart
              x={(xScale(d.date) ?? 0) + xScale.bandwidth() / 2}
              y={Math.max(margins.top + 12, yScale(d.count) - 6)}
              textAnchor="middle"
              fontSize={11}
              fill="#111827"
            >
              {d.count}
            </text>
          </g>
        ))}
      </g>
      {tooltip.visible && (
        <g
          transform={`translate(${tooltip.x - tooltip.width / 2}, ${tooltip.y - tooltip.height - 10})`}
        >
          <rect
            width={tooltip.width}
            height={tooltip.height}
            fill="white"
            stroke="#ccc"
            rx={4}
            ry={4}
          />
          <text
            // Center the text horizontally and vertically and adjust for font and lines
            x={tooltip.width / 2}
            y={
              tooltip.height / 2 - (tooltip.content.split("\n").length - 1) * 6
            }
            textAnchor="middle"
            fill="#333"
          >
            {tooltip.content.split("\n").map((line, index) => (
              <tspan
                key={index}
                x={tooltip.width / 2}
                dy={index === 0 ? "0" : "1.2em"}
              >
                {line}
              </tspan>
            ))}
          </text>
          <path
            d={`M${tooltip.width / 2 - 5},${tooltip.height} 
          L${tooltip.width / 2},${tooltip.height + 6} 
          L${tooltip.width / 2 + 5},${tooltip.height} 
          Z`}
            fill="white"
            stroke="#ccc"
          />
        </g>
      )}
      <g
        ref={xAxisRef}
        transform={`translate(0, ${svgDimensions.height - margins.bottom})`}
      />
      <g ref={yAxisRef} transform={`translate(${margins.left}, 0)`} />
    </svg>
  );
};

export default Histogram;
