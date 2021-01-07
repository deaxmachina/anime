import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./TimelineCircles.css";
import dataLoad from "../data/mal_scrape.json";


const TimelineCircles = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const gRef = useRef();
  const rectRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2006)

  /// constatns ///
  // dimensions 
  const width = 1400;
  const height = 100;
  const margin = {top: 0, bottom: 45, right: 20, left: 20}
  const radius = 10;
  const minRadius = 2;
  const maxRadius = 15;
  // colours 
  const shapeBackgroundColour = "#010B14"
  const lowNumberColour = "#4361ee"
  const highNumberColour = "#f72585"
  const axisTextColour = "white"

  /// Data load ///
  useEffect(() => {
    //console.log(dataLoad)
    const startEndYear = d3.extent(dataLoad, d => d.air_year)
    const yearsRange = _.range(startEndYear[0], startEndYear[1] + 1)
    // transform data into just {year: 2020, number_anime: 800}
    const counts = _.countBy(dataLoad, 'air_year')
    // transform data into required array of obj format
    const countsList = []
      for (const [year, count] of Object.entries(counts)) {
        countsList.push({
          year: year,
          number_animes: count
        })
      };
    const filteredCountsList = _.filter(countsList, function(o) { return o.year >= 1960 });
    setData(filteredCountsList)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      /// Scales ///
      // X Scale - corresponds to season within a given year 
      const xScale = d3.scaleBand()
        .domain(data.map(d => d['year'])) // all years
        .range([margin.left, width - margin.right])
        .padding(0.1)

      // Colour scale - number of anime per year
      // find the min and the max number of anime in any given year 
      // for now just using 0 to 1200 hardcoded 
      const colorScale = chroma.scale([lowNumberColour, highNumberColour]
        .map(color => chroma(color).saturate(1)))
        .domain([0, 1110])
      // to scale the circles by numner of anime of that year
      const numberAnimeScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.number_animes))
        .range([minRadius, maxRadius])

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .style("fill", axisTextColour)
          .attr("font-size", "0.9em")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-60)")
        )
        .call(g => g.selectAll(".tick")
          .style("color", axisTextColour)
        )

      /// Graph ///
      const g = d3.select(gRef.current)

      // draw a rectangle behind the circles 
      const rectBackground = d3.select(rectRef.current)
        .append("rect")
        .attr("rx", 30)
        .attr("ry", 30)
        .attr("width", width)
        .attr("height", height)
        .attr('fill', shapeBackgroundColour) 

      // draw one circle for each year, coloured by number of anime
      const yearCircles = g
        .selectAll("circle")
        .data(data)
        .join("circle")
          .attr("r", d => numberAnimeScale(d['number_animes']))
          .attr("cx", d => xScale(d['year']) + xScale.bandwidth()/2)
          .attr("cy", height/3)
          .attr("fill", d => colorScale(d['number_animes']))
          .attr("fill-opacity", 1)
          .attr("stroke", d => colorScale(d['number_animes']))
          // if you want the stroke to scale with size of circle
          //.attr("stroke-width", d => numberAnimeScale(d['number_animes']) * 0.5)
          // if you want the stroke to be constant
          .attr("stroke-width", 8)
          .attr("stroke-opacity", 0.5)
     
      // add text with number of animes on top of each circle 
      const yearCirclesText = g
          .selectAll(".circles-text")
          .data(data)
          .join("text")
          .classed("circles-text", true)
          .attr("x", d => xScale(d['year']) + xScale.bandwidth()/2)
          .attr("y", height/3)
          .attr("dy", ".35em")
          .text(d => d['number_animes'])
          .attr("fill", axisTextColour)
          .attr("font-size", "8px")
          .attr("text-anchor", "middle")
          .attr("opacity", 0.8)
          .attr('cursor', 'default')
          .attr('pointer-events', 'none')
          .attr("id", d => d['year'])
      
      // set up events on the circles 
      yearCircles
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)
        .on("click", onMouseEnter)
      
      function onMouseEnter(e, datum) {
        // expand the radius 
        d3.select(this).attr("r", d => 1.5 * numberAnimeScale(d['number_animes']))
      }

      function onMouseLeave(e, datum) {
        // shrink the radius back to normal
        d3.select(this).attr("r", d => numberAnimeScale(d['number_animes']))
      }

      // call the axes 
      d3.select(xAxisRef.current).call(xAxis)

    } else {
      console.log("Missing data")
    }
  }, [data]);


  return (
    <div>
      <div>
        <svg ref={svgRef} width={width} height={height}>
          <g ref={rectRef}></g>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
        </svg>
      </div>
    </div>
  )
};

export { TimelineCircles }