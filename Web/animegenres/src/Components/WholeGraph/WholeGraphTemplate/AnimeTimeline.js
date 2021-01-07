import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./WholeGraphTemplate.css";


const AnimeTimeline = ({ 
  data, allData, selectedYear, setSelectedYear 
  }) => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const gRef = useRef();
  const rectRef = useRef();

  /// constatns ///
  // dimensions 
  const width = 1400;
  const heightRect = 100;
  const height = 100;
  const margin = {top: 0, bottom: 45, right: 40, left: 40}
  // radius of the timeline circles 
  const minRadiusTimeline = 2;
  const maxRadiusTimeline = 15;
  // colours 
  const shapeBackgroundColour = "#010B14"
  const lowNumberColour = "#4361ee"
  const highNumberColour = "#f72585"
  const axisTextColour = "white"

    /// D3 Code ///
  useEffect(() => {
    if (data && allData) {

      let dataOneYear = _.filter(allData, {'air_year': parseInt(selectedYear)});

      /// Scales ///
      // X Scale 
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
      // Scale the circles of the timeline by number of anime of that year
      const numberAnimeScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.number_animes))
        .range([minRadiusTimeline, maxRadiusTimeline])

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${heightRect - margin.bottom})`)
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
        .attr("height", heightRect)
        .attr('fill', shapeBackgroundColour) 

      // draw one circle for each year, coloured by number of anime
      const yearCircles = g
        .selectAll(".year-circles")
        .data(data)
        .join("circle")
        .classed("year-circles", true)
          .attr("r", d => numberAnimeScale(d['number_animes']))
          .attr("cx", d => xScale(d['year']) + xScale.bandwidth()/2)
          .attr("cy", heightRect/3)
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
            .attr("y", heightRect/3)
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
        .on("click", onClick)
      
      function onClick(e, datum) {
        setSelectedYear(datum['year'])
        // expand the radius 
        d3.select(this).attr("r", d => 1.5 * numberAnimeScale(d['number_animes']))
      }
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
  }, [data, selectedYear, allData]);


  return (
    <>
      <svg ref={svgRef} width={width} height={height}>
        <g ref={rectRef}></g>
        <g ref={gRef}></g>
        <g ref={xAxisRef}></g>
      </svg>
    </>
  )
}

export default AnimeTimeline;