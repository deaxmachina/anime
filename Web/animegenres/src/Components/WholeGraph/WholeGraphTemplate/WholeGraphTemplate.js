import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import * as chroma from "chroma-js";
import "./WholeGraphTemplate.css";
import dataLoad from "../../data/mal_scrape.json";
import AnimeGraph from "./AnimeGraph";
import AnimeTimeline from "./AnimeTimeline";
import HeroSection from "./HeroSection";



const WholeGraphTemplate = () => {

  /// states ///
  const [data, setData] = useState(null);
  const [allData, setAllData] = useState(null)
  const [selectedAnime, setSelectedAnime] = useState(null)
  const [selectedYear, setSelectedYear] = useState(2006)

  /// Data load ///
  useEffect(() => {
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
    setAllData(dataLoad)
  }, []);


  return (
    <div className="whole-graph-template">
      <HeroSection 
        selectedYear={selectedYear}
      />
      <div className="whole-graph-template-container">
        <AnimeTimeline
                  data={data}
                  allData={allData}
                  selectedAnime={selectedAnime}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  setSelectedAnime={setSelectedAnime}
          />

        <AnimeGraph 
              data={data}
              allData={allData}
              selectedAnime={selectedAnime}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              setSelectedAnime={setSelectedAnime}
        />
      </div>
    </div>

  )
};

export { WholeGraphTemplate }