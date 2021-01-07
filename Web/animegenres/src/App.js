import React from "react";
import "./App.css";

//import { AnimeGraph } from "./Components/AnimeGraph/Seasonal/GraphPetals"
//import { AnimeGraph } from "./Components/AnimeGraph/Seasonal/GraphPetalsCircles"
//import { AnimeGraph } from "./Components/AnimeGraph/Yearly/GraphPetalsCircles"
//import { AnimeGraph } from "./Components/AnimeGraph/Seasonal/GraphPies"
//import { AnimeGraph } from "./Components/AnimeGraph/Seasonal/GraphCircles"
//import { TimelineCircles } from "./Components/Timeline/TimelineCircles"
//import { WholeGraphDemo } from "./Components/WholeGraph/WholeGraphDemo/WholeGraphDemo"
//import { WholeGraphTemplate } from "./Components/WholeGraph/WholeGraphTemplate/WholeGraphTemplate"
import { WholeGraphPetalsCircles } from "./Components/WholeGraph/WholeGraphPetalsCircles/WholeGraphPetalsCircles"

const App = () => {
    return (
        <>
          <WholeGraphPetalsCircles />
        </>
    )
};

export default App;