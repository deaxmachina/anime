import React from "react";
import _ from "lodash";
import "./WholeGraphPetalsCircles.css";


const HeroSection = ({ selectedYear }) => {
  return (
    <>
      <h1 className="whole-graph-template-title">A Timeline of Anime</h1>
      <div className="whole-graph-template-subtitle">
        Explore the evolution of anime over the decades using anime data from one of the most popular anime fan websites <a href="https://myanimelist.net/" target="_blank">MyAnimeList</a>
      </div>
      <div className="whole-graph-template-instructions-title">How to read this graph:</div>
      <ul className="whole-graph-template-instructions">
        <li><span>Bigger & more pink timeline circle = more anime.</span></li>
        <li><span>The numbers in the circle timeline = number of anime in that year.</span></li>
        <li><span>Click on a circle in the timeline to reveal a graph of all the anime of that year.</span></li>
        <li><span>Each bubble of the revealed graph corresponds to an anime. Size = popularity on MyAnimeList.</span></li>
        <li><span>Hover on a bubble to reveal information about the anime.</span></li>
      </ul>
      <div>show anime for</div>
      <h1 className="whole-graph-template-selected-year">{selectedYear}</h1>
    </>
  )
}

export default HeroSection;
