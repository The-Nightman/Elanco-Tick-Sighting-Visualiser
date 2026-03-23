"use client";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface HistogramProps{
  data:{ count: number; date: string }[]
}

const Histogram = ({ data }: HistogramProps) => {
  const [svgDimensions, setSvgDimensions] = useState({ height: 0, width: 0 });
  const histogramSvgRef = useRef<SVGSVGElement | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const xAxisRef = useRef<SVGGElement | null>(null);
  const yAxisRef = useRef<SVGGElement | null>(null);
  const barPlotRef = useRef<SVGGElement | null>(null);


  const xScale = d3.scaleBand(
    data.map(d => d.date),
    [16, svgDimensions.width - 16],
  );
  const yScale = d3.scaleLinear(
    [0, d3.max(data, (d) => d.count) ?? 0],
    [svgDimensions.height - 16, 16],
  );

  useEffect(() => {
    const svgElement = histogramSvgRef.current;
    setSvgDimensions({
      height: svgElement!.clientHeight,
      width: svgElement!.clientWidth,
    });
  }, []);

      useEffect(() => {

    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((m) => d3.timeFormat("%b")(new Date(+m)));

    const yAxis = d3.axisLeft(yScale).ticks(5);

    d3.select(xAxisRef.current!).call(xAxis);
    d3.select(yAxisRef.current!).call(yAxis);
   // d3.select(barPlotRef.current!).data(data)



  }, []);

  return (
    <div>
      <svg ref={histogramSvgRef}>
        
        <g ref={barPlotRef}>
          {data.map((d) => (
        <rect
          key={d.date}
          x={xScale(d.date)}
          y={yScale(d.count)}
          width={xScale.bandwidth()}
          height={yScale(0) - yScale(d.count)}
          fill="steelblue"
        />
      ))}
          </g> 
  <g ref={xAxisRef} transform={`translate(0, ${svgDimensions.height-16})`}/>;
  <g ref={yAxisRef} transform={`translate(${16}, 0)`} />
      </svg>
    </div>
  );
};

export default Histogram;
