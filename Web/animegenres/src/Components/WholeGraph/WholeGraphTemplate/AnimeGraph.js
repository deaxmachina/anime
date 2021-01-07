import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./WholeGraphTemplate.css";


const AnimeGraph = ({ 
  data, allData, selectedAnime, selectedYear, setSelectedYear, setSelectedAnime 
  }) => {

  /// refs ///
  const svgRef = useRef();
  const nodeGRef = useRef();

  /// constatns ///
  // dimensions 
  const width = 1400;
  const height = 800;
  const margin = {top: 0, bottom: 0, right: 0, left: 0}
  // radius of the anime circle of the force graph 
  const minRadiusAnime = 3;
  const maxRadiusAnime = 20;
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
      // Colour scale - number of anime per year
      // find the min and the max number of anime in any given year 
      // for now just using 0 to 1200 hardcoded 
      const colorScale = chroma.scale([lowNumberColour, highNumberColour]
        .map(color => chroma(color).saturate(1)))
        .domain([0, 1110])
      // Popularity scale - number of members who have seen the anime 
      const popularityScale = d3.scaleSqrt()
          .domain(d3.extent(allData, d => d.members))
          .range([minRadiusAnime, maxRadiusAnime])


      /// Graph ///
      // Force simulation for the force circles 
      const nodeG = d3.select(nodeGRef.current)
        .attr("transform", `translate(${width/2}, ${height/2.2})`)

      // circles for the force simulation 
      const node = nodeG  
        .selectAll(".anime-circle")
        .data(_.uniqBy(dataOneYear, 'mal_id'), d => d.mal_id) // filer my mal_id so that we don't get repeated anime in the same year when the anime goes on for more than 1 season 
        .join("circle")
          .classed("anime-circle",true)
          .attr("r", 1) // give them a fixed radius to start from 
          .attr("fill", d => colorScale(dataOneYear.length))
          .on("mouseenter", function(e, datum) {
            d3.select(this)
              .attr("stroke", "white")
              .attr("stroke-width", 3)
            setSelectedAnime(datum)
          })
          .on("mouseleave", function(e, datum) {
            d3.select(this)
              .attr("stroke-width", 0)
            setSelectedAnime(null)
          })
      function tick() {
          node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
          }
      const simulation = d3.forceSimulation(dataOneYear)
            .on("tick", tick)
            .force("collide", d3.forceCollide().radius(d => 1 + popularityScale(d.members)))
            .stop();
      // this is how long it takes for the simulation to happen 
      setTimeout(() => {
        simulation.restart();
        // radius is scaled by the members i.e. popularity of the anime
        node.transition().attr("r", d => popularityScale(d.members));
      }, 100);
    
      // show the initial arrangement
      tick();

    } else {
      console.log("Missing data")
    }
  }, [data, selectedYear, allData]);


  return (
    <>
        <svg ref={svgRef} width={width} height={height}>
          <g ref={nodeGRef}></g>
        </svg>
        <div className="whole-graph-template-tooltip">
          {selectedAnime 
          ? <div>
              <span className="whole-graph-template-tooltip-title">{selectedAnime.title}</span>
              <span className="whole-graph-template-tooltip-info">year: {selectedAnime.air_year}</span>
              <span className="whole-graph-template-tooltip-info">season: {selectedAnime.air_season}</span>
              <span className="whole-graph-template-tooltip-info">members: {selectedAnime.members}</span>
              <span className="whole-graph-template-tooltip-info">score: {selectedAnime.score}</span>       
            </div> 
          : null}
        </div>
    </>
  )
}

export default AnimeGraph;

