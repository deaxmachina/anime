import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "../AnimeGraph.css";
import dataLoad from "../../data/mal_scrape.json";
import { allgenres, genres_categories, colorScales } from "../../genres.js"


// options for the petal paths //
const petalPaths = [
    'M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0',
    'M0 0 C1 1 1 2 0 2 C-1 2 -1 1 0 0',
    'M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0',
    'M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0',
    'M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0',
    "M 0,0 a 25,25 0 1,1 50,0a 25,25 0 1,1 -50,0"
]


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
  const width = 1000;
  const height = 700;
  const margin = {top: 70, bottom: 30, right: 10, left: 200}
  // for the lower and upper limit of the popularity scale
  const minPopularity = 5
  const maxPopularity = 45
  // scale of the petals 
  const petalScale = 0.008
  // colours 
  const shapeBackgroundColour = "#010B14"

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

      // get only one year 
      let dataOneYear = _.filter(data, {'air_year': parseInt(selectedYear)});
      // only the unique anime for the year 
      const dataOneYearUniq = _.uniqBy(dataOneYear, 'mal_id')

      /// Scales ///
      // X Scale 
      // use a band scale to position all the anime in the year horizontally 
      // this is needed with the force as it requires an x-position that 
      // the circles should move towards 
      const xScale = d3.scaleBand()
        .domain(_.range(dataOneYear.length)) // number of anime in the year
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
      

      /// Axes ///
      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(yScale).ticks(15))
        .call(g => g.select(".domain").remove())

      /// Graph ///
      const svg = d3.select(gRef.current)
        .attr("transform", `translate(${margin.left}, ${0})`)

      // Force Simulation - to make the shapes not collide with each other
      const simulation = d3.forceSimulation(dataOneYearUniq, d => d.mal_id)
        // x is computed with the band scale 
        .force('x', d3.forceX().strength(0.3).x((d, i) => xScale(i) + xScale.bandwidth()/2))
        .force('y', d3.forceY().strength(0.4).y(d => yScale(d['score'])))
        .force('collide', d3.forceCollide().radius(d => d.r+1).strength(1))
  
      // shapes - one for each anime; apply force simulation to these
      // also apply any click events at this level 
      const shapes = svg
        .selectAll(".shape-container")
        .data(simulation.nodes(), d => d['mal_id'])
        .join("g")
        .classed("shape-container", true)
          .attr("opacity", 0)
          .attr('transform', d => `translate(${ d.x },${ d.y })`) 
          .on("click", (event, element) => {
            console.log(element)
            console.log(element.title)
            console.log(element.members)
            console.log(element.score)
          })
        
      // background for the shapes, e.g. 
      // a circle that contains the flowers for each anime
      const shapesBackground = shapes.selectAll("circle")
        .data(d => [d])
        .join("circle")
        .attr("r", d => d.r)
        .attr("fill", shapeBackgroundColour)
        .attr("fill-opacity", 1)

      // the flower of shape for each anime 
      const flowers = shapes.selectAll("path")
        .data(d => d.genres.sort((a, b) => (
          _.find(allgenres, ['genre', a.name]).category >= _.find(allgenres, ['genre', b.name]).category
          ) ? 1 : -1))
        .join("path")
          .attr("d", petalPaths[3])
          // the last arg nodes gives us access to the whole data
          .attr("transform", function(d, i, nodes){
            const allData = d3.selectAll(nodes).data() // all data for this selection
            const parentData = this.parentNode.__data__ // parent data
            return `rotate(${i * (360 / (allData.length || 1))})scale(${petalScale * parentData.r || 0.2})`
          })
          .attr("fill", function(d, i, nodes){
            const parentData = this.parentNode.__data__ // parent data
            const genre =  parentData.genres[i].name // get genre from parent data 
            let category = _.find(allgenres, ['genre', genre]).category // find genre cat from lookup 
            // fill from the cat-based colour scheme 
            const fill = colorScales[category][_.find(genres_categories, { 'category': category }).genres.indexOf(genre)]
            return fill
          })
          .attr("fill-opacity", 0.9)

      // ticks control the force simulation; translate the flowers to the right place
      function tick() {
        shapes
        .attr('transform', d => `translate(${ d.x },${ d.y })`) 
      }
      simulation.on("tick", tick)

      // shapes fade in; otherwise they enter from weird places
      setTimeout(() => {
        simulation.restart();
        shapes
          .transition()
          .attr("opacity", 1)
      }, 200);
      // show the initial arrangement
      tick();


      // call the axes 
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
                  [1950, 1960, 1970, 1980, 1990, 1995, 1999, 2000, 2003, 2006, 2009, 2012, 2015, 2020].map(year => (
                    <option value={year}>{year}</option>
                  ))
                }
          </select>
        </div>
      <div className="wrapper">
        <svg 
          ref={svgRef} 
          width={width + margin.left + margin.right} 
          height={height + margin.top + margin.bottom}
        >
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