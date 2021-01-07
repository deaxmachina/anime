import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import { orderedGenres, colourScaleOrderedGenres, hentaiGenres } from "./genres.js"



// options for the petal paths //
const petalPaths = [
    'M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0',
    'M0 0 C1 1 1 2 0 2 C-1 2 -1 1 0 0',
    'M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0',
    'M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0',
    'M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0',
    "M 0,0 a 25,25 0 1,1 50,0a 25,25 0 1,1 -50,0"
]


const AnimeGraph = ({
  data, allData, selectedYear, setSelectedYear 
}) => {

  const [selectedAnime, setSelectedAnime] = useState(null)

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gRef = useRef();
  const nodesRef = useRef();
  const legendRef = useRef();
  const legendRectsAxisRef = useRef();
  const tooltipRef = useRef();
  const svgLegendRef = useRef();

  /// constatns ///
  // dimensions 
  const width = 1300;
  const height = 850;
  const legendWidth = width;
  const legendHeight = 60;
  const margin = {top: 50, bottom: legendHeight + 0, right: 30, left: 60}
  
  // for the lower and upper limit of the popularity scale
  const minPopularity = 5
  const maxPopularity = 43
  // scale of the petals 
  const petalScale = 0.008
  // colours 
  const shapeBackgroundColour = "#010B14" // "#010B14" "#fff1e6"
  const lightColour =  "#fff1e6" // "#010B14" "#fff1e6"
  const circleOutlineHoverColour = "black"
  const HentaiColour = "#E2C6B6";
  const allGenresColour = "#003f66" //"#2a9d8f";


  /// D3 Code ///
  useEffect(() => {
    if (data && allData && selectedYear) {

      // get only one year 
      let dataOneYear = _.filter(allData, {'air_year': parseInt(selectedYear)});
      // only the unique anime for the year 
      const dataOneYearUniq = _.uniqBy(dataOneYear, 'mal_id')

      ////////////////////////////////
      /////////// GRAPH //////////////
      ////////////////////////////////
      /// Scales ///
      // X Scale 
      // use a band scale to position all the anime in the year horizontally 
      // this is needed with the force as it requires an x-position that 
      // the circles should move towards 
      const xScale = d3.scaleBand()
        .domain(['winter', 'summer', 'spring', 'fall']) // the seasons in a year 
        //.domain(_.range(dataOneYear.length)) // number of anime in the year
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale - corresponds to the score of anime 
      const yScale = d3.scaleLinear()
        .domain([d3.min(allData, d => d.score) + 1, d3.max(allData, d => d.score) + 1])
        .range([height - margin.bottom, margin.top])
      // Popularity scale - number of members who have seen the anime 
      const popularityScale = d3.scaleSqrt()
        .domain(d3.extent(allData, d => d.members))
        .range([minPopularity, maxPopularity])

      // add radius for convenience
      dataOneYear.forEach(d => d.r = popularityScale(d.members))
      // get list of the genres of anime
      dataOneYear.forEach(d => d.genresList = _.map(d.genres, "name"))
      

      /// Axes ///
      // X Axis 
      const xAxis = g => g  
        .attr("transform", `translate(${0}, ${margin.top/2})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .style("text-anchor", "start")
          .attr("font-size", "1.5em")
          .style("font-variant", "small-caps")
          .style("font-weight", "bold")
          .attr("font-family", "sans-serif")
          .style("color", lightColour)
        )
        .call(g => g.selectAll(".tick")
          .style("color", shapeBackgroundColour)
        )

      // Y Axis 
      const yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(d3.axisLeft(yScale).ticks(3))
        .call(g => g.select(".domain").remove())

      /// Graph ///
      const svg = d3.select(gRef.current)
        .attr("transform", `translate(${margin.left}, ${0})`)

      // Force Simulation - to make the shapes not collide with each other
      // note that we first remove the anime without a score as we don't want to visualise these 
      const dataOneYearUniqWithScores = _.filter(dataOneYearUniq, function(anime){ return anime['score'] !== null})
      const simulation = d3.forceSimulation(dataOneYearUniqWithScores, d => d.mal_id)
        // x is computed with the band scale 
        .force('x', d3.forceX().strength(0.3).x(d => xScale(d['air_season']) + xScale.bandwidth()/2))
        //.force('x', d3.forceX().strength(0.2).x((d, i) => xScale(i) + xScale.bandwidth()/2)) // if not by season but for the whole year 
        .force('y', d3.forceY().strength(0.9).y(d => yScale(d['score'])))
        .force('collide', d3.forceCollide().radius(d => d.r + 2.5).strength(1))
  
      // shapes - one for each anime; apply force simulation to these
      // also apply any click events at this level 
      console.log(simulation.nodes())
      const shapes = svg
        .selectAll(".shape-container")
        .data(simulation.nodes(), d => d['mal_id'])
        .join("g")
        .classed("shape-container", true)
          .attr("opacity", 0)
          .attr('transform', d => `translate(${ d.x },${ d.y })`) 

        
      // background for the shapes, e.g. 
      // a circle that contains the flowers for each anime
      const shapesBackground = shapes.selectAll("circle")
        .data(d => [d])
        .join("circle")
        .attr("r", d => d.r)
        .attr("fill", shapeBackgroundColour)
        .attr("fill-opacity", 1)
        .attr("stroke", lightColour)
        .attr("stroke-width", d => d.r * 0.15)
        .attr('stroke-opacity', 1)

      // the flower of shape for each anime based on the number of genres 
      const flowers = shapes.selectAll("path")
        .data(d => d.genres)
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
            const genres = parentData.genres
            // look up the indices of the genres in the ordered array of orderedGenres 
            // and use these to sort the anime in the order in which they appear in the orderedGenres 
            // so that we can have the petals form nice gradients when they have adjacent genres 
            const genresSorted = genres.sort((a, b) => {
              return _.indexOf(orderedGenres, a.name) - _.indexOf(orderedGenres, b.name) 
            })
            const genre =  genresSorted[i].name // get genre from parent data 
            // fill from the cat-based colour scheme 
            const fill = _.includes(orderedGenres, genre) 
              ? colourScaleOrderedGenres[_.indexOf(orderedGenres, genre)] 
              : HentaiColour
            return fill
          })
          .attr("fill-opacity", 0.8)

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
      d3.select(xAxisRef.current).call(xAxis)


      ////////////////////////////////
      /////////// LEGEND /////////////
      ////////////////////////////////
      const legend = d3.select(legendRef.current)
        .attr("transform", `translate(${0}, ${height + margin.top})`)

      const xScaleLegend = d3.scaleBand()
        .domain([...orderedGenres, ...hentaiGenres]) 
        .range([margin.left, width - margin.right])
        .padding(0.1)
      
      const legendRects = legend
        .selectAll(".legend-rect")
        .data([...orderedGenres, ...hentaiGenres])
        .join("rect")
        .classed("legend-rect", true)
        .attr('height', 15)
        .attr("width", 20)
        .attr("x", (d, i) => xScaleLegend(d) + xScaleLegend.bandwidth()/2)
        // fill based on genres, with the hentai genres separately and add a square with a different colour of "all" genres
        .attr('fill', (d, i) => _.includes(orderedGenres, d) 
          ? colourScaleOrderedGenres[i] 
          : HentaiColour 
          )
        .attr("opacity", 0.8)

      const legendRectsAxis = g => g  
        .attr("transform", `translate(${0}, ${height + margin.top + 20})`)
        .attr("class", "legend-rects-xaxis")
        .call(d3.axisBottom(xScaleLegend).tickFormat(i => i).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .style("fill", lightColour)
          .attr("font-size", "1em")
          .style("text-anchor", "end")
          .attr("dy", ".35em")
          .attr("dx", ".35em")
          .attr("transform", "rotate(-40)")
        )
        .call(g => g.selectAll(".tick")
          .style("color", shapeBackgroundColour)
        )
      d3.select(legendRectsAxisRef.current).call(legendRectsAxis)

      // the genre text which is updated when a genre rect is clicked
      const legendSelectedGenreText = legend
        .selectAll(".legend-selected-genre-text")
        .data([0])
        .join("text")
        .classed("legend-selected-genre-text", true)
          .attr("transform", `translate(${margin.left + 15}, ${-15})`)
          .text("all genres")
          .attr("fill", lightColour)
          .style("text-anchor", "start")
          .attr("font-size", "2em")

      // bit of the text that stays constant and just says "selected genre"
      const legendSelectedGenreTextFront = legend
        .selectAll(".legend-selected-genre-text-front")
        .data([0])
        .join("text")
        .classed("legend-selected-genre-text-front", true)
          .attr("transform", `translate(${margin.left + 15}, ${-50})`)
          .text("selected genre")
          .attr("fill", lightColour)
          .style("text-anchor", "start")
          .attr("font-size", "0.95em")

      // text with instructions to select genre 
      const legendSelectedGenreTextInstructions = legend
        .selectAll(".legend-selected-genre-text-instructions")
        .data([0])
        .join("text")
        .classed("legend-selected-genre-text-instructions", true)
          .attr("transform", `translate(${width - margin.right - 110}, ${-26})`)
          .text("click on a square to filter by genre or")
          .attr("fill", lightColour)
          .style("text-anchor", "end")
          .attr("font-size", "0.8em")
          .attr("dy", "0.35em")

        // button to select all genres 
        const allGenresButtonG = legend
          .selectAll(".all-genres-button-g")
          .data([0])
          .join("g")
          .classed(".all-genres-button-g", true)
          .attr("transform", `translate(${width - margin.right +1}, ${-26})`)
          .on("click", function(e, datum) {
            shapes.attr("opacity", 1)
            legendSelectedGenreText.text("all genres")
          })
          // change button style when hovering
          .on("mouseenter", function() {
            allGenresButtonRect
              .attr("fill", allGenresColour)
              .attr("fill-opacity", 0.5)
              .attr("stroke", lightColour)
          })
          .on("mouseleave", function() {
            allGenresButtonRect
              .attr("fill", shapeBackgroundColour)
              .attr("stroke", allGenresColour)
          })

        // rect for the button
        const allGenresButtonRect = allGenresButtonG
          .selectAll(".legend-select-all-genres")
          .data([0])
          .join("rect")
          .classed("legend-select-all-genres", true)
            .attr("transform", `translate(${-100}, ${-13})`)
            .attr("fill", shapeBackgroundColour)
            .attr("width", 100)
            .attr("height", 26)
            .attr("stroke", allGenresColour)
            .attr("stroke-width", 3)

        // text on the button
        const allGenresButtonText = allGenresButtonG
          .selectAll(".legend-select-all-genres-text")
          .data([0])
          .join("text")
          .classed("legend-select-all-genres-text", true)
            .attr("transform", `translate(${-88}, ${-1})`)
            .attr("fill", lightColour)
            .text("all genres")
            .style("text-anchor", "start")
            .attr("font-size", "1em")
            .style("font-variant", "small-caps")
            .style("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .attr("dy", "0.33em")
            .attr('cursor', 'default')
            .attr('pointer-events', 'none')

      /// Legend interactions ///
      legendRects.on("click", function(event, datum) {
        const genre = datum 
        // the anime which contain that genre stay with opacity 1 and the other ones have reduced opacity. if there selected genre is "all", display everything 
        shapes.attr("opacity", d => d.genresList.includes(genre) ? 1 : 0.1 
        )
        // change text to the genre in the text bit above the legend
        legendSelectedGenreText.text(genre)
      })
      legendRects.on("mouseenter", function(event, datum) {
        // stroke the selected genre rect 
        legendRects
          .attr("stroke", d => d == datum ? lightColour : null)
          .attr("stroke-width", 2)
      })
      legendRects.on("mouseleave", function(event, datum) {
        legendRects
          .attr("stroke", null)
      })


      /////////////////////////////
      ////////// TOOLTIP //////////
      /////////////////////////////
      // Include all the events here when an anime circle (shapes) is hovered or clicked 
      // i.e. the tooltip, stroke and the anime info that gets fetched 
      const tooltip = d3.select(tooltipRef.current)
      // events to move the tooltip 
      shapes.on("click", (event, element) => {
        //console.log(element)
        //console.log(element.title)
        //console.log(element.members)
        //console.log(element.score)
        //setSelectedAnime(element.title)
      })
      shapes.on("mouseenter", function(e, datum) {
        shapesBackground
          .attr("stroke", d => d == datum ? circleOutlineHoverColour : lightColour)
          .attr("fill", d => d == datum ? lightColour : circleOutlineHoverColour)
        tooltip 
          .style('transform', d => `translate(
            calc(-50% + ${datum.x}px),
            calc(30% + ${datum.y}px)`
            ) 
          .style("opacity", 1)
        // set the selected anime to the one corresponing to the hovered element 
        setSelectedAnime(datum)
        //console.log(datum)
      })
      shapes.on("mouseleave", function(e, datum) {
        shapesBackground
          .attr("stroke", lightColour)
          .attr("fill", shapeBackgroundColour)
        tooltip.style("opacity", 0)
      })

    } else {
      console.log("Missing data")
    }
  }, [data, allData, selectedYear]);

  // to select year from dropdown 
  const selectYear = (e) => {
    const currentSelectedYear = e.target.value;
    setSelectedYear(currentSelectedYear)
  }

  return (
      <div id="anime-graph-container">
         {/*{selectedAnime ? <h2>{selectedAnime}</h2> : null}*/}
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
          <g ref={legendRef}></g>
          <g ref={legendRectsAxisRef}></g>
        </svg>

        <div id="tooltip" className="tooltip" ref={tooltipRef}>
          {selectedAnime 
          ? <div>
              <span className="tooltip-title">{selectedAnime.title}</span>
              <span className="tooltip-info">MAL members: {d3.format(",.2r")(selectedAnime.members)}</span>
              <span className="tooltip-info">MAL score: {selectedAnime.score}</span>       
            </div> 
          : null}
        </div>
        <h1>Some more</h1>
      </div>
  )
};

export default AnimeGraph;