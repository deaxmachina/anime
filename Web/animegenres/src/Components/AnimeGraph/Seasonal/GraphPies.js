import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import ".../AnimeGraph.css";
import dataLoad from "../../data/mal_scrape.json";
import { allgenres, genres_categories } from "../../genres.js"

/// Gernes ///

// Colour Scale per category of genres 
const colorScale1 = chroma.scale(["#f14f8a", "#9e0059"]).colors(_.find(genres_categories, { 'category': 'genres1' }).genres.length)
const colorScale2 = chroma.scale(["#9e0059", "#9e0059"]).colors(_.find(genres_categories, { 'category': 'genres2' }).genres.length)
const colorScale3 = chroma.scale(["#21ABC0", "#21ABC0"]).colors(_.find(genres_categories, { 'category': 'genres3' }).genres.length)
const colorScale4 = chroma.scale(["#21ABC0", "#268ECF"]).colors(_.find(genres_categories, { 'category': 'genres4' }).genres.length)
const colorScale5 = chroma.scale(["#4a4e69", "#22223b"]).colors(_.find(genres_categories, { 'category': 'genres5' }).genres.length)
const colorScale6 = chroma.scale(["#f14f8a", "#f14f8a"]).colors(_.find(genres_categories, { 'category': 'genres6' }).genres.length)
const colorScales = {
        "genres1": colorScale1,
        "genres2": colorScale2,
        "genres3": colorScale3,
        "genres4": colorScale4,
        "genres5": colorScale5,
        "genres6": colorScale6
}
const colorScale = chroma.scale(["#3a0ca3", "#f72585"]).mode('lab').colors(43)


const AnimeGraph = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();
  const nodesRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2006)

  /// constatns ///
  // dimensions 
  const width = 1400;
  const height = 700;
  const margin = {top: 70, bottom: 30, right: 10, left: 30}
  // for the lower and upper limit of the popularity scale
  const minPopularity = 5
  const maxPopularity = 45

  /// Data load ///
  useEffect(() => {
    //console.log(dataLoad)
    setData(dataLoad)
    const startEndYear = d3.extent(dataLoad, d => d.air_year)
    const yearsRange = _.range(startEndYear[0], startEndYear[1] + 1)
    console.log(yearsRange)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data && selectedYear) {
      // get only one year as a test 
      console.log(selectedYear)
      let dataOneYear = _.filter(data, {'air_year': parseInt(selectedYear)})
      //dataOneYear = _.filter(dataOneYear, {'continuing': true});
      

      /// Scales ///
      // X Scale - corresponds to season within a given year 
      const xScale = d3.scaleBand()
        .domain(['winter', 'summer', 'spring', 'fall']) // the seasons in a year 
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale - corresponds to the score of anime 
      const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.score), d3.max(data, d => d.score)+1])
        .range([height - margin.bottom, margin.top])
      // Popularity scale - number of members who have seen the anime 
      const popularityScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.members))
        .range([minPopularity, maxPopularity])

      // add radius for convenience 
      dataOneYear.forEach(d => d.r = popularityScale(d.members))
      console.log(dataOneYear)

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0))
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(yScale).ticks(15))
        .call(g => g.select(".domain").remove())

      /// Graph ///
      const svg = d3.select(gRef.current)

      // Force Simulation - to make the shapes not collide with each other
      const simulation = d3.forceSimulation(dataOneYear)
        .force('x', d3.forceX().strength(0.2).x(d => xScale(d['air_season']) + xScale.bandwidth()/2))
        .force('y', d3.forceY().strength(0.85).y(d => yScale(d['score'])))
        .force('collide', d3.forceCollide().radius(d => d.r + 1).strength(1))
  
      // shapes - one for each anime; apply force simulation to these
      // these are just the containers i.e. group elements 
      // the actual shape (named flower) is defined below 
      const shapes = svg
        .selectAll(".shape-container")
        .data(simulation.nodes())
        .join("g")
        .classed("shape-container", true)
          .attr("opacity", 0)
          .on("click", (event, element) => {
            console.log(element.title)
            console.log(element.members)
            console.log(element.score)
          })

      /// Pie charts ///
      // Set up the pie - constant value for all the genres 
      // sort by category of genres 
      const pie = d3.pie().sort((a, b) => (
        _.find(allgenres, ['genre', a.name]).category >= _.find(allgenres, ['genre', b.name]).category
        ) ? 1 : -1).value(1)
      const arc = d3.arc()
        .innerRadius(0.2)
        .outerRadius(1)
        .padAngle(0)
        .cornerRadius(0)

      const flower = shapes.selectAll("path")
        .data(d => pie(d.genres))
        .join("path")
          .attr("d", arc)
          // need the radius from the parent data since we no longer have access to it here 
          .attr("transform", function(d, i, nodes){
            const parentData = this.parentNode.__data__ // parent data
            return `scale(${parentData.r || 0.1})`
          })
          // need the genres from the parent data element since we 
          // no longer have access to them here 
          .attr("fill", function(d, i, nodes){
            const parentData = this.parentNode.__data__ // parent data
            const genre =  parentData.genres[i].name // get genre from parent data 
            let category = _.find(allgenres, ['genre', genre]).category // find genre cat from lookup 
            // fill from the cat-based colour scheme 
            const fill = colorScales[category][_.find(genres_categories, { 'category': category }).genres.indexOf(genre)]
            return fill
          })
          .attr("fill-opacity", 0.9)

      // On each iteration (tick) of the simulation, we update the position of our groups
      function tick() {
        shapes
        .attr('transform', d => `translate(${ d.x },${ d.y })`) 
      }
      simulation.on("tick", tick)
      setTimeout(() => {
        simulation.restart();
        shapes
          .transition()
          .attr("opacity", 1)
      }, 600);
      // show the initial arrangement
      //tick();


      // call the axes 
      d3.select(xAxisRef.current).call(xAxis)
      d3.select(yAxisRef.current).call(yAxis)

    } else {
      console.log("Missing data")
    }
  }, [data, selectedYear]);

  // to select year from dropdown 
  const selectYear = (e) => {
    const currentSelectedYear = e.target.value;
    setSelectedYear(currentSelectedYear)
  }

  return (
    <div className="page-container">
      <h1>Title</h1>
        <div className="dropdown-menu">
          <select id="option-select" onChange={e => selectYear(e)}>
            <option value="">year</option>
                {
                  [1990, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 
                    2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020].map(year => (
                    <option value={year}>{year}</option>
                  ))
                }
          </select>
        </div>
      <div className="wrapper">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}>
            <g ref={nodesRef}></g>
          </g>
          <g ref={xAxisRef}></g>
          <g ref={yAxisRef}></g>
          </svg>
      </div>
    </div>
  )
};

export { AnimeGraph }