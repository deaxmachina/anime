import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "../AnimeGraph.css";
import dataLoad from "../../data/mal_scrape.json";


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
  const height = 600;
  const margin = {top: 70, bottom: 30, right: 10, left: 30}

  // petal paths //
  const petalPaths = [
    'M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0',
    'M0 0 C1 1 1 2 0 2 C-1 2 -1 1 0 0',
    'M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0',
    'M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0',
    'M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0',
  ]


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
      let dataOneYear = _.filter(data, {'air_year': parseInt(selectedYear)});

      /// Scales ///
      // X Scale - corresponds to season within a given year 
      const xScale = d3.scaleBand()
        .domain(['winter', 'summer', 'spring', 'fall']) // the seasons in a year 
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale - corresponds to the score of anime 
      const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.score), d3.max(data, d => d.score)])
        .range([height - margin.bottom, margin.top])
      // Popularity scale - number of members who have seen the anime 
      const popularityScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.members))
        .range([5, 45])

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
        .force('y', d3.forceY().strength(0.5).y(d => yScale(d['score'])))
        .force('collide', d3.forceCollide().radius(d => d.r + 2).strength(1))
  
      // shapes - one for each anime; apply force simulation to these
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
      const flower = shapes.selectAll("path")
        //.data(d3.range(6))
        .data(d => d.genres)
        .join("path")
          //.attr("d", petalPaths[1])
          .attr("d", "M 0,0 a 25,25 0 1,1 50,0a 25,25 0 1,1 -50,0")
          // the last arg nodes gives us access to the whole data
          .attr("transform", function(d, i, nodes){
            const allData = d3.selectAll(nodes).data() // all data for this selection
            const parentData = this.parentNode.__data__ // parent data
            return `rotate(${i * (360 / (allData.length || 1))})scale(${0.02*parentData.r || 0.2})`
          })
          .attr("fill", d => d.name == "Action" ? "#6d6875" : "maroon")
          .attr("fill-opacity", 0.8)

      // On each iteration (tick) of the simulation, we update the position of our groups
      // either transform translate or define the cx and cy postions
      function tick() {
        shapes
        .attr('transform', d => `translate(${ d.x },${ d.y })`) 
      }
      simulation.on("tick", tick)
      // this is hacky - making the circles appear after timeout 
      // allows us to get rid of the weird entry -- need to FIX 
      setTimeout(() => {
        simulation.restart();
        shapes
          .transition()
          .attr("opacity", 1)
      }, 500);
      // show the initial arrangement
      tick();


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
                  [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016].map(year => (
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